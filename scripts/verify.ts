import { calcTotals, formatCurrency, generateId, generateInvoiceNumber } from '../src/lib/calc.js';
import { ExtractionResponseSchema } from '../shared/schema.js';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${name}: ${e}`);
    failed++;
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

console.log('\nVerification Suite\n');

console.log('Invoice Calculations:');
test('calcTotals sums gross amounts', () => {
  const loads = [
    { id: '1', loadNumber: '', brokerName: '', pickupDate: '', grossAmount: 1000, originCity: '', originState: '', destinationCity: '', destinationState: '' },
    { id: '2', loadNumber: '', brokerName: '', pickupDate: '', grossAmount: 1500, originCity: '', originState: '', destinationCity: '', destinationState: '' },
  ];
  const { totalGrossRevenue, dispatchFee } = calcTotals(loads, 10);
  assert(totalGrossRevenue === 2500, `Expected 2500, got ${totalGrossRevenue}`);
  assert(dispatchFee === 250, `Expected 250, got ${dispatchFee}`);
});

test('calcTotals with empty loads returns 0', () => {
  const { totalGrossRevenue, dispatchFee } = calcTotals([], 10);
  assert(totalGrossRevenue === 0, 'Expected 0 gross');
  assert(dispatchFee === 0, 'Expected 0 fee');
});

test('formatCurrency formats correctly', () => {
  const result = formatCurrency(2500.5);
  assert(result.includes('2,500'), `Expected formatted number, got ${result}`);
});

test('generateId returns unique strings', () => {
  const a = generateId();
  const b = generateId();
  assert(a !== b, 'IDs should be unique');
});

test('generateInvoiceNumber starts with INV-', () => {
  const n = generateInvoiceNumber();
  assert(n.startsWith('INV-'), `Expected INV- prefix, got ${n}`);
});

console.log('\nExtraction Schema Validation:');
test('valid extraction response parses correctly', () => {
  const result = ExtractionResponseSchema.safeParse({
    success: true,
    data: {
      loadNumber: '12345',
      brokerName: 'Test Broker',
      pickupDate: '2025-01-15',
      grossAmount: 2500,
      originCity: 'Chicago',
      originState: 'IL',
      destinationCity: 'Dallas',
      destinationState: 'TX',
    },
  });
  assert(result.success, 'Schema should parse valid data');
});

test('partial extraction response is valid', () => {
  const result = ExtractionResponseSchema.safeParse({
    success: true,
    data: { loadNumber: '999' },
  });
  assert(result.success, 'Partial data should be valid');
});

test('error response is valid', () => {
  const result = ExtractionResponseSchema.safeParse({
    success: false,
    error: 'API key not configured',
  });
  assert(result.success, 'Error response should parse');
});

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
