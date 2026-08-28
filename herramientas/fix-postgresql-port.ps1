#requires -Version 5.1

param(
  [int]$Port = 5432,
  [int]$WaitSeconds = 30,
  [switch]$Force
)

$ErrorActionPreference = 'Stop'

function Write-Info([string]$Message) { Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Ok([string]$Message) { Write-Host "[OK]   $Message" -ForegroundColor Green }
function Write-Fail([string]$Message) { Write-Host "[ERROR] $Message" -ForegroundColor Red }

function Get-PortOwner([int]$TargetPort) {
  $matches = netstat.exe -ano -p tcp | Select-String ":$TargetPort\s+.*LISTENING\s+(\d+)"
  foreach ($match in $matches) {
    if ($match.Matches[0].Groups[1].Value) {
      return [int]$match.Matches[0].Groups[1].Value
    }
  }
  return $null
}

function Wait-Port([int]$TargetPort, [int]$Seconds) {
  for ($second = 0; $second -lt $Seconds; $second++) {
    $owner = Get-PortOwner $TargetPort
    if ($owner) { return $owner }
    Start-Sleep -Seconds 1
  }
  return $null
}

try {
  $ownerPid = Get-PortOwner $Port
  if (-not $ownerPid) {
    Write-Info "El puerto $Port está libre."
  } else {
    $process = Get-Process -Id $ownerPid -ErrorAction SilentlyContinue
    if (-not $process) { throw "No se pudo consultar el proceso que ocupa el puerto $Port." }

    Write-Info "El puerto $Port está ocupado por $($process.ProcessName).exe (PID $ownerPid)."
    if ($process.ProcessName -ne 'postgres') {
      throw "No se detendrá $($process.ProcessName).exe automáticamente. Revise el proceso antes de liberar el puerto."
    }
    if (-not $Force) {
      Write-Info 'Use -Force para terminar el proceso PostgreSQL y reiniciar el servicio.'
      exit 2
    }

    $services = Get-CimInstance Win32_Service |
      Where-Object { $_.Name -match '^postgresql' -or $_.DisplayName -match 'PostgreSQL' }
    foreach ($service in $services) {
      if ($service.State -eq 'Running') {
        Write-Info "Deteniendo servicio $($service.Name)..."
        Stop-Service -Name $service.Name -Force
      }
    }

    Stop-Process -Id $ownerPid -Force
    Write-Ok "Proceso PostgreSQL huérfano terminado."
  }

  $postgresService = Get-CimInstance Win32_Service |
    Where-Object { $_.Name -match '^postgresql' -or $_.DisplayName -match 'PostgreSQL' } |
    Select-Object -First 1

  if (-not $postgresService) {
    throw 'No se encontró un servicio PostgreSQL instalado en Windows.'
  }

  Write-Info "Iniciando servicio $($postgresService.Name)..."
  Start-Service -Name $postgresService.Name
  $newOwnerPid = Wait-Port $Port $WaitSeconds
  if (-not $newOwnerPid) {
    throw "PostgreSQL no comenzó a escuchar en el puerto $Port después de $WaitSeconds segundos. Revise el log del servicio."
  }

  $newProcess = Get-Process -Id $newOwnerPid -ErrorAction SilentlyContinue
  Write-Ok "PostgreSQL está escuchando en el puerto $Port (PID $newOwnerPid, proceso $($newProcess.ProcessName))."
} catch {
  Write-Fail $_.Exception.Message
  exit 1
}