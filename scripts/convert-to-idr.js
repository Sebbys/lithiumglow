/**
 * Script to convert all USD prices to IDR in menu-data.ts
 * Conversion rate: 1 USD = 15,000 IDR
 */

const fs = require('fs');
const path = require('path');

const USD_TO_IDR = 15000;
const filePath = path.join(__dirname, '../lib/menu-data.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Count original prices
const originalPriceMatches = content.match(/price:\s*\d+\.\d+/g);
console.log(`Found ${originalPriceMatches ? originalPriceMatches.length : 0} USD prices to convert\n`);

// Convert all decimal prices (e.g., price: 12.99) to IDR
content = content.replace(/price:\s*(\d+\.\d+)/g, (match, usdPrice) => {
  const usd = parseFloat(usdPrice);
  const idr = Math.round(usd * USD_TO_IDR);
  console.log(`Converting $${usd} → Rp ${idr.toLocaleString('id-ID')}`);
  return `price: ${idr}`;
});

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ Successfully converted all prices to IDR!`);
console.log(`📝 File updated: ${filePath}`);
