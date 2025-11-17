<?php
/**
 * Öz-Ay Ambalaj ve Plastik - Contact Form Handler
 * 
 * PHP 8.1+ Required
 * Uses PHPMailer for SMTP
 */

// Security headers
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed']);
    exit;
}

// Check if XMLHttpRequest
if (!isset($_SERVER['HTTP_X_REQUESTED_WITH']) || 
    strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) !== 'xmlhttprequest') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Invalid request']);
    exit;
}

// Load configuration
if (!file_exists(__DIR__ . '/config/config.php')) {
    error_log('Contact form error: config.php not found');
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Configuration error']);
    exit;
}

require_once __DIR__ . '/config/config.php';

// Honeypot check (anti-spam)
if (!empty($_POST['website'])) {
    error_log('Contact form: Honeypot triggered from IP: ' . $_SERVER['REMOTE_ADDR']);
    // Return success to fool bots
    echo json_encode(['ok' => true, 'message' => 'Message sent']);
    exit;
}

// Sanitize and validate input
$name = filter_var(trim($_POST['name'] ?? ''), FILTER_SANITIZE_STRING);
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone = filter_var(trim($_POST['phone'] ?? ''), FILTER_SANITIZE_STRING);
$company = filter_var(trim($_POST['company'] ?? ''), FILTER_SANITIZE_STRING);
$subject = filter_var(trim($_POST['subject'] ?? ''), FILTER_SANITIZE_STRING);
$message = filter_var(trim($_POST['message'] ?? ''), FILTER_SANITIZE_STRING);
$kvkk = isset($_POST['kvkk']) && $_POST['kvkk'] === 'on';

// Validation
$errors = [];

if (empty($name) || strlen($name) < 2) {
    $errors[] = 'Name is required and must be at least 2 characters';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Valid email is required';
}

if (empty($message) || strlen($message) < 10) {
    $errors[] = 'Message is required and must be at least 10 characters';
}

if (!$kvkk) {
    $errors[] = 'KVKK consent is required';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// Rate limiting (simple IP-based)
$rateLimit = checkRateLimit($_SERVER['REMOTE_ADDR']);
if (!$rateLimit) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'message' => 'Too many requests. Please try again later.']);
    exit;
}

// Send email using PHPMailer
try {
    // Check if PHPMailer is available
    if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        // Fallback to native mail() if PHPMailer not available
        $to = MAIL_TO_SALES;
        $emailSubject = "İletişim Formu: " . ($subject ?: 'Genel');
        $emailBody = "
İsim: $name
E-posta: $email
Telefon: $phone
Firma: $company
Konu: $subject

Mesaj:
$message

---
IP: {$_SERVER['REMOTE_ADDR']}
Tarih: " . date('Y-m-d H:i:s') . "
        ";
        
        $headers = [
            'From: ' . MAIL_FROM,
            'Reply-To: ' . $email,
            'Content-Type: text/plain; charset=UTF-8',
            'X-Mailer: PHP/' . phpversion()
        ];
        
        $mailSent = mail($to, $emailSubject, $emailBody, implode("\r\n", $headers));
        
        if (!$mailSent) {
            throw new Exception('Failed to send email');
        }
    } else {
        // Use PHPMailer
        require_once __DIR__ . '/vendor/PHPMailer/PHPMailer.php';
        require_once __DIR__ . '/vendor/PHPMailer/SMTP.php';
        require_once __DIR__ . '/vendor/PHPMailer/Exception.php';
        
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_PORT;
        $mail->CharSet = 'UTF-8';
        
        // Recipients
        $mail->setFrom(MAIL_FROM, 'Öz-Ay Ambalaj İletişim Formu');
        $mail->addAddress(MAIL_TO_SALES);
        $mail->addReplyTo($email, $name);
        
        // Content
        $mail->isHTML(false);
        $mail->Subject = "İletişim Formu: " . ($subject ?: 'Genel');
        $mail->Body = "
İsim: $name
E-posta: $email
Telefon: $phone
Firma: $company
Konu: $subject

Mesaj:
$message

---
IP: {$_SERVER['REMOTE_ADDR']}
Tarih: " . date('Y-m-d H:i:s');
        
        $mail->send();
    }
    
    // Log successful submission (with masked PII)
    logSubmission($name, maskEmail($email), $phone, $subject, true);
    
    echo json_encode([
        'ok' => true,
        'message' => 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.'
    ]);
    
} catch (Exception $e) {
    error_log('Contact form error: ' . $e->getMessage());
    logSubmission($name, maskEmail($email), $phone, $subject, false, $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin veya doğrudan bizimle iletişime geçin.'
    ]);
}

/**
 * Simple rate limiting
 */
function checkRateLimit($ip) {
    $limitFile = __DIR__ . '/logs/rate-limit.json';
    $maxRequests = 5; // max requests
    $timeWindow = 3600; // per hour
    
    if (!file_exists(dirname($limitFile))) {
        mkdir(dirname($limitFile), 0755, true);
    }
    
    $data = file_exists($limitFile) ? json_decode(file_get_contents($limitFile), true) : [];
    $now = time();
    
    // Clean old entries
    $data = array_filter($data, function($timestamp) use ($now, $timeWindow) {
        return ($now - $timestamp) < $timeWindow;
    });
    
    // Count requests from this IP
    $ipRequests = array_filter($data, function($timestamp, $key) use ($ip) {
        return strpos($key, $ip) === 0;
    }, ARRAY_FILTER_USE_BOTH);
    
    if (count($ipRequests) >= $maxRequests) {
        return false;
    }
    
    // Add new request
    $data[$ip . '_' . $now] = $now;
    file_put_contents($limitFile, json_encode($data));
    
    return true;
}

/**
 * Mask email for logging
 */
function maskEmail($email) {
    $parts = explode('@', $email);
    if (count($parts) !== 2) return '***';
    
    $name = $parts[0];
    $domain = $parts[1];
    
    $maskedName = substr($name, 0, 2) . str_repeat('*', max(1, strlen($name) - 2));
    return $maskedName . '@' . $domain;
}

/**
 * Log submission
 */
function logSubmission($name, $email, $phone, $subject, $success, $error = '') {
    $logDir = __DIR__ . '/logs';
    if (!file_exists($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/contact-' . date('Ym') . '.log';
    $logEntry = sprintf(
        "[%s] %s | Name: %s | Email: %s | Phone: %s | Subject: %s | Status: %s%s\n",
        date('Y-m-d H:i:s'),
        $_SERVER['REMOTE_ADDR'],
        $name,
        $email,
        $phone ? substr($phone, 0, 3) . '***' . substr($phone, -2) : 'N/A',
        $subject ?: 'General',
        $success ? 'SUCCESS' : 'FAILED',
        $error ? ' | Error: ' . $error : ''
    );
    
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

