# IGNIS Hero Kit - one-time setup.
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1 -RepoPath "E:\IGNIS"
param(
    [Parameter(Mandatory = $true)][string]$RepoPath,
    [switch]$Force
)

$ErrorActionPreference = "Continue"
$kit = Split-Path -Parent $PSScriptRoot

function Fail($msg) { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

if (-not (Test-Path $RepoPath)) { Fail "Path not found: $RepoPath" }
Set-Location $RepoPath

$inside = (git rev-parse --is-inside-work-tree 2>$null)
if ($inside -ne "true") { Fail "$RepoPath is not a git repository." }
$root = (git rev-parse --show-toplevel).Trim()
Set-Location $root
Write-Host "Repo: $root"

$dirty = git status --porcelain
if ($dirty -and -not $Force) {
    Write-Host "You have uncommitted changes:" -ForegroundColor Yellow
    $dirty | Select-Object -First 15 | ForEach-Object { Write-Host "  $_" }
    Fail "Commit or stash them first (or re-run with -Force; the baseline tag will then exclude them)."
}

# 1. Baseline tag at the current commit (before any kit file is added)
$tag = git tag -l hero-baseline
if (-not $tag) {
    git tag hero-baseline
    Write-Host "Created tag hero-baseline at $(git rev-parse --short HEAD)" -ForegroundColor Green
} else {
    Write-Host "Tag hero-baseline already exists at $(git rev-parse --short hero-baseline); keeping it." -ForegroundColor Yellow
}

# 2. Branch
$branch = "feature/hero-station"
$exists = git branch --list $branch
if ($exists) { git checkout $branch } else { git checkout -b $branch }
if ($LASTEXITCODE -ne 0) { Fail "Could not switch to branch $branch." }

# 3. Copy the kit into docs/hero_kit
$dest = Join-Path $root "docs\hero_kit"
$kitFull = (Resolve-Path $kit).Path
New-Item -ItemType Directory -Force -Path $dest | Out-Null
$destFull = (Resolve-Path $dest).Path
if ($kitFull -ne $destFull) {
    Copy-Item -Path (Join-Path $kit "*") -Destination $dest -Recurse -Force
    Write-Host "Kit copied to $dest" -ForegroundColor Green
} else {
    Write-Host "Kit already in place."
}
New-Item -ItemType Directory -Force -Path (Join-Path $dest "reports") | Out-Null
Set-Content -Path (Join-Path $dest "reports\.gitkeep") -Value "" -Encoding ASCII

# 4. Rules for AI agents (append, never overwrite)
$marker = "<!-- IGNIS-HERO-KIT -->"
$rules = Get-Content -Raw -Encoding UTF8 (Join-Path $dest "AGENTS.md")
$agents = Join-Path $root "AGENTS.md"
$existing = ""
if (Test-Path $agents) { $existing = Get-Content -Raw -Encoding UTF8 $agents }
if ($existing -notlike "*$marker*") {
    $block = "`r`n$marker`r`n$rules`r`n$marker`r`n"
    Add-Content -Path $agents -Value $block -Encoding UTF8
    Write-Host "Rules appended to AGENTS.md" -ForegroundColor Green
} else {
    Write-Host "AGENTS.md already contains the kit rules."
}

# 5. Same rules as an Antigravity workspace rule (extra safety; the pasted preamble is the main mechanism)
$ruleDir = Join-Path $root ".agent\rules"
New-Item -ItemType Directory -Force -Path $ruleDir | Out-Null
Set-Content -Path (Join-Path $ruleDir "ignis-hero-kit.md") -Value $rules -Encoding UTF8

# 6. Commit the kit
git add docs/hero_kit AGENTS.md .agent/rules/ignis-hero-kit.md
git commit -m "chore: add IGNIS hero kit" | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "Committed the kit on $branch." -ForegroundColor Green }
else { Write-Host "Nothing new to commit (or commit failed). Check 'git status'." -ForegroundColor Yellow }

Write-Host ""
Write-Host "DONE. Next:" -ForegroundColor Cyan
Write-Host "  cd `"$root`""
Write-Host "  .\docs\hero_kit\scripts\run_step.ps1 -Step 0"
Write-Host "Then paste the clipboard into a NEW Antigravity chat with this folder open."
