# 📱 Mobil Uyumluluk Test Rehberi

Bu doküman, Öz-Ay Ambalaj ve Plastik web sitesinin mobil uyumluluğunu test etmek için kapsamlı bir checklist ve test rehberi sunar.

---

## 🎯 Test Edilecek Cihazlar ve Çözünürlükler

### Mobil Cihazlar
- **iPhone SE (375x667)** - Küçük ekran
- **iPhone 12/13/14 (390x844)** - Standart iPhone
- **iPhone 14 Pro Max (430x932)** - Büyük iPhone
- **Samsung Galaxy S21 (360x800)** - Standart Android
- **Samsung Galaxy S21 Ultra (412x915)** - Büyük Android
- **Pixel 5 (393x851)** - Google Pixel

### Tablet Cihazlar
- **iPad Mini (768x1024)** - Küçük tablet
- **iPad Pro (1024x1366)** - Büyük tablet
- **Samsung Galaxy Tab (800x1280)** - Android tablet

### Desktop (Karşılaştırma)
- **1366x768** - Küçük laptop
- **1920x1080** - Standart desktop
- **2560x1440** - Büyük desktop

---

## ✅ Genel Mobil Uyumluluk Checklist

### 1. Viewport ve Meta Tags
- [ ] Tüm HTML sayfalarında `<meta name="viewport" content="width=device-width, initial-scale=1.0">` var mı?
- [ ] Apple mobile web app meta tags var mı?
- [ ] Theme color meta tag var mı?

### 2. Responsive Breakpoints
- [ ] `@media (max-width: 768px)` - Mobil için doğru çalışıyor mu?
- [ ] `@media (max-width: 1200px)` - Tablet için doğru çalışıyor mu?
- [ ] `@media (max-width: 1400px)` - Küçük desktop için doğru çalışıyor mu?

### 3. Navigation (Navigasyon)
- [ ] Mobil menü butonu görünüyor mu? (hamburger icon)
- [ ] Mobil menü açılıp kapanıyor mu? (slide-in animasyon)
- [ ] Mobil menüde tüm linkler çalışıyor mu?
- [ ] Mobil menüde dil seçici (TR/EN/DE) çalışıyor mu?
- [ ] Logo mobilde uygun boyutta mı? (max-height: 50px)
- [ ] Header yüksekliği mobilde 70px mi?

### 4. Typography (Yazı Tipleri)
- [ ] Başlıklar (h1, h2, h3) mobilde okunabilir boyutta mı?
  - h1: 2.5rem (mobil)
  - h2: 2rem (mobil)
  - h3: 1.5rem (mobil)
- [ ] Paragraflar mobilde okunabilir mi? (min: 16px)
- [ ] Satır yüksekliği (line-height) yeterli mi?

### 5. Images (Görseller)
- [ ] Görseller mobilde responsive mi? (`max-width: 100%`)
- [ ] Görseller srcset kullanıyor mu? (2x retina)
- [ ] Lazy loading çalışıyor mu?
- [ ] Logo görseli mobilde küçülüyor mu?

### 6. Grid Layouts (Grid Yapıları)
- [ ] Product grid mobilde 1 sütun oluyor mu?
- [ ] News grid mobilde 1 sütun oluyor mu?
- [ ] Stats grid mobilde 1 sütun oluyor mu?
- [ ] Footer grid mobilde dikey sıralanıyor mu?

### 7. Buttons (Butonlar)
- [ ] Butonlar dokunmaya uygun boyutta mı? (min: 44x44px)
- [ ] Butonlar mobilde tam genişlikte mi? (max-width: 300px)
- [ ] Hover efektleri touch'ta çalışıyor mu?

### 8. Forms (Formlar)
- [ ] Input alanları mobilde tam genişlikte mi?
- [ ] Input alanları dokunmaya uygun yükseklikte mi? (min: 44px)
- [ ] Placeholder text okunabilir mi?
- [ ] Submit butonu mobilde görünüyor mu?

### 9. WhatsApp Button
- [ ] WhatsApp butonu mobilde sağ alt köşede mi?
- [ ] Buton dokunmaya uygun boyutta mı? (64x64px)
- [ ] Buton tıklanabilir mi?
- [ ] Deep linking çalışıyor mu? (mobile -> WhatsApp app)

