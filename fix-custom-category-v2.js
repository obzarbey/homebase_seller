const fs = require('fs');
const path = require('path');

// Read the controller file
const filePath = path.join(__dirname, 'controllers', 'sellerProductController.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all projection stages to add customCategory after customNote
const lines = content.split('\n');
const updatedLines = lines.map(line => {
  // If line contains "customNote: 1," and doesn't already have customCategory
  if (line.includes('customNote: 1,') && !line.includes('customCategory')) {
    // Find the indentation
    const indentation = line.match(/^(\s*)/)[1];
    // Add customCategory line after this line
    return line + '\n' + indentation + 'customCategory: 1,';
  }
  return line;
});

content = updatedLines.join('\n');

// Also handle flattened catalog data projections
content = content.replace(
  /(\s+)name: '\$catalogData\.name',/g,
  '$1name: \'$catalogData.name\',\n$1customCatalogCategory: \'$catalogData.category\','
);

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Updated all projection stages to include customCategory field');
console.log('Updated file:', filePath);
