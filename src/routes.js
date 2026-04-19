import {
    HomePage,
    ImoveisPage,
    ImovelPage,
    BlogPage,
    NotFoundPage
} from "./modules/portal.js";
import {
    CorretorDashboardPage,
    CorretorImoveisPage,
    CorretorFinanceiroPage
} from "./modules/corretor.js";
import { AdminDashboardPage } from "./modules/admin.js";

export const routes = [
    { path: "/", component: HomePage, title: "Início", public: true },
    { path: "/imoveis", component: ImoveisPage, title: "Imóveis", public: true },
    { path: "/imovel/:id", component: ImovelPage, title: "Detalhes do Imóvel", public: true },
    { path: "/blog", component: BlogPage, title: "Blog", public: true },
    { path: "/corretor", component: CorretorDashboardPage, title: "Corretor", roles: ["corretor"] },
    { path: "/corretor/financeiro", component: CorretorFinanceiroPage, title: "Financeiro Corretor", roles: ["corretor"] },
    { path: "/corretor/imoveis", component: CorretorImoveisPage, title: "Gestão de Imóveis", roles: ["corretor"] },
    { path: "/admin", component: AdminDashboardPage, title: "Admin", public: true },
    { path: "404", component: NotFoundPage, title: "Página não encontrada", public: true }
];
