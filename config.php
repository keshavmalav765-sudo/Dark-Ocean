<?php
declare(strict_types=1);

require __DIR__ . '/lib/env.php';
env_bootstrap();

return [
    'app' => [
        'name' => 'Dark Ocean',
        'timezone' => 'Asia/Kolkata',
        'env' => getenv('APP_ENV') ?: 'dev',
    ],
    'db' => [
        'host' => '127.0.0.1',
        'port' => 3306,
        'name' => getenv('DB_NAME') ?: '',
        'user' => getenv('DB_USER') ?: '',
        'password' => getenv('DB_PASSWORD') ?: '',
        'charset' => 'utf8mb4',
    ],
    'security' => [
        'cors_allowed_origins' => array_values(array_filter(array_map('trim', explode(',', (string)(getenv('CORS_ALLOWED_ORIGINS') ?: ''))))),
        'cookie_secure' => strtolower((string)(getenv('COOKIE_SECURE') ?: '')) === 'true',
    ],
];
