# Firewall kuralı ekleme scripti
# Bu scripti YÖNETİCİ OLARAK çalıştırın

Write-Host "Firewall kuralı ekleniyor..." -ForegroundColor Yellow

try {
    netsh advfirewall firewall add rule name="HTTP Server 8080" dir=in action=allow protocol=TCP localport=8080
    Write-Host "✓ Firewall kuralı başarıyla eklendi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Mobil cihazınızda şu linki açabilirsiniz:" -ForegroundColor Cyan
    Write-Host "http://10.99.32.132:8080/pages/tr/index.html" -ForegroundColor Green
} catch {
    Write-Host "✗ Hata: Firewall kuralı eklenemedi." -ForegroundColor Red
    Write-Host "Lütfen PowerShell'i YÖNETİCİ OLARAK çalıştırın." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Devam etmek için bir tuşa basın..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

