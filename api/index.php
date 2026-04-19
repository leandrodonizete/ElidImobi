<?php

require_once __DIR__ . '/db-connection.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Trata requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Parse do caminho - tenta múltiplas fontes
$path = $_GET['request'] ?? $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($path, PHP_URL_PATH);
$path = rtrim($path, '/');

// Se for vazio ou root, retorna status da API
if ($path === '' || $path === '/') {
    respondJson(['message' => 'API imobiliária pronta'], 200);
}

// Remove a barra inicial
$path = ltrim($path, '/');
$segments = array_filter(explode('/', $path));
$segments = array_values($segments);

if (empty($segments)) {
    respondJson(['message' => 'API imobiliária pronta'], 200);
}

// Log para debug (descomente se necessário)
// error_log("API - Method: $method, Path: $path, First segment: {$segments[0]}");

switch ($segments[0] ?? '') {
    case 'auth':
        handleAuth($method, $segments);
        break;
    case 'imoveis':
        handleImoveis($method, $segments);
        break;
    case 'blog':
        handleBlog($method, $segments);
        break;
    case 'leads':
        handleLeads($method, $segments);
        break;
    case 'contratos':
        handleContratos($method, $segments);
        break;
    case 'boletos':
        handleBoletos($method, $segments);
        break;
    default:
        respondJson(['error' => 'Rota não encontrada'], 404);
}

function handleAuth(string $method, array $segments): void
{
    $action = $segments[1] ?? '';

    if ($method === 'POST' && $action === 'login') {
        handleLogin();
    } elseif ($method === 'POST' && $action === 'logout') {
        handleLogout();
    } elseif ($method === 'GET' && $action === 'me') {
        handleGetMe();
    } else {
        respondJson(['error' => 'Rota de autenticação não encontrada'], 404);
    }
}

function handleLogin(): void
{
    $body = getJsonBody();
    $email = $body['email'] ?? '';
    $senha = $body['senha'] ?? '';

    if (!$email || !$senha) {
        respondJson(['error' => 'Email e senha são obrigatórios'], 400);
    }

    $pdo = getDbConnection();
    $stmt = $pdo->prepare('SELECT id, nome, email, role FROM users WHERE email = ? AND senha_hash = SHA2(?, 256) AND ativo = 1');
    $stmt->execute([$email, $senha]);
    $user = $stmt->fetch();

    if (!$user) {
        respondJson(['error' => 'Credenciais inválidas'], 401);
    }

    // Inicia a sessão e armazena o usuário
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user'] = $user;

    respondJson([
        'success' => true,
        'message' => 'Login realizado com sucesso',
        'user' => $user
    ]);
}

function handleLogout(): void
{
    session_start();
    session_destroy();
    respondJson(['success' => true, 'message' => 'Logout realizado com sucesso']);
}

function handleGetMe(): void
{
    session_start();
    if (!isset($_SESSION['user'])) {
        respondJson(['error' => 'Não autenticado'], 401);
    }
    respondJson(['user' => $_SESSION['user']]);
}

function handleImoveis(string $method, array $segments): void
{
    $pdo = getDbConnection();

    if ($method === 'GET' && !isset($segments[1])) {
        $stmt = $pdo->prepare(
            'SELECT id, titulo, tipo, situacao, status, valor_venda, valor_aluguel, cidade, bairro, quartos, banheiros, garagem
             FROM imoveis
             WHERE ativo = 1
             ORDER BY created_at DESC'
        );
        $stmt->execute();
        respondJson(['data' => $stmt->fetchAll()]);
    }

    if ($method === 'GET' && isset($segments[1]) && is_numeric($segments[1])) {
        $stmt = $pdo->prepare('SELECT * FROM imoveis WHERE id = ? AND ativo = 1');
        $stmt->execute([(int)$segments[1]]);
        $imovel = $stmt->fetch();
        if (!$imovel) {
            respondJson(['error' => 'Imóvel não encontrado'], 404);
        }
        respondJson(['data' => $imovel]);
    }

    if ($method === 'POST') {
        $body = getJsonBody();
        $fields = [
            'titulo', 'descricao', 'tipo', 'situacao', 'status',
            'valor_venda', 'valor_aluguel', 'area_m2', 'quartos',
            'banheiros', 'garagem', 'endereco', 'cidade', 'bairro',
            'cep', 'proprietario_id', 'corretor_id'
        ];

        $values = [];
        foreach ($fields as $field) {
            $values[] = $body[$field] ?? null;
        }

        $stmt = $pdo->prepare(
            'INSERT INTO imoveis (titulo, descricao, tipo, situacao, status, valor_venda, valor_aluguel, area_m2, quartos, banheiros, garagem, endereco, cidade, bairro, cep, proprietario_id, corretor_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute($values);

        respondJson(['message' => 'Imóvel criado com sucesso', 'id' => $pdo->lastInsertId()], 201);
    }

    if (($method === 'PUT' || $method === 'PATCH') && isset($segments[1]) && is_numeric($segments[1])) {
        $body = getJsonBody();
        $allowed = [
            'titulo', 'descricao', 'tipo', 'situacao', 'status',
            'valor_venda', 'valor_aluguel', 'area_m2', 'quartos',
            'banheiros', 'garagem', 'endereco', 'cidade', 'bairro',
            'cep', 'proprietario_id', 'corretor_id', 'ativo'
        ];

        $updates = [];
        $params = [];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $body)) {
                $updates[] = "$field = ?";
                $params[] = $body[$field];
            }
        }

        if (empty($updates)) {
            respondJson(['error' => 'Nenhum campo válido para atualizar'], 400);
        }

        $params[] = (int)$segments[1];
        $stmt = $pdo->prepare('UPDATE imoveis SET ' . implode(', ', $updates) . ', updated_at = NOW() WHERE id = ?');
        $stmt->execute($params);

        respondJson(['message' => 'Imóvel atualizado com sucesso']);
    }

    if ($method === 'DELETE' && isset($segments[1]) && is_numeric($segments[1])) {
        $stmt = $pdo->prepare('UPDATE imoveis SET ativo = 0, deletado_em = NOW() WHERE id = ?');
        $stmt->execute([(int)$segments[1]]);
        respondJson(['message' => 'Imóvel desativado com sucesso']);
    }

    respondJson(['error' => 'Método não suportado para imoveis'], 405);
}

