@echo off
setlocal
set "PACKAGE_ROOT=%~dp0"
start "和盛小程序原型" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PACKAGE_ROOT%tools\serve.ps1" -Root "%PACKAGE_ROOT%prd-demo\mini" -Port 18081 -PidFile "%PACKAGE_ROOT%tools\mini.pid"
ping 127.0.0.1 -n 3 >nul
start "" "http://localhost:18081/"
endlocal
