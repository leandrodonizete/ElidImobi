<?php
// Teste direto da API sem passar por roteador
echo "<h2>Teste Direto da API</h2>";
echo "<p>Verificando banco de dados e autenticação...</p>";

require_once __DIR__ . '/api/db-connection.php';

try {
    $pdo = getDbConnection();
    echo "<p>✓ Conexão com banco de dados OK</p>";
    
    // Testa a query de autenticação
    $stmt = $pdo->prepare('SELECT id, nome, email, role FROM users WHERE email = ? AND senha_hash = SHA2(?, 256) AND ativo = 1');
    $stmt->execute(['leandro@leandro.com', '123']);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "<p>✓ Usuário encontrado: " . htmlspecialchars($user['nome']) . " (" . htmlspecialchars($user['role']) . ")</p>";
        echo "<pre>" . json_encode($user, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
    } else {
        echo "<p>✗ Usuário não encontrado com essas credenciais</p>";
    }
    
} catch (Exception $e) {
    echo "<p>✗ Erro: " . htmlspecialchars($e->getMessage()) . "</p>";
}
?>
