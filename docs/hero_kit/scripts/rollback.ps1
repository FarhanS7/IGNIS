# Returns the branch to an earlier checkpoint. Saves a backup branch of where you were.
# Usage: .\docs\hero_kit\scripts\rollback.ps1 -Step 2        (returns to tag hero-step-2)
#        .\docs\hero_kit\scripts\rollback.ps1 -Step baseline (returns to tag hero-baseline)
param(
    [Parameter(Mandatory = $true)][string]$Step
)

$ErrorActionPreference = "Continue"
$root = (git rev-parse --show-toplevel 2>$null)
if (-not $root) { Write-Host "Run this inside the IGNIS repo." -ForegroundColor Red; exit 1 }
$root = $root.Trim()
Set-Location $root

$tag = "hero-step-$Step"
if ($Step -eq "baseline" -or $Step -eq "0") { $tag = "hero-baseline" }

if (-not (git tag -l $tag)) {
    Write-Host "Tag $tag not found. Available checkpoints:" -ForegroundColor Red
    git tag -l "hero-*"
    exit 1
}

Write-Host "This will reset the current branch to $tag ($(git rev-parse --short $tag))." -ForegroundColor Yellow
Write-Host "Everything after that point stays available on a backup branch."
$answer = Read-Host "Type YES to continue"
if ($answer -ne "YES") { Write-Host "Cancelled."; exit 0 }

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = "backup/before-rollback-$stamp"

# Save uncommitted work too
$dirty = git status --porcelain
if ($dirty) {
    git add -A
    git commit -m "backup: uncommitted work before rollback to $tag" | Out-Null
}
git branch $backup
Write-Host "Backup branch created: $backup" -ForegroundColor Green

git reset --hard $tag
if ($LASTEXITCODE -eq 0) {
    Write-Host "Now at $tag. To get the old work back: git checkout $backup" -ForegroundColor Green
} else {
    Write-Host "Reset failed. Your work is safe on $backup." -ForegroundColor Red
    exit 1
}
