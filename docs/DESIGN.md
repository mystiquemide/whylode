# Whylode Design System and Screen Plan

Keep the why. Whylode runs inside IBM Bob. When a business rule changes, it traces every line of RPG that has to change, asks the one person who knows why, and keeps the answer.

## 1. Build rules

- Build one section or screen at a time. Never build a full page in one pass.
- Wait for review after each section. Do not touch approved sections.
- Every section prompt restates the global rules below and lists what must not change.
- No em dashes anywhere: copy, code comments, alt text, commit messages.

## 2. Global rules

- Light theme only. Page background `#FAF9F7`, never pure white.
- One filled action color: gold `#B7831F`, hover `#946A17`, white text.
- No ghost buttons. Secondary actions are text links with a trailing arrow.
- No mock data, no seeded records, no placeholder text, no skeleton bars used as decoration, no fake charts, no invented customer logos or metrics.
- Every number shown has a source: a cited public source, or a real record written by a real Bob run.
- Every screen has explicit loading, empty, error, and data states. Empty states tell the truth.
- No status dots. State is shown with text labels and colored line markers.
- No gradients except the single final CTA band. No glow, no blur, no glassmorphism.
- Borders 1px `#EFEFEF` only. Shadows only the two tokens below.
- Sentence case headlines. Plain words. Written for an IT director, not a developer.

## 2a. Identity

The layout borrows a familiar light SaaS structure. What makes Whylode recognizable is one idea no template has: a line of old code that changes color when a person explains it. Blue means Bob is asking, gold means a person answered, red means the answer contradicts the code.

- Metaphor: a gold seam through old code. It's the logo, and it repeats as the gold wash on every answered line.
- Motion: the only animation anywhere is a line turning from blue to gold. It appears on the landing hero, in the inbox after Save, and on memoir hover. 400ms ease-out, and off when reduced motion is set.
- Code always renders as real source with real line numbers. Never a screenshot of an editor.
- Success moment: after the expert's last answer, the inbox lists their lines in gold with "Your answers are now part of the memoir."
- One-screenshot test: the change page showing a red conflict line and a gold answered line together. This frame is the README hero and the cover image.

## 3. Tokens

### Color

| Token | Hex | Use |
|---|---|---|
| canvas | `#FAF9F7` | Page background |
| surface | `#FBFAF7` | Panels |
| white | `#FFFFFF` | Nav, inputs, raised panels |
| ink | `#121722` | Primary text |
| slate | `#777C86` | Secondary text |
| steel | `#A5A5A5` | Helper text, disabled |
| hairline | `#EFEFEF` | Borders, dividers |
| gold | `#B7831F` | Primary action, confirmed by a human |
| gold-wash | `#F7EFDD` | Background of confirmed lines |
| question | `#2A5BD7` | Open question to the expert |
| question-wash | `#EAF0FC` | Background of open-question lines |
| confirmed | `#046645` | Traced by Bob with confidence |
| conflict | `#D23F3F` | Answer contradicts the code |
| conflict-wash | `#FCEDED` | Background of conflict lines |

Meaning never changes: blue asks, gold is a human answer, green is traced, red is a contradiction.

### Type

- Interface: Inter 400, 500, 600 (Google Fonts). Feature `ss01`.
- Code: IBM Plex Mono 400, 500.
- Scale: 13 / 14 / 16 / 18 / 20 / 24 / 40 / 48 / 57 / 84 px.
- Display 84px line-height 1.06, 57px 1.09, 48px 1.2. Body 16px 1.56.

### Shape and space

- Radius: buttons and pills 48px, panels and images 16px, inline tags 8px.
- Shadow subtle: `rgba(0,0,0,0.07) 0 1px 1px 0, rgba(0,0,0,0.04) 0 -1px 1px 0 inset, rgba(0,0,0,0.14) 0 0 0 0.5px inset`.
- Shadow float: `rgba(0,0,0,0.04) 0 20px 20px -8px` (product captures only).
- 8px base grid. Page max width 1200px. Section gap 80px desktop, 56px mobile. Panel padding 24px.
- Breakpoints: 992px, 768px, 430px. Mobile side padding 16px.

## 4. Logo and icons

The mark is five short bars stacked like lines of code, with one gold seam cutting through them: the reason running through the code. The wordmark is lowercase Inter 600, "why" in ink and "lode" in gold, outlined as paths so it never depends on a loaded font.

