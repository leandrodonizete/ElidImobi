export async function CorretorDashboardPage() {
    return `
        <section class="page dashboard-page">
            <h2>Área do Corretor</h2>
            <p>Visão geral dos imóveis, contatos e contratos.</p>
            <div class="card-grid">
                <article class="card">
                    <h3>Gestão de imóveis</h3>
                    <p>Cadastre, edite ou desative imóveis sem excluir dados.</p>
                </article>
                <article class="card">
                    <h3>Contratos e financeiro</h3>
                    <p>Acompanhe boletos, repasses e situação de locações.</p>
                </article>
            </div>
        </section>
    `;
}

export async function CorretorImoveisPage() {
    return `
        <section class="page management-page">
            <h2>Gestão de imóveis</h2>
            <p>Cadastro e atualização de imóveis para venda ou locação.</p>
            <div class="placeholder-box">
                <p>Em vez de excluir, marque como inativo para histórico.</p>
            </div>
        </section>
    `;
}

export async function CorretorFinanceiroPage() {
    return `
        <section class="page finance-page">
            <h2>Financeiro do corretor</h2>
            <p>Controle de boletos, parcelas, comissões e relatórios.</p>
            <div class="placeholder-box">
                <p>Esta área será usada para locações e vendas gerenciadas.</p>
            </div>
        </section>
    `;
}
