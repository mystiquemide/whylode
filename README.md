<p><img src="public/brand/logo.svg" alt="Whylode" height="40"></p>

Whylode is an IBM Bob 2.0 mode that asks the people who know why legacy RPG code was written that way, before Bob changes it.

[Live app](https://whylode.vercel.app) · [A recorded run](https://whylode.vercel.app/changes/2?tab=draft) · [Bob session history](bob_sessions/)

![The draft from run 1: one rate changed, two blocks kept, each with the owner's reason](docs/media/run1-draft.png)

## What it does

A lot of IBM i shops still run invoicing and payroll on RPG, and the people who know why it was written that way are retiring. Code tools can show where a rule lives, but not why a line exists. When a rule changes, Whylode has Bob trace every line that implements it. For each line the code can't explain, it asks the owner one plain question. The answer gets pinned to those lines in a memoir, and every line in the draft diff carries a changed or kept reason.

## See it run

Both runs below were recorded end to end in Bob IDE against the sample RPG system in [`fixtures/rpg`](fixtures/rpg), then approved in the web app.

In run 1, `INVCALC.rpgle` had two hardcoded rates. Bob changed `0.0725` to `0.0750` on line 30. It kept `0.0525` on lines 39 to 45 because the owner said it's a contract rate fixed until 2029.

In run 2, a different notice touched the same program. Bob found three INVCALC lines in the memoir and didn't ask about them again.

| Change | Lines traced | Questions | Lines already known | Conflicts | Bob task |
|---|---|---|---|---|---|
| [California sales tax rate change](https://whylode.vercel.app/changes/2?tab=draft) | 14 | 2 | 0 | 0 | [run 1](bob_sessions/README.md) |
| [EDI 810 tax detail requirement](https://whylode.vercel.app/changes/3?tab=trace) | 24 | 2 | 3 | 0 | [run 2](bob_sessions/README.md) |

The answers pinned beside the code are in the [memoir for INVCALC.rpgle](https://whylode.vercel.app/memoir/INVCALC.rpgle).

## How Bob is used

- Mode: [`.bob/custom_modes.yaml`](.bob/custom_modes.yaml) sets the Whylode role, the order of work, and the rule to ask instead of guessing.
- Skills: [`whylode-trace`](.bob/skills/whylode-trace/SKILL.md), [`whylode-ask`](.bob/skills/whylode-ask/SKILL.md), and [`whylode-draft`](.bob/skills/whylode-draft/SKILL.md).
- Document reading: Bob reads the notice PDFs in [`fixtures/notices`](fixtures/notices) directly and splits them into clauses.
- MCP: eight tools at `/api/mcp` ([`src/lib/mcp/server.ts`](src/lib/mcp/server.ts)), which are `whylode_register_program`, `whylode_open_change`, `whylode_memoir_lookup`, `whylode_record_trace`, `whylode_ask_expert`, `whylode_get_answers`, `whylode_flag_conflict`, and `whylode_submit_draft`.
- Agent mode: Bob built the mode, the skills, the MCP server, the schema and data layer, the API routes, the sample RPG system, the notice generator, and the tests. Commits carry Bob as co-author.
- Every Bob task, with its Bobcoin cost and the exported history, is indexed in [`bob_sessions/README.md`](bob_sessions/README.md).

The web interface, the deployment, and some review fixes were built with another coding assistant.

## Architecture

```
 Developer machine                         Hosted (Vercel)
+---------------------------+            +------------------------------------+
| IBM Bob IDE               |            | Next.js app (one deployment)       |
|  Whylode mode             |  HTTPS     |  /api/mcp   MCP server (8 tools)   |
|  Whylode skills           +----------->+  /api/*     JSON API for the web   |
|  reads RPG source + PDF   |  Bearer    |  pages      landing and app        |
+---------------------------+  token     +-----------------+------------------+
                                                           |
 Expert's phone                                            v
+---------------------------+  HTTPS          Postgres (Neon, serverless driver)
| /ask/[token]              +----------->
+---------------------------+
```

- One Next.js 16 app serves the MCP endpoint, the JSON API, and every page.
- Bob connects over stateless streamable HTTP with a bearer token.
- Owners answer through a link with an unguessable token, with no account needed.
- The server works out changed and kept from the diff itself, and it refuses a draft while any question or conflict is still open.
- 39 tests run against a real Postgres test database. More detail is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Run it yourself

```bash
git clone https://github.com/mystiquemide/whylode.git && cd whylode
npm ci
cp .env.example .env.local   # DATABASE_URL, WHYLODE_MCP_TOKEN, WHYLODE_ADMIN_KEY, WHYLODE_BASE_URL
npm run db:migrate && npm test
npm run dev
```

To connect Bob, open the repo in Bob IDE and copy `.bob/mcp.json.example` to `.bob/mcp.json`. Set the URL to your `/api/mcp` and the token to your `WHYLODE_MCP_TOKEN`. Then switch to the Whylode mode and send:

```
A change notice arrived: fixtures/notices/ca-tax-notice.pdf.
The system is in fixtures/rpg/. The system owner is <name>. Handle this change.
```

## About the test system

- The RPG order-to-invoice system in `fixtures/rpg` was written for this project, and its second rate is a deliberate trap. The notices are marked as samples.
- In the recorded runs, the owner's answers were given by the builder.
- Drafts are reviewed diffs. They aren't compiled or run on a real IBM i.
- Owners use link tokens and approvers use one shared key. There are no user accounts, and nothing here has been audited.

## License

[MIT](LICENSE)
