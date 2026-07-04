const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

function setLoginMessage(message = "") {
    loginMessage.textContent = message;
}

async function redirectIfAuthorized() {
    try {
        const response = await fetch("/api/auth/me");
        const result = await response.json().catch(() => ({}));

        if (response.ok && result.success) {
            window.location.href = "/manager.html";
        }
    } catch {
        // Login page remains available when the server is unreachable.
    }
}

loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    setLoginMessage("");

    const formData = new FormData(loginForm);
    const submitButton = loginForm.querySelector("button[type='submit']");
    submitButton.disabled = true;

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                login: String(formData.get("login") || "").trim(),
                password: String(formData.get("password") || "")
            })
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Неверный логин или пароль");
        }

        window.location.href = "/manager.html";
    } catch (error) {
        setLoginMessage(error.message || "Неверный логин или пароль");
        submitButton.disabled = false;
    }
});

redirectIfAuthorized();
