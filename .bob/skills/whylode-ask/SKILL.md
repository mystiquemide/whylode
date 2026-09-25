---
name: whylode-ask
description: Ask the domain expert about lines whose intent cannot be determined from the code alone
---

## When to use

Activate this skill when the trace contains one or more lines with confidence
below 0.9. Do not guess. Do not assume. Ask.

## What to do

**1. Identify the uncertain lines.**
From the trace you just recorded, list every line with confidence < 0.9.
For each, write a specific, answerable question. A good question:
- Quotes the exact line or value in question
- States what you know (e.g. "there are two hardcoded rates")
- Asks the one thing you cannot determine from the code ("which of these two
  rates does the state notice apply to?")

A bad question: "Can you explain this program?"

**2. Call `whylode_ask_expert`.**
Pass the `change_id`, the expert's name (ask the developer if you don't know
it), and the questions array. Each question must include:
- `program`: the file name
- `line_start` / `line_end`: the exact line range
- `excerpt`: the verbatim source lines (copy them from the file)
- `question`: your specific, answerable question

**3. Give the developer the expert link and stop.**
The tool returns a `link`. Give it to the developer:

> "I need the domain expert to answer before I can continue.
> Please share this link: [link]
> Come back when the expert has responded."

Do not continue this turn. Do not speculate about the answers.
Wait for the developer to explicitly say the expert has responded.

## Rules

- One expert per change unless the developer tells you to reassign.
- Do not ask more than one question per distinct ambiguity.
  Combine related sub-questions into one well-formed question.
- The expert link is single-use per token. Do not call `whylode_ask_expert`
  again for the same change unless the developer requests a reassignment.
