<?php
declare(strict_types=1);

require __DIR__ . '/../../lib/bootstrap.php';
require __DIR__ . '/../../lib/response.php';
require __DIR__ . '/../../lib/db.php';
require __DIR__ . '/../../lib/products.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    json_response(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

$category = strtolower(trim((string)($_GET['category'] ?? '')));
$search = trim((string)($_GET['search'] ?? ''));

$pdo = db();
$sql = 'SELECT * FROM products WHERE is_active = 1';
$params = [];

if ($category !== '') {
    $sql .= ' AND category = :category';
    $params['category'] = $category;
}

if ($search !== '') {
    $sql .= ' AND (name LIKE :search OR description LIKE :search OR category LIKE :search)';
    $params['search'] = '%' . $search . '%';
}

$sql .= ' ORDER BY id DESC';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

$products = array_map('normalize_product_row', $rows);

json_response(200, [
    'ok' => true,
    'count' => count($products),
    'products' => $products,
]);

