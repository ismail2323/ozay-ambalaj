# Mail Configuration Setup

## Güvenli Mail Şifresi Yapılandırması

Mail şifrenizi güvenli bir şekilde saklamak için iki yöntem kullanabilirsiniz:

### Yöntem 1: mail-config.php Dosyası (Basit)

1. `mail-config.example.php` dosyasını `mail-config.php` olarak kopyalayın
2. `mail-config.php` dosyasında `YOUR_MAIL_PASSWORD_HERE` yerine gerçek şifrenizi yazın
3. Bu dosya `.htaccess` ile korunuyor, web'den erişilemez

```bash
cp mail-config.example.php mail-config.php
```

### Yöntem 2: Environment Variable (.env Dosyası) - Önerilen

1. `.env.example` dosyasını `.env` olarak kopyalayın
2. `.env` dosyasında `YOUR_MAIL_PASSWORD_HERE` yerine gerçek şifrenizi yazın
3. Bu dosya da `.htaccess` ile korunuyor

```bash
cp .env.example .env
```

**Not:** `.env` ve `mail-config.php` dosyaları git'e commit edilmemelidir. Sadece örnek dosyalar commit edilir.

### Güvenlik Notları

- ✅ `mail-config.php` ve `.env` dosyaları web'den erişilemez (`.htaccess` koruması)
- ✅ Bu dosyaları git'e eklemeyin
- ✅ Production ortamında environment variable kullanmak daha güvenlidir