function handleBlog(string $method, array $segments): void
{
    $pdo = getDbConnection();

    if ($method === 'GET' && !isset($segments[1])) {
        $stmt = $pdo->prepare(
            'SELECT id, titulo, slug, resumo, publicado_em
             FROM blog_posts
             WHERE ativo = 1
             ORDER BY publicado_em DESC, created_at DESC'
        );
        $stmt->execute();
        respondJson(['data' => $stmt->fetchAll()]);
    }

    if ($method === 'GET' && isset($segments[1])) {
        if (is_numeric($segments[1])) {
            $stmt = $pdo->prepare('SELECT * FROM blog_posts WHERE id = ? AND ativo = 1');
            $stmt->execute([(int)$segments[1]]);
        } else {
            $stmt = $pdo->prepare('SELECT * FROM blog_posts WHERE slug = ? AND ativo = 1');
            $stmt->execute([$segments[1]]);
        }

        $post = $stmt->fetch();
        if (!$post) {
            respondJson(['error' => 'Post não encontrado'], 404);
        }
        respondJson(['data' => $post]);
    }

    if ($method === 'POST') {
        $body = getJsonBody();
        $stmt = $pdo->prepare(
            'INSERT INTO blog_posts (titulo, slug, resumo, conteudo, autor_id, publicado_em, ativo)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $body['titulo'] ?? null,
            $body['slug'] ?? null,
            $body['resumo'] ?? null,
            $body['conteudo'] ?? null,
            $body['autor_id'] ?? null,
            $body['publicado_em'] ?? null,
            $body['ativo'] ?? 1
        ]);

        respondJson(['message' => 'Post cadastrado com sucesso', 'id' => $pdo->lastInsertId()], 201);
    }

    respondJson(['error' => 'Método não suportado para blog'], 405);
}

function handleLeads(string $method, array $segments): void
{
    $pdo = getDbConnection();

    if ($method === 'GET') {
        $stmt = $pdo->prepare('SELECT * FROM leads ORDER BY criado_em DESC');
        $stmt->execute();
        respondJson(['data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST') {
        $body = getJsonBody();
        $stmt = $pdo->prepare(
            'INSERT INTO leads (imovel_id, nome, email, telefone, mensagem, status)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $body['imovel_id'] ?? null,
            $body['nome'] ?? null,
            $body['email'] ?? null,
            $body['telefone'] ?? null,
            $body['mensagem'] ?? null,
            $body['status'] ?? 'novo'
        ]);

        respondJson(['message' => 'Lead registrado com sucesso', 'id' => $pdo->lastInsertId()], 201);
    }

    respondJson(['error' => 'Método não suportado para leads'], 405);
}

function handleContratos(string $method, array $segments): void
{
    $pdo = getDbConnection();

    if ($method === 'GET' && !isset($segments[1])) {
        $stmt = $pdo->prepare('SELECT * FROM contratos ORDER BY created_at DESC');
        $stmt->execute();
        respondJson(['data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST') {
        $body = getJsonBody();
        $stmt = $pdo->prepare(
            'INSERT INTO contratos (imovel_id, corretor_id, cliente_nome, tipo, valor, data_inicio, data_fim, situacao)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $body['imovel_id'] ?? null,
            $body['corretor_id'] ?? null,
            $body['cliente_nome'] ?? null,
            $body['tipo'] ?? 'locacao',
            $body['valor'] ?? null,
            $body['data_inicio'] ?? null,
            $body['data_fim'] ?? null,
            $body['situacao'] ?? 'ativo'
        ]);

        respondJson(['message' => 'Contrato cadastrado com sucesso', 'id' => $pdo->lastInsertId()], 201);
    }

    respondJson(['error' => 'Método não suportado para contratos'], 405);
}

function handleBoletos(string $method, array $segments): void
{
    $pdo = getDbConnection();

    if ($method === 'GET') {
        $stmt = $pdo->prepare('SELECT * FROM boletos ORDER BY criado_em DESC');
        $stmt->execute();
        respondJson(['data' => $stmt->fetchAll()]);
    }

    if ($method === 'POST') {
        $body = getJsonBody();
        $stmt = $pdo->prepare(
            'INSERT INTO boletos (contrato_id, vencimento, valor, status, nota)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $body['contrato_id'] ?? null,
            $body['vencimento'] ?? null,
            $body['valor'] ?? null,
            $body['status'] ?? 'pendente',
            $body['nota'] ?? null
        ]);

        respondJson(['message' => 'Boleto cadastrado com sucesso', 'id' => $pdo->lastInsertId()], 201);
    }

    respondJson(['error' => 'Método não suportado para boletos'], 405);
}

function getJsonBody()
{
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        respondJson(['error' => 'Corpo JSON inválido'], 400);
    }
    return $data;
}

function respondJson($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
