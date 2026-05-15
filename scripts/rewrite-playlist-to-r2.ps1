param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl,

  [string]$InputPath = ".\playlist.json",

  [string]$OutputPath = ".\playlist.r2.json",

  [switch]$InPlace
)

$ErrorActionPreference = "Stop"

function Normalize-R2BaseUrl {
  param([string]$Value)

  $trimmed = $Value.Trim().TrimEnd("/")
  if (-not $trimmed) {
    throw "BaseUrl cannot be empty."
  }
  return $trimmed
}

function Convert-ToR2Path {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $null
  }

  $raw = $Value.Trim()

  if ($raw.StartsWith("data:", [System.StringComparison]::OrdinalIgnoreCase)) {
    return $raw
  }

  if ($raw -match '^https?://') {
    try {
      $uri = [uri]$raw
      $raw = $uri.AbsolutePath.TrimStart("/")
    } catch {
      $raw = $raw.TrimStart("/")
    }
  } else {
    $raw = $raw.TrimStart("/")
  }

  $segments = $raw -split '/' | Where-Object { $_ -ne '' }
  if (-not $segments.Count) {
    return $null
  }

  return ($segments | ForEach-Object {
    [uri]::EscapeDataString([uri]::UnescapeDataString($_))
  }) -join '/'
}

function Convert-TrackUrl {
  param(
    [string]$Value,
    [string]$Base
  )

  $path = Convert-ToR2Path $Value
  if (-not $path) {
    return $Value
  }

  if ($path.StartsWith('http://', [System.StringComparison]::OrdinalIgnoreCase) -or $path.StartsWith('https://', [System.StringComparison]::OrdinalIgnoreCase)) {
    return $path
  }

  return "$Base/$path"
}

if (-not (Test-Path $InputPath)) {
  throw "Input file not found: $InputPath"
}

$base = Normalize-R2BaseUrl $BaseUrl
$content = Get-Content $InputPath -Raw | ConvertFrom-Json -Depth 50

function Rewrite-Item {
  param([object]$Item)

  if ($null -eq $Item) {
    return $null
  }

  if ($Item -isnot [psobject]) {
    return $Item
  }

  $copy = [ordered]@{}
  foreach ($property in $Item.PSObject.Properties) {
    $copy[$property.Name] = $property.Value
  }

  if ($copy.Contains('src')) {
    $copy['src'] = Convert-TrackUrl -Value ([string]$copy['src']) -Base $base
  }

  if ($copy.Contains('cover')) {
    $copy['cover'] = Convert-TrackUrl -Value ([string]$copy['cover']) -Base $base
  }

  return [pscustomobject]$copy
}

$rewritten = if ($content -is [System.Collections.IEnumerable] -and $content -isnot [string]) {
  @($content | ForEach-Object { Rewrite-Item $_ })
} elseif ($content.PSObject.Properties.Name -contains 'tracks' -and $content.tracks) {
  $tracks = @($content.tracks | ForEach-Object { Rewrite-Item $_ })
  $content.tracks = $tracks
  $content
} else {
  Rewrite-Item $content
}

$targetPath = if ($InPlace) { $InputPath } else { $OutputPath }
$rewritten | ConvertTo-Json -Depth 50 | Set-Content -Path $targetPath -Encoding utf8

Write-Host "Wrote rewritten playlist to $targetPath"