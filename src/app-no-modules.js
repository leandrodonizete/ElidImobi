// Versão sem módulos ES6 para compatibilidade
console.log('App.js carregado (versão sem módulos)');

// Estado de autenticação
const authState = {
    user: null,
    authenticated: false,

    setUser(userData) {
        this.user = userData;
        this.authenticated = true;
        localStorage.setItem("auth_user", JSON.stringify(userData));
    },

    getUser() {
        if (!this.user) {
            const stored = localStorage.getItem("auth_user");
            if (stored) {
                this.user = JSON.parse(stored);
                this.authenticated = true;
            }
        }
        return this.user;
    },

    logout() {
        this.user = null;
        this.authenticated = false;
        localStorage.removeItem("auth_user");
    },

    hasRole(role) {
        const user = this.getUser();
        return user && user.role === role;
    }
};

// Função para detectar base path
const getBasePath = () => {
    const pathname = window.location.pathname;
    // Para /Elid%20System/ElidImobi/qualquer-coisa, retorna /Elid%20System/ElidImobi
    const parts = pathname.split('/');
    // Remove a última parte (que pode ser uma rota) e junta novamente
    parts.pop();
    return parts.join('/') || '/';
};

const BASE_PATH = getBasePath();
const API_BASE = BASE_PATH + '/api';

