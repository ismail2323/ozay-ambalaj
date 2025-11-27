@echo off
echo Adding Windows Firewall rule for port 8080...
netsh advfirewall firewall add rule name="HTTP Server 8080" dir=in action=allow protocol=TCP localport=8080
echo.
echo Firewall rule added successfully!
echo You can now access the server from mobile devices.
echo.
pause