| File | Use |
|---|---|
| `public/brand/logo.svg` | Nav, footer, docs (light surfaces) |
| `public/brand/logo-dark.svg` | Dark surfaces only (final CTA band overlay, slides) |
| `public/brand/mark.svg`, `mark-dark.svg` | Mark alone, 24px and up |
| `public/brand/icon-small.svg`, `favicon.ico` | Browser tab, 16 and 32px. Simplified to three bars so it reads at 16px |
| `public/brand/icon.svg` | Full icon on an ink tile, 48px and up |
| `public/brand/apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Home screen and web manifest |
| `public/brand/og.png` | 1200x630 link preview: lockup, "Keep the why.", hero photo |

Rules: never recolor the seam anything but gold. Never stretch, rotate, outline, or add shadow. Minimum clear space around the lockup is the height of the "w". Below 24px use the icon, not the lockup.

## 5. Photography

Real photos, Unsplash License, free tier only. Photos are atmosphere. They are never captioned with a name or presented as a customer.

| File | Unsplash ID | Photographer | Use |
|---|---|---|---|
| `public/images/hero-expert.jpg` | photo-1758612898338-4eb032a133f5 | Vitaly Gariev | Landing hero |
| `public/images/handover.jpg` | photo-1758519288814-bb9f97e4df95 | Vitaly Gariev | "Keep" section |
| `public/images/warehouse-aisle.jpg` | photo-1740914994657-f1cdffdc418e | Kseniia Ilinykh | Problem section |
| `public/images/warehouse-floor.jpg` | photo-1781559818983-c32838ee3d55 | Rodrigo Rodrigues | Final CTA band |

Treatment: 16px radius, full opacity, no blur, no overlay tint except where text sits on the image.

## 6. Where the data comes from

- Bob runs the Whylode mode on the developer's machine and writes to the Whylode store over MCP: changes, clauses, traced lines, questions, answers, conflicts, drafts, approvals.
- The web app reads and writes the same store.
- Nothing is pre-filled. Until the first real run, every app screen shows its empty state.
- The landing page's run numbers (questions asked, lines reused) are copied from the real run after it happens.

## 7. Routes

| Route | Screen | Who uses it |
|---|---|---|
| `/` | Landing | Judges, buyers |
| `/changes` | All rule changes | Developer, IT director |
| `/changes/[id]` | One change: trace, questions, draft, approval | Developer, approver |
| `/ask/[token]` | Expert inbox, no login | Retiring expert |
| `/memoir` | System memoir overview | Everyone |
| `/memoir/[program]` | One program with line notes | Developer, new hire |

## 8. Screens

### 8.1 Landing `/`

```
NAV (white, 1px hairline bottom, sticky)
[whylode mark]   How it works   Memoir   Changes   GitHub        [See a real run]

HERO (canvas, 2 columns, 1200px)
LEFT
  Built for IBM i teams
  The code survived.
  The reason didn't.                                   (84px / 57px mobile)
  Whylode runs inside IBM Bob. When a rule changes, it traces
  every line that has to change, asks the one person who knows
  why, and keeps the answer.
  [See a real run]   View the memoir ->
RIGHT
  hero-expert.jpg, 16px radius
  floating panel over lower-left of photo (white, shadow float):
    INVCALC.rpgle  line 185
    CHAIN CUSTMST  42
    "42 means customer not found. Treat as walk-in, always taxed."
    Confirmed by the system owner, captured from a real run
  (panel content is copied from the real run, filled in after it happens)

PROBLEM (3 editorial rows, thin dividers, left image warehouse-aisle.jpg)
  Nothing breaks until the rule changes.
  69%    of IBM i shops name skills as their top concern.   source: IT Jungle, Jan 26 2026 (survey attribution to confirm before launch)
  Rule   Tax rates, EDI formats, and month-end jobs change every year. Someone has to edit code nobody explained.
  Why    Documentation tools describe what the code does. Nobody wrote down why.

HOW IT WORKS (4-step rail, each step shows a real capture from the run)
  1 Trace   Bob reads the change notice and finds every line that implements it.
  2 Ask     Where Bob is unsure, it asks the person who knows. One plain question at a time.
  3 Keep    Each answer is pinned to the exact lines it explains.
  4 Change  Bob drafts the edit with the reasons attached. A person approves it.

THE REPLAY (2 columns, numbers from the real run)
  First change      [n] questions to the expert
  Next change       [n] questions. [n] lines already known.
  Every change makes the system depend less on one person.

KEEP (handover.jpg left, text right)
  Knowledge that outlives the handover.
  The memoir is plain language, tied to real code, and searchable by the next person and by Bob.
  View the memoir ->

BUILT ON IBM BOB 2.0 (text list, no logos)
  Custom mode  .  Skills  .  Subagents  .  MCP  .  Native PDF reading
  Built with IBM Bob for the IBM Bob 2.0 Hackathon. Session reports in bob_sessions/.

FINAL CTA BAND (warehouse-floor.jpg, one subtle dark overlay for text contrast)
  Someone at your company knows why. Ask them while you can.
  [See a real run]

FOOTER (white, hairline top)
  whylode   Memoir  Changes  GitHub  Session reports      (c) 2026 Whylode
