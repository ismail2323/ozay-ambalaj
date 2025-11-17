<?php
/**
 * Öz-Ay Ambalaj ve Plastik - Configuration
 * 
 * IMPORTANT: This file contains sensitive information.
 * Make sure it's protected by .htaccess and never committed to public repos.
 */

// SMTP Configuration
define('SMTP_HOST', 'mail.ozay-ambalaj.com'); // Your SMTP server
define('SMTP_PORT', 587); // TLS port (or 465 for SSL)
define('SMTP_USER', 'info@ozay-ambalaj.com'); // SMTP username
define('SMTP_PASS', 'YOUR_SMTP_PASSWORD_HERE'); // SMTP password

// Email Recipients
define('MAIL_TO_SALES', 'info@ozay-ambalaj.com'); // Sales inquiries
define('MAIL_TO_HR', 'hr@ozay-ambalaj.com'); // HR applications
define('MAIL_FROM', 'noreply@ozay-ambalaj.com'); // From address

// Site Configuration
define('SITE_NAME', 'Öz-Ay Ambalaj ve Plastik');
// XAMPP Local Development
define('SITE_URL', (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . '/ozay-ambalaj/public_html');

// Security
define('RECAPTCHA_SITE_KEY', ''); // Optional: Add your reCAPTCHA site key
define('RECAPTCHA_SECRET_KEY', ''); // Optional: Add your reCAPTCHA secret key

// Logging
define('LOG_ENABLED', true);
define('LOG_PATH', __DIR__ . '/../logs/');

// Error Reporting (set to 0 in production)
error_reporting(E_ALL);
ini_set('display_errors', '0'); // Never display errors in production
ini_set('log_errors', '1');
ini_set('error_log', LOG_PATH . 'php-errors.log');

