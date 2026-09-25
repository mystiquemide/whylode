# Whylode Sample RPG System

This is a sample IBM i order-to-invoice system used as the test fixture for Whylode demos.
It is disclosed as a sample project and does not represent a real customer system.

## Members

| File | Type | Purpose |
|---|---|---|
| `ORDENT.rpgle` | RPGLE | Order entry — reads CUSTMST, accumulates order lines, calls INVCALC |
| `INVCALC.rpgle` | RPGLE | Invoice tax calculation — the program under change |
| `EDIOUT.rpgle` | RPGLE | EDI 810 invoice output — formats invoices into EDI transaction sets |
| `INVJOB.clle` | CLLE | Batch job — overrides files to production, calls ORDENT then EDIOUT |
| `CUSTMST.dds` | DDS | Customer master physical file |
| `TAXTBL.dds` | DDS | Tax rate override table |

## The change scenario

Two business rule changes are demonstrated:

1. **Sales tax rate change** — a state notice changes a rate that appears in `INVCALC.rpgle`.
   The program contains more than one hardcoded rate. A reader with only the source
   cannot determine which rate the notice applies to without knowing the business context.

2. **EDI 810 date format change** — a trading partner notice changes the date format
   used in `EDIOUT.rpgle`. The current format and its history are documented in the
   maintenance log at the top of the file.

## Answer key

The answer key (`fixtures/ANSWERS.local.md`) is gitignored and not present in the repository.
It is created locally before each demo run and must not be visible to Bob during the recorded runs.
