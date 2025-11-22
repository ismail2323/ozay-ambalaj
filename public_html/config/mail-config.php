<?php
/**
 * Mail Configuration
 * IMPORTANT: This file contains sensitive information. 
 * Make sure it's not accessible via web browser (.htaccess rules should protect it)
 * 
 * This file should NOT be committed to version control!
 * Use mail-config.example.php as a template.
 */

// Try to get password from environment variable first (more secure)
$smtpPassword = getenv('SMTP_PASSWORD');

// If not found in environment, try to load from .env file
if ($smtpPassword === false || $smtpPassword === '' || empty($smtpPassword)) {
    $envPath = __DIR__ . '/.env';
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
            error_log('mail-config.php: Error reading .env file - ' . $e->getMessage());
        }
    }
}

// SMTP Configuration for Outlook Mail
define('SMTP_HOST', 'smtp.turkticaret.net');
define('SMTP_PORT', 587); // TLS/STARTTLS - Alternative: 465 for SSL
define('SMTP_SECURE', 'tls'); // 'tls' for TLS/STARTTLS or 'ssl' for SSL (port 465)
define('SMTP_AUTH', true);
define('SMTP_USERNAME', 'info@ozayambalaj.com');

// Use password from environment/.env if available, otherwise use fallback
if ($smtpPassword !== false && $smtpPassword !== '' && $smtpPassword !== 'YOUR_MAIL_PASSWORD_HERE' && !empty($smtpPassword)) {
    define('SMTP_PASSWORD', $smtpPassword);
    error_log('mail-config.php: Password loaded from .env or environment variable');
} else {
    // IMPORTANT: Replace YOUR_MAIL_PASSWORD_HERE with your actual password!
    // Or set SMTP_PASSWORD environment variable
    // Or create .env file with SMTP_PASSWORD=your_password
    // Password will be loaded from .env by contact.php if not set here
    define('SMTP_PASSWORD', 'YOUR_MAIL_PASSWORD_HERE'); // Will be overridden by contact.php if .env exists
}

// Mail Settings
define('MAIL_FROM_EMAIL', 'info@ozayambalaj.com');
define('MAIL_FROM_NAME', 'Öz-Ay Ambalaj ve Plastik');
define('MAIL_TO_EMAIL', 'info@ozayambalaj.com');
define('MAIL_TO_NAME', 'Öz-Ay Ambalaj');

// Debug Settings (set to false in production)
define('SMTP_DEBUG', false);

