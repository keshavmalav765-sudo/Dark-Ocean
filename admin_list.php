<?php
declare(strict_types=1);

require __DIR__ . '/../../lib/bootstrap.php';
require __DIR__ . '/../../lib/response.php';
require __DIR__ . '/../../lib/db.php';
require __DIR__ . '/../../lib/auth.php';

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    json_response(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

require_admin();
$pdo = db();

$ordersStmt = $pdo->query('SELECT * FROM orders ORDER BY id DESC LIMIT 200');
$orders = $ordersStmt->fetchAll();

$out = [];
foreach ($orders as $order) {
    $itemsStmt = $pdo->prepare('SELECT product_id, product_name, size, quantity, unit_price FROM order_items WHERE order_id = :order_id');
    $itemsStmt->execute(['order_id' => (int)$order['id']]);
    $items = $itemsStmt->fetchAll();

    $shipping = json_decode((string)$order['shipping_json'], true);
    $timeline = json_decode((string)($order['timeline_json'] ?? '[]'), true);

    $out[] = [
        'id' => (string)$order['order_code'],
        'dbId' => (int)$order['id'],
        'status' => (string)$order['status'],
        'createdAt' => (string)$order['created_at'],
        'total' => (float)$order['total_amount'],
        'itemCount' => count($items),
        'items' => array_map(function ($it) {
            return [
                'productId' => (int)$it['product_id'],
                'name' => (string)$it['product_name'],
                'size' => $it['size'],
                'quantity' => (int)$it['quantity'],
                'price' => (float)$it['unit_price'],
            ];
        }, $items),
        'shipping' => is_array($shipping) ? $shipping : [],
        'payment' => [
            'method' => (string)($order['payment_method'] ?? ''),
            'status' => (string)$order['payment_status'],
        ],
        'timeline' => is_array($timeline) ? $timeline : [],
    ];
}

json_response(200, [
    'ok' => true,
    'orders' => $out,
]);