### 10. Footer
- [ ] Footer mobilde dikey sıralanıyor mu?
- [ ] Google Maps embed mobilde responsive mi?
- [ ] Footer linkleri çalışıyor mu?

### 11. Performance (Performans)
- [ ] Sayfa mobilde 3 saniyeden kısa sürede yükleniyor mu?
- [ ] Video mobilde devre dışı mı? (index.html hero video)
- [ ] Görseller optimize edilmiş mi?

### 12. Touch Interactions
- [ ] Tüm tıklanabilir elementler dokunmaya uygun mu?
- [ ] Scroll animasyonları mobilde çalışıyor mu?
- [ ] Swipe gesture'lar çalışıyor mu? (carousel, slider)

---

## 📋 Sayfa Bazında Test Checklist

### Ana Sayfa (index.html)
- [ ] Hero section mobilde uygun yükseklikte mi? (min-height: 500px)
- [ ] Hero title mobilde 2rem font-size mi?
- [ ] Hero video mobilde gizleniyor mu?
- [ ] Product grid mobilde 1 sütun mu?
- [ ] Sustainability section mobilde dikey mi?
- [ ] Stats counter animasyonu mobilde çalışıyor mu?

### Ürünler Sayfası (products.html)
- [ ] Product grid mobilde 1 sütun mu?
- [ ] Product card'lar mobilde tam genişlikte mi?
- [ ] Filter/arama özelliği mobilde çalışıyor mu?

### Ürün Detay Sayfası (product-*.html)
- [ ] Ürün görselleri mobilde responsive mi?
- [ ] Ürün bilgileri mobilde okunabilir mi?
- [ ] Galeri mobilde swipe edilebiliyor mu?

### Kurumsal Sayfası (about.html)
- [ ] Company story grid mobilde dikey mi?
- [ ] Vision/Mission grid mobilde dikey mi?
- [ ] Values grid mobilde 1 sütun mu?
- [ ] Stats grid mobilde dikey mi?

### Kalite Sayfası (quality.html)
- [ ] Sertifikalar mobilde responsive mi?
- [ ] Tab yapısı mobilde çalışıyor mu?

### Referanslar Sayfası (references.html)
- [ ] Reference slider mobilde çalışıyor mu?
- [ ] Swipe gesture çalışıyor mu?
- [ ] Logo grid mobilde uygun mu?

### Haberler Sayfası (news.html)
- [ ] News grid mobilde 1 sütun mu?
- [ ] News card'lar mobilde tam genişlikte mi?
- [ ] Pagination mobilde çalışıyor mu?

### Haber Detay Sayfası (news-detail.html)
- [ ] Haber içeriği mobilde okunabilir mi?
- [ ] Görseller mobilde responsive mi?
- [ ] Sosyal paylaşım butonları mobilde çalışıyor mu?

### İletişim Sayfası (contact.html)
- [ ] Contact form mobilde tam genişlikte mi?
- [ ] Google Maps mobilde responsive mi?
- [ ] İletişim bilgileri mobilde okunabilir mi?

---

## 🛠️ Test Araçları ve Yöntemleri

### 1. Browser DevTools (Önerilen)

#### Chrome DevTools
1. F12 tuşuna basın
2. Device Toolbar'ı açın (Ctrl+Shift+M)
3. Cihaz seçin veya özel boyut girin
4. Throttling ayarlayın (3G, Slow 3G)

#### Firefox DevTools
1. F12 tuşuna basın
2. Responsive Design Mode (Ctrl+Shift+M)
3. Cihaz seçin

#### Safari (macOS)
1. Develop > Enter Responsive Design Mode
2. Cihaz seçin

### 2. Online Test Araçları

- **BrowserStack** - Gerçek cihazlarda test
- **Responsively** - Tüm cihazları aynı anda göster
- **Google Mobile-Friendly Test** - https://search.google.com/test/mobile-friendly
- **PageSpeed Insights** - https://pagespeed.web.dev/

### 3. Gerçek Cihazlarda Test

#### iOS
- iPhone (Safari)
- iPad (Safari)

#### Android
- Samsung Galaxy (Chrome)
- Google Pixel (Chrome)

---

## 🔍 Test Senaryoları

