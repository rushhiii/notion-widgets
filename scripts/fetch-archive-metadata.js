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
      const parsed = parseFilename(filename);
      
      // Update artist and title from filename parsing
      track.artist = parsed.artist;
      track.title = parsed.title;
      
      // Update cover to use Archive.org thumbnail if available
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