// Função fetchApi
async function fetchApi(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    console.log('Fetching:', url);

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        ...options
    });

    if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let message;

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            message = data.error || data.message || 'Erro na requisição';
        } else {
            message = `Erro HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(message);
    }

    return await response.json();
}

// Router simples
const routes = {
    '/': () => `
        <section class="page home-page">
            <h2>Bem-vindo à Elid Imobiliária</h2>
            <p>Explore imóveis para venda e locação com filtros inteligentes e conteúdo relevante para quem busca o melhor negócio.</p>
            <div class="cards-preview">
                <article class="card">
                    <h3>Destaques</h3>
                    <p>Imóveis recém-cadastrados e com ótima visibilidade.</p>
                </article>
                <article class="card">
                    <h3>Últimas matérias</h3>
                    <p>Conteúdo para melhorar a experiência do comprador e o SEO da imobiliária.</p>
                </article>
            </div>
        </section>
    `,
    '/admin': () => `
        <section class="page admin-page">
            <h2>Login Administrativo</h2>
            <form id="admin-login-form">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" value="leandro@leandro.com" required>
                </div>
                <div class="form-group">
                    <label for="senha">Senha:</label>
                    <input type="password" id="senha" name="senha" value="123" required>
                </div>
                <div id="login-error" class="error-message" style="display: none;"></div>
                <button type="submit">Entrar</button>
            </form>
        </section>
    `,
    '/imoveis': () => `
        <section class="page imoveis-page">
            <h2>Imóveis Disponíveis</h2>
            <p>Carregando imóveis...</p>
        </section>
    `,
    '/blog': () => `
        <section class="page blog-page">
            <h2>Blog Imobiliário</h2>
            <p>Conteúdo em breve...</p>
        </section>
    `,
    '/corretor': () => {
        const user = authState.getUser();
        if (user && user.role === 'corretor') {
            return `
                <section class="page corretor-dashboard">
                    <h2>Painel do Corretor</h2>
                    <p>Bem-vindo, ${user.nome}!</p>
                    <div class="admin-menu">
                        <a href="/corretor/imoveis" data-link>Meus Imóveis</a>
                        <a href="/corretor/adicionar" data-link>Adicionar Imóvel</a>
                        <button id="btn-logout">Sair</button>
                    </div>
                </section>
            `;
        }
        return `
            <section class="page corretor-login">
                <h2>Login Corretor</h2>
                <form id="corretor-login-form">
                    <div class="form-group">
                        <label for="corretor-email">Email:</label>
                        <input type="email" id="corretor-email" name="email" value="corretor@test.com" required>
                    </div>
                    <div class="form-group">
                        <label for="corretor-senha">Senha:</label>
                        <input type="password" id="corretor-senha" name="senha" value="123" required>
                    </div>
                    <div id="corretor-login-error" class="error-message" style="display: none;"></div>
                    <button type="submit">Entrar como Corretor</button>
                </form>
            </section>
        `;
    },
    '/corretor/imoveis': () => {
        const user = authState.getUser();
        if (!user || user.role !== 'corretor') {
            history.pushState(null, '', BASE_PATH + '/corretor');
            renderPage('/corretor');
            return '';
        }
        return `
            <section class="page corretor-imoveis">
                <h2>Meus Imóveis</h2>
                <div class="admin-actions">
                    <a href="/corretor/adicionar" data-link class="btn">+ Adicionar Imóvel</a>
                    <button onclick="loadImoveisCorretor()" class="btn">Atualizar Lista</button>
                </div>
                <div id="imoveis-list"></div>
            </section>
        `;
    },
    '/corretor/adicionar': () => {
        const user = authState.getUser();
        if (!user || user.role !== 'corretor') {
            history.pushState(null, '', BASE_PATH + '/corretor');
            return '';
        }
        return `
            <section class="page corretor-form">
                <h2>Adicionar Novo Imóvel</h2>
                <form id="imovel-form">
                    <div class="form-group">
                        <label for="titulo">Título:</label>
                        <input type="text" id="titulo" name="titulo" required>
                    </div>
                    <div class="form-group">
                        <label for="tipo">Tipo:</label>
                        <select id="tipo" name="tipo" required>
                            <option value="">Selecione...</option>
                            <option value="casa">Casa</option>
                            <option value="apartamento">Apartamento</option>
                            <option value="comercial">Comercial</option>
                            <option value="terreno">Terreno</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="situacao">Situação:</label>
                        <select id="situacao" name="situacao" required>
                            <option value="">Selecione...</option>
                            <option value="venda">Venda</option>
                            <option value="aluguel">Aluguel</option>
                            <option value="ambos">Ambos</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="valor_venda">Valor Venda (R$):</label>
                        <input type="number" id="valor_venda" name="valor_venda" step="0.01">
                    </div>
                    <div class="form-group">
                        <label for="valor_aluguel">Valor Aluguel (R$):</label>
                        <input type="number" id="valor_aluguel" name="valor_aluguel" step="0.01">
                    </div>
                    <div class="form-group">
                        <label for="bairro">Bairro:</label>
                        <input type="text" id="bairro" name="bairro">
                    </div>
                    <div class="form-group">
                        <label for="cidade">Cidade:</label>
                        <input type="text" id="cidade" name="cidade">
                    </div>
                    <div class="form-group">
                        <label for="quartos">Quartos:</label>
                        <input type="number" id="quartos" name="quartos" min="0">
                    </div>
                    <div class="form-group">
                        <label for="banheiros">Banheiros:</label>
                        <input type="number" id="banheiros" name="banheiros" min="0">
                    </div>
                    <div class="form-group">
                        <label for="garagem">Garagem:</label>
                        <input type="number" id="garagem" name="garagem" min="0">
                    </div>
                    <button type="submit">Salvar Imóvel</button>
                </form>
            </section>
        `;
    },
    '/admin/usuarios': () => {
        const user = authState.getUser();
        if (!user || user.role !== 'admin') {
            history.pushState(null, '', BASE_PATH + '/admin');
            return routes['/admin']();
        }
        return `
            <section class="page admin-usuarios">
                <h2>Gerenciar Usuários</h2>
                <div class="admin-actions">
                    <button onclick="loadUsuarios()">Carregar Usuários</button>
                    <button onclick="showAddUserForm()">Adicionar Usuário</button>
                </div>
                <div id="usuarios-list"></div>
            </section>
        `;
    },
    '/admin/imoveis': () => {
        const user = authState.getUser();
        if (!user || user.role !== 'admin') {
            history.pushState(null, '', BASE_PATH + '/admin');
            return routes['/admin']();
        }
        return `
            <section class="page admin-imoveis">
                <h2>Gerenciar Imóveis</h2>
                <div class="admin-actions">
                    <button onclick="loadImoveis()">Carregar Imóveis</button>
                    <button onclick="showAddImovelForm()">Adicionar Imóvel</button>
                </div>
                <div id="imoveis-list"></div>
            </section>
        `;
    },
};

function renderPage(path) {
    const app = document.getElementById('app');

    // Verificar autenticação para rotas protegidas
    if (path.startsWith('/admin') && path !== '/admin') {
        const user = authState.getUser();
        if (!user || user.role !== 'admin') {
            history.pushState(null, '', BASE_PATH + '/admin');
            app.innerHTML = routes['/admin']();
            document.title = 'Elid Imobiliária - Admin';
            return;
        }
    }

    // Rotas do corretor protegidas (exceto /corretor que é login)
    if ((path === '/corretor/imoveis' || path === '/corretor/adicionar')) {
        const user = authState.getUser();
        if (!user || user.role !== 'corretor') {
            app.innerHTML = `
                <section class="page error-page">
                    <h2>Acesso Negado</h2>
                    <p>Você precisa estar logado como corretor para acessar esta área.</p>
                    <a href="/corretor" data-link>Ir para login do corretor</a>
                </section>
            `;
            document.title = 'Acesso Negado';
            return;
        }
    }

    const route = routes[path] || routes['/'];
    app.innerHTML = route();
    document.title = 'Elid Imobiliária';
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado');

    // Navegação inicial
    const currentPath = window.location.pathname.replace(BASE_PATH, '') || '/';
    renderPage(currentPath);

    // Event listeners
    document.body.addEventListener('click', (event) => {
        // Navegação SPA
        const anchor = event.target.closest('a[data-link]');
        if (anchor) {
            event.preventDefault();
            const href = anchor.getAttribute('href');
            history.pushState(null, '', BASE_PATH + href);
            renderPage(href);
        }

        // Logout button
        const logoutBtn = event.target.closest('#btn-logout');
        if (logoutBtn) {
            event.preventDefault();
            authState.logout();
            alert('Logout realizado!');
            history.pushState(null, '', BASE_PATH + '/');
            renderPage('/');
        }
    });

    // Form submissions
    document.body.addEventListener('submit', async (event) => {
        const form = event.target;

        if (form.id === 'admin-login-form') {
            event.preventDefault();
            await handleAdminLogin(form);
        }

        if (form.id === 'corretor-login-form') {
            event.preventDefault();
            await handleCorretorLogin(form);
        }

        if (form.id === 'imovel-form') {
            event.preventDefault();
            await handleAddImovel(form);
        }
    });
});

async function handleAdminLogin(form) {
    const email = form.querySelector('#email').value;
    const senha = form.querySelector('#senha').value;
    const errorDiv = form.querySelector('#login-error');

    try {
        errorDiv.style.display = 'none';
        const response = await fetchApi('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });

        if (response.success) {
            authState.setUser(response.user);
            alert('Login realizado com sucesso!');
            // Redirecionar para dashboard
            history.pushState(null, '', BASE_PATH + '/admin/dashboard');
            renderPage('/admin/dashboard');
        }
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}

// Funções para gerenciar usuários
async function loadUsuarios() {
    try {
        const response = await fetchApi('/usuarios');
        const usuariosList = document.getElementById('usuarios-list');
        if (response.success && response.data) {
            usuariosList.innerHTML = `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${response.data.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.nome}</td>
                                <td>${user.email}</td>
                                <td>${user.role}</td>
                                <td>${user.ativo ? 'Ativo' : 'Inativo'}</td>
                                <td>
                                    <button onclick="editUser(${user.id})">Editar</button>
                                    <button onclick="toggleUserStatus(${user.id}, ${user.ativo})">
                                        ${user.ativo ? 'Desativar' : 'Ativar'}
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        alert('Erro ao carregar usuários: ' + error.message);
    }
}

