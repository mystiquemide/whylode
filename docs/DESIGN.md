# Whylode Design System and Screen Plan

Keep the why. Whylode runs inside IBM Bob. When a business rule changes, it traces every line of RPG that has to change, asks the one person who knows why, and keeps the answer.

Visual direction: an editorial report on warm paper. Near-monochrome, whisper-weight headlines, one warm ember accent used as punctuation. It should read like a well-kept engineering record, not a SaaS dashboard.

## 1. Build rules

- Build one section or screen at a time. Never build a full page in one pass.
- Wait for review after each section. Do not touch approved sections.
- Every section prompt restates the global rules below and lists what must not change.
- No em dashes anywhere: copy, code comments, alt text, commit messages.

## 2. Global rules

- Light theme only. Page background `#F5F5F5`, bands in Ash `#EFEFEF`, raised surfaces white.
- Pages stay about 95% achromatic. Ember `#FF682C` and Brass `#816729` are the only colors, and they carry meaning (section 2a). No blue, no green, no red.
- One filled action style: Graphite `#202020` pill, white text. Secondary actions are text links with a trailing chevron. No outlined or ghost buttons.
- Headlines at weight 400 only. Never bold a headline.
- No shadows. Depth comes from surface color: page, Ash band, white panel.
- No gradients, glow, blur, or glassmorphism.
- No mock data, seeded records, placeholder text, decorative skeleton bars, fake charts, or invented logos and metrics. Every number is cited or comes from a real record written by a real Bob run.
- Every screen has explicit loading, empty, error, and data states. Empty states tell the truth.
- No status dots. State is shown with text labels and line markers.
- Sentence case. Plain words, written for an IT director.

## 2a. Identity

The recognizable idea: a line of old code that changes marking when a person explains it. Four states, always the same treatment:

| State | Meaning | Line treatment | Label |
|---|---|---|---|
| Traced | Bob is sure from the code | Graphite 2px left rule, no wash | Traced by Bob |
| Asked | Bob asked a person | Ember 2px left rule, no wash | Asked |
| Answered | A person explained it | Brass 2px left rule, Ivory `#EBE6DD` wash | Answered by the owner |
| Conflict | The answer contradicts the code | Graphite fill, white text, Ember left rule | Conflict |
| Kept | Traced, deliberately unchanged in the draft | Brass rule, Ivory wash, "Kept" tag | Kept because |

- Motion: the only animation is a line moving from Asked to Answered (Ember rule fades to Brass, Ivory wash fades in). 400ms ease-out, disabled under reduced motion.
- Code always renders as real source with real line numbers in IBM Plex Mono.
- Signature marker: a small 8px Ember square before a section eyebrow, as on a printed report.
- One-screenshot test: the Draft tab showing line 30 Changed next to line 44 Kept, with the owner's answer quoted beside it. That frame is the README hero and the cover image.

## 3. Tokens

### Color

| Token | Hex | Use |
|---|---|---|
| page | `#F5F5F5` | Page background |
| ash | `#EFEFEF` | Bands, nav pill, panels |
| white | `#FFFFFF` | Raised panels, inputs, code blocks |
| ivory | `#EBE6DD` | Answered and kept line wash, featured blocks |
| mist | `#E8E8E8` | Hairline dividers |
| graphite | `#202020` | Primary text, primary button, traced rule |
| steel | `#4D4D4D` | Body copy |
| slate | `#828282` | Helper text, metadata, inactive tabs |
| ember | `#FF682C` | Asked state, link underlines, eyebrow square |
| brass | `#816729` | Answered and kept state, eyebrow text, headline highlight |

Contrast: steel on page 7.9:1, slate on page 3.6:1 (use only at 14px and up or for non-essential metadata), brass on page 5.6:1. Ember is never used for body text.

### Type

