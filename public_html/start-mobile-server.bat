@echo off
echo Starting server for mobile access...
echo.
echo Your IP addresses:
ipconfig | findstr /i "IPv4"
echo.
echo Server will start on port 8080
echo Access from mobile: http://YOUR_IP:8080/pages/tr/index.html
echo.
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
python -m http.server 8080 --bind 0.0.0.0
pause

