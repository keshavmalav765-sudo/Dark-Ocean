<?php
declare(strict_types=1);

require __DIR__ . '/../../lib/bootstrap.php';
require __DIR__ . '/../../lib/response.php';
require __DIR__ . '/../../lib/db.php';
require __DIR__ . '/../../lib/auth.php';
require __DIR__ . '/../../lib/csrf.php';
require __DIR__ . '/../../lib/passwords.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    json_response(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

require_csrf();
$data = request_data();
require_fields($data, ['email', 'password']);

$email = strtolower(trim((string)$data['email']));
$password = trim((string)$data['password']);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(422, ['ok' => false, 'message' => 'Enter a valid email address.']);
}

$pdo = db();
$stmt = $pdo->prepare(
    'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = :email LIMIT 1'
);
$stmt->execute(['email' => $email]);
$userRow = $stmt->fetch();

if (!$userRow || (int)$userRow['is_active'] !== 1) {
    json_response(401, ['ok' => false, 'message' => 'Invalid credentials.']);
}

if (!verify_password_hash($password, (string)$userRow['password_hash'])) {
    json_response(401, ['ok' => false, 'message' => 'Invalid credentials.']);
}

$user = [
    'id' => (int)$userRow['id'],
    'name' => (string)$userRow['name'],
    'email' => (string)$userRow['email'],
    'role' => (string)$userRow['role'],
];

login_user($user);

json_response(200, [
    'ok' => true,
    'message' => 'Logged in successfully.',
    'user' => $user,
]);
