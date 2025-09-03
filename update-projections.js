const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'controllers', 'sellerProductController.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all occurrences of the projection without isPreOwned with the version that includes it
const oldProjection = `        isAvailable: 1,
        status: 1,`;

const newProjection = `        isAvailable: 1,
        isPreOwned: 1,
        status: 1,`;

content = content.replace(new RegExp(oldProjection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newProjection);

// Write back to file
fs.writeFileSync(filePath, content);
console.log('✅ Updated all $project stages to include isPreOwned field');
