<?php
declare(strict_types=1);

function decode_json_array_or_empty(?string $value): array
{
    if (!$value) {
        return [];
    }
    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : [];
}

function decode_json_object_or_empty(?string $value): array
{
    if (!$value) {
        return [];
    }
    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : [];
}

function normalize_product_row(array $row): array
{
    return [
        'id' => (int)$row['id'],
        'name' => (string)$row['name'],
        'category' => (string)$row['category'],
        'price' => (float)$row['price'],
        'badge' => (string)($row['badge'] ?? ''),
        'description' => (string)$row['description'],
        'image' => (string)$row['image'],
        'gallery' => decode_json_array_or_empty($row['gallery_json'] ?? null),
        'rating' => (float)$row['rating'],
        'reviewsCount' => (int)$row['reviews_count'],
        'fabric' => (string)($row['fabric'] ?? ''),
        'care' => (string)($row['care'] ?? ''),
        'fit' => (string)($row['fit'] ?? ''),
        'modelInfo' => (string)($row['model_info'] ?? ''),
        'sku' => (string)$row['sku'],
        'colors' => decode_json_array_or_empty($row['colors_json'] ?? null),
        'materials' => decode_json_array_or_empty($row['materials_json'] ?? null),
        'stockBySize' => decode_json_object_or_empty($row['stock_by_size_json'] ?? null),
        'isActive' => (int)$row['is_active'] === 1,
        'createdAt' => (string)$row['created_at'],
        'updatedAt' => (string)$row['updated_at'],
    ];
}

