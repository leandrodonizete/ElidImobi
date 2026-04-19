# Sistema Imobiliário Elid - Setup e Credenciais

## Credenciais do Admin

- **Nome**: Leandro
- **Email**: leandro@leandro.com
- **Senha**: 123
- **Role**: admin

## Corretor de Teste

- **Email**: corretor@test.com
- **Senha**: 123
- **Role**: corretor

## Instruções de Setup

### 1. Banco de Dados

Host: mysql746.umbler.com:41890
Database: financas
User: leandrofinancas
Password: a36825700

**Passos:**
1. Acesse phpMyAdmin com as credenciais acima
2. Execute o script `schema.sql` para criar as tabelas
3. Execute o script `insert-users.sql` para inserir os usuários de teste

### 2. Deploy na Umbler

1. Copie todos os arquivos para a pasta pública do Umbler
2. Verifique se o Apache mod_rewrite está habilitado (necessário para as rewrite rules)
3. Teste a API em: `https://seudominio.com/api/`
4. Teste o admin em: `https://seudominio.com/admin`

### 3. Testar Localmente

```bash
cd c:\xampp\htdocs\Elid\ System\ElidImobi
# Inicie o XAMPP e acesse http://localhost/Elid%20System/ElidImobi/
```

## Arquitetura

```
/
├── index.html                    # SPA entry point
├── .htaccess                     # Rewrite rules para SPA
├── schema.sql                    # Estrutura do BD
├── insert-users.sql              # Usuários de teste
├── api/
│   ├── index.php                # API principal
│   ├── db-config.php            # Configuração do BD
│   ├── db-connection.php        # Conexão PDO
│   └── .htaccess                # Rewrite rules para API
└── src/
    ├── app.js                   # Inicialização
    ├── routes.js                # Definição de rotas
    ├── core/
    │   ├── router.js            # Router SPA
    │   └── api.js               # Client HTTP
    ├── modules/
    │   ├── portal.js            # Home, imóveis, blog público
    │   ├── corretor.js          # Dashboard do corretor
    │   └── admin.js             # Painel administrativo
    └── styles/
        └── main.css             # CSS global
```

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login (email, senha)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário autenticado

### Imóveis
- `GET /api/imoveis` - Listar imóveis ativos
- `GET /api/imoveis/:id` - Detalhes de um imóvel
- `POST /api/imoveis` - Criar imóvel
- `PUT /api/imoveis/:id` - Atualizar imóvel
- `DELETE /api/imoveis/:id` - Desativar imóvel (soft delete)

### Blog
- `GET /api/blog` - Listar posts
- `GET /api/blog/:id` ou `GET /api/blog/:slug` - Detalhes de um post
- `POST /api/blog` - Criar post

### Leads
- `GET /api/leads` - Listar leads
- `POST /api/leads` - Criar lead

### Contratos
- `GET /api/contratos` - Listar contratos
- `POST /api/contratos` - Criar contrato

### Boletos
- `GET /api/boletos` - Listar boletos
- `POST /api/boletos` - Criar boleto

## Características Implementadas

✅ SPA com roteamento client-side
✅ Autenticação real com login
✅ Soft delete (ativo/inativo)
✅ Separação de áreas: público, corretor, admin
✅ API REST em PHP com PDO
✅ CORS preparado para integração futura
✅ Validação de credenciais
✅ Persistência de sessão no localStorage

## Próximas Etapas

1. Criar formulários de CRUD para imóveis na área do corretor
2. Implementar upload de imagens
3. Criar gestão de contratos e boletos
4. Integração com APIs de pagamento
5. Sistema de leads e notificações
6. Relatórios financeiros
