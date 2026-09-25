# Whylode PRD

Version 1.0, 2026-09-24. Status: awaiting approval.

## 1. Summary

Whylode is an IBM Bob 2.0 add-on for IBM i teams. When a business rule changes (a tax rate, an EDI format, a policy), Bob traces every RPG, CL, and DDS line that implements the rule. Where Bob can't explain a line with confidence, Whylode asks the one person who knows, pins the answer to those exact lines, and keeps it in a memoir that Bob and the next developer reuse on the next change. Bob then drafts the change with the reasons attached, and a person approves it.

One line: keep the why behind old code before the people who know it leave.

Positioning (first 15 seconds of every pitch, README, and video):

> Whylode is a Bob mode for IBM i teams. When a rule changes, Bob finds every line that implements it. Where the code can't explain itself, Bob asks the person who knows, and saves the answer next to those lines. The next change starts from what's already known.

Lead with the question loop and the prevented bug. Never lead with "documents your code", which puts Whylode in the crowded AI-documentation bucket.

Story anchor: real, linked posts (r/IBMi on rule changes hitting undocumented RPG, r/cscareerquestions on senior engineers leaving with undocumented logic). No invented founder story. If MystiqueMide has a real experience with inherited code, it replaces the posts.

What Whylode deliberately doesn't do:
- It doesn't translate RPG to Java. IBM and Fresche already do, and translation carries the missing intent into new code.
- It doesn't document whole systems. It works only on lines a real change touches, so every question has a reason.
- There are no accounts, dashboards, or analytics. The expert gets one link and answers on a phone.

## 2. Problem

- IBM i shops run order, invoice, and payroll logic in RPG written decades ago. 69% name skills as their top concern (IT Jungle, Jan 2026).
- Nothing breaks until a rule changes. Then someone edits undocumented code without knowing the original intent (r/IBMi, "What actually happens to your RPG programs when the last developer retires").
- Existing tools (Bob Premium Package for i, Fresche X-Analysis, ARCAD) show where code lives and what it does. None capture why, and none ask a human when the code can't answer. AI documentation fails on indicators, multi-program call chains, and business context that was never in the code (r/IBMi, "Documenting RPG IV with AI").

## 3. Users

| Persona | Need | Surface |
|---|---|---|
| IT director at an IBM i shop (buyer) | Change the system safely after key people leave | Changes list, memoir |
| Remaining or new developer (daily user) | Make the change without guessing | Bob IDE with the Whylode mode, change detail |
| Retiring expert (contributor) | Answer a few precise questions fast, on any device | Expert inbox |
| Approver (manager or lead) | Know every edited line has a reason | Draft and approval |

## 4. Goals and KPIs

Hackathon goals:
1. A judge sees one real end-to-end run: change notice in, lines traced, questions answered, diff approved, memoir updated.
2. A second change reuses the memoir and asks fewer questions. The number is shown from the real run.
3. Bob is visibly the core: custom mode, skills, MCP tools, and native PDF reading, all in the exported session reports. Every product action (trace, ask, check answer, draft) happens in a Bob session. The web app is a window onto the store, never a second place where the work happens.
4. The demo shows one moment where an expert's answer prevents a wrong change (US11).

Judging surfaces (2.0 criteria unpublished, assumed from last edition, re-check at kickoff):

| Surface | Evidence we must produce |
|---|---|
| Bob as core component | Session reports for every demo step, mapped in `bob_sessions/README.md` |
| Working product | Deployed URL with the two recorded runs as live records |
| Real-world impact | Cited 69% stat, two linked Reddit posts, the prevented-bug moment |
| Originality | The ask-the-human loop and memoir reuse, shown with real counts |
| Presentation | Video under 3 minutes, deck, cover, README per the blueprint in TASKS.md |

Product KPIs (tracked from real records in the store):
- Questions per change, first change vs later changes (target: falls with each change).
- Share of traced lines already explained by the memoir.
- Time from question sent to answered.
- Conflicts caught (answers that contradict the code).

## 5. Scope

### In scope (thin full V1)

