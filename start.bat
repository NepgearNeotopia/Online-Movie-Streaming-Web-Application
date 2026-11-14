@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo  MovieStream - Start
echo ============================================================
echo.

echo [INFO] Checking MySQL on 127.0.0.1:3306 ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $c = New-Object System.Net.Sockets.TcpClient; $i = $c.BeginConnect('127.0.0.1', 3306, $null, $null); if (-not $i.AsyncWaitHandle.WaitOne(2000)) { exit 1 }; $c.EndConnect($i); $c.Close(); exit 0 } catch { exit 1 }"

if errorlevel 1 (
    echo.
    echo [ERROR] MySQL is not running on 127.0.0.1:3306.
    echo Open XAMPP Control Panel, click Start next to MySQL, then run start.bat again.
    echo Apache is not required for this project.
    echo.
    pause
    exit /b 1
)

echo [ OK ] MySQL is reachable.
echo.

echo [INFO] Starting backend in a new window ...
start "MovieStream Backend" powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%~dp0backend'; npm run dev"

echo [INFO] Starting frontend in a new window ...
start "MovieStream Frontend" powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%~dp0frontend'; npm run dev"

echo.
echo ============================================================
echo  Open the site at:
echo    Frontend:       http://localhost:5173
echo    Backend:        http://localhost:5000
echo    Backend health: http://localhost:5000/api/health
echo ============================================================
echo.
echo Close the two new windows to stop the servers.
echo.
pause
endlocal