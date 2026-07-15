const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

function setLoginMessage(message = "") {
    loginMessage.textContent = message;
}

function getLoginErrorMessage(error) {
    return window.MatMixErrors?.getMessage(error, {
        fallback: "Неверный логин или пароль",
        networkFallback: "Не удалось соединиться с сервером."
    }) || "Неверный логин или пароль";
}

function toggleLoginPassword(button) {
    const field = button.closest(".password-field");
    const input = field?.querySelector("input");
    if (!input) return;

    const shouldShow = input.type === "password";
    input.type = shouldShow ? "text" : "password";
    button.textContent = shouldShow ? "Скрыть" : "Показать";
    button.setAttribute("aria-label", shouldShow ? "Скрыть пароль" : "Показать пароль");
}

async function redirectIfAuthorized() {
    try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        const result = await (window.MatMixErrors?.readJson(response) || response.json().catch(() => ({})));

        if (response.ok && result.success) {
            window.location.href = "/manager.html";
        }
    } catch {
        // Login page remains available when the server is unreachable.
    }
}

loginForm.addEventListener("click", event => {
    const passwordToggle = event.target.closest("[data-password-toggle]");
    if (!passwordToggle) return;

    toggleLoginPassword(passwordToggle);
});

loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    setLoginMessage("");

    const formData = new FormData(loginForm);
    const submitButton = loginForm.querySelector("button[type='submit']");
    submitButton.disabled = true;

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                login: String(formData.get("login") || "").trim(),
                password: String(formData.get("password") || "")
            })
        });
        const result = await (window.MatMixErrors?.readJson(response) || response.json().catch(() => ({})));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Неверный логин или пароль");
        }

        window.location.href = "/manager.html";
    } catch (error) {
        setLoginMessage(getLoginErrorMessage(error));
        submitButton.disabled = false;
    }
});

redirectIfAuthorized();
