const currentYear = 2026;
const lastInvoiceNumbers = [
  'INV-2026-0001',
  'INV-2026-2027', // The buggy one
];

console.log('Testing number generation:');

lastInvoiceNumbers.forEach(lastNumber => {
  const parts = lastNumber.split('-');
  let nextNumber = 1;
  if (parts.length >= 3) {
    const lastNum = parseInt(parts[2] || '0');
    nextNumber = lastNum + 1;
  } else {
    // Fallback if format is unexpected
    const lastNum = parseInt(parts[parts.length - 1] || '0');
    nextNumber = isNaN(lastNum) ? 1 : lastNum + 1;
  }
  const result = `INV-${currentYear}-${String(nextNumber).padStart(4, '0')}`;
  console.log(`Last: ${lastNumber} -> Next: ${result}`);
});
