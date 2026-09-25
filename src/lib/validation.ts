import { z } from 'zod';

// ── whylode_register_program ─────────────────────────────────────────────────
export const RegisterProgramInput = z.object({
  name:        z.string().min(1),
  description: z.string().default(''),
  source:      z.string().default(''),
});
export type RegisterProgramInput = z.infer<typeof RegisterProgramInput>;

// ── whylode_open_change ──────────────────────────────────────────────────────
export const OpenChangeInput = z.object({
  title:       z.string().min(1),
  source_file: z.string().min(1),
  clauses:     z.array(z.string().min(1)).min(1),
});
export type OpenChangeInput = z.infer<typeof OpenChangeInput>;

// ── whylode_memoir_lookup ────────────────────────────────────────────────────
export const MemoirLookupInput = z.object({
  program:    z.string().min(1),
  line_start: z.number().int().positive(),
  line_end:   z.number().int().positive(),
});
export type MemoirLookupInput = z.infer<typeof MemoirLookupInput>;

// ── whylode_record_trace ─────────────────────────────────────────────────────
export const TraceLineInput = z.object({
  program:        z.string().min(1),
  line_no:        z.number().int().positive(),
  code:           z.string().default(''),
  confidence:     z.number().min(0).max(1),
  known_note_id:  z.number().int().positive().optional(),
});

export const RecordTraceInput = z.object({
  clause_id: z.number().int().positive(),
  lines:     z.array(TraceLineInput).min(1),
});
export type RecordTraceInput = z.infer<typeof RecordTraceInput>;

// ── whylode_ask_expert ───────────────────────────────────────────────────────
export const ExpertQuestionInput = z.object({
  program:    z.string().min(1),
  line_start: z.number().int().positive(),
  line_end:   z.number().int().positive(),
  excerpt:    z.string().default(''),
  question:   z.string().min(1),
});

export const AskExpertInput = z.object({
  change_id:   z.number().int().positive(),
  expert_name: z.string().min(1),
  questions:   z.array(ExpertQuestionInput).min(1),
});
export type AskExpertInput = z.infer<typeof AskExpertInput>;

// ── whylode_get_answers ──────────────────────────────────────────────────────
export const GetAnswersInput = z.object({
  change_id: z.number().int().positive(),
});
export type GetAnswersInput = z.infer<typeof GetAnswersInput>;

// ── whylode_flag_conflict ────────────────────────────────────────────────────
export const FlagConflictInput = z.object({
  change_id: z.number().int().positive(),
  note_id:   z.number().int().positive(),
  claim:     z.string().min(1),
  code_fact: z.string().min(1),
});
export type FlagConflictInput = z.infer<typeof FlagConflictInput>;

// ── whylode_submit_draft ─────────────────────────────────────────────────────
export const DraftReasonInput = z.object({
  file:      z.string().min(1),
  line_no:   z.number().int().positive(),
  note_id:   z.number().int().positive().optional(),
  clause_id: z.number().int().positive().optional(),
});

export const SubmitDraftInput = z.object({
  change_id: z.number().int().positive(),
  diff:      z.string().min(1),
  reasons:   z.array(DraftReasonInput),
});
export type SubmitDraftInput = z.infer<typeof SubmitDraftInput>;
