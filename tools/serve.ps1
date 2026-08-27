param(
  [Parameter(Mandatory = $true)][string]$Root,
  [Parameter(Mandatory = $true)][int]$Port,
  [Parameter(Mandatory = $true)][string]$PidFile
)

$siteRoot = (Resolve-Path -LiteralPath $Root).Path
$pidDirectory = Split-Path -Parent $PidFile
if (-not (Test-Path -LiteralPath $pidDirectory)) {
  New-Item -ItemType Directory -Path $pidDirectory | Out-Null
}
[IO.File]::WriteAllText($PidFile, [string]$PID)

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg" = "image/svg+xml"
  ".ico" = "image/x-icon"
  ".woff" = "font/woff"
  ".woff2" = "font/woff2"
  ".webp" = "image/webp"
}

try {
  $listener.Start()
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    try {
      $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))
      if ([string]::IsNullOrWhiteSpace($requestPath)) { $requestPath = "index.html" }

      $relativePath = $requestPath.Replace("/", [IO.Path]::DirectorySeparatorChar)
      $candidatePath = [IO.Path]::GetFullPath((Join-Path $siteRoot $relativePath))
      if (-not $candidatePath.StartsWith($siteRoot, [StringComparison]::OrdinalIgnoreCase)) {
        $context.Response.StatusCode = 403
        $context.Response.Close()
        continue
      }

      if (Test-Path -LiteralPath $candidatePath -PathType Container) {
        $candidatePath = Join-Path $candidatePath "index.html"
      }
      if (-not (Test-Path -LiteralPath $candidatePath -PathType Leaf)) {
        $candidatePath = Join-Path $siteRoot "index.html"
      }

      $extension = [IO.Path]::GetExtension($candidatePath).ToLowerInvariant()
      $context.Response.ContentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { "application/octet-stream" }
      $context.Response.Headers["Cache-Control"] = "no-store"
      $bytes = [IO.File]::ReadAllBytes($candidatePath)
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.OutputStream.Close()
    }
    catch {
      $context.Response.StatusCode = 500
      $context.Response.Close()
    }
  }
}
finally {
  if ($listener.IsListening) { $listener.Stop() }
  $listener.Close()
  if (Test-Path -LiteralPath $PidFile) { Remove-Item -LiteralPath $PidFile -Force }
}

