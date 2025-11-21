# 🚀 Live Server Nasıl Başlatılır

## Yöntem 1: VS Code Live Server Extension (ÖNERİLEN)

1. **Extensions** panelini aç (`Ctrl+Shift+X`)
2. **"Live Server"** ara ve yükle (Ritwick Dey tarafından)
3. `public_html/pages/tr/index.html` dosyasını aç
4. Sağ altta **"Go Live"** butonuna tıkla
5. Browser otomatik açılacak

## Yöntem 2: Python HTTP Server

Terminal'de şu komutu çalıştır:

```powershell
Set-Location "C:\Users\23ism\Desktop\ozay-ambalaj\ozay-ambalaj\public_html"
python -m http.server 8080
```

Sonra browser'da: `http://localhost:8080/pages/tr/index.html`

## Yöntem 3: Node.js http-server

```powershell
npm install -g http-server
cd C:\Users\23ism\Desktop\ozay-ambalaj\ozay-ambalaj\public_html
http-server -p 8080
```

Sonra: `http://localhost:8080/pages/tr/index.html`

## ⚠️ ÖNEMLİ NOTLAR

- **Live Server ayarları** `.vscode/settings.json` dosyasında yapılandırılmıştır
- Root dizin: `public_html`
- Port: 5500 (Live Server) veya 8080 (Python/Node)
- Tüm linkler absolute path kullanıyor (`/css/main.css` vs.)

## 🎯 Test Edilmesi Gerekenler

✅ Ana sayfa yükleniyor mu?
✅ CSS dosyaları yükleniyor mu?
✅ JavaScript çalışıyor mu?
✅ Bayraklar görünüyor mu?
✅ Navigation linkleri çalışıyor mu?
✅ Logo doğru boyutta mı?
✅ WhatsApp butonu çalışıyor mu?

## 🔧 Sorun Giderme

**CSS görünmüyorsa:**
- Browser Console'u aç (F12) ve hataları kontrol et
- Path'lerin doğru olduğundan emin ol

**404 hatası alıyorsan:**
- VS Code'u `public_html` klasöründen aç
- `.vscode/settings.json` ayarlarını kontrol et

**Bayraklar görünmüyorsa:**
- Internet bağlantını kontrol et (flagcdn.com'a erişim gerekli)
- Browser cache'ini temizle (Ctrl+F5)

