<?php
declare(strict_types=1);

if (!function_exists('env_load')) {
    function env_load(string $path): void
    {
        if (!is_file($path)) {
            return;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES);
        if (!is_array($lines)) {
            return;
        }

        foreach ($lines as $line) {
            $line = trim((string)$line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            $pos = strpos($line, '=');
            if ($pos === false) {
                continue;
            }

            $key = trim(substr($line, 0, $pos));
            $value = trim(substr($line, $pos + 1));

            if ($key === '') {
                continue;
            }

            if (
                (str_starts_with($value, '"') && str_ends_with($value, '"')) ||
                (str_starts_with($value, "'") && str_ends_with($value, "'"))
            ) {
                $value = substr($value, 1, -1);
            }

            if (getenv($key) !== false) {
                continue;
            }

            putenv("{$key}={$value}");
            $_ENV[$key] = $value;
        }
    }
}

if (!function_exists('env_bootstrap')) {
    function env_bootstrap(): void
    {
        static $bootstrapped = false;

        if ($bootstrapped) {
            return;
        }

        $bootstrapped = true;

        env_load(__DIR__ . '/../../.env');
        env_load(__DIR__ . '/../.env');
    }
}