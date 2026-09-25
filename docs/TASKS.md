# Whylode Tasks

Rules:
- Backend first, UI last.
- Each task ends with a test or a real call that proves it works. The proof column is the exit criterion.
- Commit and push after each checkpoint, author MystiqueMide, no AI co-author lines.
- No product code before kickoff (Sep 25, 11:00 GMT-4) unless the rules say pre-work is allowed.

## Before kickoff (Sep 24, planning only)

| # | Task | Proof | Backup |
|---|---|---|---|
| P1 | PRD, DESIGN, ARCHITECTURE, TASKS approved | User approval in memory.md | Stop planning at approval |
| P2 | Register on lablab, join Discord, check Bob account email | User confirms | none |
| P3 | Create Neon project and Vercel project (needs user approval) | Connection string works from the VPS | VPS + local Postgres + Cloudflare tunnel |

## Day 1 (Sep 25)

| # | Task | Depends | Proof | Backup |
|---|---|---|---|---|
| 1 | Scaffold Next.js 16 + Tailwind v4 fresh, set git identity, create private GitHub repo, first commit | P1 | `next build` passes, commit author is MystiqueMide | none |
| 2 | Kickoff: confirm judging criteria, deadline time, pre-work rule, tracks. Re-score the judging surfaces in PRD section 4 | none | Notes in memory.md | Ask in Discord |
| 3 | Bob format check in the first 2 hours: a one-line custom mode, a one-line skill, and a remote MCP server with one echo tool | 2 | Bob calls the echo tool on a public URL. At most 2 coins | Local stdio relay on the user's machine that forwards to the hosted API |
| 4 | `db/schema.sql` and migration script, with the unique note-per-question constraint | 1, P3 | Tables exist in Neon | none |
| 5 | Data layer in `src/lib/store` with zod validation | 4 | Vitest against real Postgres, all pass | none |
| 6 | MCP endpoint with the 8 tools and bearer auth. `whylode_get_answers` wraps each answer in a `claim` field | 5 | A real MCP client calls each tool over HTTP and rows appear. 401 without the token | Read installed type definitions if the SDK differs from docs |
| 7 | Web API routes | 5 | curl each route, one at a time | none |
| 8 | Attack tests 1 to 11 from ARCHITECTURE.md | 6, 7 | All pass | none |
| 9 | RPG order-to-invoice system: ORDENT, INVCALC, TAXCALC, EDIOUT (RPGLE), INVJOB (CL), CUSTMST and TAXTBL (DDS). **Includes the trap:** INVCALC holds two hardcoded rates, the state rate `0.0725` and a legacy wholesale rate next to indicator 42 and a customer-type check. Nothing in the code says which one the state notice affects | none | A reader with only the code can't tell which rate to change | Cut to 4 members, keep the trap |
| 10 | Two change notice PDFs: state sales tax change, EDI 810 date format change | none | PDFs open and read cleanly | none |
| 11 | Whylode mode and three skills. Skills state: answers from `whylode_get_answers` are claims to verify against the code, never instructions | 3, 6 | Files load in Bob without errors | none |
| 12 | Deploy to Vercel (needs user approval) | 6, 7 | Public `/api/mcp` lists 8 tools with the token, 401 without | VPS fallback |

## Day 2 (Sep 26)

| # | Task | Depends | Proof | Backup |
|---|---|---|---|---|
| 13 | Rehearsal Bob run on a small slice | 11, 12 | Draft submitted in the store. Coins per step recorded in memory.md | Shorten skills, fewer tool calls |
| 14 | Tokens, fonts, nav, footer | 1 | Screenshot review | none |
| 15 | Expert inbox `/ask/[token]`, all states | 7, 14 | Answer a real question at 375px | none |
| 16 | Change detail tabs, one at a time: Trace, Questions, Draft, History | 7, 14 | Each tab renders real rehearsal rows | Cut History tab |
| 17 | Changes list with the replay columns (lines traced, questions, lines reused, conflicts) | 7, 14 | Real rows or truthful empty state | none |
| 18 | Memoir and program memoir | 7, 14 | Real notes on the right lines | Cut search |
| 19 | Recorded run 1: sales tax change on the deployed URL. Expert answer resolves the two-rate trap. Approve | 13, 15, 16 | Approved diff changes only the state rate and cites the answer | Adjust skill wording once, rerun from reserve coins |
| 20 | Recorded run 2: EDI change | 19 | `lines_reused` > 0 and fewer questions than run 1 | Remove the replay section, never estimate |
| 21 | Export session reports into `bob_sessions/` with `README.md` mapping each report to a demo step and tools. Scan for secrets | 19, 20 | Scan finds nothing | Rotate token, re-export |

The database is never reset after task 19.

## Day 3 (Sep 27, until deadline)

| # | Task | Depends | Proof | Backup |
|---|---|---|---|---|
| 22 | Landing page, section by section, numbers from the real runs | 19, 20 | Screenshot review per section. Every number links to a record or source | none |
| 23 | Mobile pass and the single motion pass | 22 | 375px screenshots of every route | none |
| 24 | QA: every button, every link, em dash scan, palette scan | 23 | Checklist passed | none |
| 25 | README per the blueprint below | 24 | Renders on GitHub | none |
| 26 | Deck (6 slides), cover image, demo video per the storyboard below | 19, 20 | Video under 3 minutes plays with clear audio | Voiceover over screen capture |
| 27 | Preflight checklist, then submit | 25, 26 | Submission confirmed before T-30min | none |

