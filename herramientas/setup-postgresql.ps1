#requires -Version 5.1

param(
  [string]$DbName = 'gestor_inventario',
  [string]$DbUser = 'postgres',
  [string]$DbPassword = 'postgres',
  [int]$DbPort = 5432,
  [switch]$SkipSeed
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Backend = Join-Path $Root 'backend'
if (-not (Test-Path $Backend)) {
  $Backend = Join-Path $Root 'app\backend'
}
$UserData = Join-Path $env:APPDATA 'gestor-inventario-root'
$DatabaseUrlFile = Join-Path $UserData 'database-url.txt'
$ContainerName = 'gestor-inventario-postgres'

function Write-Info([string]$Message) { Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Ok([string]$Message) { Write-Host "[OK]   $Message" -ForegroundColor Green }
function Write-Fail([string]$Message) { Write-Host "[ERROR] $Message" -ForegroundColor Red }

function Find-CommandPath([string]$Name) {
  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($command) { return $command.Source }

  $roots = @(
    'C:\Program Files\PostgreSQL',
    'C:\Program Files (x86)\PostgreSQL'
  )
  foreach ($root in $roots) {
    if (Test-Path $root) {
      $match = Get-ChildItem $root -Filter "$Name.exe" -Recurse -ErrorAction SilentlyContinue |
        Select-Object -First 1
      if ($match) { return $match.FullName }
    }
  }
  return $null
}

function Wait-Tcp([string]$HostName, [int]$Port, [int]$Seconds = 30) {
  for ($i = 0; $i -lt $Seconds; $i++) {
    try {
      $client = [Net.Sockets.TcpClient]::new()
      $task = $client.ConnectAsync($HostName, $Port)
      if ($task.Wait(1000) -and $client.Connected) {
        $client.Close()
        return $true
      }
      $client.Close()
    } catch {}
    Start-Sleep -Seconds 1
  }
  return $false
}

function Invoke-Psql([string]$Psql, [string]$Database, [string]$Sql) {
  $env:PGPASSWORD = $DbPassword
  try {
    & $Psql -h 127.0.0.1 -p $DbPort -U $DbUser -d $Database -v ON_ERROR_STOP=1 -c $Sql
    if ($LASTEXITCODE -ne 0) { throw "psql terminó con código $LASTEXITCODE" }
  } finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  }
}

function Setup-Docker {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { return $false }

  docker info *> $null
  if ($LASTEXITCODE -ne 0) { return $false }
  Write-Info "Docker está disponible. Preparando PostgreSQL en el contenedor '$ContainerName'."

  $existing = docker ps -a --filter "name=^/$ContainerName$" --format '{{.Names}}'
  if (-not $existing) {
    docker run --name $ContainerName `
      -e "POSTGRES_USER=$DbUser" `
      -e "POSTGRES_PASSWORD=$DbPassword" `
      -e "POSTGRES_DB=$DbName" `
      -p "${DbPort}:5432" `
      -v "${UserData}\postgres-data:/var/lib/postgresql/data" `
      -d postgres:16
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear el contenedor PostgreSQL.' }
  } else {
    docker start $ContainerName *> $null
  }

  if (-not (Wait-Tcp '127.0.0.1' $DbPort 45)) {
    throw "PostgreSQL no respondió en 127.0.0.1:$DbPort. Revise Docker Desktop."
  }
  Write-Ok 'PostgreSQL está disponible mediante Docker.'
  return $true
}

function Setup-Native {
  $psql = Find-CommandPath 'psql'
  if (-not $psql) { return $false }
  Write-Info "Usando PostgreSQL instalado localmente: $psql"

  if (-not (Wait-Tcp '127.0.0.1' $DbPort 5)) {
    throw "El servicio PostgreSQL no está escuchando en 127.0.0.1:$DbPort. Inícielo desde services.msc."
  }

  $safeUser = $DbUser.Replace('"', '""')
  $safePassword = $DbPassword.Replace("'", "''")
  Invoke-Psql $psql 'postgres' "ALTER ROLE `"$safeUser`" WITH PASSWORD '$safePassword';"
  $exists = $false
  $env:PGPASSWORD = $DbPassword
  try {
    $result = & $psql -h 127.0.0.1 -p $DbPort -U $DbUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DbName'"
    $exists = ($result.Trim() -eq '1')
  } finally {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  }
  if (-not $exists) {
    $safeDbName = $DbName.Replace('"', '""')
    Invoke-Psql $psql 'postgres' "CREATE DATABASE `"$safeDbName`""
  }
  Write-Ok "Base de datos '$DbName' disponible."
  return $true
}

try {
  New-Item -ItemType Directory -Force -Path $UserData | Out-Null

  if (-not (Get-Command node -ErrorAction SilentlyContinue) -or
      -not (Get-Command npm -ErrorAction SilentlyContinue) -or
      -not (Get-Command npx -ErrorAction SilentlyContinue)) {
    throw 'Falta Node.js/npm para ejecutar Prisma manualmente. El instalador normal no necesita Node.js: abra el POS para que configure PostgreSQL automáticamente.'
  }

  $configured = Setup-Docker
  if (-not $configured) { $configured = Setup-Native }
  if (-not $configured) {
    throw 'No se encontró Docker activo ni PostgreSQL instalado. Instale PostgreSQL 16 o Docker Desktop y ejecute este script nuevamente.'
  }

  $encodedUser = [Uri]::EscapeDataString($DbUser)
  $encodedPassword = [Uri]::EscapeDataString($DbPassword)
  $url = "postgresql://${encodedUser}:${encodedPassword}@127.0.0.1:${DbPort}/${DbName}?schema=public"
  Set-Content -Path $DatabaseUrlFile -Value $url -Encoding UTF8
  Write-Ok "Conexión guardada en $DatabaseUrlFile"

  Push-Location $Backend
  try {
    $env:DATABASE_URL = $url
    npx --no-install prisma db push
    if ($LASTEXITCODE -ne 0) { throw 'Prisma no pudo crear la estructura de la base de datos.' }
    if (-not $SkipSeed) {
      npm run db:seed
      if ($LASTEXITCODE -ne 0) { throw 'No se pudieron cargar los datos iniciales.' }
    }
  } finally {
    Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
    Pop-Location
  }

  Write-Host ''
  Write-Ok 'PostgreSQL quedó configurado para Gestor de Inventario POS.'
  Write-Host 'Reinicie la aplicación para que use la nueva conexión.' -ForegroundColor Yellow
} catch {
  Write-Fail $_.Exception.Message
  exit 1
}