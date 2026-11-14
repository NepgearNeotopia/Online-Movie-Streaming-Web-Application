param(
    [string]$XamppPath = "C:\xampp",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$ProjectRoot = $PSScriptRoot
$BackendDir  = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$EnvPath     = Join-Path $BackendDir ".env"

function Write-Info([string]$Message)  { Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Ok([string]$Message)    { Write-Host "[ OK ] $Message" -ForegroundColor Green }
function Write-Warn2([string]$Message) { Write-Host "[WARN] $Message" -ForegroundColor Yellow }
function Write-Fail([string]$Message)  { Write-Host "[FAIL] $Message" -ForegroundColor Red }

function Confirm-Action([string]$Message) {
    if ($DryRun) {
        Write-Host "[DRY-RUN] Would ask for confirmation: $Message"
        return $false
    }
    $answer = Read-Host "$Message [y/N]"
    return ($answer -match '^(y|yes)$')
}

function Read-DotEnv([string]$Path) {
    $map = @{}
    if (-not (Test-Path -LiteralPath $Path)) { return $map }

    foreach ($line in (Get-Content -LiteralPath $Path -Encoding UTF8)) {
        if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
            $key = $matches[1]
            $value = $matches[2].Trim()

            if ($value.Length -ge 2) {
                $first = $value.Substring(0, 1)
                $last  = $value.Substring($value.Length - 1, 1)
                if (($first -eq '"' -and $last -eq '"') -or ($first -eq "'" -and $last -eq "'")) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
            }

            $map[$key] = $value
        }
    }

    return $map
}

function Resolve-MySqlClient([string]$Xampp) {
    $candidates = @()
    if ($Xampp) { $candidates += (Join-Path $Xampp "mysql\bin\mysql.exe") }
    $candidates += "C:\xampp\mysql\bin\mysql.exe"
    $candidates += "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath $candidate) { return $candidate }
    }

    $command = Get-Command mysql.exe -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }

    return $null
}

function Test-PortOpen([string]$HostName, [int]$Port, [int]$TimeoutMs = 2000) {
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $async = $client.BeginConnect($HostName, $Port, $null, $null)
        $completed = $async.AsyncWaitHandle.WaitOne($TimeoutMs)
        if (-not $completed) { return $false }
        $client.EndConnect($async)
        return $true
    } catch {
        return $false
    } finally {
        $client.Close()
    }
}

function Invoke-MySql([string]$Client, [string]$User, [string]$Password, [string]$HostName, [int]$Port, [string]$Query, [string]$Database) {
    $mysqlArgs = @("--user=$User", "--host=$HostName", "--port=$Port", "--batch", "--raw", "-e", $Query)
    if ($Database) { $mysqlArgs += "--database=$Database" }

    $hadOld = Test-Path Env:\MYSQL_PWD
    $old = $null
    if ($hadOld) { $old = $env:MYSQL_PWD }

    if ($Password) {
        $env:MYSQL_PWD = $Password
    } elseif ($hadOld) {
        Remove-Item Env:\MYSQL_PWD -ErrorAction SilentlyContinue
    }

    try {
        $output = & $Client @mysqlArgs 2>&1
        $code = $LASTEXITCODE
        return [pscustomobject]@{
            Success = ($code -eq 0)
            Output  = ($output -join "`n")
            Code    = $code
        }
    } finally {
        if ($hadOld) { $env:MYSQL_PWD = $old }
        else { Remove-Item Env:\MYSQL_PWD -ErrorAction SilentlyContinue }
    }
}

