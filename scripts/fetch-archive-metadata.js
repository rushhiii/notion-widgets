import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to extract item ID from Archive.org URL
function extractItemId(url) {
  const match = url.match(/\/items\/([^\/]+)\//);
  return match ? match[1] : null;
}

// Function to parse artist and title from filename
function parseFilename(filename) {
  // Decode URL-encoded characters
  const decoded = decodeURIComponent(filename);
  
  // Try to match "Artist - Title" pattern
  const match = decoded.match(/^(.+?)\s*-\s*(.+?)(?:\.(mp3|wav|flac))?$/i);
  
  if (match) {
    return {
      artist: match[1].trim(),
      title: match[2].trim()
    };
  }
  
  // Fallback: just use the filename without extension
  return {
    artist: 'Unknown Artist',
    title: decoded.replace(/\.(mp3|wav|flac)$/i, '').trim()
  };
}

// Function to fetch and parse XML files from Archive.org
async function fetchArchiveMetadata(itemId) {
  try {
    const metadataUrl = `https://archive.org/metadata/${itemId}`;
    const response = await fetch(metadataUrl);
    if (!response.ok) throw new Error(`Failed to fetch metadata for ${itemId}`);
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching metadata for ${itemId}:`, error.message);
    return null;
  }
}

// Function to get cover art URL
function getCoverUrl(itemId) {
  // Use placeholder cover image
  return "https://via.placeholder.com/200?text=Cover";
}

// Main function to update playlist
async function updatePlaylistMetadata() {
  try {
    // Read current playlist
    const playlistPath = path.join(__dirname, '../public/audio/playlist.json');
    const playlist = JSON.parse(fs.readFileSync(playlistPath, 'utf-8'));
    
    console.log(`Processing ${playlist.length} tracks...`);
    
    // Track items we've already fetched to avoid duplicate API calls
    const fetchedMetadata = {};
    
    for (let i = 0; i < playlist.length; i++) {
      const track = playlist[i];
      const itemId = extractItemId(track.src);
      
      if (!itemId) {
        console.log(`⚠️  Skipping track ${i + 1}: Could not extract item ID from URL`);
        continue;
      }
      
      // Extract filename from URL
      const fileMatch = track.src.match(/\/([^\/]+\.mp3)$/i);
      if (!fileMatch) {
        console.log(`⚠️  Track ${i + 1}: Could not extract filename from URL`);
        continue;
      }

      const filename = fileMatch[1];
      const filenameDecoded = decodeURIComponent(filename);

      // Fetch metadata only once per item
      if (!fetchedMetadata[itemId]) {
        console.log(`📥 Fetching metadata for item: ${itemId}`);
        fetchedMetadata[itemId] = await fetchArchiveMetadata(itemId);
        // Rate limiting: be nice to Archive.org
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const metadata = fetchedMetadata[itemId];

      // Try to use per-file metadata when available
      let finalArtist = null;
      let finalTitle = null;

      if (metadata && Array.isArray(metadata.files)) {
        const relPath = decodeURIComponent(track.src.split(`/items/${itemId}/`)[1]);
        const fileObj = metadata.files.find(f => f.name === relPath || f.name === filenameDecoded || (f.name && f.name.endsWith(filenameDecoded)));

        if (fileObj) {
          finalArtist = fileObj.artist || fileObj.creator || null;
          finalTitle = fileObj.title || null;
        }
      }

      // Fallback to filename parsing when per-file metadata isn't available
      if (!finalArtist || !finalTitle) {
        const parsed = parseFilename(filename);
        finalArtist = finalArtist || parsed.artist;
        finalTitle = finalTitle || parsed.title;
      }

      // Clean artist: remove parenthetical qualifiers like (slowed+reverb)
      finalArtist = finalArtist.replace(/\s*\(.*?\)\s*$/,'').trim();

      // If artist becomes empty after cleaning, set Unknown Artist
      if (!finalArtist) finalArtist = 'Unknown Artist';
      // If artist equals title or looks like a variant, try to find the original (non-slowed/sped) file
      const baseTitle = (finalTitle || '').replace(/\s*\(.*?\)\s*/g, '').trim();
      if (metadata && Array.isArray(metadata.files) && (finalArtist === finalTitle || finalArtist === baseTitle || /slowed|sped|remix|reverb/i.test(filenameDecoded))) {
        const alt = metadata.files.find(f => {
          const n = f.name || '';
          // prefer files containing the baseTitle but not slowed/sped/reverb variants
          return n.includes(baseTitle) && !/slowed|sped|remix|reverb/i.test(n) && n.toLowerCase().endsWith('.mp3');
        });

        if (alt && (alt.artist || alt.creator)) {
          finalArtist = (alt.artist || alt.creator).replace(/\s*\(.*?\)\s*$/,'').trim();
          if (!finalArtist) finalArtist = 'Unknown Artist';
        }
      }

      track.artist = finalArtist;
      track.title = finalTitle;
      // Keep placeholder covers per request
      track.cover = getCoverUrl(itemId);

      console.log(`✅ Updated track ${i + 1}: "${track.title}" by "${track.artist}"`);
    }
    
    // Save updated playlist
    fs.writeFileSync(playlistPath, JSON.stringify(playlist, null, 4), 'utf-8');
    console.log(`\n✅ Playlist updated successfully! Saved to ${playlistPath}`);
    
  } catch (error) {
    console.error('Error updating playlist:', error.message);
    process.exit(1);
  }
}

updatePlaylistMetadata();
