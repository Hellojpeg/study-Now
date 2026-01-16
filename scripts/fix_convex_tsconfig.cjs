const fs = require('fs');
const path = require('path');
const tsconfigPath = path.join(__dirname, '..', 'node_modules', 'convex', 'tsconfig.json');

if (!fs.existsSync(tsconfigPath)) {
  console.log('Convex tsconfig not found, skipping.');
  process.exit(0);
}

try {
  const content = fs.readFileSync(tsconfigPath, 'utf8');
  const json = JSON.parse(content);

  json.compilerOptions = json.compilerOptions || {};
  json.compilerOptions.target = 'ES2024';
  json.compilerOptions.module = 'NodeNext';
  json.compilerOptions.moduleResolution = 'NodeNext';
  json.compilerOptions.resolveJsonModule = true;
  json.compilerOptions.skipLibCheck = true;
  json.compilerOptions.esModuleInterop = true;

  fs.writeFileSync(tsconfigPath, JSON.stringify(json, null, 2));
  console.log('Patched convex/tsconfig.json for Node 24 (NodeNext)');
} catch (err) {
  console.error('Failed to patch convex tsconfig:', err);
  process.exit(1);
}