function Get-MySqlTableList([string]$Client, [string]$User, [string]$Password, [string]$HostName, [int]$Port, [string]$DbName) {
    $result = Invoke-MySql $Client $User $Password $HostName $Port "SHOW TABLES;" $DbName
    if (-not $result.Success) { return @() }

    $lines = $result.Output -split "`r?`n"
    return @($lines | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" })
}

function Ensure-Dependencies([string]$Directory, [string]$Label) {
    $modules = Join-Path $Directory "node_modules"
    if (Test-Path -LiteralPath $modules) {
        Write-Ok "$Label dependencies are already installed."
        return
    }

    Write-Info "Installing $Label dependencies..."
    if ($DryRun) {
        Write-Host "[DRY-RUN] Would run: npm ci (fallback: npm install --package-lock=false) in $Directory"
        return
    }

    Push-Location -LiteralPath $Directory
    try {
        & npm ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) {
            Write-Warn2 "'npm ci' failed. Trying 'npm install --package-lock=false'..."
            & npm install --package-lock=false --no-audit --no-fund
            if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed for $Label." }
        }
    } finally {
        Pop-Location
    }

    Write-Ok "$Label dependencies installed."
}

Write-Host "============================================================"
Write-Host " MovieStream - Project Setup"
Write-Host "============================================================"
if ($DryRun) { Write-Warn2 "DRY-RUN mode: no changes will be made." }
Write-Host ""

# 1. Windows check
if ($env:OS -ne "Windows_NT") {
    Write-Fail "This setup script supports Windows only."
    exit 1
}
Write-Ok "Running on Windows."

# 2. Node.js and npm
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$npmCommand  = Get-Command npm  -ErrorAction SilentlyContinue
if (-not $nodeCommand -or -not $npmCommand) {
    Write-Fail "Node.js and/or npm was not found on PATH."
    Write-Host "Install Node.js 18 or newer from https://nodejs.org/ and reopen the terminal."
    exit 1
}

$nodeVersion = (& node --version).TrimStart("v")
$nodeMajor = 0
if ($nodeVersion -match '^(\d+)\.') { $nodeMajor = [int]$matches[1] }
if ($nodeMajor -lt 18) {
    Write-Fail "Node.js $nodeVersion was found, but version 18 or newer is required."
    exit 1
}
$npmVersion = (& npm --version).Trim()
Write-Ok "Node.js $nodeVersion and npm $npmVersion detected."

# 3. backend/.env (existence and required keys only; values are never displayed)
if (-not (Test-Path -LiteralPath $EnvPath)) {
    Write-Fail "backend/.env was not found."
    Write-Host "Copy backend/.env.example to backend/.env and fill in your database settings."
    Write-Host "Required keys: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET."
    Write-Host "Then run setup.bat again."
    exit 1
}
Write-Ok "backend/.env exists (values are not displayed)."

$envMap = Read-DotEnv $EnvPath
$requiredKeys = @("DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME", "JWT_SECRET")
$missingKeys = @($requiredKeys | Where-Object { -not $envMap.ContainsKey($_) })
if ($missingKeys.Count -gt 0) {
    Write-Fail "backend/.env is missing required keys: $($missingKeys -join ', ')"
    Write-Host "Add the missing keys, then run setup.bat again."
    exit 1
}

$dbHost     = $envMap["DB_HOST"]
$dbPort     = 3306
$portText   = "$($envMap['DB_PORT'])"
if ($portText -match '^\d+$') { $dbPort = [int]$portText }
else {
    Write-Fail "DB_PORT in backend/.env must be a number."
    exit 1
}
$dbUser     = $envMap["DB_USER"]
$dbPassword = $envMap["DB_PASSWORD"]
$dbName     = $envMap["DB_NAME"]
$jwtSecret  = $envMap["JWT_SECRET"]

if ([string]::IsNullOrWhiteSpace($dbName)) {
    Write-Fail "DB_NAME in backend/.env is empty."
    exit 1
}
if ([string]::IsNullOrWhiteSpace($jwtSecret)) {
    Write-Fail "JWT_SECRET in backend/.env is empty."
    exit 1
}

$probeHost = $dbHost
if ($dbHost -eq "localhost") { $probeHost = "127.0.0.1" }

