# Weavatrix MCP line-coverage gate.
# Measures every file under src/mcp (adapters, session, server, error, watcher).
# Excludes: main (stdio product entry), and the weavatrix-rust engine crate.
# Target: >= 95% lines.
$ErrorActionPreference = "Stop"
$toolchain = "1.89.0-x86_64-pc-windows-msvc"
$min = if ($env:WEAVATRIX_MCP_COV_MIN) { [int]$env:WEAVATRIX_MCP_COV_MIN } else { 95 }
& cargo "+$toolchain" llvm-cov `
  --ignore-filename-regex "weavatrix.rust|weavatrix_|main\.rs`$" `
  --fail-under-lines $min `
  --summary-only
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "MCP coverage OK (fail-under-lines=$min)"
