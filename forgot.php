<?php
declare(strict_types=1);

require __DIR__ . '/../../lib/bootstrap.php';
require __DIR__ . '/../../lib/response.php';
require __DIR__ . '/../../lib/db.php';
require __DIR__ . '/../../lib/csrf.php';
require __DIR__ . '/../../lib/passwords.php';

// Production-safe password reset flow:
// 1) POST { email } -> returns ok (and token only in dev).
// 2) POST { token, newPassword } -> resets password.
//
// This endpoint supports both steps via an "action" field:
// - action=request  (default)
// - action=confirm

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    json_response(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

require_csrf();
$config = require __DIR__ . '/../../config.php';
$env = (string)($config['app']['env'] ?? 'dev');

$data = request_data();
$action = strtolower(trim((string)($data['action'] ?? 'request')));
$pdo = db();

if ($action === 'confirm') {
    require_fields($data, ['token', 'newPassword']);
    $token = trim((string)$data['token']);
    $newPassword = trim((string)$data['newPassword']);

    if (strlen($token) < 20) {
        json_response(422, ['ok' => false, 'message' => 'Valid reset token is required.']);
    }
    if (strlen($newPassword) < 8) {
        json_response(422, ['ok' => false, 'message' => 'Password should be at least 8 characters.']);
    }

    $tokenHash = hash('sha256', $token);
    $stmt = $pdo->prepare(
        'SELECT pr.id, pr.user_id
         FROM password_resets pr
         WHERE pr.token_hash = :token_hash AND pr.used_at IS NULL AND pr.expires_at > NOW()
         ORDER BY pr.id DESC
         LIMIT 1'
    );
    $stmt->execute(['token_hash' => $tokenHash]);
    $row = $stmt->fetch();

    if (!$row) {
        json_response(400, ['ok' => false, 'message' => 'Reset token is invalid or expired.']);
    }

    $pdo->beginTransaction();
    try {
        $updateUser = $pdo->prepare('UPDATE users SET password_hash = :hash WHERE id = :id AND is_active = 1');
        $updateUser->execute([
            'hash' => make_password_hash($newPassword),
            'id' => (int)$row['user_id'],
        ]);

        $markUsed = $pdo->prepare('UPDATE password_resets SET used_at = NOW() WHERE id = :id');
        $markUsed->execute(['id' => (int)$row['id']]);

        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        json_response(500, ['ok' => false, 'message' => 'Password reset failed.']);
    }

    json_response(200, [
        'ok' => true,
        'message' => 'Password updated successfully.',
    ]);
}

// action=request
require_fields($data, ['email']);
$email = strtolower(trim((string)$data['email']));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(422, ['ok' => false, 'message' => 'Enter a valid email address.']);
}

$findUser = $pdo->prepare('SELECT id FROM users WHERE email = :email AND is_active = 1 LIMIT 1');
$findUser->execute(['email' => $email]);
$user = $findUser->fetch();

// Always return a generic success response to avoid account enumeration.
$token = bin2hex(random_bytes(32));

if ($user) {
    $tokenHash = hash('sha256', $token);
    $expiresAt = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->modify('+30 minutes')->format('Y-m-d H:i:s');
    $insert = $pdo->prepare(
        'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (:user_id, :token_hash, :expires_at)'
    );
    $insert->execute([
        'user_id' => (int)$user['id'],
        'token_hash' => $tokenHash,
        'expires_at' => $expiresAt,
    ]);
}

$payload = [
    'ok' => true,
    'message' => 'If an account exists for this email, a reset link will be sent.',
];

// Dev convenience only: expose token so you can complete the flow without email integration.
if ($env !== 'prod') {
    $payload['devOnlyToken'] = $token;
}

json_response(200, $payload);