# 4. MySQL client
$mysqlClient = Resolve-MySqlClient $XamppPath
if (-not $mysqlClient) {
    Write-Fail "Could not find mysql.exe."
    Write-Host "Install XAMPP (default: C:\xampp) or pass -XamppPath <path>."
    exit 1
}
Write-Ok "MySQL client found: $mysqlClient"

# 5. MySQL running check (never starts MySQL automatically)
if (-not (Test-PortOpen $probeHost $dbPort 2000)) {
    Write-Warn2 "MySQL is not reachable at ${probeHost}:$dbPort."
    Write-Host "Open XAMPP Control Panel, click Start next to MySQL, then press Enter to retry."
    Write-Host "(Apache is not required. This script will not start MySQL for you.)"
    Write-Host "Press Ctrl+C to cancel."
    Write-Host ""

    while (-not (Test-PortOpen $probeHost $dbPort 2000)) {
        Read-Host | Out-Null
        Write-Info "Checking MySQL again..."
    }
    Write-Ok "MySQL is now reachable."
} else {
    Write-Ok "MySQL is reachable at ${probeHost}:$dbPort."
}

# 6. MySQL connection check
$connection = Invoke-MySql $mysqlClient $dbUser $dbPassword $probeHost $dbPort "SELECT 1;" $null
if (-not $connection.Success) {
    Write-Fail "Could not connect to MySQL with the credentials in backend/.env."
    Write-Host "Check DB_USER and DB_PASSWORD in backend/.env (values are not shown)."
    exit 1
}
Write-Ok "MySQL connection verified."

# 6b. Verify the backend's own database configuration
Write-Info "Verifying backend database configuration..."
Push-Location -LiteralPath $BackendDir
try {
    $nodeCheck = "require('./src/config/database').testConnection().then(function(r){ console.log(r.success ? 'DB_OK' : 'DB_FAIL'); process.exit(r.success ? 0 : 1); }).catch(function(){ console.log('DB_FAIL'); process.exit(1); });"
    $backendCheck = & node -e $nodeCheck 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Backend could not connect to MySQL using backend/.env."
        Write-Host $backendCheck
        exit 1
    }
    Write-Ok "Backend database connection verified."
} finally {
    Pop-Location
}

# 7. Database, tables, and required column
$databaseResult = Invoke-MySql $mysqlClient $dbUser $dbPassword $probeHost $dbPort "SHOW DATABASES LIKE '$dbName';" $null
$databaseExists = $databaseResult.Success -and ($databaseResult.Output -match [regex]::Escape($dbName))

if (-not $databaseExists) {
    Write-Warn2 "Database '$dbName' does not exist."
    $createDatabaseSql = "CREATE DATABASE IF NOT EXISTS $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    Write-Host "Proposed SQL:"
    Write-Host "  $createDatabaseSql"

    if ($DryRun) {
        Write-Host "[DRY-RUN] Database would be created. No changes made."
    } else {
        if (Confirm-Action "Create database '$dbName'?") {
            $created = Invoke-MySql $mysqlClient $dbUser $dbPassword $probeHost $dbPort $createDatabaseSql $null
            if (-not $created.Success) {
                Write-Fail "Failed to create database '$dbName'."
                Write-Host $created.Output
                exit 1
            }
            Write-Ok "Database '$dbName' created."
            $databaseExists = $true
        } else {
            Write-Fail "The database is required. Aborting."
            exit 1
        }
    }
} else {
    Write-Ok "Database '$dbName' exists."
}

$tables = @()
if ($databaseExists) {
    $tables = Get-MySqlTableList $mysqlClient $dbUser $dbPassword $probeHost $dbPort $dbName
}

$requiredTables = @("users", "movies", "categories", "movie_categories", "favorites")
$missingTables = @()
if ($databaseExists) {
    $missingTables = @($requiredTables | Where-Object { $tables -notcontains $_ })
}

