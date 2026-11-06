# Verifies a finished step. Writes docs\hero_kit\reports\step<N>_verify.txt
# Usage: .\docs\hero_kit\scripts\verify.ps1 -Step 1 [-E2E] [-Python] [-AllowProtected] [-SkipBuild]
param(
    [string]$Step = "x",
    [switch]$E2E,
    [switch]$Python,
    [switch]$AllowProtected,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Continue"

$root = (git rev-parse --show-toplevel 2>$null)
if (-not $root) { Write-Host "Run this inside the IGNIS repo." -ForegroundColor Red; exit 1 }
$root = $root.Trim()
Set-Location $root

$reportDir = Join-Path $root "docs\hero_kit\reports"
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
$reportFile = Join-Path $reportDir "step${Step}_verify.txt"

$results = New-Object System.Collections.ArrayList
$failed = $false

function Add-Result($name, $status, $detail) {
    [void]$script:results.Add([pscustomobject]@{ Name = $name; Status = $status; Detail = $detail })
    $color = "Green"
    if ($status -eq "FAIL") { $color = "Red"; $script:failed = $true }
    if ($status -eq "WARN" -or $status -eq "SKIP") { $color = "Yellow" }
    Write-Host ("[{0}] {1} {2}" -f $status, $name, $detail) -ForegroundColor $color
}

# ---- Editable lists ----------------------------------------------------
$protectedPatterns = @(
    '(^|/)lib/fire/(sim|detectors|localizer|responseSequencer|sim_params)\.ts$',
    '(^|/)lib/fire/ml/',
    '(^|/)real_solid_matcher\.ts$',
    '(^|/)src/data/models/',
    '^data/',
    '^pipelines/',
    '^services/'
)
# Words built from pieces so this script is not itself flagged by text searches.
$banned = @(
    ('cert' + 'ified'),
    ('guaran' + 'teed'),
    ('predicts fire' + ' risk'),
    ('flight-' + 'certified')
)
$pythonDirs = @("pipelines", "services/api")
# -------------------------------------------------------------------------

# Last checkpoint to compare against
$lastTag = (git tag -l "hero-step-*" --sort=-creatordate 2>$null | Select-Object -First 1)
if (-not $lastTag) { $lastTag = "hero-baseline" }
$baseTagExists = (git tag -l hero-baseline)
if (-not $baseTagExists) {
    Add-Result "baseline tag" "FAIL" "tag hero-baseline not found. Run install.ps1 first."
}

# 1. Protected files vs baseline
if ($baseTagExists) {
    $changed = git diff --name-only hero-baseline
    $changedUntracked = git ls-files --others --exclude-standard
    $all = @($changed) + @($changedUntracked) | Where-Object { $_ }
    $hits = @()
    foreach ($f in $all) {
        $norm = $f -replace '\\', '/'
        foreach ($p in $protectedPatterns) {
            if ($norm -match $p) { $hits += $norm; break }
        }
    }
    if ($hits.Count -eq 0) {
        Add-Result "protected files untouched" "PASS" "(vs hero-baseline)"
    } elseif ($AllowProtected) {
        Add-Result "protected files untouched" "WARN" ("changed but allowed: " + ($hits -join ", "))
    } else {
        Add-Result "protected files untouched" "FAIL" ("changed: " + ($hits -join ", "))
    }
}

# 2. Banned terms and non-determinism in ADDED lines of source (not tests, not kit docs)
if ($baseTagExists) {
    $diff = git diff hero-baseline -U0 -- "apps/web/src" ":(exclude)*.test.ts" ":(exclude)*.test.tsx" ":(exclude)*copy_lint*"
    $added = @($diff | Where-Object { $_ -match '^\+' -and $_ -notmatch '^\+\+\+' })
    # Untracked (new) source files are not in git diff, so read them directly.
    $newFiles = @(git ls-files --others --exclude-standard -- "apps/web/src") | Where-Object {
        $_ -and $_ -notmatch '\.test\.tsx?$' -and $_ -notmatch 'copy_lint' -and $_ -match '\.(ts|tsx|js|jsx|css)$'
    }
    foreach ($nf in $newFiles) {
        $added += @(Get-Content -Path (Join-Path $root $nf) -ErrorAction SilentlyContinue | ForEach-Object { "+" + $_ })
    }
    $bannedHits = @()
    foreach ($line in $added) {
        foreach ($w in $banned) {
            if ($line -match [regex]::Escape($w)) { $bannedHits += $line.Trim() }
        }
    }
    if ($bannedHits.Count -eq 0) {
        Add-Result "banned claim terms in new code" "PASS" ""
    } else {
        Add-Result "banned claim terms in new code" "FAIL" (($bannedHits | Select-Object -First 5) -join " | ")
    }
    $rand = @($added | Where-Object { $_ -match 'Math\.random\(|Date\.now\(|new Date\(\)' })
    if ($rand.Count -eq 0) {
        Add-Result "non-determinism (Math.random / Date.now)" "PASS" ""
    } else {
        Add-Result "non-determinism (Math.random / Date.now)" "WARN" ("review these added lines: " + (($rand | Select-Object -First 5 | ForEach-Object { $_.Trim() }) -join " | "))
    }
}

# 3. npm scripts: use the root package.json if it has the script, else apps/web
function Get-NpmArgs($script) {
    $pkg = Join-Path $root "package.json"
    if (Test-Path $pkg) {
        try {
            $j = Get-Content -Raw $pkg | ConvertFrom-Json
            if ($j.scripts -and $j.scripts.PSObject.Properties.Name -contains $script) { return @("run", $script) }
        } catch { }
    }
    return @("run", $script, "--prefix", "apps/web")
}

function Run-Npm($label, $script, $extra) {
    $npmArgs = Get-NpmArgs $script
    Write-Host ">> npm $($npmArgs -join ' ') ..." -ForegroundColor Cyan
    $out = & npm @npmArgs 2>&1 | Out-String
    $code = $LASTEXITCODE
    $pass = ""
    $fail = ""
    if ($out -match '(?m)pass\s+(\d+)') { $pass = $Matches[1] }
    if ($out -match '(?m)fail\s+(\d+)') { $fail = $Matches[1] }
    $summary = ""
    if ($pass -ne "") { $summary = "pass=$pass fail=$fail" }
    if ($label -eq "e2e" -and $out -match '(\d+)\s+passed') { $summary = "passed=$($Matches[1])" }
    if ($code -eq 0) {
        Add-Result $label "PASS" $summary
    } else {
        Add-Result $label "FAIL" ("exit code $code. Last lines: " + (($out -split "`n" | Select-Object -Last 12) -join " / "))
        $logFile = Join-Path $reportDir "step${Step}_${label}_output.txt"
        Set-Content -Path $logFile -Value $out -Encoding UTF8
        Write-Host "Full output saved to $logFile" -ForegroundColor Yellow
    }
}

Run-Npm "unit tests" "test" ""
if (-not $SkipBuild) { Run-Npm "build" "build" "" } else { Add-Result "build" "SKIP" "(-SkipBuild)" }

if ($E2E) { Run-Npm "e2e" "test:e2e" "" } else { Add-Result "e2e" "SKIP" "(add -E2E to run)" }

if ($Python) {
    $py = Get-Command python -ErrorAction SilentlyContinue
    if (-not $py) {
        Add-Result "python tests" "WARN" "python not found"
    } else {
        foreach ($d in $pythonDirs) {
            if (Test-Path (Join-Path $root $d)) {
                Push-Location (Join-Path $root $d)
                $o = & python -m pytest -q 2>&1 | Out-String
                $c = $LASTEXITCODE
                Pop-Location
                $tail = ($o -split "`n" | Where-Object { $_.Trim() } | Select-Object -Last 1)
                if ($c -eq 0) { Add-Result "python: $d" "PASS" $tail } else { Add-Result "python: $d" "FAIL" $tail }
            } else {
                Add-Result "python: $d" "SKIP" "folder not found (edit pythonDirs in verify.ps1)"
            }
        }
    }
} else {
    Add-Result "python tests" "SKIP" "(add -Python to run)"
}

# 4. Files changed since the last checkpoint
$changedSince = @(git diff --name-only $lastTag) + @(git ls-files --others --exclude-standard) | Where-Object { $_ } | Sort-Object -Unique
Add-Result "files changed since $lastTag" "INFO" ("$($changedSince.Count) files")

# Report
$overall = "PASS"
if ($failed) { $overall = "FAIL" }
$lines = @()
$lines += "Step: $Step"
$lines += "Compared with: $lastTag"
$lines += "Overall: $overall"
$lines += ""
foreach ($r in $results) { $lines += ("[{0}] {1} {2}" -f $r.Status, $r.Name, $r.Detail) }
$lines += ""
$lines += "Changed files:"
$lines += ($changedSince | ForEach-Object { "  $_" })
Set-Content -Path $reportFile -Value $lines -Encoding UTF8

Write-Host ""
if ($failed) {
    Write-Host "OVERALL: FAIL. Report: $reportFile" -ForegroundColor Red
    Write-Host "Next: .\docs\hero_kit\scripts\run_step.ps1 -Prompt fix_failures   (then paste the failing output under it)"
    exit 1
} else {
    Write-Host "OVERALL: PASS. Report: $reportFile" -ForegroundColor Green
    Write-Host "Now do the eye-check in CHECKLISTS.md, then run checkpoint.ps1."
    exit 0
}
