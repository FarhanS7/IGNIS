# Copies a prompt to the clipboard.
# Steps:    .\docs\hero_kit\scripts\run_step.ps1 -Step 0        (0, 0b, 1..6, 99)
# Others:   .\docs\hero_kit\scripts\run_step.ps1 -Prompt fix_failures
#           (fix_failures, audit_review, fix_about_metrics, fix_abstention_threshold,
#            verify_context_citations, check_llm_endpoint)
# Options:  -Note "text"   appended as OWNER INPUT (use it for step 0b)
#           -Print         write the prompt to reports\last_prompt.md instead of the clipboard
param(
    [string]$Step = "",
    [string]$Prompt = "",
    [string]$Note = "",
    [switch]$Print
)

$ErrorActionPreference = "Stop"
$kit = Split-Path -Parent $PSScriptRoot
$promptsDir = Join-Path $kit "prompts"

$map = @{
    "0"  = "step0_recon"
    "0b" = "step0b_lock_decision"
    "1"  = "step1_timeline_shell"
    "2"  = "step2_station_3d"
    "3"  = "step3_localize_alarm"
    "4"  = "step4_containment_gate"
    "5"  = "step5_earth_vs_orbit"
    "6"  = "step6_capture_polish"
    "99" = "99_finalize"
}

$name = ""
if ($Step -ne "") {
    if (-not $map.ContainsKey($Step)) {
        Write-Host "Unknown step '$Step'. Valid: $($map.Keys -join ', ')" -ForegroundColor Red
        exit 1
    }
    $name = $map[$Step]
} elseif ($Prompt -ne "") {
    $name = $Prompt
} else {
    Write-Host "Give -Step <0|0b|1..6|99> or -Prompt <name>." -ForegroundColor Red
    exit 1
}

$file = Join-Path $promptsDir "$name.md"
$optional = $false
if (-not (Test-Path $file)) {
    $file = Join-Path $promptsDir "optional\$name.md"
    $optional = $true
}
if (-not (Test-Path $file)) {
    Write-Host "Prompt not found: $name" -ForegroundColor Red
    exit 1
}

$body = Get-Content -Raw -Encoding UTF8 $file
$text = ""

if (-not $optional) {
    $pre = Get-Content -Raw -Encoding UTF8 (Join-Path $promptsDir "00_preamble.md")
    $text = $pre + "`r`n`r`n"
}

$text += $body

# Lock the decision into every build step
$decision = Join-Path $kit "DECISION.md"
$needsDecision = @("step1_timeline_shell", "step2_station_3d", "step3_localize_alarm",
                   "step4_containment_gate", "step5_earth_vs_orbit", "step6_capture_polish")
if (($needsDecision -contains $name) -and (Test-Path $decision)) {
    $text += "`r`n`r`nLOCKED DECISION (docs/hero_kit/DECISION.md):`r`n"
    $text += (Get-Content -Raw -Encoding UTF8 $decision)
} elseif ($needsDecision -contains $name) {
    Write-Host "WARNING: docs/hero_kit/DECISION.md not found. Do Step 0 and 0b first." -ForegroundColor Yellow
}

if ($Note -ne "") {
    $text += "`r`n`r`nOWNER INPUT:`r`n$Note`r`n"
}

if ($Print) {
    $reports = Join-Path $kit "reports"
    New-Item -ItemType Directory -Force -Path $reports | Out-Null
    $out = Join-Path $reports "last_prompt.md"
    Set-Content -Path $out -Value $text -Encoding UTF8
    Write-Host "Prompt written to: $out" -ForegroundColor Green
    Write-Host "In the chat, send: Follow the instructions in docs/hero_kit/reports/last_prompt.md"
} else {
    Set-Clipboard -Value $text
    Write-Host "Copied to clipboard: $name ($($text.Length) characters)" -ForegroundColor Green
    Write-Host "Paste it into a NEW Antigravity chat with the repo open." -ForegroundColor Cyan
}