### Senaryo 1: Küçük Ekran (iPhone SE - 375px)
```
1. Sayfayı aç
2. Logo görünüyor mu? ✓
3. Mobil menü butonu görünüyor mu? ✓
4. Mobil menüyü aç
5. Tüm linkler çalışıyor mu? ✓
6. Sayfayı scroll et
7. Tüm içerik okunabilir mi? ✓
8. WhatsApp butonu görünüyor mu? ✓
9. Footer görünüyor mu? ✓
```

### Senaryo 2: Tablet (iPad - 768px)
```
1. Sayfayı aç
2. Layout tablet için optimize edilmiş mi? ✓
3. Grid'ler 2 sütun mu? ✓
4. Navigasyon çalışıyor mu? ✓
```

### Senaryo 3: Landscape Mode (Yatay Mod)
```
1. Cihazı yatay çevir
2. Layout bozulmuyor mu? ✓
3. Tüm özellikler çalışıyor mu? ✓
```

### Senaryo 4: Touch Interactions
```
1. Butonlara dokun
2. Input alanlarına dokun
3. Swipe gesture (carousel'de)
4. Scroll animasyonları
5. Mobil menü aç/kapa
```

---

## ⚠️ Bilinen Sorunlar ve Çözümleri

### 1. Mobil Menü Açılmıyor
**Sorun:** JavaScript yüklenmeden menü tıklanıyor
**Çözüm:** `js/main.js` dosyasında `DOMContentLoaded` kontrolü var mı?

### 2. Görseller Mobilde Büyük Görünüyor
**Sorun:** `max-width: 100%` uygulanmamış
**Çözüm:** CSS'de img selector'a `max-width: 100%` ekle

### 3. Form Input'lar Küçük
**Sorun:** Font-size 16px'ten küçük (iOS zoom engeli)
**Çözüm:** `min-font-size: 16px` kullan

### 4. WhatsApp Butonu Görünmüyor
**Sorun:** z-index veya positioning sorunu
**Çözüm:** `position: fixed; z-index: 999;` kontrol et

---

## 📊 Test Raporu Şablonu

```
📱 MOBİL UYUMLULUK TEST RAPORU
Tarih: [TARİH]
Test Eden: [İSİM]
Tarayıcı: [BROWSER] [VERSIYON]
Cihaz: [CIHAZ] [ÇÖZÜNÜRLÜK]

GENEL DURUM:
✅ Başarılı
⚠️ Küçük Sorunlar Var
❌ Kritik Sorunlar Var

TEST SONUÇLARI:
[ ] Viewport ve Meta Tags
[ ] Navigation
[ ] Typography
[ ] Images
[ ] Grid Layouts
[ ] Buttons
[ ] Forms
[ ] WhatsApp Button
[ ] Footer
[ ] Performance

SAYFA BAZINDA:
- index.html: [✅/⚠️/❌]
- products.html: [✅/⚠️/❌]
- about.html: [✅/⚠️/❌]
- contact.html: [✅/⚠️/❌]
- ...

BULUNAN SORUNLAR:
1. [SORUN AÇIKLAMASI]
2. [SORUN AÇIKLAMASI]

ÖNERİLER:
1. [ÖNERİ]
2. [ÖNERİ]
```

---

## 🚀 Hızlı Test Komutları

### Google Mobile-Friendly Test
```
Site: https://www.ozay-ambalaj.com
URL: https://search.google.com/test/mobile-friendly?url=https://www.ozay-ambalaj.com
```

### PageSpeed Insights
```
URL: https://pagespeed.web.dev/analysis?url=https://www.ozay-ambalaj.com
```

### Lighthouse (Chrome DevTools)
```
1. F12 > Lighthouse tab
2. Mobile seç
3. Analyze
```

---

## 📝 Test Notları

- **Önemli:** Tüm testler farklı cihazlarda ve tarayıcılarda yapılmalı
- **Önemli:** Hem portrait (dikey) hem landscape (yatay) mod test edilmeli
- **Önemli:** Slow 3G bağlantısında performans test edilmeli
- **Önemli:** Touch event'ler mouse event'lerden farklı davranabilir

---

## ✅ Test Tamamlandığında

1. ✅ Tüm checklist maddeleri kontrol edildi
2. ✅ Test raporu dolduruldu
3. ✅ Bulunan sorunlar düzeltildi
4. ✅ Production'a deploy edilmeye hazır

---

**Son Güncelleme:** 2024
**Versiyon:** 1.0

