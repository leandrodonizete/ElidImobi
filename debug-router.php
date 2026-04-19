<?php
// Teste do roteador de API
$_SERVER['REQUEST_URI'] = '/api/';
$_SERVER['REQUEST_METHOD'] = 'GET';

// Simula o roteador
$request_uri = $_SERVER['REQUEST_URI'];
$script_name = $_SERVER['SCRIPT_NAME'];
$path = explode('?', $request_uri)[0];
$base_path = dirname($script_name);

echo "<h2>Debug do Roteador</h2>";
echo "<p>REQUEST_URI: " . htmlspecialchars($request_uri) . "</p>";
echo "<p>SCRIPT_NAME: " . htmlspecialchars($script_name) . "</p>";
echo "<p>base_path: " . htmlspecialchars($base_path) . "</p>";

if (strpos($path, $base_path) === 0) {
    $path = substr($path, strlen($base_path));
}

$path = rtrim($path, '/') ?: '/';
echo "<p>Path final: " . htmlspecialchars($path) . "</p>";

// Se for requisição para API
if (strpos($path, '/api') === 0) {
    $api_path = substr($path, 4);
    if (empty($api_path)) $api_path = '/';
    echo "<p><strong>✓ Roteando para API com path: " . htmlspecialchars($api_path) . "</strong></p>";
} else {
    echo "<p>× Não é uma requisição de API</p>";
}
?>
