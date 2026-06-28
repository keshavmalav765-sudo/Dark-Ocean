<?php
declare(strict_types=1);

$config = require __DIR__ . '/../config.php';
date_default_timezone_set($config['app']['timezone'] ?? 'UTC');

if (session_status() === PHP_SESSION_NONE) {
    $secureCookie = (bool)($config['security']['cookie_secure'] ?? false);
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secureCookie,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');

// CORS: For production deployments, serve frontend + backend on the same origin.
// If you must call APIs cross-origin (e.g. separate domains), set CORS_ALLOWED_ORIGINS env var.
$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
$allowedOrigins = $config['security']['cors_allowed_origins'] ?? [];
if ($origin !== '') {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = (string)($_SERVER['HTTP_HOST'] ?? '');
    $selfOrigin = $host !== '' ? "{$scheme}://{$host}" : '';

    $isSameOrigin = $selfOrigin !== '' && hash_equals($selfOrigin, $origin);
    $isAllowlisted = is_array($allowedOrigins) && in_array($origin, $allowedOrigins, true);
    $isAllowed = $isSameOrigin || $isAllowlisted;
    if (!$isAllowed) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo '{"ok":false,"message":"Origin not allowed."}';
        exit;
    }

    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
