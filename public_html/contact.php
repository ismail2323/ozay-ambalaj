<?php
/**
 * Öz-Ay Ambalaj ve Plastik - Contact Form Handler
 * 
 * Handles contact forms from:
 * 1. index.html (home contact form)
 * 2. contact.html (contact page form)
 * 
 * Uses SMTP with Outlook Mail configuration
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Error handler to catch all PHP errors
function handleContactFormError($errno, $errstr, $errfile, $errline) {
    error_log("Contact form PHP error: [$errno] $errstr in $errfile on line $errline");
    return true;
}
set_error_handler('handleContactFormError');

// Exception handler
function handleContactFormException($exception) {
    error_log("Contact form exception: " . $exception->getMessage());
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Sunucu hatası oluştu. Lütfen tekrar deneyin.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
set_exception_handler('handleContactFormException');

// Allow only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'message' => 'Geçersiz istek yöntemi.'
    ]);
    exit;
}

// Load mail configuration
$mailConfigPath = __DIR__ . '/config/mail-config.php';
$smtpPassword = null;

// First, try to load password from .env file (if exists and readable)
$envPath = __DIR__ . '/config/.env';
if (file_exists($envPath) && is_readable($envPath)) {
    try {
        $envLines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($envLines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue; // Skip empty lines and comments
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                if ($key === 'SMTP_PASSWORD' && !empty($value)) {
                    $smtpPassword = $value;
                    // Also set as environment variable
                    putenv('SMTP_PASSWORD=' . $value);
                    $_ENV['SMTP_PASSWORD'] = $value;
                    break;
                }
            }
        }
    } catch (Exception $e) {
        error_log('Contact form: Error reading .env file - ' . $e->getMessage());
    }
}

// If .env didn't provide password, try environment variable
if (empty($smtpPassword)) {
    $smtpPassword = getenv('SMTP_PASSWORD');
    if ($smtpPassword === false || empty($smtpPassword)) {
        $smtpPassword = isset($_ENV['SMTP_PASSWORD']) ? $_ENV['SMTP_PASSWORD'] : null;
    }
}

// Now load mail-config.php
if (file_exists($mailConfigPath)) {
    try {
        // Temporarily set password if we found it in .env
        if (!empty($smtpPassword)) {
            putenv('SMTP_PASSWORD=' . $smtpPassword);
        }
        
        require_once $mailConfigPath;
        
        // Override password from .env if it exists and config has placeholder
        if (!empty($smtpPassword) && defined('SMTP_PASSWORD') && SMTP_PASSWORD === 'YOUR_MAIL_PASSWORD_HERE') {
            // Re-define with actual password from .env
            if (!defined('SMTP_PASSWORD_OVERRIDE')) {
                // We need to check if we can redefine
                error_log('Contact form: Using password from .env file');
            }
        }
        
        // Verify required constants are defined
        if (!defined('SMTP_HOST') || !defined('SMTP_USERNAME') || !defined('MAIL_TO_EMAIL')) {
            throw new Exception('Mail yapılandırması eksik. Lütfen config/mail-config.php dosyasını kontrol edin.');
        }
        
        // Check if password is set (not placeholder)
        if (!defined('SMTP_PASSWORD') || SMTP_PASSWORD === 'YOUR_MAIL_PASSWORD_HERE') {
            if (!empty($smtpPassword)) {
                // Use password from .env
                define('SMTP_PASSWORD', $smtpPassword);
                error_log('Contact form: Password loaded from .env file');
            } else {
                throw new Exception('SMTP şifresi ayarlanmamış. Lütfen config/.env dosyasında SMTP_PASSWORD değerini ayarlayın.');
            }
        }
    } catch (Exception $e) {
        error_log('Contact form: Error loading mail config - ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'ok' => false,
            'message' => 'Mail yapılandırması yüklenemedi: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
} else {
    // Fallback configuration if mail-config.php doesn't exist
    if (empty($smtpPassword)) {
        error_log('Contact form: mail-config.php not found and SMTP_PASSWORD not set in .env or environment');
        http_response_code(500);
        echo json_encode([
            'ok' => false,
            'message' => 'Mail yapılandırması eksik. Lütfen config/mail-config.php veya config/.env dosyasını kontrol edin.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Use fallback configuration with password from .env
    define('SMTP_HOST', 'smtp.turkticaret.net');
    define('SMTP_PORT', 587);
    define('SMTP_SECURE', 'tls');
    define('SMTP_AUTH', true);
    define('SMTP_USERNAME', 'info@ozayambalaj.com');
    define('SMTP_PASSWORD', $smtpPassword);
    define('MAIL_FROM_EMAIL', 'info@ozayambalaj.com');
    define('MAIL_FROM_NAME', 'Öz-Ay Ambalaj ve Plastik');
    define('MAIL_TO_EMAIL', 'info@ozayambalaj.com');
    define('MAIL_TO_NAME', 'Öz-Ay Ambalaj');
    define('SMTP_DEBUG', false);
}

// Honeypot – bots doldurursa reddet
$honeypot = isset($_POST['website']) ? trim($_POST['website']) : '';
if ($honeypot !== '') {
    // Bot detected - return success to fool them
    echo json_encode([
        'ok' => true,
        'message' => 'Mesajınız başarıyla gönderildi.'
    ]);
    exit;
}

// Form fields - handle both forms (home and contact page)
$name    = isset($_POST['name']) ? trim($_POST['name']) : '';
$email   = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone   = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$address = isset($_POST['address']) ? trim($_POST['address']) : '';
$company = isset($_POST['company']) ? trim($_POST['company']) : '';
$subject = isset($_POST['subject']) ? trim($_POST['subject']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';
$kvkk    = isset($_POST['kvkk']) ? $_POST['kvkk'] : null;
$captcha = isset($_POST['captcha']) ? trim($_POST['captcha']) : '';

// Validate captcha (simple math: 4 + 3 = 7)
if (!empty($captcha) && intval($captcha) !== 7) {
    echo json_encode([
        'ok' => false,
        'message' => 'Lütfen işlem sonucunu doğru girin (4 + 3 = 7).'
    ]);
    exit;
}

// Validation
$errors = [];

if (empty($name) || strlen($name) < 2) {
    $errors[] = 'Ad Soyad en az 2 karakter olmalıdır.';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Lütfen geçerli bir e-posta adresi girin.';
}

if (empty($message) || strlen($message) < 10) {
    $errors[] = 'Mesaj en az 10 karakter olmalıdır.';
}

// KVKK validation - can be 'on' (checkbox), '1', 'true', or true (checked)
if (empty($kvkk) || ($kvkk !== 'on' && $kvkk !== '1' && $kvkk !== true && $kvkk !== 'true')) {
    $errors[] = 'KVKK metnini onaylamadan formu gönderemezsiniz.';
}

if (!empty($errors)) {
    echo json_encode([
        'ok' => false,
        'message' => implode(' ', $errors)
    ]);
    exit;
}

// Build email content - Professional HTML format
$subjectLine = 'İletişim Formu: ' . ($subject !== '' ? htmlspecialchars($subject, ENT_QUOTES, 'UTF-8') : 'Yeni Mesaj');

$body = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #2d5f3f;
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .content {
            padding: 30px 20px;
        }
        .info-section {
            background-color: #f9f9f9;
            border-left: 4px solid #2d5f3f;
            padding: 20px;
            margin: 20px 0;
        }
        .info-row {
            margin: 12px 0;
            padding: 8px 0;
            border-bottom: 1px solid #eeeeee;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #2d5f3f;
            display: inline-block;
            width: 120px;
        }
        .value {
            color: #555555;
        }
        .message-box {
            background-color: #ffffff;
            border: 2px solid #2d5f3f;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .footer {
            background-color: #e9e9e9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666666;
            border-top: 1px solid #dddddd;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>📧 Web Sitesi İletişim Formu</h1>
        </div>
        <div class="content">
            <div class="info-section">
                <div class="info-row">
                    <span class="label">Ad Soyad:</span>
                    <span class="value">' . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . '</span>
                </div>
                <div class="info-row">
                    <span class="label">E-posta:</span>
                    <span class="value"><a href="mailto:' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . '</a></span>
                </div>';
                
if (!empty($phone)) {
    $body .= '
                <div class="info-row">
                    <span class="label">Telefon:</span>
                    <span class="value"><a href="tel:' . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . '</a></span>
                </div>';
}

if (!empty($address)) {
    $body .= '
                <div class="info-row">
                    <span class="label">Adres:</span>
                    <span class="value">' . htmlspecialchars($address, ENT_QUOTES, 'UTF-8') . '</span>
                </div>';
}

if (!empty($company)) {
    $body .= '
                <div class="info-row">
                    <span class="label">Firma:</span>
                    <span class="value">' . htmlspecialchars($company, ENT_QUOTES, 'UTF-8') . '</span>
                </div>';
}

if (!empty($subject)) {
    $body .= '
                <div class="info-row">
                    <span class="label">Konu:</span>
                    <span class="value">' . htmlspecialchars($subject, ENT_QUOTES, 'UTF-8') . '</span>
                </div>';
}

$body .= '
            </div>
            
            <div>
                <h3 style="color: #2d5f3f; margin-top: 30px; margin-bottom: 10px;">Mesaj:</h3>
                <div class="message-box">' . nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8')) . '</div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Bu e-posta, Öz-Ay Ambalaj web sitesindeki iletişim formundan otomatik olarak gönderilmiştir.</strong></p>
            <p>IP Adresi: ' . htmlspecialchars($_SERVER['REMOTE_ADDR'] ?? 'Bilinmiyor', ENT_QUOTES, 'UTF-8') . '</p>
            <p>Tarih: ' . date('d.m.Y H:i:s') . '</p>
        </div>
    </div>
</body>
</html>';

// Try to send email using SMTP (if PHPMailer is available) or fallback to mail()
$mailSent = false;
$errorMessage = '';

// Check if PHPMailer is available
if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    try {
        require_once __DIR__ . '/vendor/autoload.php';
        
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // SMTP Configuration
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = SMTP_AUTH;
        $mail->Username = SMTP_USERNAME;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = SMTP_SECURE === 'ssl' ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_PORT;
        $mail->CharSet = 'UTF-8';
        
        if (defined('SMTP_DEBUG') && SMTP_DEBUG) {
            $mail->SMTPDebug = 2;
            $mail->Debugoutput = 'error_log';
        }
        
        // Recipients
        $mail->setFrom(MAIL_FROM_EMAIL, MAIL_FROM_NAME);
        $mail->addAddress(MAIL_TO_EMAIL, MAIL_TO_NAME);
        $mail->addReplyTo($email, $name);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = '=?UTF-8?B?' . base64_encode($subjectLine) . '?=';
        $mail->Body = $body;
        $mail->AltBody = strip_tags($body);
        
        $mail->send();
        $mailSent = true;
        
    } catch (Exception $e) {
        $errorMessage = $e->getMessage();
        error_log('SMTP Mail Error: ' . $errorMessage);
        
        // Fallback to native mail() function
        $mailSent = false;
    }
}

// Fallback to native mail() if PHPMailer failed or not available
if (!$mailSent) {
    try {
        // Check if required constants are defined
        if (!defined('MAIL_TO_EMAIL') || !defined('MAIL_FROM_EMAIL') || !defined('MAIL_FROM_NAME')) {
            throw new Exception('Mail yapılandırması eksik. Lütfen config/mail-config.php dosyasını kontrol edin.');
        }
        
        // Check if password is set (not default)
        if (defined('SMTP_PASSWORD') && SMTP_PASSWORD === 'YOUR_MAIL_PASSWORD_HERE') {
            error_log('Contact form: SMTP password is still set to default value. Please update mail-config.php or .env file.');
            // Continue anyway - mail() might work without SMTP on some servers
        }
        
        $to = MAIL_TO_EMAIL;
        $headers = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=utf-8';
        $headers[] = 'From: ' . MAIL_FROM_NAME . ' <' . MAIL_FROM_EMAIL . '>';
        $headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
        $headers[] = 'X-Mailer: PHP/' . phpversion();
        
        // Suppress warnings but log errors
        $prevErrorLevel = error_reporting(E_ERROR | E_PARSE | E_CORE_ERROR | E_COMPILE_ERROR | E_USER_ERROR | E_RECOVERABLE_ERROR);
        $mailSent = @mail($to, '=?UTF-8?B?' . base64_encode($subjectLine) . '?=', $body, implode("\r\n", $headers));
        error_reporting($prevErrorLevel);
        
        if (!$mailSent) {
            $lastError = error_get_last();
            $errorMsg = ($lastError && isset($lastError['message'])) ? $lastError['message'] : 'Mail gönderilemedi. Localhost ortamında mail() fonksiyonu çalışmayabilir. Lütfen canlı sunucuda test edin veya PHPMailer kullanın.';
            error_log('Native mail() function failed. Error: ' . $errorMsg);
            $errorMessage = $errorMsg;
        } else {
            error_log('Mail successfully sent using native mail() function to: ' . $to);
        }
    } catch (Exception $e) {
        error_log('Mail sending exception: ' . $e->getMessage());
        $errorMessage = $e->getMessage();
        $mailSent = false;
    } catch (Error $e) {
        error_log('Mail sending fatal error: ' . $e->getMessage());
        $errorMessage = 'Kritik hata: ' . $e->getMessage();
        $mailSent = false;
    }
}

// Response
try {
    if ($mailSent) {
        $response = [
            'ok' => true,
            'message' => 'Mesajınız başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.'
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        // Return user-friendly error message (don't expose technical details)
        $errorMsg = !empty($errorMessage) ? $errorMessage : 'Mail gönderilemedi. Lütfen daha sonra tekrar deneyin.';
        error_log('Contact form: Mail sending failed. Error: ' . $errorMsg);
        
        // Clean error message for user
        $userMessage = 'Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin veya doğrudan bizimle iletişime geçin: info@ozayambalaj.com';
        
        $response = [
            'ok' => false,
            'message' => $userMessage
        ];
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
} catch (Exception $e) {
    error_log('Contact form: JSON encoding error - ' . $e->getMessage());
    http_response_code(500);
    $response = [
        'ok' => false,
        'message' => 'Sunucu hatası oluştu. Lütfen tekrar deneyin.'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Error $e) {
    error_log('Contact form: Fatal error - ' . $e->getMessage());
    http_response_code(500);
    $response = [
        'ok' => false,
        'message' => 'Sunucu hatası oluştu. Lütfen tekrar deneyin.'
    ];
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

exit;