- Display and headings: Inter Tight 400, letter-spacing -0.02em (free substitute for PolySans). Never 500 or above.
- Body and UI: Inter 400 for paragraphs, 500 for labels and buttons.
- Code: IBM Plex Mono 400, 500.
- Scale: display 66px / 0.95, heading-lg 40px / 1.2, heading 32px / 1.19, subheading 18px / 1.3, body 16px / 1.5, caption 14px / 1.43, meta 13px / 1.38.
- Mobile display drops to 44px / 1.0.
- Headline highlight: one word in Brass with a 1px Brass underline, offset 6px (as on the reference "Growth.").

### Shape and space

- Radius: buttons and nav pill fully round (200px). Panels 8px. Featured band panels 8px on the top-left only. Tags 20px. Code blocks 8px.
- 4px base grid. Page max width 1200px. Section gap 80px desktop, 56px mobile. Panel padding 40px desktop, 20px mobile. Element gap 20px.
- Bands: featured sections sit on an Ash panel that starts at the container's left edge and bleeds to the right edge of the viewport.
- Breakpoints: 992px, 768px, 430px. Mobile side padding 16px.

## 4. Logo and icons

The mark is five short bars stacked like lines of code with one Brass seam cutting through them. Wordmark is lowercase, "why" in Graphite and "lode" in Brass. Assets live in `public/brand/` and are regenerated in Graphite and Brass to match this palette.

