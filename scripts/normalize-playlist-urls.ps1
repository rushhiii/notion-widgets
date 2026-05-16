param(
  [string]$InputPath = ".\public\audio\playlist.json",
  [string]$OutputPath = ".\public\audio\playlist.json"
)

$ErrorActionPreference = "Stop"

# Mapping of archive.org collection IDs to their IA mirror servers
# Format: "collection-id" = "mirror-server-url"
$MirrorMap = @{
  "ashwin-pathak-sunderkand-hd" = "https://ia601904.us.archive.org/35/items/ashwin-pathak-sunderkand-hd"
}

function Convert-ArchiveOrgUrl {
  param([string]$Url)

  if (-not $Url) { return $Url }

  # Extract collection ID and path from download URL
  # Format: https://archive.org/download/COLLECTION_ID/path
  if ($Url -match '^https?://archive\.org/download/([^/]+)/(.*)$') {
    $collectionId = $Matches[1]
    $path = $Matches[2]
    
    # Check if we have a mirror mapping for this collection
    if ($MirrorMap.ContainsKey($collectionId)) {
      $mirrorBase = $MirrorMap[$collectionId]
      return "$mirrorBase/$path"
    }
    
    # Fallback: if no explicit mapping, try to auto-detect the mirror
    # Most collections follow pattern: https://ia<digits>.us.archive.org/<digits>/items/COLLECTION_ID
    # For now, return as-is if no mapping found
    return $Url
  }

  # If already in IA mirror format, keep as-is
  if ($Url -match '^https?://ia\d+\.us\.archive\.org/') {
    return $Url
  }

  # Unknown format, return as-is
  return $Url
}

if (-not (Test-Path $InputPath)) {
  Write-Error "Input file not found: $InputPath"
  exit 1
}

Write-Host "Reading playlist from: $InputPath"
$content = Get-Content $InputPath -Raw | ConvertFrom-Json

function Process-Item {
  param([object]$Item)

  if ($null -eq $Item) { return $null }
  if ($Item -isnot [psobject]) { return $Item }

  $copy = [ordered]@{}
  foreach ($property in $Item.PSObject.Properties) {
    if ($property.Name -eq 'src') {
      $copy['src'] = Convert-ArchiveOrgUrl -Url ([string]$property.Value)
      Write-Host "Converted: $($property.Value) -> $($copy['src'])"
    } else {
      $copy[$property.Name] = $property.Value
    }
  }

  return [pscustomobject]$copy
}

$processed = if ($content -is [System.Collections.IEnumerable] -and $content -isnot [string]) {
  @($content | ForEach-Object { Process-Item $_ })
} elseif ($content.PSObject.Properties.Name -contains 'tracks' -and $content.tracks) {
  $tracks = @($content.tracks | ForEach-Object { Process-Item $_ })
  $content.tracks = $tracks
  $content
} else {
  Process-Item $content
}

$processed | ConvertTo-Json | Set-Content -Path $OutputPath -Encoding utf8

Write-Host "Playlist normalized and saved to: $OutputPath"
