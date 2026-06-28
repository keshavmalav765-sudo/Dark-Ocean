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
require_fields($data, ['name', 'email', 'password']);

$name = trim((string)$data['name']);
$email = strtolower(trim((string)$data['email']));
$password = trim((string)$data['password']);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(422, ['ok' => false, 'message' => 'Enter a valid email address.']);
}

if (strlen($name) < 2) {
    json_response(422, ['ok' => false, 'message' => 'Name should be at least 2 characters.']);
}

if (strlen($password) < 8) {
    json_response(422, ['ok' => false, 'message' => 'Password should be at least 8 characters.']);
}

$pdo = db();
$findStmt = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
$findStmt->execute(['email' => $email]);
if ($findStmt->fetch()) {
    json_response(409, ['ok' => false, 'message' => 'Email already registered.']);
}

$insertStmt = $pdo->prepare(
    'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (:name, :email, :password_hash, :role, :is_active)'
);
$insertStmt->execute([
    'name' => $name,
    'email' => $email,
    'password_hash' => make_password_hash($password),
    'role' => 'user',
    'is_active' => 1,
]);

$userId = (int)$pdo->lastInsertId();
$user = [
    'id' => $userId,
    'name' => $name,
    'email' => $email,
    'role' => 'user',
];

login_user($user);

json_response(201, [
    'ok' => true,
    'message' => 'Account created successfully.',
    'user' => $user,
]);
