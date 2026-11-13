# Commits and tags a finished step.
# Usage: .\docs\hero_kit\scripts\checkpoint.ps1 -Step 1 -Message "timeline engine and page shell"
param(
    [Parameter(Mandatory = $true)][string]$Step,
    [string]$Message = "",
    [switch]$Force
)

$ErrorActionPreference = "Continue"
$root = (git rev-parse --show-toplevel 2>$null)
if (-not $root) { Write-Host "Run this inside the IGNIS repo." -ForegroundColor Red; exit 1 }
$root = $root.Trim()
Set-Location $root

$report = Join-Path $root "docs\hero_kit\reports\step${Step}_verify.txt"
$ok = $false
if (Test-Path $report) {
    $ok = (Select-String -Path $report -Pattern '^Overall: PASS' -Quiet)
}
if (-not $ok -and -not $Force) {
    Write-Host "No passing verify report for step $Step." -ForegroundColor Red
    Write-Host "Run: .\docs\hero_kit\scripts\verify.ps1 -Step $Step   (or use -Force to checkpoint anyway)"
    exit 1
}

$tag = "hero-step-$Step"
$msg = "hero step ${Step}: $Message"

git add -A
git commit -m $msg | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing to commit (or commit failed). Tagging the current commit anyway." -ForegroundColor Yellow
}
git tag -f $tag | Out-Null
$sha = (git rev-parse --short HEAD)
Add-Content -Path (Join-Path $root "docs\hero_kit\reports\checkpoints.log") -Value ("{0}  {1}  {2}  {3}" -f (Get-Date -Format "yyyy-MM-dd HH:mm"), $tag, $sha, $Message)

Write-Host "Checkpoint saved: $tag at $sha" -ForegroundColor Green
Write-Host "Now tick the step in docs\hero_kit\PROGRESS.md, then send me the step report."
Write-Host "Tip: push the branch so a copy exists online:  git push -u origin feature/hero-station"
