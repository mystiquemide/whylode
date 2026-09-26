// Recompute each draft reason's changed/kept label from its draft's diff.
// The label is derived by the server, so this only reapplies the current rule.
import { neon } from '@neondatabase/serverless';
import { changedLinesFromDiff } from '../src/lib/store/drafts';

(async () => {
  const sql = neon(process.env.DATABASE_URL!);
  const drafts = (await sql`SELECT id, diff FROM drafts`) as { id: number; diff: string }[];
  for (const d of drafts) {
    const changed = changedLinesFromDiff(d.diff);
    const reasons = (await sql`SELECT id, file, line_no, action FROM draft_reasons WHERE draft_id = ${d.id}`) as {
      id: number; file: string; line_no: number; action: string;
    }[];
    let updated = 0;
    for (const r of reasons) {
      const base = r.file.split('/').pop() ?? r.file;
      const action = changed.get(base)?.has(r.line_no) ? 'changed' : 'kept';
      if (action !== r.action) {
        await sql`UPDATE draft_reasons SET action = ${action} WHERE id = ${r.id}`;
        updated++;
      }
    }
    console.log(`draft ${d.id}: ${reasons.length} reasons, ${updated} relabeled`);
  }
})();
