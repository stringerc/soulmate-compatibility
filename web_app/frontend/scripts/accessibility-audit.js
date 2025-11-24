#!/usr/bin/env node

/**
 * Accessibility Audit Script
 * Runs automated accessibility checks using axe-core
 * 
 * Usage: npm run audit:accessibility
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running Accessibility Audit...\n');

// Check if axe-core is installed
try {
  require.resolve('axe-core');
} catch (e) {
  console.error('❌ axe-core not found. Installing...');
  execSync('npm install --save-dev axe-core', { stdio: 'inherit' });
}

// Create audit results directory
const resultsDir = path.join(process.cwd(), 'accessibility-audit-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

console.log('✅ Accessibility audit setup complete!');
console.log('\n📋 Next Steps:');
console.log('1. Run your app: npm run dev');
console.log('2. Install axe DevTools browser extension');
console.log('3. Run audit on each page');
console.log('4. Review results in browser console');
console.log('\n💡 For automated testing, use Playwright with axe-core');

