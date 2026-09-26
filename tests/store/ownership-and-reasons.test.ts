import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/testDb';
import { openChange } from '@/lib/store/changes';
import { recordTrace } from '@/lib/store/trace';
import { createExpert } from '@/lib/store/experts';
import { getQuestionForExpert } from '@/lib/store/questions';
import { answerQuestion } from '@/lib/store/notes';
import { submitDraft, getDraft } from '@/lib/store/drafts';

describe('expert ownership and draft reasons', () => {
  let tdb: TestDb;
  beforeAll(async () => { tdb = await createTestDb(); });
  afterAll(async () => { await tdb.teardown(); });

  it("an expert can't reach another expert's question", async () => {
    const { change_id } = await openChange('own', 'n.pdf', ['c'], tdb.sql);
    const q = { program: 'INVCALC.rpgle', line_start: 30, line_end: 30, excerpt: 'x', question: 'q' };
    const a = await createExpert(change_id, 'A', [q], tdb.sql);
    const b = await createExpert(change_id, 'B', [q], tdb.sql);
    expect(await getQuestionForExpert(a.question_ids[0], a.expert_id, tdb.sql)).not.toBeNull();
    expect(await getQuestionForExpert(a.question_ids[0], b.expert_id, tdb.sql)).toBeNull();
  });

  it('stores kept lines with the answer that justified them', async () => {
    const { change_id, clause_ids } = await openChange('kept', 'n.pdf', ['rate change'], tdb.sql);
    await recordTrace(clause_ids[0], [
      { program: 'INVCALC.rpgle', line_no: 30, code: '0.0725', confidence: 1 },
      { program: 'INVCALC.rpgle', line_no: 44, code: '0.0525', confidence: 0.4 },
    ], tdb.sql);
    const { question_ids } = await createExpert(change_id, 'Owner', [
      { program: 'INVCALC.rpgle', line_start: 39, line_end: 44, excerpt: 'x', question: 'what is C2?' },
    ], tdb.sql);
    const { note_id } = await answerQuestion(question_ids[0], 'contract rate, leave it', 'Owner', tdb.sql);
    const diff = '--- a/INVCALC.rpgle\n+++ b/INVCALC.rpgle\n@@ -30,1 +30,1 @@\n-EVAL TaxRate = 0.0725\n+EVAL TaxRate = 0.0750\n';
    await submitDraft(change_id, diff, [
      { file: 'INVCALC.rpgle', line_no: 30, clause_id: clause_ids[0], action: 'changed' },
      { file: 'INVCALC.rpgle', line_no: 44, note_id, action: 'kept' },
    ], tdb.sql);
    const draft = await getDraft(change_id, tdb.sql);
    const kept = draft!.reasons.find((r) => r.line_no === 44)!;
    expect(kept.action).toBe('kept');
    expect(kept.note_text).toBe('contract rate, leave it');
    expect(draft!.reasons.find((r) => r.line_no === 30)!.action).toBe('changed');
  });
});

describe('draft decisions', () => {
  let tdb: TestDb;
  beforeAll(async () => { tdb = await createTestDb(); });
  afterAll(async () => { await tdb.teardown(); });

  it('decides a pending draft once and refuses while a conflict is open', async () => {
    const { decideDraft } = await import('@/lib/store/drafts');
    const { flagConflict, reviewConflict } = await import('@/lib/store/conflicts');
    const { change_id } = await openChange('decide', 'n.pdf', ['c'], tdb.sql);
    const { question_ids } = await createExpert(change_id, 'Owner', [
      { program: 'P.rpgle', line_start: 1, line_end: 1, excerpt: 'x', question: 'q' },
    ], tdb.sql);
    const { note_id } = await answerQuestion(question_ids[0], 'a', 'Owner', tdb.sql);
    await submitDraft(change_id, '--- a\n+++ b\n', [], tdb.sql);

    const { conflict_id } = await flagConflict(change_id, note_id, 'claim', 'code', tdb.sql);
    await expect(decideDraft(change_id, 'approved', 'Lead', tdb.sql)).rejects.toThrow(/conflict/);
    await reviewConflict(conflict_id, tdb.sql);

    await decideDraft(change_id, 'approved', 'Lead', tdb.sql);
    expect((await getDraft(change_id, tdb.sql))!.state).toBe('approved');
    await expect(decideDraft(change_id, 'changes_requested', 'Lead', tdb.sql)).rejects.toThrow(/already/);
  });
});

describe('reason actions come from the diff', () => {
  it('marks only lines the diff edits as changed', async () => {
    const { changedLinesFromDiff } = await import('@/lib/store/drafts');
    const diff = [
      '--- a/fixtures/rpg/INVCALC.rpgle',
      '+++ b/fixtures/rpg/INVCALC.rpgle',
      '@@ -28,7 +28,7 @@',
      '       *',
      '       * Set rate',
      '-     C                   EVAL      TaxRate  = 0.0725',
      '+     C                   EVAL      TaxRate  = 0.0750',
      '       *',
    ].join('\n');
    const map = changedLinesFromDiff(diff);
    expect([...map.get('INVCALC.rpgle')!]).toEqual([30]);
  });

  it('counts an insertion as a change to the line it follows', async () => {
    const { changedLinesFromDiff } = await import('@/lib/store/drafts');
    const diff = ['--- a/INVCALC.rpgle', '+++ b/INVCALC.rpgle', '@@ -25,3 +25,4 @@', ' PARM TaxAmt', ' PARM ErrFlag', '+PARM TaxRate', ' *'].join('\n');
    expect([...changedLinesFromDiff(diff).get('INVCALC.rpgle')!]).toEqual([26]);
  });
});
