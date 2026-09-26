# Whylode memory

Local only. Never committed (in .gitignore).

## Identity

- Project: Whylode. Tagline: "Keep the why."
- Hackathon: IBM Bob 2.0 Hackathon, lablab.ai, Sep 25-27 2026, online, solo.
- Owner: MystiqueMide. Git author: MystiqueMide <176629124+mystiquemide@users.noreply.github.com> (confirm id with `gh api user --jq .id`).
- Path: /root/projects/whylode

## Decisions

- 2026-09-24: Idea approved: rule-change handover for IBM i (merged idea: change-triggered tracing plus expert questions plus memoir).
- 2026-09-24: Validation: hackathon GREEN, startup YELLOW. Tracing alone is a commodity (Bob Premium i, X-Analysis, ARCAD). The differentiator is the intent layer: ask a human, pin the answer to lines, reuse it.
- 2026-09-24: Product runs as a Bob add-on: custom mode + skills + MCP server + web app. Bob does product work, Claude Code builds everything else.
- 2026-09-24: No PUB400. The payoff is traced + confirmed + reviewed diff, not a compiled change.
- 2026-09-24: Name Whylode (domains .com/.io/.dev/.ai unregistered via RDAP, 0 GitHub repos; no trademark search done).
- 2026-09-24: Theme switched from dark green-screen to light, adapted from dock.us teardown. Gold #B7831F is the only filled action color. No ghost buttons, no mock data, no status dots.
- 2026-09-24: Hosting: one Next.js app on Vercel (pages + API + MCP at /api/mcp) with Neon Postgres. Fallback: VPS + local Postgres + Cloudflare tunnel.
- 2026-09-24: No product code before kickoff. lablab pre-work rule not found (guide and event page checked, rules page 404). Confirm at kickoff.
- 2026-09-25: Kickoff facts: deadline Sep 27 15:00 UTC (11:00 ET). Judging: Application of Technology, Presentation, Business Value, Originality. Prizes 5k/3k/2k + 20x100. Sample project allowed. bob_sessions/ = task session summary PNG screenshots. Bob Usage Statement and Problem/Solution statement, 500 words each. Video <=3 min, >=90s in action.
- 2026-09-25: Split proposed: Bob builds mode, skills, MCP tool handlers, RPG fixture, tool tests; Claude builds scaffold, db, web, deploy, README.
- 2026-09-25: User chose to track all planning docs (PRD, TASKS, WIN_PLAN, memory.md) in the main repo so Bob can read them. Overrides AGENTS.md hygiene rule by explicit instruction. Secrets stay ignored.
- 2026-09-24: Fresh scaffold, no boilerplate clone (AGENTS.md rule overrides skill).

## Status

- docs/DESIGN.md: approved (tokens, logo, photos, 6 route wireframes).
- public/brand: logo, marks, favicon, icons, og.png: approved.
- public/images: 4 Unsplash photos (free license, IDs in DESIGN.md).
- docs/PRD.md: approved 2026-09-24.
- docs/ARCHITECTURE.md, docs/TASKS.md, .env.example: approved 2026-09-24.
- GitHub repo: see Session log (created 2026-09-25).
- Vercel project created 2026-09-24: whylode (prj_ITtUdFRSfxuOrG1BduQm5BJwAphW) in account mide27145-3891, team mide27145-3891s-projects (team_BKCbq0hFkn0ymT4eeB7VDzdN). Framework nextjs, protection on previews only. Token: VERCEL_TOKEN in /root/.hermes/.env. Neon store neon-almond-river connected (dev, preview, prod). DATABASE_URL in .env.local via vercel env pull. Verified: PostgreSQL 18.6, db neondb, 0 public tables.
- Bob access: opens at kickoff. Nothing Bob-side verified.

## Notion

- Hackathon Tracker row: https://app.notion.com/p/IBM-Bob-2-0-Hackathon-3e51fa84b58f81218617ebb3f0284a27
- Projects row (Whylode): https://app.notion.com/p/Whylode-3e51fa84b58f8130b2c7e0e110bbc7dc
- DB ids: Hackathon Tracker dd7fdf11-bd3a-44da-8d34-3f8081f6f1c2, Projects 1991fa84-b58f-805c-b343-cf5e409db4c7. Token NOTION_API_KEY in /root/.hermes/.env. Use Status 1 on Projects, not Status.

## Gotchas

- Reddit is blocked from this VPS.
- Neon vars are 'sensitive' on preview/prod and can't be pulled; development target is required for local .env.local.
- Two Vercel accounts: MystiqueMide (claude.ai connector, read-only) and mide27145-3891 (CLI token, used for Whylode). ~/.local/share/com.vercel.cli auth.json token is expired; pass --token from /root/.hermes/.env.
- Unsplash blocks curl and headless Chrome (bot wall). WebFetch on the photo page returns the images.unsplash.com URL; the image CDN itself downloads fine.
- Bob formats (from docs, unverified in practice): modes in .bob/custom_modes.yaml (slug, name, roleDefinition, whenToUse, customInstructions, groups), skills in .bob/skills/<name>/SKILL.md with name + description frontmatter, MCP in .bob/mcp.json with mcpServers; streamable-http uses "type": "streamable-http", "url".
- 40 Bobcoins, no refills. One Reddit user burned 40 in 3 hours.
- Brand generator script lives in the session scratchpad (brand.py). Regenerate by rerunning it if needed.

