<?php
declare(strict_types=1);

require __DIR__ . '/../lib/bootstrap.php';
require __DIR__ . '/../lib/response.php';

json_response(200, [
    'ok' => true,
    'service' => 'dark-ocean-api',
    'time' => gmdate('c'),
]);

