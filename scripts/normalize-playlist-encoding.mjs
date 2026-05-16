import fs from 'fs';
import path from 'path';
const p = path.resolve(process.cwd(), 'public', 'audio', 'playlist.json');
let text = fs.readFileSync(p, 'utf8');
// strip BOM if present
if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
let data;
try {
  data = JSON.parse(text);
} catch (e) {
  console.error('Failed to parse JSON:', e.message);
  process.exit(1);
}
let changed = 0;
for (const item of data) {
  if (item && typeof item === 'object') {
    if (typeof item.category === 'string' && /%[0-9A-Fa-f]{2}/.test(item.category)) {
      try {
        const dec = decodeURIComponent(item.category);
        if (dec !== item.category) { item.category = dec; changed++; }
      } catch (e) {
        // ignore
      }
    }
    if (typeof item.src === 'string' && /%25[0-9A-Fa-f]{2}/.test(item.src)) {
      let before = item.src;
      // replace %25XX -> %XX repeatedly until stable
      let after = before.replace(/%25([0-9A-Fa-f]{2})/g, '%$1');
      while (after !== before) {
        before = after;
        after = before.replace(/%25([0-9A-Fa-f]{2})/g, '%$1');
      }
      if (after !== item.src) { item.src = after; changed++; }
    }
    // Keep track URLs URL-encoded, but normalize any raw or double-encoded path segments.
    if (typeof item.src === 'string') {
      try {
        const u = new URL(item.src);
        if (u.href !== item.src) {
          item.src = u.href;
          changed++;
        }
      } catch {
        // ignore invalid URLs
      }
    }
  }
}
if (changed) {
  fs.writeFileSync(p, JSON.stringify(data, null, 4) + '\n', 'utf8');
  console.log('Updated', changed, 'values in', p);
} else {
  console.log('No changes needed');
}
