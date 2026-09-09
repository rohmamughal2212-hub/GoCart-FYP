const fs = require('fs');
const path = require('path');
const base = path.join('Frontend','src');

// Patch ProductCard.jsx
const pcPath = path.join(base,'components','ProductCard.jsx');
let pc = fs.readFileSync(pcPath,'utf8');
if (!pc.includes('src={product.image[0]}')) {
  console.log('ProductCard pattern not found, skipping');
} else {
  pc = pc.replace(/src=\{product.image\[0\]\}/g, 'src={String((product.image && product.image[0]) || assets.profile_icon).trim()}');
  pc = pc.replace(/<img([\s\S]*?)className=\"w-full h-full object-cover[\s\S]*?>/g, function(m){
    if (m.includes('onError=')) return m;
    return m.replace(/\/>$/, ' onError={(e)=> e.currentTarget.src = assets.profile_icon} />');
  });
  fs.writeFileSync(pcPath, pc, 'utf8');
  console.log('Patched ProductCard.jsx');
}

// Patch SingleProduct.jsx
const spPath = path.join(base,'pages','SingleProduct.jsx');
let sp = fs.readFileSync(spPath,'utf8');
if (!sp.includes('setThumbnail(product?.image?.[0]')) {
  console.log('SingleProduct thumbnail effect pattern not found');
} else {
  // ensure assets import
  if (!sp.includes("import { assets } from \"../assets/assets\"")) {
    sp = sp.replace('import toast from "react-hot-toast";', 'import toast from "react-hot-toast";\nimport { assets } from "../assets/assets";');
  }
  // replace thumbnail init
  sp = sp.replace(/setThumbnail\(product\?\.image\?\[0\] \|\| null\);/, 'setThumbnail(String((product?.image?.[0]) || assets.profile_icon).trim());');
  // thumbnails img src + onError
  sp = sp.replace(/<img src=\{img\} alt=\{`thumb-\$\{i\}`\} className=\"w-full object-cover\" \/>/g, '<img src={String(img || assets.profile_icon).trim()} alt={`thumb-${i}`} className="w-full object-cover" onError={(e)=> e.currentTarget.src = assets.profile_icon} />');
  // large image
  sp = sp.replace(/<img src=\{thumbnail\} alt=\{product.name\} className=\"w-full object-cover\" \/>/g, '<img src={String(thumbnail || product.image?.[0] || assets.profile_icon).trim()} alt={product.name} className="w-full object-cover" onError={(e)=> e.currentTarget.src = assets.profile_icon} />');
  fs.writeFileSync(spPath, sp, 'utf8');
  console.log('Patched SingleProduct.jsx');
}