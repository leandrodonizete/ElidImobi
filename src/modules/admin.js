import { authState } from "../core/router.js";

export async function AdminDashboardPage() {
    // Se o usuário não estiver autenticado, mostrar formulário de login
    if (!authState.authenticated) {
        return `
            <section class="page login-page">
                <div class="login-container">
                    <h2>Área Administrativa</h2>
                    <form id="admin-login-form">
                        <div class="form-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" name="email" value="leandro@leandro.com" required />
                        </div>
                        <div class="form-group">
                            <label for="senha">Senha:</label>
                            <input type="password" id="senha" name="senha" value="123" required />
                        </div>
                        <button type="submit">Entrar</button>
                        <div id="login-error" class="error-message"></div>
                    </form>
                </div>
            </section>
        `;
    }

    // Se autenticado e for admin
    if (authState.isAdmin()) {
        return `
            <section class="page admin-page">
                <h2>Área administrativa</h2>
                <p>Bem-vindo, <strong>${authState.user.nome}</strong>!</p>
                <p>Controle de usuários, corretores, permissões e configurações do sistema.</p>
                <div class="admin-actions">
                    <button id="btn-logout">Sair</button>
                </div>
                <div class="placeholder-box">
                    <p>Aqui serão adicionados relatórios, ACL e logs de auditoria.</p>
                </div>
            </section>
        `;
    }

    // Se autenticado mas não for admin
    return `
        <section class="page message-page">
            <h2>Acesso Negado</h2>
            <p>Você não tem permissão para acessar a área administrativa.</p>
        </section>
    `;
}
