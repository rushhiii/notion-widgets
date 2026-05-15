# My Music Collection

Private audio assets for use with [Notion Widgets](https://github.com/rushhiii/notion-widgets) audio player.

## License

Personal Use License - See LICENSE file.

This collection is **NOT** open source. Audio files are provided for private, non-commercial use only by designated users. Public redistribution, commercial use, or derivative works are prohibited without express written permission.

## Repository Structure

```
MyMusicCollection/
├── LICENSE
├── README.md
├── metadata.json (optional playlist index)
├── tracks/
│   ├── instrumental-1.mp3
│   ├── ambient-loop.mp3
│   └── ...
└── covers/
    ├── instrumental-1.jpg
    ├── ambient-loop.jpg
    └── ...
```

## Playlist Format

Reference your audio files in a `metadata.json` or `playlist.json` like this:

```json
[
  {
    "src": "https://cdn.jsdelivr.net/gh/V0idVanguard/MyMusicCollection@main/tracks/instrumental-1.mp3",
    "title": "Instrumental 1",
    "artist": "Your Name",
    "cover": "https://cdn.jsdelivr.net/gh/V0idVanguard/MyMusicCollection@main/covers/instrumental-1.jpg"
  }
]
```

Or if you're using the signed-URL proxy approach with Cloudflare R2, reference files by their S3 path in the metadata, and let the proxy handle secure signing.

## Cloudflare R2 Setup

If you want the easiest path for your widget, use a public R2 bucket or public custom domain.

Cloudflare currently asks for billing details to enable the R2 subscription, even if you stay within the free monthly usage. If you do not want to add a card, skip R2 and use the no-card option below.

1. Create an R2 bucket in Cloudflare.
2. Upload your `tracks/` and `covers/` folders.
3. Set a public bucket policy or attach a public custom domain.
4. Generate `playlist.json` with absolute public URLs, for example:

```json
[
  {
    "src": "https://media.example.com/tracks/ENG/21%20Savage%20-%20Rockstar.mp3",
    "title": "Rockstar",
    "artist": "21 Savage",
    "cover": "https://media.example.com/covers/21-savage-rockstar.jpg",
    "category": "eng",
    "type": "speed up"
  }
]
```

5. Point the audio-player widget `data` param to the public `playlist.json` URL.

If you keep the bucket private, use a backend proxy to mint short-lived signed URLs and return them to the widget.

## No-Card Alternative

If you do not want to add any payment method, use a host that allows public file links without billing. The most practical fallback for a 3.19 GB audio library is Internet Archive.

Why it fits:

1. No credit card is typically required to upload and host public files.
2. It can serve direct download URLs that the audio player can read.
3. It works better than Google Drive or Dropbox for stable hotlinking.

How to use it:

1. Create an Internet Archive account.
2. Upload your MP3s as a public item or collection.
3. Use the direct file URLs from the uploaded item in `playlist.json`.
4. Point the widget `data` param to the public JSON file.

If you want, I can help you convert your current `playlist.json` format to Internet Archive URLs next.

## Rewrite Helper

If you already have a playlist JSON and just want to swap its `src` and `cover` values to an R2 public base, use the helper in the widget repo:

```powershell
Set-Location 'C:\Users\rushi\Documents\00 Projects\notion-widgets'
pwsh .\scripts\rewrite-playlist-to-r2.ps1 -BaseUrl 'https://media.example.com' -InputPath 'C:\Users\rushi\Music\MyMusicCollection\playlist.json' -OutputPath 'C:\Users\rushi\Music\MyMusicCollection\playlist.r2.json'
```

Use `-InPlace` if you want to overwrite the original `playlist.json` after you’ve confirmed the rewritten file looks correct.

## Usage with Notion Widgets

See the parent widget repo documentation for integration steps.

---

**Contact**: [your-email@example.com]
