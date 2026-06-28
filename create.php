<?php
declare(strict_types=1);

require __DIR__ . '/../../lib/bootstrap.php';
require __DIR__ . '/../../lib/response.php';
require __DIR__ . '/../../lib/db.php';
require __DIR__ . '/../../lib/auth.php';
require __DIR__ . '/../../lib/csrf.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    json_response(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

require_csrf();
require_admin();
$data = request_data();
require_fields($data, ['name', 'category', 'price', 'description', 'image']);

$name = trim((string)$data['name']);
$category = strtolower(trim((string)$data['category']));
$price = (float)$data['price'];
$badge = trim((string)($data['badge'] ?? ''));
$description = trim((string)$data['description']);
$image = trim((string)$data['image']);
$sku = strtoupper(trim((string)($data['sku'] ?? '')));
if ($sku === '') {
    $prefix = strtoupper(substr($category, 0, 3));
    $sku = "DO-{$prefix}-" . (string)time() . "-" . (string)random_int(100, 999);
}

if ($price <= 0) {
    json_response(422, ['ok' => false, 'message' => 'Price must be greater than 0.']);
}

$gallery = isset($data['gallery']) && is_array($data['gallery']) ? $data['gallery'] : [];
$colors = isset($data['colors']) && is_array($data['colors']) ? $data['colors'] : [];
$materials = isset($data['materials']) && is_array($data['materials']) ? $data['materials'] : [];
$stockBySize = isset($data['stockBySize']) && is_array($data['stockBySize']) ? $data['stockBySize'] : [];

$pdo = db();
$stmt = $pdo->prepare(
    'INSERT INTO products
    (name, category, price, badge, description, image, gallery_json, rating, reviews_count, fabric, care, fit, model_info, sku, colors_json, materials_json, stock_by_size_json, is_active)
    VALUES
    (:name, :category, :price, :badge, :description, :image, :gallery_json, :rating, :reviews_count, :fabric, :care, :fit, :model_info, :sku, :colors_json, :materials_json, :stock_by_size_json, :is_active)'
);

$stmt->execute([
    'name' => $name,
    'category' => $category,
    'price' => $price,
    'badge' => $badge !== '' ? $badge : null,
    'description' => $description,
    'image' => $image,
    'gallery_json' => json_encode($gallery, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    'rating' => (float)($data['rating'] ?? 4.5),
    'reviews_count' => (int)($data['reviewsCount'] ?? 0),
    'fabric' => trim((string)($data['fabric'] ?? '')),
    'care' => trim((string)($data['care'] ?? '')),
    'fit' => trim((string)($data['fit'] ?? '')),
    'model_info' => trim((string)($data['modelInfo'] ?? '')),
    'sku' => $sku,
    'colors_json' => json_encode($colors, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    'materials_json' => json_encode($materials, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    'stock_by_size_json' => json_encode($stockBySize, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    'is_active' => 1,
]);

json_response(201, [
    'ok' => true,
    'message' => 'Product created successfully.',
    'id' => (int)$pdo->lastInsertId(),
]);
