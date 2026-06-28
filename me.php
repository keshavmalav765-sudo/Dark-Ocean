<?php
declare(strict_types=1);

require __DIR__ . '/../../lib/bootstrap.php';
require __DIR__ . '/../../lib/response.php';
require __DIR__ . '/../../lib/auth.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    json_response(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

$user = current_user();

json_response(200, [
    'ok' => true,
    'authenticated' => (bool)$user,
    'user' => $user,
]);

