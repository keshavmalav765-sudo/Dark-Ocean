<?php
declare(strict_types=1);

function current_user(): ?array
{
    if (!isset($_SESSION['user']) || !is_array($_SESSION['user'])) {
        return null;
    }
    return $_SESSION['user'];
}

function login_user(array $user): void
{
    $_SESSION['user'] = [
        'id' => (int)$user['id'],
        'name' => (string)$user['name'],
        'email' => (string)$user['email'],
        'role' => (string)$user['role'],
    ];
}

function logout_user(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], (bool)$params['secure'], (bool)$params['httponly']);
    }
    session_destroy();
}

function require_auth(): array
{
    $user = current_user();
    if (!$user) {
        json_response(401, [
            'ok' => false,
            'message' => 'Authentication required.',
        ]);
    }
    return $user;
}

function require_admin(): array
{
    $user = require_auth();
    if (($user['role'] ?? 'user') !== 'admin') {
        json_response(403, [
            'ok' => false,
            'message' => 'Admin access required.',
        ]);
    }
    return $user;
}