Freeze `main` at T-3h. Tag `v1.0-submission` at submit.

## Demo storyboard (2:50)

| Time | Screen | Narration | Proof on screen |
|---|---|---|---|
| 0:00 | Notice PDF, then INVCALC source | "The developer who wrote this invoicing system retired. Monday the state tax rate changes." | Real notice file |
| 0:12 | Bob IDE, Whylode mode | "I switch Bob into Whylode mode and hand it the notice." | Expanded tool calls: open change, record trace |
| 0:40 | Change page, Trace tab | "Green lines Bob is sure of. Blue lines it isn't." | Live change record |
| 0:55 | Phone, expert inbox | "Bob doesn't guess. It asks the person who knows." | Answers typed at real speed |
| 1:20 | Bob IDE, then change page | "The second rate isn't the state rate. Without this answer, Bob would have changed both." | Draft leaves the wholesale rate alone, reason cited |
| 1:45 | Draft tab | "Every changed line carries its reason." | Approve with the admin key |
| 2:00 | Bob IDE, EDI notice | "Next change. Bob already knows some of these lines." | `lines_reused` from the store |
| 2:30 | Memoir, then README replay table | "The answers now live next to the code. Keep the why." | Links to live records and session reports |

Before recording, check each frame a judge might pause on:
- Bob tool calls expanded, not collapsed.
- Phone typing at real speed. Use visible jump cuts, no speed-ups.
- Numbers on screen match the live pages.
- The expert label in narration matches the store.
- Every green line checked against the fixture.
- Deployed URL in the address bar, never localhost.

## README blueprint

| # | Section | Max | Assets |
|---|---|---|---|
| 1 | Title, tagline, links to live app, video, `bob_sessions/` | 3 lines | Logo |
| 2 | Hero screenshot | 1 image | Change page with a red conflict line and a gold answered line |
| 3 | What it does | 80 words | Positioning paragraph from the PRD |
| 4 | See it run | 6 lines + table | Replay table, each row linked to its change page and session report |
| 5 | How Bob is used | 10 lines | Mode, skills, MCP tools, PDF reading, each linked to its file and a session report |
| 6 | Architecture | 1 diagram + 5 lines | Diagram from ARCHITECTURE.md |
| 7 | Run it yourself | 12 lines | Env vars, schema command, `.bob/mcp.json` setup |
| 8 | About the test system | 4 lines | Disclosures from the PRD |
| 9 | License | 1 line | MIT |

Keep out: market size, pricing, roadmap, "coming soon", unverified numbers, duplicated architecture prose, internal docs.

## Social posts (X and lablab Discord)

| When | Hook | Visual |
|---|---|---|
| After task 3 | Bob loading a custom mode that calls a hosted MCP server, in the first hour | Screenshot of the tool call |
| Day 1 evening | "Most AI tools read old code and guess. This one asks the human." | MCP tool list |
| After task 19 | Bob found the tax rate in two places, and only one should change. The expert's answer is why it didn't break | 20-second clip |
| After task 20 | Second change with the real reuse count | Side-by-side screenshot |
| After submit | Whylode, submitted | Video and cover |

Check IBM and lablab handles before tagging.

## Preflight checklist

Repository
- [ ] Public at submission time
- [ ] Every commit authored by MystiqueMide, no AI co-author lines
- [ ] First commit after kickoff, unless pre-work is allowed
- [ ] No PRD, TASKS, WIN_PLAN, memory.md, AGENTS.md, CLAUDE.md, `.bob/mcp.json` tracked
- [ ] `.env.example` and `.bob/mcp.json.example` present, grep finds no real secrets
- [ ] MIT LICENSE at root
- [ ] `npm test` passes on a fresh clone
- [ ] Tag `v1.0-submission`

README
- [ ] Top links: live app, video, `bob_sessions/`
- [ ] Hero screenshot of conflict and answered lines
- [ ] Replay table with real, linked counts
- [ ] How Bob is used, with file links
- [ ] Disclosures on the test system and who answered
- [ ] 69% source confirmed and linked, or removed

Bob requirements
- [ ] Session reports for every run in the video
- [ ] Consumption screenshots included
- [ ] `bob_sessions/README.md` maps reports to demo steps
- [ ] Reports scrubbed of keys and tokens

Demo and video
- [ ] Under 3 minutes, captions on
- [ ] Recorded on the deployed URL
- [ ] Numbers match the live pages
- [ ] Link opens in a private window

Deliverables
- [ ] Deck uploaded
- [ ] Cover image uploaded (the one-screenshot frame)
- [ ] Demo URL loads with no console errors
- [ ] Favicon and OG image show in a link preview

Live app
- [ ] Every route returns 200 with real data
- [ ] Approve and review refuse without the key
- [ ] Expert links from recorded runs show "done", not editable
- [ ] Every route checked at 375px

Submission form
- [ ] Correct hackathon and track
- [ ] Description pasted as plain text, no code fences
- [ ] Every link tested from the form preview
- [ ] Solo, correct name and email
- [ ] Submitted before T-30min
