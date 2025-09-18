// Test script for searchKeywords functionality
const mongoose = require('mongoose');
require('dotenv').config();

// Helper function to extract keywords from custom name
const extractKeywordsFromCustomName = (customName) => {
  if (!customName || typeof customName !== 'string') return [];
  
  // Split by spaces, commas, hyphens, and other common separators
  const keywords = customName
    .toLowerCase()
    .split(/[\s,\-_]+/)
    .map(word => word.trim())
    .filter(word => word.length > 0);
  
  return [...new Set(keywords)]; // Remove duplicates
};

// Test cases
const testCases = [
  "Premium Quality Rice",
  "Fresh Organic Tomatoes",
  "Samsung Galaxy Phone Case",
  "Hand-Made Wooden Chair",
  "Extra Virgin Olive Oil, Cold Pressed",
  "Women's Fashion Handbag",
  "",
  null,
  undefined,
  "Single",
  "Multiple Words With Spaces",
  "hyphen-separated-words",
  "Mixed_underscore and-hyphen words"
];

console.log('Testing keyword extraction function:\n');

testCases.forEach((testCase, index) => {
  const keywords = extractKeywordsFromCustomName(testCase);
  console.log(`Test ${index + 1}:`);
  console.log(`  Input: "${testCase}"`);
  console.log(`  Keywords: [${keywords.map(k => `"${k}"`).join(', ')}]`);
  console.log();
});

console.log('All tests completed!');
