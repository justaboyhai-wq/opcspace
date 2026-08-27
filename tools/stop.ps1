param([Parameter(Mandatory = $true)][string[]]$PidFiles)

foreach ($pidFileArgument in $PidFiles) {
  foreach ($pidFile in $pidFileArgument.Split(",", [StringSplitOptions]::RemoveEmptyEntries)) {
    $normalizedPidFile = $pidFile.Trim().Trim('"')
    if (-not (Test-Path -LiteralPath $normalizedPidFile)) { continue }
    $serverPid = [IO.File]::ReadAllText($normalizedPidFile).Trim()
    if ($serverPid -match "^\d+$") {
      Stop-Process -Id ([int]$serverPid) -Force -ErrorAction SilentlyContinue
    }
    Remove-Item -LiteralPath $normalizedPidFile -Force -ErrorAction SilentlyContinue
  }
}
