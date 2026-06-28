<?php
declare(strict_types=1);

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = require __DIR__ . '/../config.php';
    $db = $config['db'];
    $env = (string)($config['app']['env'] ?? 'dev');

    foreach (['name', 'user'] as $required) {
        if (empty($db[$required])) {
            $message = "Database config missing: {$required}. Set DB_NAME/DB_USER in .env or environment.";
            if ($env === 'prod') {
                throw new RuntimeException($message);
            }
            throw new RuntimeException($message);
        }
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $db['host'],
        (int)$db['port'],
        $db['name'],
        $db['charset']
    );

    $pdo = new PDO($dsn, $db['user'], $db['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}
