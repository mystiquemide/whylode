import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestDb, type TestDb } from '../helpers/testDb';
import { openChange } from '@/lib/store/changes';
import { recordTrace, getTraceLines } from '@/lib/store/trace';
import { createExpert } from '@/lib/store/experts';
import { answerQuestion } from '@/lib/store/notes';
import { flagConflict, reviewConflict } from '@/lib/store/conflicts';

// Trace lines follow the question lifecycle: traced, asked, answered, conflict.
describe('trace line state', () => {
  let tdb: TestDb;
  beforeAll(async () => { tdb = await createTestDb(); });
  afterAll(async () => { await tdb.teardown(); });

  it('moves traced to asked to answered to conflict and back', async () => {
    const { change_id, clause_ids } = await openChange('state test', 'n.pdf', ['clause'], tdb.sql);
    await recordTrace(clause_ids[0], [
      { program: 'INVCALC.rpgle', line_no: 30, code: 'EVAL TaxRate = 0.0725', confidence: 0.95 },
      { program: 'INVCALC.rpgle', line_no: 44, code: 'EVAL TaxRate = 0.0525', confidence: 0.4 },
    ], tdb.sql);
    const state = async (line: number) =>
      (await getTraceLines(change_id, tdb.sql)).find((l) => l.line_no === line)!.state;

    const { question_ids } = await createExpert(change_id, 'Owner', [
      { program: 'INVCALC.rpgle', line_start: 39, line_end: 45, excerpt: 'x', question: 'q' },
    ], tdb.sql);
    expect(await state(44)).toBe('asked');
    expect(await state(30)).toBe('traced');

    const { note_id } = await answerQuestion(question_ids[0], 'contract rate', 'Owner', tdb.sql);
    expect(await state(44)).toBe('answered');

    const { conflict_id } = await flagConflict(change_id, note_id, 'claim', 'code', tdb.sql);
    expect(await state(44)).toBe('conflict');

    await reviewConflict(conflict_id, tdb.sql);
    expect(await state(44)).toBe('answered');
  });
});
