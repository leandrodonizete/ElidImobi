import { fetchApi } from "../core/api.js";

function createPropertyCard(imovel) {
    return `
        <article class="card property-card">
            <h3>${imovel.titulo}</h3>
            <p><strong>Tipo:</strong> ${imovel.tipo} • <strong>Situação:</strong> ${imovel.situacao}</p>
            <p><strong>Local:</strong> ${imovel.bairro || 'N/A'} - ${imovel.cidade || 'N/A'}</p>
            <p><strong>Quartos:</strong> ${imovel.quartos || '-'} • <strong>Banheiros:</strong> ${imovel.banheiros || '-'} • <strong>Garagem:</strong> ${imovel.garagem || '-'}</p>
            <p><strong>Venda:</strong> ${imovel.valor_venda ? `R$ ${Number(imovel.valor_venda).toFixed(2)}` : 'não informado'} • <strong>Aluguel:</strong> ${imovel.valor_aluguel ? `R$ ${Number(imovel.valor_aluguel).toFixed(2)}` : 'não informado'}</p>
            <a href="/imovel/${imovel.id}" data-link>Ver detalhes</a>
        </article>
    `;
}

export async function HomePage() {
    return `
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
    `;
}

export async function ImoveisPage() {
    try {
        const response = await fetchApi('/imoveis');
        const imóveis = response.data || [];

        if (imóveis.length === 0) {
            return `
                <section class="page list-page">
                    <h2>Imóveis disponíveis</h2>
                    <p>Filtre por tipo, localização, valor e situação (venda ou locação).</p>
                    <div class="placeholder-box">
                        <p>Nenhum imóvel ativo encontrado no momento.</p>
                    </div>
                </section>
            `;
        }

        return `
            <section class="page list-page">
                <h2>Imóveis disponíveis</h2>
                <p>Filtre por tipo, localização, valor e situação (venda ou locação).</p>
                <div class="card-grid">
                    ${imóveis.map(createPropertyCard).join('')}
                </div>
            </section>
        `;
    } catch (error) {
        return `
            <section class="page list-page">
                <h2>Imóveis disponíveis</h2>
                <p>Ocorreu um erro ao carregar os imóveis. Tente novamente mais tarde.</p>
            </section>
        `;
    }
}

export async function ImovelPage(params) {
    try {
        const response = await fetchApi(`/imoveis/${params.id}`);
        const imovel = response.data;

        return `
            <section class="page detail-page">
                <h2>${imovel.titulo}</h2>
                <p><strong>Tipo:</strong> ${imovel.tipo} • <strong>Situação:</strong> ${imovel.situacao}</p>
                <p><strong>Status:</strong> ${imovel.status}</p>
                <p><strong>Endereço:</strong> ${imovel.endereco || 'não informado'}</p>
                <p>${imovel.descricao || 'Descrição não disponível.'}</p>
                <div class="placeholder-box">
                    <p><strong>Valor de venda:</strong> ${imovel.valor_venda ? `R$ ${Number(imovel.valor_venda).toFixed(2)}` : 'não informado'}</p>
                    <p><strong>Valor de aluguel:</strong> ${imovel.valor_aluguel ? `R$ ${Number(imovel.valor_aluguel).toFixed(2)}` : 'não informado'}</p>
                </div>
            </section>
        `;
    } catch (error) {
        return `
            <section class="page detail-page">
                <h2>Imóvel não encontrado</h2>
                <p>Não foi possível carregar os detalhes do imóvel.</p>
            </section>
        `;
    }
}

export async function BlogPage() {
    try {
        const response = await fetchApi('/blog');
        const posts = response.data || [];

        if (posts.length === 0) {
            return `
                <section class="page blog-page">
                    <h2>Blog da imobiliária</h2>
                    <p>Publicações para SEO e relacionamento com clientes.</p>
                    <div class="placeholder-box">
                        <p>Nenhuma matéria disponível no momento.</p>
                    </div>
                </section>
            `;
        }

        return `
            <section class="page blog-page">
                <h2>Blog da imobiliária</h2>
                <div class="card-grid">
                    ${posts.map(post => `
                        <article class="card">
                            <h3>${post.titulo}</h3>
                            <p>${post.resumo || 'Resumo não disponível.'}</p>
                        </article>
                    `).join('')}
                </div>
            </section>
        `;
    } catch (error) {
        return `
            <section class="page blog-page">
                <h2>Blog da imobiliária</h2>
                <p>Ocorreu um erro ao carregar o blog. Tente novamente mais tarde.</p>
            </section>
        `;
    }
}

export async function NotFoundPage() {
    return `
        <section class="page notfound-page">
            <h2>Página não encontrada</h2>
            <p>Verifique a rota e tente novamente.</p>
        </section>
    `;
}
