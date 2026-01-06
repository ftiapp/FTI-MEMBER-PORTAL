const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'app', 'api');

function addNoCacheExports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has dynamic export
  if (content.includes('export const dynamic') || content.includes('export const revalidate')) {
    console.log(`⏭️  Skipped (already has exports): ${filePath}`);
    return false;
  }
  
  // Check if it's an API route (has export async function)
  if (!content.includes('export async function')) {
    console.log(`⏭️  Skipped (not an API route): ${filePath}`);
    return false;
  }
  
  // Find the first import or the start of exports
  const lines = content.split('\n');
  let insertIndex = 0;
  let foundImports = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ')) {
      foundImports = true;
    } else if (foundImports && !lines[i].trim().startsWith('import ') && lines[i].trim() !== '') {
      insertIndex = i;
      break;
    }
  }
  
  // If no imports found, insert at the beginning
  if (!foundImports) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('export ')) {
        insertIndex = i;
        break;
      }
    }
  }
  
  // Insert the exports
  const noCacheExports = [
    '',
    '// Force dynamic rendering - no caching in development',
    'export const dynamic = "force-dynamic";',
    'export const revalidate = 0;',
    ''
  ];
  
  lines.splice(insertIndex, 0, ...noCacheExports);
  
  const newContent = lines.join('\n');
  fs.writeFileSync(filePath, newContent, 'utf8');
  
  console.log(`✅ Updated: ${filePath}`);
  return true;
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (entry.name === 'route.js') {
      if (addNoCacheExports(fullPath)) {
        count++;
      }
    }
  }
  
  return count;
}

console.log('🚀 Adding no-cache exports to all API routes...\n');
const updatedCount = processDirectory(apiDir);
console.log(`\n✨ Done! Updated ${updatedCount} API route files.`);
