# IBM Bob sessions

Evidence of how IBM Bob built and runs Whylode.

- `bob-task-history-2026-09-26.md`: the full exported task history from Bob IDE, every message and tool call.
- `whylode_task01_mode_format_check.png`, `whylode_task02_data_layer.png`: task session summary screenshots.
- `whylode_run1_ca_tax_change.jpg`: task session summary for recorded run 1, the California sales tax change (1.16 Bobcoins).

## Tasks

Costs are the Bobcoins Bob reported for each task. Times are UTC.

| When | Task | Bobcoins | What happened |
|---|---|---|---|
| Sep 25 15:41 | Schema and data layer | 17.22 | Bob built `db/schema.sql`, the migration script, the data layer in `src/lib/store`, validation, and the store tests. |
| Sep 25 16:27 | Session screenshot | 0.63 | Added the first task summary screenshot to this folder. |
| Sep 25 16:33 | Commit attribution | 0.77 | Set up IBM Bob as co-author on its commits. |
| Sep 25 16:43 | Backend build | 6.00 | Bob fixed test isolation, then built the custom mode, the three skills, the MCP server and its eight tools, the API routes, the sample RPG system, the change notices, and the attack tests. |
| Sep 25 20:35 | Account check | 0.02 | Checked the Bob account after a Forbidden error. |
| Sep 25 20:51 to 21:35 | Rehearsals | 2.23 | Four rehearsal runs of the tax change, used to find and fix problems before recording. The first two ran on stale local files. |
| Sep 26 07:28 | Voided run | 0.61 | A run started with a placeholder owner name. It was discarded and its records deleted. |
| Sep 26 07:38 | Recorded run 1 | 1.17 | California sales tax rate change. Bob asked about the C2 contract rate, changed only the state rate, and kept the contract rate with the owner's answer as the reason. Change 2 on the live site. |
| Sep 26 12:11 | Recorded run 2 | 1.32 | EDI 810 tax detail requirement. Bob reused 3 already answered lines from the memoir and only asked about new wiring. Change 3 on the live site. |

The hackathon allocation covered the build tasks. The runs from Sep 25 20:35 onward used a personal Bob trial account after the allocation ran out.
