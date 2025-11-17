# Öz-Ay Ambalaj ve Plastik - Kurulum Kılavuzu

## 📋 İçindekiler
1. [Gereksinimler](#gereksinimler)
2. [cPanel Kurulumu](#cpanel-kurulumu)
3. [SMTP Yapılandırması](#smtp-yapılandırması)
4. [Google Maps Yapılandırması](#google-maps-yapılandırması)
5. [SSL Sertifikası](#ssl-sertifikası)
6. [Test ve Doğrulama](#test-ve-doğrulama)
7. [Performans Optimizasyonu](#performans-optimizasyonu)

---

## 🔧 Gereksinimler

### Sunucu Gereksinimleri
- **PHP**: 8.1 veya üstü
- **Apache**: 2.4+ (mod_rewrite aktif)
- **MySQL**: 5.7+ (opsiyonel, form logları için)
- **SSL**: Let's Encrypt veya ticari sertifika
- **Disk Alanı**: Minimum 500MB
- **RAM**: Minimum 256MB

### cPanel Özellikleri
- File Manager erişimi
- Email Accounts
- PHP Selector
- SSL/TLS Manager
- Metrics (Errors, Visitors, vb.)

---

## 📦 cPanel Kurulumu

### Adım 1: Dosyaları Yükleme

1. **cPanel'e Giriş Yapın**
   - cPanel URL: `https://yourdomain.com:2083`
   - Kullanıcı adı ve şifrenizi girin

2. **File Manager'ı Açın**
   - cPanel ana sayfasında "File Manager" butonuna tıklayın
   - `public_html` dizinine gidin

3. **Mevcut Dosyaları Temizleyin (İlk Kurulum İçin)**
   ```
   - public_html içindeki varsayılan dosyaları yedekleyin veya silin
   ```

4. **Dosyaları Yükleyin**
   - "Upload" butonuna tıklayın
   - Proje dosyalarınızı (ZIP olarak) yükleyin
   - Veya FTP ile `public_html` içine yükleyin

5. **ZIP Dosyasını Açın** (Eğer ZIP yüklediyseniz)
   - ZIP dosyasına sağ tıklayın
   - "Extract" seçeneğini seçin
   - Dosyaların `public_html` içine çıkarıldığını doğrulayın

### Adım 2: Dizin Yapısını Doğrulayın

Dosya yapınız şu şekilde olmalı:

```
public_html/
├── assets/
│   ├── img/
│   ├── video/
│   ├── icons/
│   └── fonts/
├── css/
│   ├── main.css
├── js/
│   ├── main.js
│   ├── lang.js
│   ├── slider.js
│   ├── whatsapp.js
│   └── animations.js
├── pages/
│   ├── tr/
│   ├── en/
│   └── de/
├── config/
│   └── config.php
├── logs/ (oluşturulacak)
├── contact.php
├── .htaccess
├── robots.txt
├── sitemap.xml
└── manifest.json
```

### Adım 3: Dizin İzinlerini Ayarlayın

1. **logs/ Dizini Oluşturun**
   ```
   - File Manager'da public_html içinde
   - "+ Folder" butonuna tıklayın
   - "logs" adını verin
   ```

2. **İzinleri Ayarlayın**
   ```
   - logs/ dizinine sağ tıklayın → "Permissions"
   - 755 (rwxr-xr-x) olarak ayarlayın
   - config/ dizini için de 755
   - config.php için 644 (rw-r--r--)
   ```

### Adım 4: PHP Versiyonunu Ayarlayın

1. **cPanel'de "Select PHP Version"** bölümüne gidin
2. **PHP 8.1 veya üstünü seçin**
3. Şu eklentilerin aktif olduğundan emin olun:
   - `json`
   - `mbstring`
   - `curl`
   - `openssl`

---

## 📧 SMTP Yapılandırması

### Email Hesabı Oluşturma

1. **cPanel'de "Email Accounts"** bölümüne gidin

2. **Yeni Email Oluşturun**
   - Email: `info@ozay-ambalaj.com`
   - Şifre: Güçlü bir şifre oluşturun (kaydedin!)
   - Mailbox Quota: 500 MB (veya daha fazla)

3. **SMTP Bilgilerinizi Not Edin**
   ```
   SMTP Host: mail.ozay-ambalaj.com (veya sunucu IP)
   SMTP Port: 587 (TLS) veya 465 (SSL)
   SMTP User: info@ozay-ambalaj.com
   SMTP Pass: [oluşturduğunuz şifre]
   ```

### config.php Dosyasını Düzenleyin

1. **File Manager'da `config/config.php` dosyasını açın**

2. **SMTP Bilgilerini Güncelleyin**
   ```php
   define('SMTP_HOST', 'mail.ozay-ambalaj.com');
   define('SMTP_PORT', 587);
   define('SMTP_USER', 'info@ozay-ambalaj.com');
   define('SMTP_PASS', 'GÜÇLÜŞİFRENİZ');
   
   define('MAIL_TO_SALES', 'info@ozay-ambalaj.com');
   define('MAIL_TO_HR', 'hr@ozay-ambalaj.com'); // İsteğe bağlı
   define('MAIL_FROM', 'noreply@ozay-ambalaj.com');
   ```

3. **Dosyayı Kaydedin**

### Test Email Gönderimi

1. Web sitenizin iletişim formunu açın
2. Bir test mesajı gönderin
3. Kontrol edin:
   - Email geldi mi?
   - `logs/contact-YYYYMM.log` dosyası oluştu mu?
   - Hatalar `logs/php-errors.log` dosyasında var mı?

---

## 🗺️ Google Maps Yapılandırması

### Google Maps API Key Alma (Opsiyonel)

Şu an için Maps embed kullanıyoruz (API key gerektirmez), ama gelecekte ihtiyaç olursa:

1. [Google Cloud Console](https://console.cloud.google.com/) gidin
2. Yeni proje oluşturun: "Oz-Ay Ambalaj"
3. **APIs & Services** → **Library** → "Maps JavaScript API" aktifleştirin
4. **Credentials** → **Create Credentials** → API Key
5. API Key'inizi kısıtlayın:
   - Application restrictions: **HTTP referrers**
   - Website restrictions: `https://www.ozay-ambalaj.com/*`
6. API Key'i not edin

### Harita Koordinatlarını Güncelleme

1. **Google Maps'te adresinizi bulun**
2. **Koordinatları alın** (URL'den veya sağ tık → "What's here?")
3. **Footer HTML'lerini güncelleyin** (`partials/footer.html` içinde)
   ```html
   <iframe 
       src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d[LATITUDE]![LONGITUDE]!..."
   ```

---

## 🔒 SSL Sertifikası

### Let's Encrypt SSL (Ücretsiz)

1. **cPanel'de "SSL/TLS Status"** bölümüne gidin
2. **Domain seçin**: `ozay-ambalaj.com` ve `www.ozay-ambalaj.com`
3. **"Run AutoSSL"** butonuna tıklayın
4. 5-10 dakika bekleyin, SSL otomatik kurulacak

### HTTPS Yönlendirmesi

`.htaccess` dosyası zaten HTTPS yönlendirmesi içeriyor, sadece yorumdan çıkarın:

```apache
# Force HTTPS (uncomment when SSL is ready)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### HSTS Header (Opsiyonel ama Önerilen)

`.htaccess` içindeki HSTS satırını da yorumdan çıkarın:

```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

---

## ✅ Test ve Doğrulama

### Fonksiyonel Testler

1. **Ana Sayfa**
   - [ ] Hero section düzgün yükleniyor
   - [ ] Animasyonlar çalışıyor
   - [ ] Dil değiştirme çalışıyor (TR/EN/DE)

2. **Navigasyon**
   - [ ] Tüm sayfalar erişilebilir
   - [ ] Mobil menü çalışıyor
   - [ ] Sticky header çalışıyor

3. **İletişim Formu**
   - [ ] Validasyon çalışıyor
   - [ ] Email gönderimi başarılı
   - [ ] KVKK checkbox zorunlu
   - [ ] Rate limiting aktif (5 istek/saat)

4. **WhatsApp Butonu**
   - [ ] Mobilde doğru link (wa.me)
   - [ ] Masaüstünde doğru link (web.whatsapp.com)
   - [ ] Önceden yazılmış mesaj çalışıyor

5. **Çok Dilli**
   - [ ] TR/EN/DE geçiş çalışıyor
   - [ ] LocalStorage dil tercihi hatırlıyor
   - [ ] Tüm metinler çevriliyor

### SEO Testleri

1. **Google Search Console**
   - Site ekleyin: `https://search.google.com/search-console`
   - `sitemap.xml` gönderin
   - Coverage raporunu kontrol edin

2. **Lighthouse Testi**
   - Chrome DevTools → Lighthouse
   - Hedefler:
     - Performance: ≥ 90
     - Accessibility: ≥ 95
     - Best Practices: ≥ 90
     - SEO: ≥ 95

3. **Meta Tags Doğrulama**
   - [Facebook Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Güvenlik Testleri

1. **Security Headers**
   ```bash
   curl -I https://www.ozay-ambalaj.com
   ```
   Kontrol edin:
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `Content-Security-Policy`

2. **SSL Test**
   - [SSL Labs](https://www.ssllabs.com/ssltest/)
   - A veya A+ rating hedefleyin

---

## 🚀 Performans Optimizasyonu

### Önbellekleme

`.htaccess` dosyası zaten optimal cache header'larını içeriyor:
- Images: 1 yıl
- CSS/JS: 1 ay
- HTML: Cache yok

### Görsel Optimizasyonu

1. **WebP Formatı Kullanın**
   ```
   - assets/img/ içindeki tüm JPEG/PNG'leri WebP'ye çevirin
   - Fallback için orijinalleri saklayın
   ```

2. **Sıkıştırma Araçları**
   - [TinyPNG](https://tinypng.com/) - PNG/JPEG
   - [Squoosh](https://squoosh.app/) - WebP/AVIF

### CDN (Opsiyonel)

Daha yüksek trafik için:
- Cloudflare (ücretsiz plan)
- BunnyCDN
- KeyCDN

---

## 📊 Analytics Kurulumu

### Google Analytics 4

1. **GA4 Property Oluşturun**
   - [Google Analytics](https://analytics.google.com/)
   - Admin → Create Property
   - Measurement ID alın: `G-XXXXXXXXXX`

2. **Tracking Code Ekleyin**
   Her sayfa `<head>` bölümüne:
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

---

## 🐛 Sorun Giderme

### Email Gönderilmiyor

1. **SMTP Bilgilerini Kontrol Edin**
   ```php
   // config/config.php
   define('SMTP_HOST', 'mail.ozay-ambalaj.com'); // Doğru mu?
   define('SMTP_PORT', 587); // TLS için 587, SSL için 465
   ```

2. **PHP Error Log Kontrol Edin**
   ```
   - cPanel → Metrics → Errors
   - Veya logs/php-errors.log dosyasını kontrol edin
   ```

3. **Firewall/Port Kontrolü**
   - Sunucunuzun 587 veya 465 portlarının açık olduğundan emin olun
   - cPanel → Email → Email Deliverability

### CSS/JS Yüklenmiyor

1. **Dosya İzinlerini Kontrol Edin**
   ```
   - .htaccess: 644
   - CSS/JS files: 644
   - Directories: 755
   ```

2. **.htaccess Aktif mi?**
   - cPanel → File Manager → Settings
   - "Show Hidden Files" aktif olmalı
   - `.htaccess` dosyası görünüyor mu?

### 404 Hataları

1. **mod_rewrite Aktif mi?**
   - Hosting sağlayıcınıza sorun
   - cPanel'de "MultiPHP INI Editor" kontrol edin

2. **Base Path Doğru mu?**
   - Sayfaların `<head>` bölümündeki `basePath` script'ini kontrol edin

---

## 📞 Destek

Sorunlarınız için:
- **Email**: developer@ozay-ambalaj.com
- **Telefon**: 0 (541) 903 08 78

---

## 📄 Telif Beyanı

Bu proje Öz-Ay Ambalaj ve Plastik için geliştirilmiştir.

- **Görseller**: Unsplash (lisanslı) ve özgün içerik
- **İkonlar**: Feather Icons (MIT License)
- **Fontlar**: Google Fonts (Open Font License)
- **Kod**: Özgün geliştirme

© 2022 Artinlife Tech. Tüm hakları saklıdır.

