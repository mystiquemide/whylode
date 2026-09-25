/**
 * generate-notices.ts
 * Generates the two change notice PDFs for the Whylode demo.
 * Run with: npx tsx scripts/generate-notices.ts
 *
 * Produces:
 *   fixtures/notices/ca-tax-notice.pdf
 *   fixtures/notices/edi-810-notice.pdf
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Builds a Letter-size PDF with one text block per page, using standard fonts
// so any PDF reader can extract the text.
async function buildPdf(pages: string[][]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Courier);
  const bold = await doc.embedFont(StandardFonts.CourierBold);
  for (const lines of pages) {
    const page = doc.addPage([612, 792]);
    let y = 740;
    lines.forEach((line, i) => {
      page.drawText(line, { x: 56, y, size: 10, font: i === 0 ? bold : font, color: rgb(0.07, 0.09, 0.13) });
      y -= 15;
    });
  }
  return doc.save();
}

// ── Notice 1: California Sales Tax Rate Change ────────────────────────────────

const taxNoticePages: string[][] = [
  [
    'SAMPLE NOTICE FOR SOFTWARE TESTING. NOT AN OFFICIAL DOCUMENT.',
    '',
    'STATE OF CALIFORNIA',
    'DEPARTMENT OF TAX AND FEE ADMINISTRATION',
    '',
    'NOTICE OF SALES AND USE TAX RATE CHANGE',
    'Reference: Publication 79-B  |  Effective: January 1, 2027',
    '',
    'To: Registered Sellers and Software Vendors',
    '',
    'This notice announces a change to the California state sales and use',
    'tax rate effective January 1, 2027.',
    '',
    'RATE CHANGE SUMMARY',
    '',
    '  Previous statewide rate:  7.25%  (0.0725)',
    '  New statewide rate:       7.50%  (0.0750)',
    '',
    'The new rate applies to all taxable retail sales occurring on or after',
    'January 1, 2027. The rate change affects the base state rate only.',
    'Local district taxes and special district rates are unchanged.',
    '',
    'APPLICABILITY',
    '',
    'This rate change applies to:',
    '  - All tangible personal property sold at retail',
    '  - Taxable services as defined in Revenue and Taxation Code 6006',
    '',
    'This rate change does NOT apply to:',
    '  - Sales for resale',
    '  - Sales to government entities (Government Code 6381)',
    '  - Pre-negotiated contract rates established before January 1, 2027',
    '    (See Publication 79-C for contractor rate guidance)',
  ],
  [
    'SYSTEMS AND SOFTWARE REQUIREMENTS',
    '',
    'All point-of-sale, invoicing, and billing systems that calculate',
    'California state sales tax must be updated to reflect the new rate',
    'of 7.50% (0.0750) no later than December 31, 2026.',
    '',
    'IMPORTANT: Only the base state rate changes. Do not modify:',
    '  - County or city tax rates',
    '  - Special district rates',
    '  - Contract rates or pre-negotiated rates with individual customers',
    '',
    'Vendors are reminded that rate lookups driven by table records',
    '(TAXTBL or equivalent) must be reviewed to ensure the table-driven',
    'override logic does not interfere with the new statutory rate.',
    '',
    'CONTACT',
    '',
    'Questions regarding this notice should be directed to:',
    '  Business Tax and Fee Division',
    '  (phone number omitted in sample)',
    '  cdtfa.ca.gov/industry/sales-tax',
    '',
    'Document ID: CDTFA-79-B-2026-001',
    'Issued: September 1, 2026',
    '',
    '--- END OF NOTICE ---',
  ],
];

// ── Notice 2: EDI 810 Date Format Change ─────────────────────────────────────

const ediNoticePages: string[][] = [
  [
    'SAMPLE NOTICE FOR SOFTWARE TESTING. NOT AN OFFICIAL DOCUMENT.',
    '',
    'ACME RETAIL PARTNERS',
    'ELECTRONIC DATA INTERCHANGE OPERATIONS',
    '',
    'EDI TRADING PARTNER NOTICE',
    'Subject: EDI 810 Invoice Tax Detail Requirement',
    'Notice ID: ARP-EDI-2026-014  |  Effective: January 1, 2027',
    '',
    'To: All EDI 810 Invoice Suppliers',
    '',
    'Starting January 1, 2027, every EDI 810 invoice must report the',
    'sales tax percentage that was actually applied to the invoice,',
    'in addition to the tax amount.',
    '',
    'CHANGE SUMMARY',
    '',
    '  Segment:  TXI (Tax Information)',
    '  Element:  TXI03 (Percent)',
    '',
    '  Current:  TXI01 tax type and TXI02 monetary amount only',
    '  Required: TXI01, TXI02, and TXI03 with the applied rate',
    '',
    'TXI03 must hold the rate used to calculate TXI02, expressed as a',
    'percentage with up to four decimal places (for example 7.5 for',
    '7.50 percent). If a customer is taxed at a rate other than the',
    'standard state rate, TXI03 must show that other rate.',
    '',
    'Invoices where TXI03 does not match TXI02 divided by the taxable',
    'amount will be rejected with a 997 error code.',
  ],
  [
    'TECHNICAL REQUIREMENTS',
    '',
    '  Transaction Set: 810 Invoice',
    '  Implementation:  X12 005010',
    '  Example segment: TXI*ST*75.00*7.5***ST',
    '',
    'TESTING',
    '',
    'Suppliers must send one test 810 with TXI03 populated through the',
    'test gateway before December 15, 2026.',
    '',
    'CONTACT',
    '',
    'EDI Help Desk: edi-support@partner.example',
    '',
    'Notice issued by: Acme Retail Partners EDI Operations',
    'Date: September 10, 2026',
    '',
    '--- END OF NOTICE ---',
  ],
];

// ── Write files ───────────────────────────────────────────────────────────────

async function main() {
  const outDir = join(process.cwd(), 'fixtures', 'notices');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'ca-tax-notice.pdf'), await buildPdf(taxNoticePages));
  console.log('Written: fixtures/notices/ca-tax-notice.pdf');
  writeFileSync(join(outDir, 'edi-810-notice.pdf'), await buildPdf(ediNoticePages));
  console.log('Written: fixtures/notices/edi-810-notice.pdf');
}

main();
