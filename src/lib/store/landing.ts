import { NeonQueryFunction } from '@neondatabase/serverless';
import { sql as defaultSql } from '../db';

export type HeroProof = {
  change_id: number;
  file: string;
  line_no: number;
  code: string;
  note: string;
  author: string;
};

/**
 * The most recent approved draft's kept line that an owner's answer justified,
 * with the real source line. Null until such a record exists.
 */
export async function getHeroProof(db: NeonQueryFunction<false, false> = defaultSql): Promise<HeroProof | null> {
  const rows = await db`
    SELECT d.change_id, r.file, r.line_no, n.text AS note, n.author, p.source
    FROM draft_reasons r
    JOIN drafts d ON d.id = r.draft_id AND d.state = 'approved'
    JOIN notes n ON n.id = r.note_id
    JOIN programs p ON p.name = r.file
    WHERE r.action = 'kept'
    ORDER BY d.decided_at DESC, r.line_no
  `;
  if (rows.length === 0) return null;
  const all = rows as Array<{ change_id: number; file: string; line_no: number; note: string; author: string; source: string }>;
  // Prefer the kept line that assigns a literal value (a hardcoded rate), then any assignment.
  const lineOf = (r: (typeof all)[number]) => r.source.split('\n')[r.line_no - 1] ?? '';
  const pick =
    all.find((r) => /EVAL\s+\w+\s*=\s*[\d.]+/.test(lineOf(r))) ??
    all.find((r) => /EVAL\s+\w+\s*=/.test(lineOf(r))) ??
    all[0];
  const code = (pick.source.split('\n')[pick.line_no - 1] ?? '').trim().replace(/\s+/g, ' ');
  return { change_id: Number(pick.change_id), file: pick.file, line_no: pick.line_no, code, note: pick.note, author: pick.author };
}
