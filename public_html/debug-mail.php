<?php
/**
 * Debug Mail Configuration
 * This file helps diagnose mail configuration issues
 * IMPORTANT: Delete this file after debugging!
 */

// Load mail configuration
$mailConfigPath = __DIR__ . '/config/mail-config.php';
$configLoaded = false;
$errors = [];

if (file_exists($mailConfigPath)) {
    try {
        require_once $mailConfigPath;
        $configLoaded = true;
    } catch (Exception $e) {
        $errors[] = 'Config dosyası yüklenirken hata: ' . $e->getMessage();
    }
} else {
    $errors[] = 'mail-config.php dosyası bulunamadı!';
}

?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mail Yapılandırması Debug</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .box {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .success { color: #2d5f3f; background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .error { color: #721c24; background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .warning { color: #856404; background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .info { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 10px 0; }
        h2 { color: #2d5f3f; margin-top: 0; }
        code { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="box">
        <h1>Mail Yapılandırması Debug</h1>
        
        <?php if ($configLoaded): ?>
            <div class="success">
                <strong>✅ Mail yapılandırması yüklendi</strong>
            </div>
            
            <h2>Yapılandırma Bilgileri:</h2>
            <div class="info">
                <p><strong>SMTP Sunucu:</strong> <?php echo defined('SMTP_HOST') ? htmlspecialchars(SMTP_HOST) : 'Tanımlı değil'; ?></p>
                <p><strong>SMTP Port:</strong> <?php echo defined('SMTP_PORT') ? SMTP_PORT : 'Tanımlı değil'; ?></p>
                <p><strong>SMTP Güvenlik:</strong> <?php echo defined('SMTP_SECURE') ? strtoupper(SMTP_SECURE) : 'Tanımlı değil'; ?></p>
                <p><strong>SMTP Kullanıcı:</strong> <?php echo defined('SMTP_USERNAME') ? htmlspecialchars(SMTP_USERNAME) : 'Tanımlı değil'; ?></p>
                <p><strong>SMTP Şifre:</strong> <?php 
                    if (defined('SMTP_PASSWORD')) {
                        if (SMTP_PASSWORD === 'YOUR_MAIL_PASSWORD_HERE') {
                            echo '<span style="color: red;">⚠️ ŞİFRE HENÜZ AYARLANMAMIŞ!</span>';
                        } else {
                            echo '***' . substr(SMTP_PASSWORD, -3) . ' (ayarlanmış)';
                        }
                    } else {
                        echo 'Tanımlı değil';
                    }
                ?></p>
                <p><strong>Mail Alıcı:</strong> <?php echo defined('MAIL_TO_EMAIL') ? htmlspecialchars(MAIL_TO_EMAIL) : 'Tanımlı değil'; ?></p>
                <p><strong>Mail Gönderen:</strong> <?php echo defined('MAIL_FROM_EMAIL') ? htmlspecialchars(MAIL_FROM_EMAIL) : 'Tanımlı değil'; ?></p>
            </div>
            
            <?php if (defined('SMTP_PASSWORD') && SMTP_PASSWORD === 'YOUR_MAIL_PASSWORD_HERE'): ?>
                <div class="error">
                    <strong>❌ ŞİFRE AYARLANMAMIŞ!</strong><br>
                    Lütfen <code>config/mail-config.php</code> veya <code>config/.env</code> dosyasında şifreyi ayarlayın.
                </div>
            <?php endif; ?>
            
            <h2>PHP Mail Fonksiyonu Testi:</h2>
            <?php
            if (function_exists('mail')) {
                echo '<div class="success">✅ mail() fonksiyonu mevcut</div>';
            } else {
                echo '<div class="error">❌ mail() fonksiyonu mevcut değil</div>';
            }
            ?>
            
            <h2>Test Mail Gönder:</h2>
            <form method="POST" action="<?php echo $_SERVER['PHP_SELF']; ?>">
                <button type="submit" name="test_mail" style="padding: 10px 20px; background: #2d5f3f; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Test Mail Gönder
                </button>
            </form>
            
            <?php
            if (isset($_POST['test_mail'])) {
                $testTo = defined('MAIL_TO_EMAIL') ? MAIL_TO_EMAIL : 'info@ozayambalaj.com';
                $testSubject = 'Test Mail - Debug';
                $testBody = 'Bu bir test mailidir.';
                $testHeaders = 'From: ' . (defined('MAIL_FROM_EMAIL') ? MAIL_FROM_EMAIL : 'info@ozayambalaj.com');
                
                $result = @mail($testTo, $testSubject, $testBody, $testHeaders);
                
                if ($result) {
                    echo '<div class="success">✅ Test mail gönderildi! (mail() fonksiyonu true döndü)</div>';
                } else {
                    echo '<div class="error">❌ Test mail gönderilemedi! (mail() fonksiyonu false döndü)</div>';
                    $lastError = error_get_last();
                    if ($lastError) {
                        echo '<div class="warning">Hata: ' . htmlspecialchars($lastError['message']) . '</div>';
                    }
                }
            }
            ?>
            
        <?php else: ?>
            <div class="error">
                <strong>❌ Mail yapılandırması yüklenemedi</strong>
                <?php foreach ($errors as $error): ?>
                    <p><?php echo htmlspecialchars($error); ?></p>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
        
        <div class="warning" style="margin-top: 30px;">
            <strong>⚠️ Güvenlik Uyarısı:</strong><br>
            Bu dosyayı debug sonrası silin! Production ortamında bu dosya bulunmamalıdır.
        </div>
    </div>
</body>
</html>

