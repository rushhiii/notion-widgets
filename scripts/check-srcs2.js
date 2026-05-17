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
    const r = await head(t.src);
    if (!r.ok) failures.push({ index: i+1, src: t.src, title: t.title, artist: t.artist, status: r.status, error: r.error });
    await new Promise(r=>setTimeout(r, 100));
  }
  fs.writeFileSync(path.join(process.cwd(),'scripts','check-srcs-results.json'), JSON.stringify({ failures }, null, 2), 'utf8');
  console.log('Wrote results to scripts/check-srcs-results.json');
})();
