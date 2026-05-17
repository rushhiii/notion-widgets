import fs from 'fs';
import path from 'path';

const playlistPath = path.join(process.cwd(), 'public', 'audio', 'playlist.json');
const playlist = JSON.parse(fs.readFileSync(playlistPath, 'utf8'));

async function head(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

(async () => {
  const failures = [];
  for (let i = 0; i < playlist.length; i++) {
    const t = playlist[i];
    process.stdout.write(`Checking ${i+1}/${playlist.length}...\r`);
    const r = await head(t.src);
    if (!r.ok) failures.push({ index: i+1, src: t.src, title: t.title, artist: t.artist, status: r.status, error: r.error });
    await new Promise(r => setTimeout(r, 150));
  }
  console.log('\nDone.');
  if (failures.length === 0) {
    console.log('All URLs responded OK.');
  } else {
    console.log(`Failures: ${failures.length}`);
    failures.slice(0,50).forEach(f => console.log(`${f.index}: ${f.status || 'ERR'} ${f.src} — ${f.title} — ${f.artist} ${f.error?'- '+f.error:''}`));
  }
})();
