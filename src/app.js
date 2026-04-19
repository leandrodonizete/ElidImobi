import { initRouter } from "./core/router.js";
import { routes } from "./routes.js";

const router = initRouter(routes);
const app = document.getElementById("app");

window.addEventListener("popstate", () => router.resolve());

document.body.addEventListener("click", (event) => {
    const anchor = event.target.closest("a[data-link]");
    if (anchor) {
        event.preventDefault();
        const href = anchor.getAttribute("href");
        router.navigateTo(href);
    }

    // Admin logout button
    const logoutBtn = event.target.closest("#btn-logout");
    if (logoutBtn) {
        event.preventDefault();
        handleLogout();
    }
});

// Form submissions via event delegation
document.body.addEventListener("submit", async (event) => {
    const form = event.target;

    // Admin login form
    if (form.id === "admin-login-form") {
        event.preventDefault();
        await handleAdminLogin(form);
    }
});

async function handleAdminLogin(form) {
    const { fetchApi } = await import("./core/api.js");
    const { authState } = await import("./core/router.js");

    const email = form.querySelector("#email").value;
    const senha = form.querySelector("#senha").value;
    const errorDiv = form.querySelector("#login-error");

    try {
        const response = await fetchApi("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, senha })
        });

        if (response.success) {
            authState.setUser(response.user);
            window.location.reload();
        }
    } catch (error) {
        errorDiv.textContent = error.message || "Falha ao fazer login";
    }
}

async function handleLogout() {
    const { fetchApi } = await import("./core/api.js");
    const { authState } = await import("./core/router.js");

    try {
        await fetchApi("/auth/logout", { method: "POST" });
    } catch (error) {
        console.error(error);
    }
    authState.logout();
    window.location.href = "/";
}

router.resolve();
