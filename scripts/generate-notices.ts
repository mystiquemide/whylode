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

// ── Minimal PDF generator ────────────────────────────────────────────────────
// Generates a multi-page (or single-page) PDF with plain text content.
// No external libraries — raw PDF 1.4 syntax.

function buildPdf(pages: string[][]): Buffer {
  const lines: string[] = [];
  const offsets: number[] = [];

  const push = (s: string) => lines.push(s);

  // Header
  push('%PDF-1.4');
  push('%\xFF\xFF\xFF\xFF');

  const objects: Array<{ offset: number; content: string[] }> = [];

  const addObj = (id: number, content: string[]) => {
    const offset = lines.join('\n').length + 1;
    offsets.push(offset);
    objects.push({ offset, content });
    push(`${id} 0 obj`);
    content.forEach((l) => push(l));
    push('endobj');
    push('');
  };

  // We'll build objects in-order and track byte offsets via a second pass.
  const objectContents: string[][] = [];

  // Object 1: catalog
  objectContents.push(['<< /Type /Catalog /Pages 2 0 R >>', '']);

  // Object 2: pages (will be filled in after we know page count)
  const pageIds = pages.map((_, i) => i + 3); // objects 3..N are pages
  const fontId = pages.length + 3;
  objectContents.push([`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`, '']);

  // Page objects
  for (const pageLines of pages) {
    const streamContent = pageLines
      .map((line, i) => `BT /F1 11 Tf 50 ${750 - i * 18} Td (${escapePdf(line)}) Tj ET`)
      .join('\n');
    const streamBytes = Buffer.byteLength(streamContent, 'latin1');
    objectContents.push([
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]`,
      `   /Contents ${fontId + 1 + objectContents.length - 2} 0 R`,
      `   /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`,
      '',
    ]);
    // Stream object for this page's content
    objectContents.push([
      `<< /Length ${streamBytes} >>`,
      'stream',
      streamContent,
      'endstream',
      '',
    ]);
  }

  // Font object
  objectContents.push([
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '',
  ]);

  // Now do a real two-pass build to get accurate byte offsets.
  const parts: string[] = ['%PDF-1.4\n%\xFF\xFF\xFF\xFF\n'];
  const xrefOffsets: number[] = [];

  for (let i = 0; i < objectContents.length; i++) {
    xrefOffsets.push(parts.join('').length);
    parts.push(`${i + 1} 0 obj\n`);
    parts.push(objectContents[i].join('\n'));
    parts.push('\nendobj\n\n');
  }

  const xrefOffset = parts.join('').length;
  const count = objectContents.length + 1; // +1 for the free entry

  const xref = [
    'xref',
    `0 ${count}`,
    '0000000000 65535 f ',
    ...xrefOffsets.map((o) => `${String(o).padStart(10, '0')} 00000 n `),
    '',
    'trailer',
    `<< /Size ${count} /Root 1 0 R >>`,
    'startxref',
    String(xrefOffset),
    '%%EOF',
  ].join('\n');

  parts.push(xref);
  return Buffer.from(parts.join(''), 'latin1');
}

function escapePdf(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

// ── Notice 1: California Sales Tax Rate Change ────────────────────────────────

const taxNoticePages: string[][] = [
  [
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
    '  (800) 400-7115',
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
    'ACME RETAIL PARTNERS',
    'ELECTRONIC DATA INTERCHANGE OPERATIONS',
    '',
    'EDI TRADING PARTNER NOTICE',
    'Subject: EDI 810 Invoice Date Format Requirement',
    'Notice ID: ARP-EDI-2026-014  |  Effective: October 1, 2026',
    '',
    'To: All EDI 810 Invoice Suppliers',
    '',
    'This notice updates the date format requirement for the BIG segment',
    'of the EDI 810 Invoice transaction set.',
    '',
    'CHANGE SUMMARY',
    '',
    '  Segment:  BIG (Beginning Segment for Invoice)',
    '  Element:  BIG01 (Invoice Date)',
    '',
    '  Current accepted format:  YYYYMMDD',
    '  New required format:      CCYYMMDD',
    '',
    'Effective October 1, 2026, all EDI 810 invoices submitted to',
    'Acme Retail Partners must use the CCYYMMDD format in the BIG01',
    'element as specified in the X12 005010 implementation guide.',
    '',
    'BACKGROUND',
    '',
    'The CCYYMMDD format is the X12 standard 8-character date format',
    'where CC represents the century (19 or 20), YY the two-digit year,',
    'MM the month, and DD the day.',
    '',
    'For dates in the years 2000-2099, CCYYMMDD and YYYYMMDD produce',
    'identical 8-character strings. This change aligns terminology',
    'with the X12 005010 specification without altering the byte values.',
  ],
  [
    'TECHNICAL REQUIREMENTS',
    '',
    '  Transaction Set: 810 Invoice',
    '  Implementation:  X12 005010X012A1',
    '  Segment:         BIG',
    '  Element:         BIG01',
    '  Format:          CCYYMMDD (8 numeric digits)',
    '  Example:         20261001 (October 1, 2026)',
    '',
    'TESTING',
    '',
    'Suppliers are required to submit one test 810 transaction in the',
    'CCYYMMDD format through the AS2 test gateway by September 15, 2026.',
    '',
    'Test gateway: edi-test.acmeretail.com:4080',
    'ISA qualifier: ZZ  ISA ID: ACMEEDITST',
    '',
    'ACKNOWLEDGEMENT',
    '',
    'Your 997 Functional Acknowledgement must be updated to confirm',
    'receipt of 810 transactions using the CCYYMMDD date element.',
    '',
    'CONTACT',
    '',
    'EDI Help Desk: edi-support@acmeretail.com',
    'Phone: (555) 900-4400 ext 2',
    '',
    'Notice issued by: Acme Retail Partners EDI Operations',
    'Date: August 28, 2026',
    '',
    '--- END OF NOTICE ---',
  ],
];

// ── Write files ───────────────────────────────────────────────────────────────

const outDir = join(process.cwd(), 'fixtures', 'notices');
mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, 'ca-tax-notice.pdf'), buildPdf(taxNoticePages));
console.log('Written: fixtures/notices/ca-tax-notice.pdf');

writeFileSync(join(outDir, 'edi-810-notice.pdf'), buildPdf(ediNoticePages));
console.log('Written: fixtures/notices/edi-810-notice.pdf');
