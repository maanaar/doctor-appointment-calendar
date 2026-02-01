/**
 * Copies built React app to Odoo agial_17 static folder.
 * Run: npm run build:odoo
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIST = path.join(__dirname, '..', 'dist');
// Path to Odoo addon (from calendar-app/scripts: ../../.. = project root parent)
const ODOO_ADDONS = process.env.ODOO_ADDONS_PATH || path.join(__dirname, '..', '..', '..', 'extra-addons');
const TARGET = path.join(ODOO_ADDONS, 'agial_17', 'static', 'calendar');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error('Build not found. Run "npm run build" first.');
    process.exit(1);
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log('  ' + path.relative(DIST, srcPath) + ' -> ' + destPath);
    }
  }
}

console.log('Copying build to Odoo static folder...');
console.log('  From:', DIST);
console.log('  To:', TARGET);
copyRecursive(DIST, TARGET);
console.log('Done. Restart Odoo and open IVF Inpatient > React Calendar.');