if ($databaseExists -and $missingTables.Count -gt 0) {
    Write-Warn2 "Missing tables: $($missingTables -join ', ')"
    Write-Host "Proposed action: run backend/scripts/create-tables.js"
    Write-Host "The script uses CREATE TABLE IF NOT EXISTS and inserts no data."
    Write-Host "SQL source (backend/scripts/create-tables.js):"

    $createTablesPath = Join-Path $BackendDir "scripts\create-tables.js"
    if (Test-Path -LiteralPath $createTablesPath) {
        Get-Content -LiteralPath $createTablesPath | ForEach-Object { Write-Host "  $_" }
    }

    if ($DryRun) {
        Write-Host "[DRY-RUN] Tables would be created. No changes made."
    } else {
        if (Confirm-Action "Create the missing tables?") {
            Push-Location -LiteralPath $BackendDir
            try {
                & node "scripts\create-tables.js"
                if ($LASTEXITCODE -ne 0) { throw "create-tables.js failed." }
            } finally {
                Pop-Location
            }

            $tables = Get-MySqlTableList $mysqlClient $dbUser $dbPassword $probeHost $dbPort $dbName
            $missingTables = @($requiredTables | Where-Object { $tables -notcontains $_ })
            if ($missingTables.Count -gt 0) {
                Write-Fail "Some tables are still missing: $($missingTables -join ', ')"
                exit 1
            }
            Write-Ok "Missing tables created."
        } else {
            Write-Fail "The tables are required. Aborting."
            exit 1
        }
    }
} elseif ($databaseExists) {
    Write-Ok "All required tables exist."
}

if ($databaseExists -and ($tables -contains "movies")) {
    $columnResult = Invoke-MySql $mysqlClient $dbUser $dbPassword $probeHost $dbPort "SHOW COLUMNS FROM movies LIKE 'video_url';" $dbName
    $hasVideoUrl = $columnResult.Success -and ($columnResult.Output -match 'video_url')

    if (-not $hasVideoUrl) {
        Write-Warn2 "Column 'movies.video_url' is missing."
        $alterSql = "ALTER TABLE movies ADD COLUMN video_url VARCHAR(1000) NULL AFTER poster_url;"
        Write-Host "Proposed SQL:"
        Write-Host "  $alterSql"

        if ($DryRun) {
            Write-Host "[DRY-RUN] Column would be added. No changes made."
        } else {
            if (Confirm-Action "Add column 'movies.video_url'?") {
                Push-Location -LiteralPath $BackendDir
                try {
                    & node "scripts\add-video-url.js"
                    if ($LASTEXITCODE -ne 0) { throw "add-video-url.js failed." }
                } finally {
                    Pop-Location
                }

                $columnResult = Invoke-MySql $mysqlClient $dbUser $dbPassword $probeHost $dbPort "SHOW COLUMNS FROM movies LIKE 'video_url';" $dbName
                if (-not ($columnResult.Output -match 'video_url')) {
                    Write-Fail "Column 'movies.video_url' was not added."
                    exit 1
                }
                Write-Ok "Column 'movies.video_url' added."
            } else {
                Write-Fail "The video_url column is required for playback. Aborting."
                exit 1
            }
        }
    } else {
        Write-Ok "Column 'movies.video_url' exists."
    }
}

# 8. Dependencies
Ensure-Dependencies $BackendDir "Backend"
Ensure-Dependencies $FrontendDir "Frontend"

Write-Host ""
Write-Host "============================================================"
Write-Host " Setup completed."
Write-Host "============================================================"
Write-Host "Next step: run start.bat"
Write-Host ""
Write-Host "  Frontend:       http://localhost:5173"
Write-Host "  Backend:        http://localhost:5000"
Write-Host "  Backend health: http://localhost:5000/api/health"
Write-Host ""
Write-Host "To create an admin account later:"
Write-Host "  cd backend"
Write-Host "  node scripts/create-admin.js"
Write-Host ""

if ($DryRun) { Write-Warn2 "DRY-RUN: no changes were made." }
exit 0