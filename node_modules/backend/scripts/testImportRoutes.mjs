import path from 'path';
import fs from 'fs';
const __dirname = path.dirname(new URL(import.meta.url).pathname.replace(/^\//, ''));
const routesDir = path.resolve(__dirname, '../routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
console.log('Found route files:', files);
for (const f of files) {
  const p = `../routes/${f}`;
  try {
    const mod = await import(p);
    console.log('Imported', f, 'exports:', Object.keys(mod));
  } catch (err) {
    console.error('Error importing', f, err.stack || err.message);
  }
}
