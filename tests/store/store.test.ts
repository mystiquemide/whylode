/**
 * Store tests against a real Postgres database.
 * Each suite creates its own schema (test_<random>), applies schema.sql,
 * and drops it on teardown. The public schema is never touched.
 *
 * Coverage:
 * - one-note rule (second answer rejected)
 * - draft refusal with open question
 * - draft refusal with open conflict
 * - event rows on every write
 * - derived counts (questions_asked, lines_reused)
 * - token uniqueness across two experts
 * - SQL injection resistance: quotes and semicolons in program names
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/testDb';
import { upsertProgram } from '../../src/lib/store/programs';
import { openChange, getChange } from '../../src/lib/store/changes';
import { recordTrace } from '../../src/lib/store/trace';
import { createExpert } from '../../src/lib/store/experts';
import { answerQuestion } from '../../src/lib/store/notes';
import { submitDraft } from '../../src/lib/store/drafts';
import { flagConflict, reviewConflict } from '../../src/lib/store/conflicts';
import { getEvents } from '../../src/lib/store/events';

// ── helpers ──────────────────────────────────────────────────────────────────

async function scaffold(db: TestDb['sql']) {
  const { change_id, clause_ids } = await openChange(
    'CA sales tax 7.25% to 7.50%',
    'ca-tax-notice.pdf',
    ['The rate changes to 7.50%.'],
    db,
  );
  return { change_id, clause_id: clause_ids[0] };
}

// ── suite ─────────────────────────────────────────────────────────────────────

describe('store', () => {
  let tdb: TestDb;

  beforeAll(async () => {
    tdb = await createTestDb();
  });

  afterAll(async () => {
    await tdb.teardown();
  });

  // ── programs ───────────────────────────────────────────────────────────────

  it('upserts a program and finds it again', async () => {
    const { id } = await upsertProgram('INVCALC.rpgle', 'Invoice calc', '** source', tdb.sql);
    expect(id).toBeGreaterThan(0);
    // Upsert again — same name, different description — should not throw.
    const { id: id2 } = await upsertProgram('INVCALC.rpgle', 'Updated desc', '** v2', tdb.sql);
    expect(id2).toBe(id);
  });

  it('rejects a duplicate program name via upsert (same row updated)', async () => {
    // The UNIQUE constraint means a second INSERT would conflict.
    // upsertProgram uses ON CONFLICT DO UPDATE so it should succeed.
    await expect(upsertProgram('INVCALC.rpgle', 'dup', '', tdb.sql)).resolves.toBeDefined();
  });

  // ── changes / derived status ──────────────────────────────────────────────

  it('status is open when no questions and no draft', async () => {
    const { change_id } = await scaffold(tdb.sql);
    const change = await getChange(change_id, tdb.sql);
    expect(change?.status).toBe('open');
  });

  it('derived questions_asked equals count of questions created', async () => {
    const { change_id } = await scaffold(tdb.sql);
    await createExpert(
      change_id,
      'Alice',
      [
        { program: 'INVCALC.rpgle', line_start: 10, line_end: 10, excerpt: 'C TAXRT', question: 'Why 0.0725?' },
        { program: 'INVCALC.rpgle', line_start: 20, line_end: 20, excerpt: 'C RATE2', question: 'What is RATE2?' },
      ],
      tdb.sql,
    );
    const change = await getChange(change_id, tdb.sql);
    expect(change?.questions_asked).toBe(2);
  });

  it('derived lines_reused equals count of trace lines in state known', async () => {
    const { change_id, clause_id } = await scaffold(tdb.sql);
    // Insert a note first so we have a known_note_id to reference.
    const noteRows = await tdb.sql`
      INSERT INTO notes (program, line_start, line_end, text, author, change_id)
      VALUES ('INVCALC.rpgle', 5, 5, 'Known fact', 'tester', ${change_id})
      RETURNING id
    `;
    const note_id = (noteRows[0] as { id: number }).id;

    await recordTrace(
      clause_id,
      [
        { program: 'INVCALC.rpgle', line_no: 5, code: 'C TAXRT', confidence: 0.9, known_note_id: note_id },
        { program: 'INVCALC.rpgle', line_no: 6, code: 'C RATE2', confidence: 0.5 },
      ],
      tdb.sql,
    );
    const change = await getChange(change_id, tdb.sql);
    expect(change?.lines_reused).toBe(1);
  });

  it('status becomes waiting when there is an open question', async () => {
    const { change_id } = await scaffold(tdb.sql);
    await createExpert(
      change_id,
      'Bob',
      [{ program: 'INVCALC.rpgle', line_start: 1, line_end: 1, excerpt: '', question: 'What?' }],
      tdb.sql,
    );
    const change = await getChange(change_id, tdb.sql);
    expect(change?.status).toBe('waiting');
  });

  // ── one-note rule ─────────────────────────────────────────────────────────

  it('one-note rule: second answer to the same question is rejected', async () => {
    const { change_id } = await scaffold(tdb.sql);
    const { question_ids } = await createExpert(
      change_id,
      'Expert',
      [{ program: 'INVCALC.rpgle', line_start: 100, line_end: 100, excerpt: '', question: 'Why?' }],
      tdb.sql,
    );
    const qid = question_ids[0];

    // First answer succeeds.
    const { note_id } = await answerQuestion(qid, 'The rate is state-mandated.', 'expert', tdb.sql);
    expect(note_id).toBeGreaterThan(0);

    // Second answer must be rejected.
    await expect(
      answerQuestion(qid, 'I changed my mind.', 'expert', tdb.sql),
    ).rejects.toThrow();
  });

  // ── draft refusal ─────────────────────────────────────────────────────────

  it('draft refusal: refused while a question is open', async () => {
    const { change_id } = await scaffold(tdb.sql);
    await createExpert(
      change_id,
      'Expert',
      [{ program: 'INVCALC.rpgle', line_start: 50, line_end: 50, excerpt: '', question: 'Why 42?' }],
      tdb.sql,
    );

    await expect(
      submitDraft(change_id, '--- diff ---', [], tdb.sql),
    ).rejects.toThrow(/open questions/i);
  });

  it('draft refusal: refused while a conflict is open', async () => {
    const { change_id } = await scaffold(tdb.sql);

    // Answer the only question so it is not open.
    const { question_ids } = await createExpert(
      change_id,
      'Expert',
      [{ program: 'INVCALC.rpgle', line_start: 60, line_end: 60, excerpt: '', question: 'Which rate?' }],
      tdb.sql,
    );
    const { note_id } = await answerQuestion(question_ids[0], 'State rate only.', 'expert', tdb.sql);

    // Flag a conflict.
    await flagConflict(change_id, note_id, 'State rate only.', 'Code shows two rates.', tdb.sql);

    await expect(
      submitDraft(change_id, '--- diff ---', [], tdb.sql),
    ).rejects.toThrow(/open conflicts/i);
  });

  it('draft succeeds after conflict is reviewed', async () => {
    const { change_id } = await scaffold(tdb.sql);
    // Answer all questions (none here — scaffold creates 0 questions).
    // Flag and then review a conflict.
    const noteRows = await tdb.sql`
      INSERT INTO notes (program, line_start, line_end, text, author, change_id)
      VALUES ('INVCALC.rpgle', 70, 70, 'Answer', 'expert', ${change_id})
      RETURNING id
    `;
    const note_id = (noteRows[0] as { id: number }).id;
    const { conflict_id } = await flagConflict(change_id, note_id, 'claim', 'fact', tdb.sql);
    await reviewConflict(conflict_id, tdb.sql);

    const { draft_id } = await submitDraft(change_id, 'diff', [], tdb.sql);
    expect(draft_id).toBeGreaterThan(0);
  });

  // ── events on writes ──────────────────────────────────────────────────────

  it('every write inserts an event row', async () => {
    const { change_id } = await scaffold(tdb.sql);
    let events = await getEvents(change_id, tdb.sql);
    // openChange emits 'change_opened'.
    expect(events.some((e) => e.kind === 'change_opened')).toBe(true);

    const { question_ids } = await createExpert(
      change_id,
      'ExpertEv',
      [{ program: 'INVCALC.rpgle', line_start: 200, line_end: 200, excerpt: '', question: 'Event?' }],
      tdb.sql,
    );
    events = await getEvents(change_id, tdb.sql);
    expect(events.some((e) => e.kind === 'expert_asked')).toBe(true);

    await answerQuestion(question_ids[0], 'Yes.', 'ev', tdb.sql);
    events = await getEvents(change_id, tdb.sql);
    expect(events.some((e) => e.kind === 'question_answered')).toBe(true);

    const { draft_id } = await submitDraft(change_id, 'diff', [], tdb.sql);
    events = await getEvents(change_id, tdb.sql);
    expect(events.some((e) => e.kind === 'draft_submitted')).toBe(true);
    expect(draft_id).toBeGreaterThan(0);
  });

  // ── token uniqueness ──────────────────────────────────────────────────────

  it('two experts get different tokens', async () => {
    const { change_id } = await scaffold(tdb.sql);
    const q = { program: 'INVCALC.rpgle', line_start: 300, line_end: 300, excerpt: '', question: 'Q?' };
    const e1 = await createExpert(change_id, 'Expert1', [q], tdb.sql);
    const q2 = { program: 'INVCALC.rpgle', line_start: 301, line_end: 301, excerpt: '', question: 'Q2?' };
    const e2 = await createExpert(change_id, 'Expert2', [q2], tdb.sql);
    expect(e1.token).not.toBe(e2.token);
    expect(e1.token.length).toBeGreaterThan(20);
  });

  // ── SQL injection resistance ──────────────────────────────────────────────

  it('program names with quotes and semicolons are stored and retrieved correctly', async () => {
    const nasty = `O'Hara; DROP TABLE programs; --`;
    const { id } = await upsertProgram(nasty, 'desc', 'source', tdb.sql);
    expect(id).toBeGreaterThan(0);

    // Query it back.
    const rows = await tdb.sql`SELECT name FROM programs WHERE id = ${id}`;
    expect((rows[0] as { name: string }).name).toBe(nasty);
  });

  it('memoir lookup with a program name containing quotes returns correct rows', async () => {
    const { change_id } = await scaffold(tdb.sql);
    const prog = `INVCALC's "BEST".rpgle`;
    // Insert a note directly.
    await tdb.sql`
      INSERT INTO notes (program, line_start, line_end, text, author, change_id)
      VALUES (${prog}, 1, 5, 'Some note', 'tester', ${change_id})
    `;
    const { memoirLookup } = await import('../../src/lib/store/notes');
    const notes = await memoirLookup(prog, 1, 5, tdb.sql);
    expect(notes.length).toBe(1);
    expect(notes[0].text).toBe('Some note');
  });
});
