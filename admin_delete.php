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
$orderCode = trim((string)($data['orderCode'] ?? $_GET['orderCode'] ?? ''));
if ($orderCode === '') {
    json_response(422, ['ok' => false, 'message' => 'Valid orderCode is required.']);
}

$pdo = db();

// Soft-delete by marking status to "deleted" (keeps accounting/audit trail).
$stmt = $pdo->prepare('UPDATE orders SET status = :status WHERE order_code = :order_code');
$stmt->execute([
    'status' => 'deleted',
    'order_code' => $orderCode,
]);

if ($stmt->rowCount() === 0) {
    json_response(404, ['ok' => false, 'message' => 'Order not found.']);
}

json_response(200, [
    'ok' => true,
    'message' => 'Order deleted.',
]);