1. **Whylode mode for Bob** (`.bob/custom_modes.yaml`): role, instructions, and allowed tool groups (read, edit, mcp).
2. **Whylode skills for Bob** (`.bob/skills/*/SKILL.md`): trace a change, find gaps, draft with reasons, reuse the memoir.
3. **Whylode MCP server** (streamable HTTP): tools Bob calls to open a change, record clauses and traced lines, ask questions, read the memoir, record drafts, and check answers.
4. **Store**: one database holding changes, clauses, traced lines, questions, answers, conflicts, drafts, approvals, and events.
5. **Web app** (Next.js), per `docs/DESIGN.md`: landing, changes list, change detail, expert inbox, memoir, program memoir.
6. **Order-to-invoice RPG system**: about six RPG, CL, and DDS members written in period style (fixed format, indicators, a hardcoded rate), used as the codebase for the recorded run. It's labeled in the README as a realistic test system, not a customer system.
7. **Two real change notices** as PDFs: a sales tax rate change and an EDI date format change.
8. **Session reports** exported from Bob into `bob_sessions/`.

### Out of scope

- Compiling or running RPG on a real IBM i (no PUB400, decided 2026-09-24).
- Direct QSYS/IFS connection (needs Bob Premium Package for i).
- User accounts, roles, or SSO. Expert links use unguessable tokens.
- Email or SMS sending. The developer copies the expert link.
- COBOL or Z support.
- watsonx.ai and watsonx Orchestrate.
- Public mentions of anything above. They invite "is that built?"

Cut first if Day 2 runs late (none appear in the demo): memoir search, question reassign, the History tab (the events table stays).

Never ship:
- The replay section filled with estimated numbers. If run 2 fails, the section is removed.
- The unverified "~100k IBM i shops" figure.
- A named character ("Maria") unless the store and narration use the same real label.

Disclosures (README and video):
- The RPG order-to-invoice system in `fixtures/` was written for this project in period style.
- The expert answers in the recorded runs were given by the builder.
- The loop works on any RPG source.

## 6. User stories and acceptance criteria

| ID | Story | Acceptance criteria |
|---|---|---|
| US1 | As a developer, I give Bob a change notice PDF and it opens a change in Whylode. | Bob reads the PDF natively. A change record exists with title, source file, and clauses split from the notice. It appears on `/changes`. |
| US2 | As a developer, Bob traces each clause to the exact lines that implement it. | Each clause has one or more traced lines with file, line number, code text, and confidence. The Trace tab shows them. |
| US3 | As a developer, Bob asks the expert only where it's unsure. | Low-confidence lines become questions with the file, line, a short code excerpt, and one plain question. Lines already explained in the memoir aren't asked again. |
| US4 | As an expert, I answer on my phone without an account. | `/ask/[token]` shows one question at a time, saves the answer, and shows done when finished. Invalid tokens show the expired state. Works at 375px. |
| US5 | As an expert, I can hand a question to someone else. | Reassign records the new name. The question keeps its history. |
| US6 | As a developer, a wrong answer is caught. | When Bob checks an answer against the code and they disagree, a conflict record shows both sides. The draft stays locked until the conflict is resolved or reviewed. |
| US7 | As an approver, I see every edited line with its reason. | The Draft tab shows a unified diff. Each changed line links to the memoir answer or traced clause behind it. Approve records the name and time. |
| US8 | As a new developer, I read the memoir. | `/memoir` lists programs with real note counts. `/memoir/[program]` shows the full source with notes on their lines. |
| US9 | As a developer, the second change reuses what's known. | Running the EDI change shows known lines pulled from the memoir, with fewer new questions. The change record stores both counts. |
| US10 | As a judge, I can check that Bob did the work. | `bob_sessions/` holds exported task histories and consumption screenshots for every run in the demo. `bob_sessions/README.md` maps each report to a demo step and the MCP tools it called. The README links it. |
| US11 | As an approver, an expert's answer stops a wrong edit. | The test system has two hardcoded rates in INVCALC: the state rate and a legacy wholesale rate that must not change. Nothing in the code says which is which. Bob asks, the expert answers, and the approved diff changes only the state rate and cites the answer as the reason. |
| US12 | As a developer, an expert's answer can't hijack Bob. | Answers reach Bob as labeled data. The skill treats them as claims to verify against the code, never as instructions. An answer containing instructions still leaves the draft locked if a conflict is open. Approval only happens on the web with the admin key. |
| US13 | As a judge, every number is checkable. | The replay table (change, lines traced, questions, lines reused, conflicts) is computed from store rows. Each row links to its change page and its session report. |

## 7. RICE backlog

Reach is on a 1-10 scale for how much of the judged demo it touches. Impact is 0.5 to 3. Confidence is 0-100%. Effort is in hours.

