export const WINDOWS_MEMORY_MONITOR_SCRIPT = `
$ErrorActionPreference = 'SilentlyContinue'
$rootPidValue = [int]$env:WEAVATRIX_BENCHMARK_ROOT_PID
$intervalValue = [int]$env:WEAVATRIX_BENCHMARK_MEMORY_INTERVAL_MS
$peak = [int64]0
$samples = 0
$seen = New-Object 'System.Collections.Generic.HashSet[int]'
$seenIdentities = New-Object 'System.Collections.Generic.HashSet[string]'
$initialRows = @(Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId, CreationDate)
$rootRow = $initialRows | Where-Object { [int]$_.ProcessId -eq $rootPidValue } | Select-Object -First 1
$rootIdentity = if ($null -ne $rootRow) { "$rootPidValue|$($rootRow.CreationDate.ToUniversalTime().Ticks)" } else { $null }
do {
  $rows = @(Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId, CreationDate)
  $ids = New-Object 'System.Collections.Generic.HashSet[int]'
  [void]$ids.Add($rootPidValue)
  $changed = $true
  while ($changed) {
    $changed = $false
    foreach ($row in $rows) {
      if ($ids.Contains([int]$row.ParentProcessId) -and $ids.Add([int]$row.ProcessId)) { $changed = $true }
    }
  }
  $total = [int64]0
  foreach ($id in $ids) {
    $row = $rows | Where-Object { [int]$_.ProcessId -eq $id } | Select-Object -First 1
    if ($null -ne $row) {
      [void]$seen.Add($id)
      [void]$seenIdentities.Add("$id|$($row.CreationDate.ToUniversalTime().Ticks)")
      $process = Get-Process -Id $id
      if ($null -ne $process) { $total += [int64]$process.WorkingSet64 }
    }
  }
  if ($total -gt $peak) { $peak = $total }
  $samples += 1
  $rootAlive = $false
  if ($null -ne $rootIdentity) {
    foreach ($row in $rows) {
      if ("$([int]$row.ProcessId)|$($row.CreationDate.ToUniversalTime().Ticks)" -eq $rootIdentity) {
        $rootAlive = $true
        break
      }
    }
  }
  if ($rootAlive) { Start-Sleep -Milliseconds $intervalValue }
} while ($rootAlive)
$currentRows = @(Get-CimInstance Win32_Process | Select-Object ProcessId, CreationDate)
$liveIdentities = @(
  foreach ($row in $currentRows) {
    $identity = "$([int]$row.ProcessId)|$($row.CreationDate.ToUniversalTime().Ticks)"
    if ($seenIdentities.Contains($identity)) { $identity }
  }
)
@{
  availability = if ($peak -gt 0) { 'AVAILABLE' } else { 'UNAVAILABLE' }
  reason = if ($peak -gt 0) { $null } else { 'process exited before the Windows sampler captured a non-zero working set' }
  method = 'windows-cim-process-tree-working-set-sampling'
  sampleIntervalMs = $intervalValue
  samples = $samples
  peakProcessTreeRssBytes = if ($peak -gt 0) { $peak } else { $null }
  sampledPids = @($seen)
  sampledProcessIdentities = @($seenIdentities)
  liveSampledProcessIdentities = @($liveIdentities)
} | ConvertTo-Json -Compress
`
