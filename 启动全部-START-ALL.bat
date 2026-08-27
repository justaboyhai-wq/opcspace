@echo off
setlocal
set "PACKAGE_ROOT=%~dp0"

start "和盛小程序原型" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PACKAGE_ROOT%tools\serve.ps1" -Root "%PACKAGE_ROOT%mini-program" -Port 18081 -PidFile "%PACKAGE_ROOT%tools\mini.pid"
start "和盛管理端原型" /min powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%PACKAGE_ROOT%tools\serve.ps1" -Root "%PACKAGE_ROOT%web-admin" -Port 18082 -PidFile "%PACKAGE_ROOT%tools\web.pid"

ping 127.0.0.1 -n 3 >nul
start "" "%PACKAGE_ROOT%index.html"
endlocal

