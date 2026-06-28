<?php
declare(strict_types=1);

function make_password_hash(string $plainPassword): string
{
    return password_hash($plainPassword, PASSWORD_BCRYPT);
}

function verify_password_hash(string $plainPassword, string $storedHash): bool
{
    if (strpos($storedHash, '$2y$') === 0 || strpos($storedHash, '$2a$') === 0 || strpos($storedHash, '$2b$') === 0) {
        return password_verify($plainPassword, $storedHash);
    }

    if (strpos($storedHash, 'sha256$') === 0) {
        $expected = substr($storedHash, 7);
        return hash_equals($expected, hash('sha256', $plainPassword));
    }

    return false;
}
