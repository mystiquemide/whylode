---
name: whylode-trace
description: Trace a business rule change to the RPG lines that implement it
---

## When to use

Activate this skill at Step 2 of the Whylode workflow: after you have opened
the change and have the `change_id` and `clause_ids` in hand.

## What to do

For each clause, work through these steps in order:

**1. Check the memoir first.**
Call `whylode_memoir_lookup` with the program name and the line range you are
about to trace. If notes come back, those lines are already known. Pass the
`note_id` of each matching note as `known_note_id` when you record the trace.
Known lines increase `lines_reused` — this is one of the headline demo numbers.

**2. Read the source.**
Open the relevant RPG, CL, or DDS file. Identify every line that implements
the clause. Look for:
- Hardcoded literals that match values named in the clause
- Condition checks (indicators, IF/SELECT) that gate the logic
- Table lookups (CHAIN) that could override the literal
- Downstream calls that propagate the value

**3. Record the trace.**
Call `whylode_record_trace` with the `clause_id` and an array of line objects.
Set `confidence` honestly for each line:

| Confidence | Meaning |
|---|---|
| 0.9 – 1.0 | The rule is directly visible in this line. You are certain. |
| 0.5 – 0.89 | The line is plausibly related but context is ambiguous. |
| 0.0 – 0.49 | You cannot determine the intent from the code alone. |

**4. Decide next step.**
- If **all lines are 0.9+**: proceed to the **whylode-draft** skill.
- If **any line is below 0.9**: activate the **whylode-ask** skill.

## The two-rate trap

When INVCALC.rpgle (or any program) contains more than one literal that matches
the changed value, trace ALL of them. Record each with its honest confidence.
Do not assume which one the notice refers to. That is what the expert is for.