```

States: none dynamic except the run numbers, which are written in only after the real run. The page ships without the replay section until those numbers exist.

### 8.2 Changes `/changes`

```
Rule changes
Every change Whylode has handled, newest first.

ROW (white panel, hairline)
  CA sales tax 7.25% to 7.50%        Approved     4 lines changed   2 questions   Sep 26
  EDI 810 date format                Waiting on expert   1 question open        Sep 26
```
- Loading: "Loading changes."
- Empty: "No changes yet. Run the Whylode mode in IBM Bob on a rule change and it will appear here." plus a link to the setup guide in the repo.
- Error: "Can't reach the Whylode store. Check that the server is running." [Try again]

### 8.3 Change detail `/changes/[id]`

```
<- All changes
CA sales tax 7.25% to 7.50%
Source: ca-tax-notice.pdf   Opened Sep 26   Status: Waiting on expert

TABS: Trace | Questions (2) | Draft | History

TRACE
  Clause 1  "The rate changes to 7.50% on January 1, 2027."
    INVCALC.rpgle  142  TAXRT = 0.0725          Traced by Bob
    TAXTBL.pf      RATE                          Traced by Bob
  Clause 2  "Resale certificate holders stay exempt."
    INVCALC.rpgle  188  IF *IN42 = *OFF          Asked the expert
    ORDENT.rpgle    77  IF CUSTYP = 'R'          Conflict

QUESTIONS
  Q1  INVCALC.rpgle line 188   Answered by the system owner, Sep 26
  Q2  ORDENT.rpgle line 77     Waiting since Sep 26   Copy expert link

DRAFT (enabled when every question is answered and no conflict is open)
  unified diff, each changed line with a gold note linking to the memoir answer
  [Approve change]     Request changes ->

HISTORY
  time-ordered list of real events: traced, asked, answered, conflict, approved
```
- Draft locked state: "Draft opens when all questions are answered." Shows count remaining. No disabled gray button.
- Conflict state: red line with both sides: what the expert said, what the code does. Actions: [Ask again], "Mark reviewed ->".
- Approved state: gold banner "Approved by [name], Sep 26." Diff read-only.
- Loading, not found ("This change doesn't exist."), error, same pattern as 7.2.

### 8.4 Expert inbox `/ask/[token]`

```
whylode
Questions about the system you know best
Bob is updating the invoicing programs and found 2 places the code doesn't explain.
Your answers are saved next to the code so nobody has to ask again.

Question 1 of 2
INVCALC.rpgle, line 188
Indicator 42 skips the tax step. What turns indicator 42 on?

  185  C     CUSTNO    CHAIN     CUSTMST                    42
  188  C                   IF        *IN42 = *OFF

Your answer
[ textarea, 4 rows ]
[Save answer]      I'm not sure, send to someone else ->
```
- After save: "Saved. Thank you." then next question.
- All done: "That's everything. Your answers are now part of the memoir." Link to the memoir.
- Reassign: name and email field, [Send], confirmation text.
- Invalid or used link: "This link has expired. Ask the team for a new one."
- Mobile first: this screen is used on a phone.

### 8.5 Memoir `/memoir`

```
Memoir
What the code does and why, in the words of the people who built it.

Search  [ search box: program, line, or words ]

PROGRAM ROWS
  INVCALC.rpgle   Invoice tax calculation     5 notes   Last note Sep 26
  ORDENT.rpgle    Order entry                  2 notes   1 conflict
```
- Coverage line uses real counts only: "7 notes across 2 programs."
- Empty: "Nothing kept yet. The first answers land here after a rule change runs through Whylode."
- Search no match: "No notes match that. Try a program name."

### 8.6 Program memoir `/memoir/[program]`

```
<- Memoir
INVCALC.rpgle
Invoice tax calculation

CODE (Plex Mono, line numbers, full source from the store)
  142  TAXRT = 0.0725        gold wash    note ->
  185  CHAIN CUSTMST  42     gold wash    note ->
  201  MULT 1.03             blue wash    question open

SIDE PANEL (desktop) / BOTTOM SHEET (mobile) for the selected note
  "42 means customer not found. Treat as walk-in, always taxed."
  Answered by the system owner, Sep 26
  From change: CA sales tax 7.25% to 7.50%  ->
  Used again in: EDI 810 date format  ->
```
- Lines with no notes render plain.
- Legend at top, text only: Traced, Question open, Answered, Conflict.

## 9. Build order

1. Tokens, fonts, nav, footer.
2. Landing hero, then each landing section one at a time.
3. Expert inbox (most important app screen, used on phones).
4. Change detail tabs, one tab at a time.
5. Changes list.
6. Memoir, then program memoir.
7. Mobile pass, then a single motion pass (the blue to gold line change only).

If the Day 2 schedule slips, cut in this order: memoir search, reassign, History tab. None appear in the demo.
