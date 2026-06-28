<?php
declare(strict_types=1);

require __DIR__ . '/../../lib/bootstrap.php';
require __DIR__ . '/../../lib/response.php';
require __DIR__ . '/../../lib/db.php';
require __DIR__ . '/../../lib/auth.php';
require __DIR__ . '/../../lib/csrf.php';

if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['POST', 'PUT', 'PATCH'], true)) {
    json_response(405, ['ok' => false, 'message' => 'Method not allowed.']);
}

require_csrf();
require_admin();

$data = request_data();
require_fields($data, ['orderCode', 'status']);

$orderCode = trim((string)$data['orderCode']);
$status = strtolower(trim((string)$data['status']));

if ($orderCode === '' || strlen($orderCode) > 50) {
    json_response(422, ['ok' => false, 'message' => 'Valid orderCode is required.']);
}

$allowed = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'deleted'];
if (!in_array($status, $allowed, true)) {
    json_response(422, ['ok' => false, 'message' => 'Invalid order status.']);
}

$pdo = db();
$stmt = $pdo->prepare('SELECT id, timeline_json FROM orders WHERE order_code = :order_code LIMIT 1');
$stmt->execute(['order_code' => $orderCode]);
$order = $stmt->fetch();
if (!$order) {
    json_response(404, ['ok' => false, 'message' => 'Order not found.']);
}

$timeline = json_decode((string)($order['timeline_json'] ?? '[]'), true);
if (!is_array($timeline)) {
    $timeline = [];
}

$timeline[] = [
    'label' => ucfirst($status),
    'at' => gmdate('c'),
];

$update = $pdo->prepare('UPDATE orders SET status = :status, timeline_json = :timeline_json WHERE id = :id');
$update->execute([
    'status' => $status,
    'timeline_json' => json_encode($timeline, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    'id' => (int)$order['id'],
]);

json_response(200, [
    'ok' => true,
    'message' => 'Order status updated.',
]);