| # | Item | R | I | C | E | Score | Tier |
|---|---|---|---|---|---|---|---|
| 1 | MCP server with change, clause, line, question, answer tools | 10 | 3 | 90% | 5 | 5.4 | Must |
| 2 | Store and schema | 10 | 3 | 95% | 2 | 14.3 | Must |
| 3 | Whylode mode and skills | 10 | 3 | 70% | 3 | 7.0 | Must |
| 4 | RPG order-to-invoice system and two notice PDFs | 10 | 2 | 85% | 4 | 4.3 | Must |
| 5 | Expert inbox `/ask/[token]` | 9 | 3 | 90% | 3 | 8.1 | Must |
| 6 | Change detail (trace, questions, draft, approve) | 9 | 3 | 85% | 5 | 4.6 | Must |
| 7 | Memoir and program memoir | 8 | 2 | 90% | 4 | 3.6 | Must |
| 8 | Conflict detection and state | 7 | 2 | 70% | 2 | 4.9 | Should |
| 9 | Landing page | 8 | 2 | 95% | 4 | 3.8 | Should |
| 10 | Changes list | 6 | 1 | 95% | 1 | 5.7 | Should |
| 11 | Second change run (replay) | 9 | 3 | 75% | 2 | 10.1 | Must |
| 12 | Reassign question | 3 | 1 | 90% | 1 | 2.7 | Could |
| 13 | Memoir search | 3 | 1 | 90% | 1 | 2.7 | Could |
| 14 | Deck, cover image, video | 10 | 3 | 90% | 5 | 5.4 | Must (submission) |

## 8. Bobcoin budget (40 total, no refills)

Bob does the product work. Everything else is built outside Bob.

| Use | Coins (estimate) |
|---|---|
| Rehearsal run on a small change to check mode, skills, and MCP wiring | 6 |
| Recorded run 1: sales tax change | 12 |
| Recorded run 2: EDI change (replay) | 8 |
| Fixes to the mode or skills found in rehearsal | 6 |
| Reserve | 8 |

These are guesses. One public report burned 40 coins in 3 hours of general use. The real burn rate gets measured in the rehearsal, and the plan is adjusted then.

## 9. Constraints

- Bob access opens at kickoff, Sep 25 11:00 GMT-4. Nothing Bob-side can be tested before then.
- Bob runs on the user's machine. The MCP server has to be reachable from there, so it's hosted on a public HTTPS URL, not localhost on the VPS.
- Deadline: Sep 27 (exact time to confirm at kickoff). 48 hours, solo.
- No mock data. The store is empty until the first real run. The landing page's run numbers are filled from the real run.

## 10. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Bob burns coins faster than planned | No recorded run | Build and test the MCP server and web app with direct API calls first. Spend coins only on the recorded runs. |
| Bob doesn't call the MCP tools reliably | Broken loop | Keep tools few and specific. Name tools in the mode instructions. Test in the rehearsal run. |
| Hackathon Bob account blocks remote MCP | No link between Bob and the store | Fall back to a stdio MCP server on the user's machine that forwards to the hosted API. Check at kickoff. |
| Custom mode or skills format differs from docs | Mode won't load | Formats taken from current Bob docs (custom modes, skills, MCP). Verify at kickoff. |
| Judges see the RPG system as staged | Weaker credibility | Say so plainly in the README and video. The value is the loop, and it runs on any RPG source. |
| Public URL for expert answers exposes the store | Data tampering | Unguessable tokens, answer-only write access on the inbox, admin actions need a key. |
| Bob ships as a side feature of a web app | Loses the "Bob is core" surface | Every product action runs in Bob. Web app is read and answer only, plus approval. |
| Prompt injection through an expert answer | Bob approves or edits wrongly | US12 |
| MCP token leaks in exported session reports | Secret in a public repo | Token lives only in the user's local `.bob/mcp.json`. Exports are scanned before commit. Rotate if found. |
| Judges doubt the numbers or the fixture | Credibility | US13 plus the disclosures above |
| Bob misses the fixture trap | Weaker demo | Rehearse. Adjust skill wording once. Rerun from reserve coins. |

## 11. Assumptions

- Judging criteria aren't public yet. They're assumed to follow the last edition: Bob as core, working product, real-world impact, presentation.
- The deliverables are a slide deck, cover image, demo video, demo URL, and repo with `bob_sessions/`.
- The prize amount doesn't affect scope.

## 12. Open questions

1. Hosting for the web app and MCP server: Vercel plus a hosted database, or the VPS behind a domain. Decided in architecture.
2. Is the 69% figure's original survey (vendor and year) confirmed? Check before launch.
3. Exact deadline time. Confirm at kickoff.
