<?php
declare(strict_types=1);

function json_response(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        http_response_code(500);
        echo '{"ok":false,"message":"Failed to encode JSON response."}';
        exit;
    }
    echo $json;
    exit;
}

function request_data(): array
{
    $contentType = strtolower((string)($_SERVER['CONTENT_TYPE'] ?? ''));
    $raw = file_get_contents('php://input') ?: '';

    if (strpos($contentType, 'application/json') !== false && $raw !== '') {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $decoded;
        }
    }

    if (!empty($_POST)) {
        return $_POST;
    }

    parse_str($raw, $formData);
    return is_array($formData) ? $formData : [];
}

function require_fields(array $data, array $fields): void
{
    foreach ($fields as $field) {
        if (!isset($data[$field]) || trim((string)$data[$field]) === '') {
            json_response(422, [
                'ok' => false,
                'message' => "Missing required field: {$field}",
            ]);
        }
    }
}
