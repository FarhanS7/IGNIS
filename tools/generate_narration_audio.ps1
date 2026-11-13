Add-Type -AssemblyName System.Speech

$voice = "Microsoft Zira Desktop"
$rate = 0 # Normal speaking speed

$segments = @{
    "stage1_incident.wav"   = "Emergency condition initiated. An abnormal thermal anomaly has been detected inside the compartment."
    "stage2_detection.wav"  = "In microgravity, smoke forms an unbuoyant spherical cloud. Particulate and gas sensors verify an active fire condition."
    "stage3_alarm.wav"      = "Fire alarm activated. The emergency containment sequence is now latched across the module."
    "stage4_response.wav"   = "Containment active. Electrical power is isolated, ventilation dampers seal the compartment, and suppression discharges."
    "stage5_outcome.wav"    = "The fire is extinguished. Sensors confirm rapid thermal decay and containment integrity. Spacecraft is safe."
}

$outDir = "apps/web/public/audio/narration"
if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

foreach ($item in $segments.GetEnumerator()) {
    $filePath = Join-Path $outDir $item.Key
    Write-Host "Synthesizing $($item.Key)..."
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    try {
        $synth.SelectVoice($voice)
    } catch {
        Write-Warning "Voice $voice not found, using default voice."
    }
    $synth.Rate = $rate
    $synth.SetOutputToWaveFile($filePath)
    $synth.Speak($item.Value)
    $synth.Dispose()
    Write-Host "Wrote $filePath ($((Get-Item $filePath).Length) bytes)"
}