async function loadImoveis() {
    try {
        const response = await fetchApi('/imoveis');
        const imoveisList = document.getElementById('imoveis-list');
        if (response.success && response.data) {
            imoveisList.innerHTML = `
                <div class="imoveis-grid">
                    ${response.data.map(imovel => `
                        <article class="card property-card">
                            <h3>${imovel.titulo}</h3>
                            <p><strong>Tipo:</strong> ${imovel.tipo} • <strong>Situação:</strong> ${imovel.situacao}</p>
                            <p><strong>Local:</strong> ${imovel.bairro || 'N/A'} - ${imovel.cidade || 'N/A'}</p>
                            <p><strong>Venda:</strong> ${imovel.valor_venda ? `R$ ${Number(imovel.valor_venda).toFixed(2)}` : 'não informado'}</p>
                            <div class="card-actions">
                                <button onclick="editImovel(${imovel.id})">Editar</button>
                                <button onclick="toggleImovelStatus(${imovel.id}, ${imovel.ativo})">
                                    ${imovel.ativo ? 'Desativar' : 'Ativar'}
                                </button>
                            </div>
                        </article>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        alert('Erro ao carregar imóveis: ' + error.message);
    }
}

function showAddUserForm() {
    // Implementar formulário de adicionar usuário
    alert('Função em desenvolvimento');
}

function showAddImovelForm() {
    // Implementar formulário de adicionar imóvel
    alert('Função em desenvolvimento');
}

// Tornar funções globais para serem chamadas pelos botões
window.loadUsuarios = loadUsuarios;
window.loadImoveis = loadImoveis;
window.loadImoveisCorretor = loadImoveisCorretor;
window.showAddUserForm = showAddUserForm;
window.showAddImovelForm = showAddImovelForm;
window.editUser = (id) => alert('Editar usuário ' + id);
window.editImovel = (id) => alert('Editar imóvel ' + id);
window.toggleUserStatus = (id, ativo) => alert('Toggle status usuário ' + id);
window.toggleImovelStatus = (id, ativo) => alert('Toggle status imóvel ' + id);

// Login do Corretor
async function handleCorretorLogin(form) {
    const email = form.querySelector('#corretor-email').value;
    const senha = form.querySelector('#corretor-senha').value;
    const errorDiv = form.querySelector('#corretor-login-error');

    try {
        errorDiv.style.display = 'none';
        const response = await fetchApi('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });

        if (response.success) {
            authState.setUser(response.user);
            alert('Login realizado com sucesso!');
            history.pushState(null, '', BASE_PATH + '/corretor');
            renderPage('/corretor');
        }
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}

// Carregar imóveis do corretor
async function loadImoveisCorretor() {
    try {
        const response = await fetchApi('/imoveis');
        const imoveisList = document.getElementById('imoveis-list');
        if (response.success && response.data) {
            imoveisList.innerHTML = `
                <div class="imoveis-grid">
                    ${response.data.map(imovel => `
                        <article class="card property-card">
                            <h3>${imovel.titulo}</h3>
                            <p><strong>Tipo:</strong> ${imovel.tipo} • <strong>Situação:</strong> ${imovel.situacao}</p>
                            <p><strong>Local:</strong> ${imovel.bairro || 'N/A'} - ${imovel.cidade || 'N/A'}</p>
                            <p><strong>Quartos:</strong> ${imovel.quartos || '-'} • <strong>Banheiros:</strong> ${imovel.banheiros || '-'}</p>
                            <p><strong>Venda:</strong> ${imovel.valor_venda ? `R$ ${Number(imovel.valor_venda).toFixed(2)}` : 'N/A'} • <strong>Aluguel:</strong> ${imovel.valor_aluguel ? `R$ ${Number(imovel.valor_aluguel).toFixed(2)}` : 'N/A'}</p>
                            <div class="card-actions">
                                <button onclick="editarImovelCorretor(${imovel.id})" class="btn-sm btn-edit">Editar</button>
                                <button onclick="desativarImovel(${imovel.id})" class="btn-sm btn-danger">Desativar</button>
                            </div>
                        </article>
                    `).join('')}
                </div>
            `;
        } else {
            imoveisList.innerHTML = '<p>Nenhum imóvel encontrado.</p>';
        }
    } catch (error) {
        alert('Erro ao carregar imóveis: ' + error.message);
    }
}

// Adicionar imóvel
async function handleAddImovel(form) {
    const titulo = form.querySelector('#titulo').value;
    const tipo = form.querySelector('#tipo').value;
    const situacao = form.querySelector('#situacao').value;
    const valor_venda = form.querySelector('#valor_venda').value;
    const valor_aluguel = form.querySelector('#valor_aluguel').value;
    const bairro = form.querySelector('#bairro').value;
    const cidade = form.querySelector('#cidade').value;
    const quartos = form.querySelector('#quartos').value;
    const banheiros = form.querySelector('#banheiros').value;
    const garagem = form.querySelector('#garagem').value;

    try {
        const response = await fetchApi('/imoveis', {
            method: 'POST',
            body: JSON.stringify({
                titulo, tipo, situacao, valor_venda, valor_aluguel,
                bairro, cidade, quartos, banheiros, garagem
            })
        });

        if (response.success) {
            alert('Imóvel adicionado com sucesso!');
            history.pushState(null, '', BASE_PATH + '/corretor/imoveis');
            renderPage('/corretor/imoveis');
        }
    } catch (error) {
        alert('Erro ao adicionar imóvel: ' + error.message);
    }
}

// Editar imóvel (simulado)
window.editarImovelCorretor = (id) => {
    alert('Editar imóvel ' + id + ' - Função em desenvolvimento');
};

// Desativar imóvel
window.desativarImovel = async (id) => {
    if (confirm('Tem certeza que deseja desativar este imóvel?')) {
        try {
            const response = await fetchApi(`/imoveis/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ ativo: 0 })
            });

            if (response.success) {
                alert('Imóvel desativado com sucesso!');
                loadImoveisCorretor();
            }
        } catch (error) {
            alert('Erro ao desativar imóvel: ' + error.message);
        }
    }
};