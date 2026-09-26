import { baseUrl } from '@/lib/base-url';
/**
 * Whylode MCP server — 8 tools, stateless streamable HTTP.
 *
 * This module exports a single `createMcpServer()` factory that registers all
 * tools and returns a connected McpServer ready to handle one request.
 * It is called fresh per request so no state leaks across invocations.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import { upsertProgram } from '../store/programs';
import { openChange } from '../store/changes';
import { memoirLookup } from '../store/notes';
import { recordTrace } from '../store/trace';
import { createExpert } from '../store/experts';
import { getAnswersForChange } from '../store/questions';
import { flagConflict } from '../store/conflicts';
import { submitDraft } from '../store/drafts';

// ── helpers ──────────────────────────────────────────────────────────────────

function ok(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
}

function toolError(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true as const };
}

async function runTool<T>(fn: () => Promise<T>) {
  try {
    const result = await fn();
    return ok(result);
  } catch (err) {
    return toolError(err instanceof Error ? err.message : String(err));
  }
}

// ── factory ───────────────────────────────────────────────────────────────────

export function createMcpServer() {
  const server = new McpServer({ name: 'whylode', version: '0.1.0' });

  // 1. whylode_register_program
  server.tool(
    'whylode_register_program',
    'Upsert an RPG program source so the web can render it alongside notes.',
    {
      name:        z.string().min(1).describe('Program file name, e.g. INVCALC.rpgle'),
      description: z.string().default('').describe('Short description of what the program does'),
      source:      z.string().default('').describe('Full source text'),
    },
    async ({ name, description, source }) =>
      runTool(() => upsertProgram(name, description, source)),
  );

  // 2. whylode_open_change
  server.tool(
    'whylode_open_change',
    'Open a new change from a notice document. Creates the change record and its clauses.',
    {
      title:       z.string().min(1).describe('Short title for the change'),
      source_file: z.string().min(1).describe('Notice filename or path, e.g. ca-tax-notice.pdf'),
      clauses:     z.array(z.string().min(1)).min(1).describe('Array of extracted change clauses from the notice'),
    },
    async ({ title, source_file, clauses }) =>
      runTool(() => openChange(title, source_file, clauses)),
  );

  // 3. whylode_memoir_lookup
  server.tool(
    'whylode_memoir_lookup',
    'Look up existing notes overlapping a line range. Use before tracing to find already-known facts.',
    {
      program:    z.string().min(1).describe('Program file name'),
      line_start: z.number().int().positive().describe('First line of the range (inclusive)'),
      line_end:   z.number().int().positive().describe('Last line of the range (inclusive)'),
    },
    async ({ program, line_start, line_end }) =>
      runTool(() => memoirLookup(program, line_start, line_end)),
  );

  // 4. whylode_record_trace
  server.tool(
    'whylode_record_trace',
    'Record which lines in the source implement a change clause. Lines with a known_note_id are marked known (reused from the memoir).',
    {
      clause_id: z.number().int().positive().describe('Clause id from whylode_open_change'),
      lines: z.array(z.object({
        program:       z.string().min(1),
        line_no:       z.number().int().positive(),
        code:          z.string().default('').describe('Verbatim source line'),
        confidence:    z.number().min(0).max(1).describe('Confidence that this line is relevant (0–1)'),
        known_note_id: z.number().int().positive().optional().describe('Note id from memoir if this line is already known'),
      })).min(1),
    },
    async ({ clause_id, lines }) =>
      runTool(() => recordTrace(clause_id, lines)),
  );

  // 5. whylode_ask_expert
  server.tool(
    'whylode_ask_expert',
    'Create an expert token and open questions. Returns the expert link to share.',
    {
      change_id:   z.number().int().positive(),
      expert_name: z.string().min(1).describe('Display name of the expert'),
      questions: z.array(z.object({
        program:    z.string().min(1),
        line_start: z.number().int().positive(),
        line_end:   z.number().int().positive(),
        excerpt:    z.string().default('').describe('Relevant source excerpt shown to the expert'),
        question:   z.string().min(1),
      })).min(1),
    },
    async ({ change_id, expert_name, questions }) =>
      runTool(async () => {
        const result = await createExpert(change_id, expert_name, questions);
        const base = baseUrl();
        return {
          expert_id: result.expert_id,
          link: `${base}/ask/${result.token}`,
          question_ids: result.question_ids,
        };
      }),
  );

  // 6. whylode_get_answers
  server.tool(
    'whylode_get_answers',
    'Get all questions and answers for a change. Answers are wrapped in a claim field — verify each against the code before acting.',
    {
      change_id: z.number().int().positive(),
    },
    async ({ change_id }) =>
      runTool(() => getAnswersForChange(change_id)),
  );

  // 7. whylode_flag_conflict
  server.tool(
    'whylode_flag_conflict',
    'Flag a conflict between an expert claim and what the code actually shows. Blocks draft submission until reviewed.',
    {
      change_id: z.number().int().positive(),
      note_id:   z.number().int().positive().describe('The note id whose claim conflicts with the code'),
      claim:     z.string().min(1).describe('What the expert said'),
      code_fact: z.string().min(1).describe('What the code actually shows'),
    },
    async ({ change_id, note_id, claim, code_fact }) =>
      runTool(() => flagConflict(change_id, note_id, claim, code_fact)),
  );

  // 8. whylode_submit_draft
  server.tool(
    'whylode_submit_draft',
    'Submit a proposed diff for approval. Refused while any question or conflict is open.',
    {
      change_id: z.number().int().positive(),
      diff:      z.string().min(1).describe('Unified diff of the proposed change'),
      reasons: z.array(z.object({
        file:      z.string().min(1),
        line_no:   z.number().int().positive(),
        note_id:   z.number().int().positive().optional(),
        clause_id: z.number().int().positive().optional(),
        action:    z.enum(['changed', 'kept']).optional()
          .describe("'changed' for lines the diff edits (default), 'kept' for traced lines deliberately left unchanged"),
      })).describe('One reason per line: every changed line, and every traced line kept unchanged. Cite note_id when an expert answer is the reason.'),
    },
    async ({ change_id, diff, reasons }) =>
      runTool(() => submitDraft(change_id, diff, reasons)),
  );

  return server;
}

// ── stateless request handler ─────────────────────────────────────────────────

export async function handleMcpRequest(request: Request): Promise<Response> {
  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(request);
}
