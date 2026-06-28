<?php
declare(strict_types=1);

require __DIR__ . '/../../lib/bootstrap.php';
require __DIR__ . '/../../lib/response.php';
require __DIR__ . '/../../lib/db.php';
require __DIR__ . '/../../lib/auth.php';
require __DIR__ . '/../../lib/csrf.php';

if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['POST', 'DELETE'], true)) {
    json_response(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

require_csrf();
require_admin();
$data = request_data();
$id = (int)($data['id'] ?? $_GET['id'] ?? 0);

if ($id <= 0) {
    json_response(422, ['ok' => false, 'message' => 'Valid product id is required.']);
}

$pdo = db();
$stmt = $pdo->prepare('UPDATE products SET is_active = 0 WHERE id = :id');
$stmt->execute(['id' => $id]);

if ($stmt->rowCount() === 0) {
    json_response(404, ['ok' => false, 'message' => 'Product not found.']);
}

json_response(200, [
    'ok' => true,
    'message' => 'Product deleted successfully.',
]);
