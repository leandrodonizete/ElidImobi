<?php
// Teste rápido da API
echo json_encode([
    'test' => 'ok',
    'request_uri' => $_SERVER['REQUEST_URI'],
    'script_name' => $_SERVER['SCRIPT_NAME'],
    'path_info' => $_SERVER['PATH_INFO'] ?? 'não disponível',
    'php_version' => PHP_VERSION
]);
?>
