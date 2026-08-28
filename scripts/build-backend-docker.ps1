param(
  [string[]]$MavenArguments = @("--no-transfer-progress", "-DskipTests", "package")
)

$ErrorActionPreference = "Stop"
$workspaceRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$backendPath = (Resolve-Path -LiteralPath (Join-Path $workspaceRoot "services\backend")).Path
$docker = Get-Command docker -ErrorAction SilentlyContinue

if ($null -eq $docker) {
  throw "Docker is required because this workspace does not bundle JDK or Maven."
}

$mount = "type=bind,source=$backendPath,target=/workspace"
$image = "maven:3.9.11-eclipse-temurin-17"

Write-Output "Building OPCSpace backend baseline"
Write-Output "Image: $image"
Write-Output "Source: $backendPath"
Write-Output "Maven arguments: $($MavenArguments -join ' ')"

& docker run --rm --mount $mount --workdir /workspace $image mvn @MavenArguments
if ($LASTEXITCODE -ne 0) {
  throw "Backend build failed with exit code $LASTEXITCODE"
}

$artifactPath = Join-Path $backendPath "ruoyi-admin\target\ruoyi-admin.jar"
if (-not (Test-Path -LiteralPath $artifactPath -PathType Leaf)) {
  throw "Build reported success but artifact was not found: $artifactPath"
}

$artifact = Get-Item -LiteralPath $artifactPath
Write-Output "BACKEND_BUILD_OK artifact=$($artifact.FullName) bytes=$($artifact.Length)"
