// Monthly hisaab export: sheet building (monthReport.js) and the .xlsx writer (xlsx.js).
import { describe, expect, it } from 'vitest';
import { buildMonthSheets, monthKey, monthLabel } from '../src/lib/monthReport.js';
import { buildXlsx } from '../src/lib/xlsx.js';

const NOW = new Date('2026-10-03T20:00:00');

const state = {
  settings: { shopName: 'Sharma Kirana' },
  items: [{ id: 'sugar', name: 'Sugar' }],
  customers: [
    { id: 'c1', name: 'Ramesh', openingBalance: 100 },
    { id: 'c2', name: 'Sunita', openingBalance: 0 },
  ],
  transactions: [
    // Last month: moves Ramesh's opening balance, not this month's totals.
    { id: 't0', type: 'credit_sale', customerId: 'c1', amount: 50, ts: '2026-09-30T10:00:00' },
    {
      id: 't1',
      type: 'credit_sale',
      customerId: 'c1',
      amount: 90,
      ts: '2026-10-01T09:05:00',
      lines: [{ itemId: 'sugar', qty: 2, unit: 'kg' }],
    },
    { id: 't2', type: 'cash_sale', amount: 40, ts: '2026-10-01T11:00:00', lines: [] },
    { id: 't3', type: 'payment', customerId: 'c1', amount: 60, ts: '2026-10-03T18:00:00' },
    { id: 't4', type: 'stock_in', amount: 500, ts: '2026-10-02T08:00:00', lines: [] },
    // Next month: ignored everywhere.
    { id: 't5', type: 'payment', customerId: 'c2', amount: 10, ts: '2026-11-01T10:00:00' },
  ],
};

const sheetByName = (sheets, name) => sheets.find((s) => s.name === name);

describe('month report', () => {
  it('names months', () => {
    expect(monthKey(NOW)).toBe('2026-10');
    expect(monthLabel('2026-10')).toMatch(/October 2026/);
  });

  it('builds the four sheets in order', () => {
    const sheets = buildMonthSheets(state, '2026-10', NOW);
    expect(sheets.map((s) => s.name)).toEqual(['Summary', 'Daily', 'Transactions', 'Khata']);
  });

  it('summary totals only count this month', () => {
    const summary = sheetByName(buildMonthSheets(state, '2026-10', NOW), 'Summary');
    const value = (label) => summary.rows.find((r) => r[0] === label)[1];
    expect(summary.rows[0][0]).toMatch(/^Sharma Kirana — October 2026/);
    expect(value('Total sales (₹)')).toBe(130);
    expect(value('Cash sales (₹)')).toBe(40);
    expect(value('Udhaar sales (₹)')).toBe(90);
    expect(value('Payments received (₹)')).toBe(60);
    expect(value('Cash in hand (₹)')).toBe(100);
    expect(value('Stock bought (₹)')).toBe(500);
    expect(value('Entries')).toBe(4);
  });

  it('daily sheet runs up to today, quiet days as zero, with a total row', () => {
    const daily = sheetByName(buildMonthSheets(state, '2026-10', NOW), 'Daily');
    const body = daily.rows.slice(1, -1);
    expect(body.map((r) => r[0])).toEqual(['2026-10-01', '2026-10-02', '2026-10-03']);
    expect(body[0]).toEqual(['2026-10-01', 40, 90, 130, 0, 40, 0]);
    expect(body[1]).toEqual(['2026-10-02', 0, 0, 0, 0, 0, 500]);
    expect(daily.rows.at(-1)).toEqual(['Total', 40, 90, 130, 60, 100, 500]);
    expect(daily.boldRows).toEqual([0, 4]);
  });

  it('transactions sheet lists items, customer and time', () => {
    const tx = sheetByName(buildMonthSheets(state, '2026-10', NOW), 'Transactions');
    expect(tx.rows[1]).toEqual(['2026-10-01', '09:05', 'Udhaar sale', 'Ramesh', 'Sugar 2 kg', 90]);
    expect(tx.rows).toHaveLength(5);
  });

  it('khata sheet carries last month into the opening balance', () => {
    const khata = sheetByName(buildMonthSheets(state, '2026-10', NOW), 'Khata');
    expect(khata.rows[1]).toEqual(['Ramesh', 150, 90, 60, 180]);
    expect(khata.rows[2]).toEqual(['Sunita', 0, 0, 0, 0]);
    expect(khata.rows.at(-1)).toEqual(['Total', 150, 90, 60, 180]);
  });
});

describe('xlsx writer', () => {
  const decode = (bytes) => new TextDecoder().decode(bytes);

  it('writes a zip with one worksheet per sheet', () => {
    const bytes = buildXlsx([
      { name: 'One', rows: [['a']] },
      { name: 'Two', rows: [[1]] },
    ]);
    expect([...bytes.slice(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04]); // "PK\3\4"
    const text = decode(bytes);
    expect(text).toContain('xl/worksheets/sheet1.xml');
    expect(text).toContain('xl/worksheets/sheet2.xml');
    expect(text).toContain('<sheet name="One" sheetId="1" r:id="rId1"/>');
  });

  it('writes numbers as values, text as escaped inline strings, and bold rows', () => {
    const text = decode(
      buildXlsx([
        {
          name: 'S',
          boldRows: [0],
          widths: [10],
          rows: [
            ['A & <B>', 42],
            [null, ''],
          ],
        },
      ]),
    );
    expect(text).toContain(
      '<c r="A1" s="1" t="inlineStr"><is><t xml:space="preserve">A &amp; &lt;B&gt;</t>',
    );
    expect(text).toContain('<c r="B1" s="1"><v>42</v></c>');
    expect(text).toContain('<row r="2"></row>'); // empty cells are left out
    expect(text).toContain('<col min="1" max="1" width="10" customWidth="1"/>');
  });

  it('cleans sheet names Excel would reject', () => {
    const text = decode(buildXlsx([{ name: 'Oct/Nov: [hisaab] with a very long name', rows: [] }]));
    expect(text).toContain('<sheet name="Oct Nov   hisaab  with a very l"');
  });
});
