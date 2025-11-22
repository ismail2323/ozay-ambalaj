<?php
/**
 * Mail Configuration - EXAMPLE FILE
 * 
 * IMPORTANT: 
 * 1. Copy this file to mail-config.php
 * 2. Replace YOUR_MAIL_PASSWORD_HERE with your actual mail password
 * 3. Never commit mail-config.php to version control!
 */

// SMTP Configuration for Outlook Mail
define('SMTP_HOST', 'smtp.turkticaret.net');
define('SMTP_PORT', 587); // TLS/STARTTLS - Alternative: 465 for SSL
define('SMTP_SECURE', 'tls'); // 'tls' for TLS/STARTTLS or 'ssl' for SSL (port 465)
define('SMTP_AUTH', true);
define('SMTP_USERNAME', 'info@ozayambalaj.com');
// IMPORTANT: Replace with your actual mail password
define('SMTP_PASSWORD', 'OzAy!2025#Kutu'); // Change this!

// Mail Settings
define('MAIL_FROM_EMAIL', 'info@ozayambalaj.com');
define('MAIL_FROM_NAME', 'Öz-Ay Ambalaj ve Plastik');
define('MAIL_TO_EMAIL', 'info@ozayambalaj.com');
define('MAIL_TO_NAME', 'Öz-Ay Ambalaj');

// Debug Settings (set to false in production)
define('SMTP_DEBUG', false);

