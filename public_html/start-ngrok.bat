@echo off
echo ========================================
echo   NGROK TUNNEL BASLATILIYOR
echo ========================================
echo.
echo Sunucu portu: 8080
echo.
echo NOT: Eger ngrok authtoken isterse:
echo 1. https://dashboard.ngrok.com/get-started/setup adresine gidin
echo 2. Authtoken alin
echo 3. Su komutu calistirin: ngrok authtoken YOUR_TOKEN
echo.
echo ========================================
echo.

cd /d "%~dp0\.."
"%TEMP%\ngrok.exe" http 8080

pause

