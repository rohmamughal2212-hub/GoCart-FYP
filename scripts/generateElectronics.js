import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const srcPath = path.resolve('C:/Users/CH-MHS/Desktop/electronics_dataset_100_products.csv');
const outPath = path.resolve('C:/Users/CH-MHS/Desktop/Gocart/Frontend/src/assets/electronicsProducts.js');

if (!fs.existsSync(srcPath)) {
  console.error('CSV source file not found:', srcPath);
  process.exit(1);
}

const text = fs.readFileSync(srcPath, 'utf8');
const records = parse(text, {
  columns: true,
  skip_empty_lines: true,
});

const rows = records.slice(0, 100).map((row, idx) => {
  const title = (row.title || '').trim();
  const images = (row.images || '')
    .split(' | ')
    .map((u) => u.trim())
    .filter(Boolean);

  const rawPrice = (row.price || '').replace(/[^0-9.]/g, '');
  const rawOriginal = (row.original_price || '').replace(/[^0-9.]/g, '');
  const toNum = (s) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  };
  const price = toNum(rawPrice) || toNum(rawOriginal) || 0;
  const originalPrice = toNum(rawOriginal) || price || 0;
  const descRaw = row.highlights || row.description || '';
  const descText = descRaw.startsWith('[') && descRaw.endsWith(']') ? descRaw.slice(1, -1) : descRaw;
  const description = descText
    .split(/\s*\|\s*|\\n|\.|;|,/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 5);

  return {
    _id: (row.uniq_id || row.pid || `prod${idx}`).trim(),
    name: title || `Product ${idx + 1}`,
    category: 'Electronics',
    price: Number.isFinite(originalPrice) ? originalPrice : 0,
    offerPrice: Number.isFinite(price) ? price : 0,
    image: images.length ? images : ['https://via.placeholder.com/400'],
    description: description.length ? description : [title || 'No description'],
    inStock: true,
  };
});

const output = `export const electronicsProducts = [\n${rows
  .map((item) => `  ${JSON.stringify(item, null, 2)}`)
  .join(',\n')}\n];\n`;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, output, 'utf8');
console.log('WROTE', outPath, 'with', rows.length, 'items');
