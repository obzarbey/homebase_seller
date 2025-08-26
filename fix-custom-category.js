const fs = require('fs');
const path = require('path');

// Read the controller file
const filePath = path.join(__dirname, 'controllers', 'sellerProductController.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all occurrences where customName: is followed by address: 
// and add customCategory: between them
const regex = /(\s+)customName: (\$catalogData\.)?customName,(\s+)address:/g;
const replacement = '$1customName: $2customName,$3customCategory: $2customCategory,$3address:';

content = content.replace(regex, replacement);

// Also handle projections where customName: 1, is followed by address: 1,
const regex2 = /(\s+)customName: 1,(\s+)address: 1,/g;
const replacement2 = '$1customName: 1,$2customCategory: 1,$2address: 1,';

content = content.replace(regex2, replacement2);

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Updated all projection stages to include customCategory field');
console.log('Updated file:', filePath);
