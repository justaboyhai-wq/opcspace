@echo off
setlocal
set "PACKAGE_ROOT=%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PACKAGE_ROOT%tools\stop.ps1" -PidFiles "%PACKAGE_ROOT%tools\mini.pid","%PACKAGE_ROOT%tools\web.pid"
echo.
echo Prototype services stopped.
timeout /t 2 >nul
endlocal

