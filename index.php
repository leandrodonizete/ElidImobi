<?php
// Router SPA - apenas serve o HTML para todas as rotas que não são arquivos estáticos
// A API é servida pela pasta /api com seu próprio .htaccess

$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/Elid%20System/ElidImobi';

// Remove o base path
if (strpos($request_uri, $base_path) === 0) {
    $path = substr($request_uri, strlen($base_path));
} else {
    $path = $request_uri;
}

// Remove query string
$path = explode('?', $path)[0];
$path = rtrim($path, '/');

// Se for arquivo estático ou diretório real, deixa o servidor servir
$ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
if ($ext || ($path !== '' && $path !== '/' && is_dir(__DIR__ . $path))) {
    return false;
}

// Serve index.html para todas as outras rotas (SPA)
header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/index.html');
exit;
?>