## Next

1. User clones repo for Bob IDE.
2. Scaffold Next.js (Claude), then Bob tasks: mode, skills, MCP tools, RPG fixture, tool tests.

## Session log

- 2026-09-24: Research, ideas, validation, naming, dock.us teardown, DESIGN.md, logo system, PRD. Verified: logo renders at 16/32/64/128, favicon legible at 16px, photos load. Next: PRD approval.
- 2026-09-24: Phase 2 docs written (architecture, tasks, env example). Next: approval.
- 2026-09-24: Win plan written (docs/WIN_PLAN.md, gitignored). Key adds: fixture trap (second hardcoded wholesale rate that must not change), answers-as-data against prompt injection, replay table, bob_sessions index.
- 2026-09-24: Win plan merged into PRD (positioning, judging surfaces, US11-13, cuts, disclosures, risks), ARCHITECTURE (claim field, attack tests, freeze list), DESIGN (identity, cut order), TASKS (trap, schedule with backups, storyboard, README blueprint, social, preflight). .bob/mcp.json gitignored.
- 2026-09-24: Phase 2 approved. Vercel project whylode created in account mide27145-3891 via API. Next: user adds Neon via dashboard Storage, then vercel env pull.
- 2026-09-24: Neon connected and verified with a live query. Pre-kickoff setup (P1, P3) done. P2 (lablab registration) is on the user. Next: kickoff Sep 25 11:00 GMT-4, Task 1 and 2 and 3.
- 2026-09-24: Telegram kickoff reminder scheduled (at job 6, Sep 25 14:30 UTC) via /root/projects/whylode-reminders/tg-send.sh using the Hermes bot. Test message delivered.
- 2026-09-24: Notion updated: Bob hackathon row set In progress / Build with deadline, requirements, note appended. Whylode project row created. User was already registered on lablab.
- 2026-09-25: Repo created and pushed: https://github.com/mystiquemide/whylode (private, main). First commit 2ad4c8d after kickoff (15:00 UTC). Secret scan on staged files: 0 hits. .gitignore rewritten (.env* bug from vercel CLI fixed, .env.example kept), .bobignore added.
- 2026-09-25: Scaffold pushed (10e09bc): Next 16.3.6, tokens, fonts, icons; build passes, page verified in headless Chrome. Ports 3100 and 3217 are used by other projects; use a free port for local checks.
- 2026-09-25: Bob format check done by user, 0.288 coins. User asked to credit Bob on Bob-built commits: trailer Co-authored-by: IBM Bob <236091442+ibm-bob@users.noreply.github.com> (GitHub user ibm-bob, looks official, IBM org membership not public). Applies to this hackathon and Bob's commits only.
- 2026-09-25: TASKS.md updated with kickoff facts, build split, Bob task routine, answer-key and bobignore rules. User takes over running Bob tasks. Next: Bob task 2 (RPG fixture); Claude: schema and data layer when asked.
- 2026-09-25: Bob coins exhausted after the big backend commit 203482d (mode, 3 skills, RPG fixture, notices, API routes, MCP server, attack tests). That commit's subject line is a garbled co-author line with bob@ibm.com; left as is.
- 2026-09-25: Claude fixes pushed: trap restored in INVCALC (opaque type C2, no explaining comments, DDS labels removed, fixtures README neutral) 2ba634b; notices rebuilt with pdf-lib, EDI notice now requires TXI03 applied rate so run 2 reuses the C2 answer, both marked SAMPLE, real phone removed 882b7b0; db.ts Proxy target fixed (sql tagged template crashed everywhere) + int8 parsed as number ac7ab6c; vitest @ alias 2db0b83; tsbuildinfo untracked d8c954b. Verified: 33/33 tests, build passes, public tables 0 rows.
- 2026-09-25: Answer key written at fixtures/ANSWERS.local.md (gitignored, bobignored, VPS only). C2 = contract wholesale rate 5.25%, fixed until 2029.
- Open: no Bob coins for rehearsal and recorded runs. Options given to user: ask lablab Discord for top-up, or personal Bob trial account (disclose).
- 2026-09-25: Deployed to https://whylode.vercel.app (Vercel prod). MCP token and admin key set as sensitive env vars; WHYLODE_BASE_URL plain. base-url helper 8c632c2. Verified: tools/list 8 via real client, 401 no/wrong token, GET 405, expert link correct, /api/ask token 200 and random 404.
- 2026-09-25: Bob trial account works (first attempts Forbidden: user was on the exhausted hackathon account). Rehearsal 1 cost 0.633 coins; ran on stale local repo (old comments, broken PDF) but trace+ask loop worked and Bob asked the right C2 question at confidence 0.4. Fixed trace state lifecycle 0d8df15, MCP GET 405 465c149. Store reset to 0. Next: rehearsal 2 on current code incl. answers and draft.
- 2026-09-26: Redesign to Ventriloc-style editorial system (DESIGN.md replaced). Built and deployed: expert inbox, change page (Trace, Questions, Draft with approver sign-in), changes list, memoir, program memoir. Approver flow verified live by user (key paste bug fixed by trimming). decideDraft guards pending-only and no open conflict. History tab cut. 37/37 tests. Store still holds rehearsal data (change 1 approved); reset before recorded run 1. Next: recorded runs, then landing.
