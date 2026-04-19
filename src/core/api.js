// Detecta o base path do projeto no XAMPP/servidor
const getBasePath = () => {
    const pathname = window.location.pathname;
    // Remove tudo a partir da última barra (nome do arquivo/rota)
    return pathname.substring(0, pathname.lastIndexOf('/')) || '/';
};

const BASE_PATH = getBasePath();
export const API_BASE = BASE_PATH + '/api';

export async function fetchApi(endpoint, options = {}) {
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
            message = await response.text();
        }
        
        throw new Error(message || `HTTP ${response.status}`);
    }

    return response.json();
}
