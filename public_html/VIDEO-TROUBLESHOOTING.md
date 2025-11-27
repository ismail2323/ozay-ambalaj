# Video Streaming Sorunları - Çözümler

## Sorun
cloudflared ücretsiz versiyonunda büyük video dosyaları için streaming limitleri var. Bu yüzden video yüklenirken "stream canceled" hataları görülebilir.

## Çözümler

### 1. Video Dosyasını Optimize Et
- Video dosyasını sıkıştırın (daha küçük boyut)
- Video codec'ini optimize edin (H.264)
- Video çözünürlüğünü düşürün (720p veya 480p)

### 2. Video'yu YouTube'a Yükleyip Embed Et
- Video'yu YouTube'a yükleyin
- YouTube embed kodu kullanın
- Daha güvenilir ve hızlı yükleme

### 3. Video'yu Mobilde Gizle
- Mobilde video yerine statik görsel kullanın
- Daha hızlı yükleme

### 4. Video için Lazy Loading
- Video'yu sayfa yüklendikten sonra yükleyin
- İlk yükleme daha hızlı olur

## Mevcut Durum
- Video hata yönetimi eklendi
- Video otomatik olarak retry yapıyor
- Hata durumunda video section gizleniyor

