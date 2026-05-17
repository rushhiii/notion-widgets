import fs from 'fs';
import path from 'path';

const playlistPath = path.join(process.cwd(), 'public', 'audio', 'playlist.json');
const raw = fs.readFileSync(playlistPath, 'utf8');
const playlist = JSON.parse(raw);
let changed = 0;

for (const track of playlist) {
  if (!track.src) continue;
  const newSrc = track.src.replace(/\(/g, '%28').replace(/\)/g, '%29');
  if (newSrc !== track.src) {
    track.src = newSrc;
    changed++;
  }
}

if (changed > 0) {
  fs.writeFileSync(playlistPath, JSON.stringify(playlist, null, 4), 'utf8');
}
console.log(`Done. Updated ${changed} src URLs.`);
