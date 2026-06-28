<?php
declare(strict_types=1);

require __DIR__ . '/../../lib/bootstrap.php';
require __DIR__ . '/../../lib/response.php';
require __DIR__ . '/../../lib/db.php';
require __DIR__ . '/../../lib/products.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    json_response(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    json_response(422, ['ok' => false, 'message' => 'Valid product id is required.']);
}

$pdo = db();
$stmt = $pdo->prepare('SELECT * FROM products WHERE id = :id AND is_active = 1 LIMIT 1');
$stmt->execute(['id' => $id]);
$row = $stmt->fetch();

if (!$row) {
    json_response(404, ['ok' => false, 'message' => 'Product not found.']);
}

json_response(200, [
    'ok' => true,
    'product' => normalize_product_row($row),
]);

