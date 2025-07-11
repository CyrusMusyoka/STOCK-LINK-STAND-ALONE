const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Rebuilding native modules for Electron...');
  const result = execSync('npx electron-rebuild -f -w better-sqlite3', {
    cwd: path.resolve(__dirname),
    stdio: 'inherit'
  });
  console.log('Rebuild successful');
} catch (error) {
  console.error('Rebuild failed:', error);
  process.exit(1);
}