const fs = require('fs');
const path = require('path');

// Read the controller file
const filePath = path.join(__dirname, 'controllers', 'sellerProductController.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all occurrences where isAvailable: 1, is followed by status: 1,
// and add isPreOwned: 1, between them
const regex = /(\s+)isAvailable: 1,(\s+)status: 1,/g;
const replacement = '$1isAvailable: 1,$2isPreOwned: 1,$2status: 1,';

content = content.replace(regex, replacement);

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Updated all projection stages to include isPreOwned field');
console.log('Updated file:', filePath);
