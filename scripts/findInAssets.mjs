import fs from 'fs';
const p = 'Frontend/src/assets/assets.js';
const raw = fs.readFileSync(p,'utf8');
console.log(raw.includes('sp01a99k'));
// print surrounding lines
const idx = raw.indexOf('sp01a99k');
if(idx!==-1){
  console.log(raw.substring(Math.max(0, idx-120), idx+120));
}
