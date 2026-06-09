<#
.SYNOPSIS
    Collects keyboard / HID / power / thermal / event-log info to help diagnose
    a laptop keyboard that intermittently cuts out.

.USAGE
    1. Right-click PowerShell -> "Run as Administrator"
    2. cd to this folder
    3. If scripts are blocked, run once:
         Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    4. Run:
         .\keyboard-diagnostic.ps1
    5. Share the generated keyboard-diagnostic-report.txt
#>

$ErrorActionPreference = 'SilentlyContinue'
$out = Join-Path $PSScriptRoot 'keyboard-diagnostic-report.txt'
"Keyboard Diagnostic Report - $(Get-Date)" | Out-File $out
"=================================================" | Out-File $out -Append

function Section($title) {
    "" | Out-File $out -Append
    "### $title ###" | Out-File $out -Append
    "-------------------------------------------------" | Out-File $out -Append
}

Section "System Info"
Get-CimInstance Win32_ComputerSystem  | Select Manufacturer,Model,SystemFamily | Format-List | Out-File $out -Append
Get-CimInstance Win32_BIOS            | Select Manufacturer,SMBIOSBIOSVersion,ReleaseDate | Format-List | Out-File $out -Append
Get-CimInstance Win32_OperatingSystem | Select Caption,Version,BuildNumber,OSArchitecture,LastBootUpTime | Format-List | Out-File $out -Append

Section "Keyboard Devices (PnP)"
Get-PnpDevice -Class Keyboard | Select Status,FriendlyName,InstanceId,Problem,ProblemDescription | Format-List | Out-File $out -Append

Section "HID Devices"
Get-PnpDevice -Class HIDClass | Select Status,FriendlyName,InstanceId,Problem | Format-Table -AutoSize | Out-File $out -Append -Width 300

Section "Keyboard Drivers"
Get-CimInstance Win32_PnPSignedDriver |
    Where-Object { $_.DeviceClass -eq 'KEYBOARD' } |
    Select DeviceName,DriverVersion,DriverDate,Manufacturer,InfName |
    Format-List | Out-File $out -Append

Section "USB Power Management (Allow turn off to save power)"
try {
    $usb = Get-CimInstance -Namespace root\wmi -ClassName MSPower_DeviceEnable
    foreach ($d in $usb) {
        $id = $d.InstanceName
        "{0}  Enabled={1}" -f $id, $d.Enable | Out-File $out -Append
    }
} catch { "Unable to read MSPower_DeviceEnable: $_" | Out-File $out -Append }

Section "Active Power Plan"
powercfg /getactivescheme | Out-File $out -Append
"" | Out-File $out -Append
"USB selective suspend setting:" | Out-File $out -Append
powercfg /query SCHEME_CURRENT SUB_USB | Out-File $out -Append

Section "Filter Keys / Sticky Keys / Accessibility"
$rk = 'HKCU:\Control Panel\Accessibility'
Get-ItemProperty "$rk\Keyboard Response" | Format-List | Out-File $out -Append
Get-ItemProperty "$rk\StickyKeys"        | Format-List | Out-File $out -Append
Get-ItemProperty "$rk\ToggleKeys"        | Format-List | Out-File $out -Append

Section "Thermal Zones (current temps in Kelvin*10 -> Celsius)"
try {
    $tz = Get-CimInstance -Namespace root\wmi -ClassName MSAcpi_ThermalZoneTemperature
    foreach ($z in $tz) {
        $c = [math]::Round(($z.CurrentTemperature / 10) - 273.15, 1)
        "{0}  {1} C" -f $z.InstanceName, $c | Out-File $out -Append
    }
} catch { "Thermal zone data unavailable." | Out-File $out -Append }

Section "Battery / Power Source"
Get-CimInstance Win32_Battery | Select Name,BatteryStatus,EstimatedChargeRemaining,DesignVoltage | Format-List | Out-File $out -Append

Section "Recent System Event Log Errors/Warnings (last 3 days)"
$since = (Get-Date).AddDays(-3)
Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2,3; StartTime=$since} -ErrorAction SilentlyContinue |
    Select TimeCreated,Id,LevelDisplayName,ProviderName,Message |
    Sort TimeCreated -Descending |
    Select -First 80 |
    Format-List | Out-File $out -Append

Section "Recent Application Event Log Errors (last 3 days)"
Get-WinEvent -FilterHashtable @{LogName='Application'; Level=1,2; StartTime=$since} -ErrorAction SilentlyContinue |
    Select TimeCreated,Id,LevelDisplayName,ProviderName,Message |
    Sort TimeCreated -Descending |
    Select -First 40 |
    Format-List | Out-File $out -Append

Section "Kernel-Power / Unexpected Shutdown events (last 14 days)"
Get-WinEvent -FilterHashtable @{LogName='System'; ProviderName='Microsoft-Windows-Kernel-Power'; StartTime=(Get-Date).AddDays(-14)} -ErrorAction SilentlyContinue |
    Select TimeCreated,Id,Message | Format-List | Out-File $out -Append

Section "Driver install/update history (last 30 days)"
Get-WinEvent -LogName 'Microsoft-Windows-Kernel-PnP/Configuration' -ErrorAction SilentlyContinue |
    Where-Object { $_.TimeCreated -gt (Get-Date).AddDays(-30) } |
    Select -First 50 TimeCreated,Id,Message | Format-List | Out-File $out -Append

"" | Out-File $out -Append
"=== DONE ===" | Out-File $out -Append
Write-Host ""
Write-Host "Report written to: $out" -ForegroundColor Green
Write-Host "Open it, review, and share the contents back." -ForegroundColor Green
