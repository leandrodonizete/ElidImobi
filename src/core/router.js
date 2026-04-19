import { fetchApi } from "./api.js";

export const authState = {
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
        return this.authenticated && this.user?.role === role;
    },

    isAdmin() {
        return this.hasRole("admin");
    },

    isCorretor() {
        return this.hasRole("corretor");
    }
};

function pathToRegex(path) {
    return new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");
}

function getParams(match) {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);
    return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
}

export function initRouter(routes) {
    const root = document.getElementById("app");

    async function render(page, params = {}) {
        document.title = page.title || "Elid Imobiliária";
        root.innerHTML = await page.component(params);
        
        // Trigger custom event after render for components to bind events
        root.dispatchEvent(new CustomEvent('pageRendered'));
    }

    function isAuthorized(route) {
        if (route.public) return true;
        if (!authState.authenticated) return false;
        if (!route.roles) return true;
        return route.roles.includes(authState.user.role);
    }

    async function resolve() {
        const currentPath = window.location.pathname;
        const potentialMatches = routes.map(route => ({
            route,
            result: currentPath.match(pathToRegex(route.path))
        }));

        let match = potentialMatches.find(p => p.result !== null);
        if (!match) {
            match = { route: routes.find(r => r.path === "404"), result: [currentPath] };
        }

        if (!isAuthorized(match.route)) {
            return navigateTo("/");
        }

        const params = match.route.path.includes(":") ? getParams(match) : {};
        render(match.route, params);
    }

    function navigateTo(url) {
        window.history.pushState(null, null, url);
        resolve();
    }

    return { resolve, navigateTo, getAuthState: () => authState };
}
