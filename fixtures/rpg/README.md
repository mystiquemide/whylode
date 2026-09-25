# Sample RPG system

A small IBM i order-to-invoice system written in period style (fixed-format RPG IV, CL, DDS). It was written for this project as a sample codebase and does not come from a real company.

| File | Type | Purpose |
|---|---|---|
| `ORDENT.rpgle` | RPGLE | Order entry |
| `INVCALC.rpgle` | RPGLE | Invoice tax calculation |
| `EDIOUT.rpgle` | RPGLE | EDI 810 invoice output |
| `INVJOB.clle` | CLLE | Nightly invoice job |
| `CUSTMST.dds` | DDS | Customer master file |
| `TAXTBL.dds` | DDS | Tax override table |

Change notices used with this system are in `fixtures/notices/`.
