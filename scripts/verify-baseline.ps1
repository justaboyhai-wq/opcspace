param(
  [switch]$RequireToolchain
)

$ErrorActionPreference = "Stop"
$workspaceRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")).Path
$baselinePath = Join-Path $workspaceRoot "workspace-baseline.json"
$baseline = Get-Content -LiteralPath $baselinePath -Raw -Encoding UTF8 | ConvertFrom-Json
$failures = [Collections.Generic.List[string]]::new()
$warnings = [Collections.Generic.List[string]]::new()

function Get-CommandPath {
  param([Parameter(Mandatory = $true)][string]$Name)
  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($null -eq $command) { return $null }
  return $command.Source
}

Write-Output "OPCSpace baseline verification"
Write-Output "Workspace: $workspaceRoot"
Write-Output "Product version: $($baseline.product.version)"

foreach ($approvedDirectory in $baseline.layout.approvedDirectories) {
  $approvedPath = [IO.Path]::GetFullPath((Join-Path $workspaceRoot $approvedDirectory))
  if (-not $approvedPath.StartsWith($workspaceRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    $failures.Add("Approved directory escapes workspace: $approvedDirectory")
    continue
  }
  if (-not (Test-Path -LiteralPath $approvedPath -PathType Container)) {
    $failures.Add("Missing approved directory: $approvedDirectory")
    continue
  }
  Write-Output "OK directory=$approvedDirectory"
}

foreach ($legacyDirectory in $baseline.layout.legacyRootDirectories) {
  $legacyPath = Join-Path $workspaceRoot $legacyDirectory
  if (Test-Path -LiteralPath $legacyPath) {
    $failures.Add("Legacy root directory still exists: $legacyDirectory")
  }
}

if ($baseline.architecture.backendStyle -ne "modular-monolith") {
  $failures.Add("Architecture must use modular-monolith for the initial release")
}
if ($baseline.architecture.ruoyiCloudAdopted -ne $false) {
  $failures.Add("RuoYi-Cloud must not be adopted for the initial release")
}

$expectedApiPrefixes = @{
  admin = "/api/admin/v1"
  app = "/api/app/v1"
  callback = "/api/callback/v1/{provider}"
}
foreach ($apiName in $expectedApiPrefixes.Keys) {
  $actualPrefix = $baseline.architecture.apiPrefixes.$apiName
  if ($actualPrefix -ne $expectedApiPrefixes[$apiName]) {
    $failures.Add("API prefix mismatch for $apiName`: expected $($expectedApiPrefixes[$apiName]), actual $actualPrefix")
  }
}

$expectedBackendModules = @("opc-foundation", "opc-service", "opc-content", "opc-governance")
$actualBackendModules = @($baseline.architecture.backendModules)
$moduleDifference = @(Compare-Object -ReferenceObject $expectedBackendModules -DifferenceObject $actualBackendModules)
if ($moduleDifference.Count -gt 0) {
  $failures.Add("Backend module manifest must contain exactly: $($expectedBackendModules -join ', ')")
}

$adminAudience = $baseline.architecture.identityDomains.admin.audience
$appAudience = $baseline.architecture.identityDomains.app.audience
if ([string]::IsNullOrWhiteSpace($adminAudience) -or [string]::IsNullOrWhiteSpace($appAudience) -or $adminAudience -eq $appAudience) {
  $failures.Add("Admin and app identity domains must use distinct non-empty audiences")
}
else {
  Write-Output "OK architecture=modular-monolith api=admin,app,callback identityDomains=separate"
}

foreach ($component in $baseline.components) {
  $componentPath = [IO.Path]::GetFullPath((Join-Path $workspaceRoot $component.path))
  if (-not $componentPath.StartsWith($workspaceRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
    $failures.Add("Component path escapes workspace: $($component.path)")
    continue
  }
  if (-not (Test-Path -LiteralPath $componentPath -PathType Container)) {
    $failures.Add("Missing component directory: $($component.path)")
    continue
  }

  if ($component.sourceMode -ne "vendored-source") {
    $failures.Add("Component sourceMode must be vendored-source: $($component.path)")
  }
  if ($null -eq $component.upstreamSnapshot -or [string]::IsNullOrWhiteSpace($component.upstreamSnapshot.commit) -or [string]::IsNullOrWhiteSpace($component.upstreamSnapshot.license)) {
    $failures.Add("Component must retain source snapshot and license record: $($component.path)")
  }
  $nestedGit = Join-Path $componentPath ".git"
  if (Test-Path -LiteralPath $nestedGit) {
    $failures.Add("Nested Git metadata is not allowed in native component: $($component.path)")
  }
  $licensePath = Join-Path $componentPath "LICENSE"
  if (-not (Test-Path -LiteralPath $licensePath -PathType Leaf)) {
    $failures.Add("Missing imported-source license: $($component.path)/LICENSE")
  }

  Write-Output "OK component=$($component.name) sourceMode=vendored-source"
}

$gitmodulesPath = Join-Path $workspaceRoot ".gitmodules"
if (Test-Path -LiteralPath $gitmodulesPath -PathType Leaf) {
  $failures.Add(".gitmodules must not exist in the native project baseline")
}

$gitlinkEntries = @(& git -C $workspaceRoot ls-files -s | Select-String -Pattern '^160000\s')
if ($LASTEXITCODE -ne 0) {
  $failures.Add("Git index inspection failed")
}
elseif ($gitlinkEntries.Count -gt 0) {
  $failures.Add("Gitlinks are not allowed in the native project baseline: $($gitlinkEntries -join '; ')")
}
else {
  Write-Output "OK git-index=no-gitlinks"
}

$toolNames = @("git", "node", "npm", "java", "mvn")
foreach ($toolName in $toolNames) {
  $toolPath = Get-CommandPath -Name $toolName
  if ($toolPath) {
    Write-Output "TOOL $toolName=$toolPath"
  }
  elseif ($RequireToolchain -and $toolName -in @("java", "mvn")) {
    $failures.Add("Required tool not found: $toolName")
  }
  else {
    $warnings.Add("Tool not found: $toolName")
  }
}

foreach ($warning in $warnings) {
  Write-Warning $warning
}

if ($failures.Count -gt 0) {
  foreach ($failure in $failures) {
    Write-Error $failure
  }
  exit 1
}

Write-Output "BASELINE_OK"