| File | Use |
|---|---|
| `logo.svg` | Nav, footer |
| `logo-dark.svg` | Dark surfaces |
| `mark.svg`, `mark-dark.svg` | Mark alone, 24px and up |
| `icon-small.svg`, `favicon.ico` | Browser tab (three-bar simplified mark) |
| `icon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | App icons |
| `og.png` | 1200x630 link preview |

Never recolor the seam anything but Brass. Never stretch, rotate, outline, or shadow.

## 5. Photography

Real photos, Unsplash License, free tier only. Photos are atmosphere and are never captioned with a name or presented as a customer. Treatment: 8px radius, full color, slightly desaturated (CSS `saturate(0.85)`), no overlay except under text.

| File | Unsplash ID | Photographer | Use |
|---|---|---|---|
| `public/images/hero-expert.jpg` | photo-1758612898338-4eb032a133f5 | Vitaly Gariev | Landing hero, right column |
| `public/images/handover.jpg` | photo-1758519288814-bb9f97e4df95 | Vitaly Gariev | Keep section |
| `public/images/warehouse-aisle.jpg` | photo-1740914994657-f1cdffdc418e | Kseniia Ilinykh | Problem section |
| `public/images/warehouse-floor.jpg` | photo-1781559818983-c32838ee3d55 | Rodrigo Rodrigues | Final band |

App screens use no photos. The code and the records are the imagery.

## 6. Where the data comes from

- Bob runs the Whylode mode and writes to the store through MCP: changes, clauses, traced lines, questions, answers, conflicts, drafts with changed and kept reasons, approvals, events.
- The web app reads the same store through `/api/*` and writes only answers, reassignments, approvals, and conflict reviews.
- Nothing is pre-filled. Until a real run, every app screen shows its empty state.
- Landing numbers (questions asked, lines reused) are copied from the recorded runs after they happen.

## 7. Routes

| Route | Screen | Who uses it |
|---|---|---|
| `/` | Landing | Judges, buyers |
| `/changes` | All rule changes | Developer, IT director |
| `/changes/[id]` | One change: trace, questions, draft, approval | Developer, approver |
| `/ask/[token]` | Expert inbox, no login | Retiring expert |
| `/memoir` | System memoir overview | Everyone |
| `/memoir/[program]` | One program with line notes | Developer, new hire |

## 8. Shared components

```
NAV (page background, no border)
[whylode logo]        ( Changes   Memoir   How it works )        [See a real run]
                        ^ Ash pill container, 200px radius        ^ Graphite pill

FOOTER (page background, mist top hairline)
whylode   Changes  Memoir  GitHub  Session reports
```

- Eyebrow: 8px Ember square, then 13px Brass label. Example: `[■] Rule change`.
- Text link: Graphite text, 1px Ember underline offset 3px, trailing chevron.
- State tag: 13px Inter 500, 20px radius, Ash background, label from section 2a.
- Code block: white panel, 8px radius, Plex Mono 14px, line numbers in Slate, state rule on the left of each marked line.

## 9. Screens

### 9.1 Landing `/`

```
NAV

HERO (page background, 2 columns)
LEFT
  [■] For IBM i teams
  The code survived.
  The reason didn't. Keep the why.            (66px Inter Tight 400, "why" in Brass, underlined)
  Whylode runs inside IBM Bob. When a rule changes, it traces every
  line that has to change, asks the one person who knows why, and
  keeps the answer.                           (18px Inter, Steel)
  [See a real run]   View the memoir >
RIGHT
  hero-expert.jpg, 8px radius
  white panel overlapping the photo's lower-left corner:
    INVCALC.rpgle  line 44                      Answered
    EVAL TaxRate = 0.0525
    "C2 is our contract group ... leave 0.0525 alone."
    From recorded run 1 (text copied from the real record)

PROBLEM (Ash band, bleeds right)
  [■] The problem
  Nothing breaks until the rule changes.
  three rows, mist hairlines:
  69%   of IBM i shops name skills as their top concern.   IT Jungle, Jan 2026 (source confirmed before launch)
  Rule  Tax rates, EDI formats, and month-end jobs change. Someone has to edit code nobody explained.
  Why   Documentation tools say what the code does. Nobody wrote down why.
  warehouse-aisle.jpg on the right

HOW IT WORKS (page background)
  [■] How it works
  Four steps, one row each, with a real capture from recorded run 1:
  01 Trace   Bob reads the notice and finds every line that implements it.
  02 Ask     Where Bob is unsure, it asks the person who knows.
  03 Keep    Each answer is pinned to the exact lines it explains.
  04 Change  Bob drafts the edit with a reason on every line. A person approves it.

THE PROOF (Ash band)
  [■] Recorded run 1
  Bob would have changed two rates. The owner's answer kept one.
  Side by side:  line 30  Changed  0.0725 > 0.0750     |  line 44  Kept  "contract rate, leave it"
  See the change >

THE REPLAY (page background, numbers from the recorded runs)
  [■] The next change
  First change: [n] questions.  Next change: [n] questions, [n] lines already known.
  Every change makes the system depend less on one person.

KEEP (Ash band, handover.jpg left)
  Knowledge that outlives the handover.
  The memoir is plain language, pinned to real code, readable by the next person and by Bob.
  View the memoir >

BUILT ON IBM BOB 2.0 (page background, text list)
  Custom mode, skills, MCP tools, subagents, document understanding.
  Built with IBM Bob for the IBM Bob 2.0 Hackathon. Session reports in bob_sessions/.

FINAL BAND (warehouse-floor.jpg, Graphite overlay at 55% under text only)
  Someone at your company knows why. Ask them while you can.
  [See a real run]   (white pill, Graphite text)

FOOTER
```

The Proof and Replay sections ship only once the recorded runs exist. No estimated numbers.

### 9.2 Changes `/changes`

```
NAV
[■] Rule changes
Every change Whylode has handled.

ROWS (white panels, mist hairline between)
  California sales tax rate change      Approved   1 line changed  1 kept  2 questions   Sep 26
  EDI 810 tax detail requirement        Asked      1 question open                        Sep 26
  (title links to /changes/[id])

LOADING  Loading changes.
EMPTY    No changes yet. Run the Whylode mode in IBM Bob on a change notice and it appears here.
ERROR    Can't reach the Whylode store right now.  Try again >
```

### 9.3 Change detail `/changes/[id]`

```
NAV
< All changes
[■] Rule change
California sales tax rate change                          (40px)
ca-tax-notice.pdf   Opened Sep 26   Status: Waiting on the owner

TABS (Ash pill container, active tab white pill): Trace | Questions 2 | Draft | History

TRACE
  Clause 1  "Update the base California rate from 7.25% to 7.50%."
    code block: INVCALC.rpgle
      30  EVAL TaxRate = 0.0725            Traced by Bob
  Clause 2  "Do not modify pre-negotiated contract rates."
      39  IF CustType = 'C2'               Asked
      44  EVAL TaxRate = 0.0525            Answered by the owner

QUESTIONS
  Q1  INVCALC.rpgle 39 to 44    Answered Sep 26
      Question text
      Answer in an Ivory panel with the owner's name and time
  Q2  INVCALC.rpgle 33 to 36    Waiting since Sep 26    Copy the owner's link >

DRAFT (opens when every question is answered and no conflict is open)
  diff code block
  Changed   INVCALC.rpgle 30   because Clause 1
  Kept      INVCALC.rpgle 44   because the owner: "C2 is our contract group ..."
  [Approve change]   Request changes >
  Without the approver key: "Sign in as approver to decide." with a key field and [Sign in]

HISTORY
  Real events with times: opened, traced, asked, answered, draft submitted, approved.

STATES
  Draft locked   Draft opens when every question is answered. 1 left.
  Conflict       Graphite panel: The owner said / The code shows.  [Mark reviewed]
  Approved       "Approved by [name], Sep 26." Draft is read-only.
  Not found      This change doesn't exist.  All changes >
```

### 9.4 Expert inbox `/ask/[token]` (phone first)

```
[whylode logo]
[■] Questions for you
The code doesn't explain these lines
Bob is updating the invoicing programs and found 2 places only you can answer.
Your answers are saved next to the code so nobody has to ask again.

Question 1 of 2
INVCALC.rpgle, lines 39 to 44
The question text from the record.
code block of the excerpt with real line numbers

Your answer
[ textarea, white, 8px radius ]
[Save answer]          I'm not sure, send to someone else >

SAVED     Saved. The line turns Answered, next question slides in.
ALL DONE  That's everything. Your answers are now part of the memoir. View the memoir >
REASSIGN  Name [ ]  [Send]  then "Sent to [name]."
EXPIRED   This link doesn't work anymore. Ask the team for a new one.
```

### 9.5 Memoir `/memoir`

```
NAV
[■] Memoir
What the code does, and why, in the words of the people who built it.
[n] notes across [n] programs.              (real counts)

ROWS
  INVCALC.rpgle   2 notes   Last note Sep 26   >

EMPTY     Nothing kept yet. The first answers land here after a rule change runs through Whylode.
```

### 9.6 Program memoir `/memoir/[program]`

```
NAV
< Memoir
INVCALC.rpgle
Legend (text tags): Traced  Asked  Answered  Conflict

CODE (full source)                                | NOTE (desktop side panel, mobile below the line)
  30  EVAL TaxRate = 0.0725                       |  "C2 is our contract group ..."
  39  IF CustType = 'C2'          Answered        |  Answered by the owner, Sep 26
  44  EVAL TaxRate = 0.0525       Answered        |  From: California sales tax rate change >
                                                  |  Used again in: EDI 810 tax detail >
```

## 10. Build order

1. Tokens, fonts, nav, footer, shared components (eyebrow, tag, code block, text link, button).
2. Expert inbox (used live on a phone in recorded run 1).
3. Change detail, one tab at a time: Trace, Questions, Draft, History.
4. Changes list.
5. Memoir, then program memoir.
6. Recorded runs 1 and 2.
7. Landing, section by section, with numbers from the recorded runs.
8. Mobile pass, then the single motion pass.

If the schedule slips, cut in this order: memoir search, reassign, History tab, How it works captures.
