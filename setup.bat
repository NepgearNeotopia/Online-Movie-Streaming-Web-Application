@echo off
setlocal
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup.ps1" %*
set "EXITCODE=%ERRORLEVEL%"

echo.
if not "%EXITCODE%"=="0" (
    echo [ERROR] Setup failed with exit code %EXITCODE%.
    echo Please read the messages above and check SETUP_GUIDE.md.
) else (
    echo Setup finished successfully.
)

echo.
pause
endlocal