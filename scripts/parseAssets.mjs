import fs from 'fs';
const raw = fs.readFileSync('Frontend/src/assets/assets.js','utf8');
const sectionRegex = /export const\s+(electronicsProducts|dummyProducts)\s*=\s*\[([\s\S]*?)\];/g;
let sectionMatch; let count=0; let found=false;
while((sectionMatch=sectionRegex.exec(raw))!==null){
  const sectionName = sectionMatch[1];
  const sectionBody = sectionMatch[2];
  let i=0;
  while(i<sectionBody.length){
    const openIdx = sectionBody.indexOf('{', i);
    if(openIdx===-1) break;
    let braceCount=1; let closeIdx=openIdx+1;
    while(closeIdx<sectionBody.length && braceCount>0){
      if(sectionBody[closeIdx]==='{') braceCount++;
      else if(sectionBody[closeIdx]==='}') braceCount--;
      closeIdx++;
    }
    if(braceCount===0){
      const objText = sectionBody.substring(openIdx+1, closeIdx-1);
      const idMatch = objText.match(/_id\s*:\s*['\"]([^'\"]+)['\"]/);
      const id = idMatch ? idMatch[1] : null;
      if(id){ count++; if(id==='sp01a99k') found=true; }
      i = closeIdx;
    } else break;
  }
}
console.log('parsed', count, 'found', found);
