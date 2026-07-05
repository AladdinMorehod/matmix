// CRM settings: profile password and admin user management.
function canManageUsers() {
    return currentUser?.role === "admin";
}

function getUserStatusText(user) {
    return user.isActive ? "Активен" : "Отключен";
}

function isMainAdminUser(user) {
    return user?.login === "admin";
}

function renderPasswordField({ label = "", name, autocomplete = "new-password", placeholder = "", minlength = "", required = false }) {
    return `
        <label>
            ${label ? `<span>${escapeHtml(label)}</span>` : ""}
            <span class="password-field">
                <input
                    name="${escapeHtml(name)}"
                    type="password"
                    autocomplete="${escapeHtml(autocomplete)}"
                    ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""}
                    ${minlength ? `minlength="${escapeHtml(minlength)}"` : ""}
                    ${required ? "required" : ""}
                >
                <button class="password-toggle" type="button" data-password-toggle aria-label="Показать пароль">Показать</button>
            </span>
        </label>
    `;
}

function togglePasswordVisibility(button) {
    const field = button.closest(".password-field");
    const input = field?.querySelector("input");
    if (!input) return;

    const shouldShow = input.type === "password";
    input.type = shouldShow ? "text" : "password";
    button.textContent = shouldShow ? "Скрыть" : "Показать";
    button.setAttribute("aria-label", shouldShow ? "Скрыть пароль" : "Показать пароль");
}

function getSafePayloadInfo(payload) {
    return Object.fromEntries(Object.entries(payload).map(([key, value]) => [
        key,
        key.toLowerCase().includes("password") ? `[hidden:${String(value || "").length}]` : value
    ]));
}

function logSettingsWarn(message, data) {
    console.warn(`[settings] ${message}`, data || "");
}

function logSettingsError(message, error) {
    console.error(`[settings] ${message}`, error);
}

function bindSettingsFormEvents() {
    const profilePasswordForm = document.getElementById("profilePasswordForm");
    if (profilePasswordForm && profilePasswordForm.dataset.bound !== "1") {
        profilePasswordForm.dataset.bound = "1";
        profilePasswordForm.addEventListener("submit", event => {
            event.preventDefault();
            console.log("[settings] change password submit");
            changeOwnPassword(profilePasswordForm);
        });
    }

    const createUserForm = document.getElementById("createUserForm");
    if (createUserForm && createUserForm.dataset.bound !== "1") {
        createUserForm.dataset.bound = "1";
        createUserForm.addEventListener("submit", event => {
            event.preventDefault();
            console.log("[settings] create user submit");
            createUser(createUserForm);
        });
    }

    document.querySelectorAll(".settings-user-password-form").forEach(form => {
        if (form.dataset.bound === "1") return;
        form.dataset.bound = "1";
        form.addEventListener("submit", event => {
            event.preventDefault();
            changeUserPassword(form.dataset.userId, form);
        });
    });

    document.querySelectorAll(".settings-user-edit-form").forEach(form => {
        if (form.dataset.bound === "1") return;
        form.dataset.bound = "1";
        form.addEventListener("submit", event => {
            event.preventDefault();
            updateUser(form.dataset.userId, form);
        });
    });
}

function renderSettingsTabs() {
    const tabs = [
        { id: "profile", label: "Профиль", enabled: true },
        { id: "users", label: "Пользователи", enabled: canManageUsers() }
    ].filter(tab => tab.enabled);

    return `
        <nav class="settings-tabs" aria-label="Разделы настроек">
            ${tabs.map(tab => `<button class="${activeSettingsTab === tab.id ? "active" : ""}" data-settings-tab="${tab.id}" type="button">${escapeHtml(tab.label)}</button>`).join("")}
        </nav>
    `;
}

function renderProfileSettings() {
    return `
        <section class="settings-panel">
            <h2>Профиль</h2>
            <div class="settings-profile-grid">
                ${renderInfoRow("Имя", currentUser?.name || "")}
                ${renderInfoRow("Логин", currentUser?.login || "")}
                ${renderInfoRow("Роль", getRoleLabel(currentUser?.role))}
            </div>

            <form class="settings-form" id="profilePasswordForm">
                <h3>Смена пароля</h3>
                ${renderPasswordField({ label: "Текущий пароль", name: "currentPassword", autocomplete: "current-password", required: true })}
                ${renderPasswordField({ label: "Новый пароль", name: "newPassword", minlength: "6", required: true })}
                ${renderPasswordField({ label: "Повтор нового пароля", name: "confirmPassword", minlength: "6", required: true })}
                <button type="submit">Сменить пароль</button>
            </form>
        </section>
    `;
}

function renderUserCard(user) {
    const isSelf = Number(user.id) === Number(currentUser?.id);
    const isEditing = Number(user.id) === Number(editingUserId);
    const isMainAdmin = isMainAdminUser(user);

    return `
        <article class="settings-user-card" data-user-id="${user.id}">
            <div class="settings-user-main">
                <div>
                    <strong>${escapeHtml(user.name)}</strong>
                    <span>${escapeHtml(user.login)} · ${escapeHtml(getRoleLabel(user.role))}</span>
                </div>
                <span class="settings-user-status ${user.isActive ? "active" : "disabled"}">${getUserStatusText(user)}</span>
            </div>
            ${isMainAdmin ? `<p class="settings-muted settings-self-label">Главный администратор · Защищенная учетная запись</p>` : ""}
            ${isEditing ? `
                <form class="settings-form settings-user-edit-form" data-user-id="${user.id}">
                    <label>
                        <span>Имя</span>
                        <input name="name" type="text" value="${escapeHtml(user.name)}" required>
                    </label>
                    <label>
                        <span>Логин</span>
                        <input name="login" type="text" value="${escapeHtml(user.login)}" required autocomplete="off"${isMainAdmin ? " readonly" : ""}>
                    </label>
                    <label>
                        <span>Роль</span>
                        <select name="role"${isMainAdmin ? " disabled" : ""}>
                            <option value="manager"${user.role === "manager" ? " selected" : ""}>Менеджер</option>
                            <option value="admin"${user.role === "admin" ? " selected" : ""}>Админ</option>
                        </select>
                        ${isMainAdmin ? `<input name="role" type="hidden" value="admin">` : ""}
                    </label>
                    <div class="settings-inline-actions">
                        <button type="submit">Сохранить</button>
                        <button class="settings-cancel-edit" type="button">Отмена</button>
                    </div>
                </form>
            ` : ""}
            <div class="settings-user-actions">
                ${isMainAdmin ? "" : `<button class="settings-edit-user" data-user-id="${user.id}" type="button">Редактировать</button>`}
                ${isMainAdmin ? "" : `
                    <button class="settings-toggle-user" data-user-id="${user.id}" data-is-active="${user.isActive ? "0" : "1"}" type="button"${isSelf && user.isActive ? " disabled" : ""}>
                        ${user.isActive ? "Отключить" : "Включить"}
                    </button>
                `}
                ${isSelf
                    ? `<span class="settings-muted settings-self-label">Текущий пользователь</span>`
                    : (isMainAdmin ? "" : `<button class="settings-delete-user" data-user-id="${user.id}" data-user-name="${escapeHtml(user.name)}" type="button">Удалить</button>`)}
                ${isMainAdmin ? "" : `
                    <form class="settings-user-password-form" data-user-id="${user.id}">
                        ${renderPasswordField({ name: "password", placeholder: "Новый пароль", minlength: "6" })}
                        <button type="submit">Сменить пароль</button>
                    </form>
                `}
            </div>
        </article>
    `;
}

function renderSettingsUsersList() {
    if (settingsUsersLoading) {
        return `<p class="settings-muted">Пользователи загружаются...</p>`;
    }

    if (settingsUsersError) {
        return `
            <div class="settings-empty-state">
                <p class="settings-muted">${escapeHtml(settingsUsersError)}</p>
                <button class="settings-refresh-users" type="button">Повторить</button>
            </div>
        `;
    }

    if (!settingsUsersLoaded) {
        return `<p class="settings-muted">Список пользователей еще не загружен.</p>`;
    }

    if (!settingsUsers.length) {
        return `<p class="settings-muted">Пользователей пока нет.</p>`;
    }

    return settingsUsers.map(renderUserCard).join("");
}

function renderUsersSettings() {
    if (!canManageUsers()) {
        return `
            <section class="settings-panel">
                <h2>Пользователи</h2>
                <p class="settings-muted">Управление пользователями доступно только администратору.</p>
            </section>
        `;
    }

    return `
        <section class="settings-panel">
            <div class="settings-panel-header">
                <h2>Пользователи</h2>
                <button class="settings-refresh-users" type="button">Обновить</button>
            </div>

            <form class="settings-form settings-create-user" id="createUserForm">
                <h3>Создать менеджера</h3>
                <label>
                    <span>Имя</span>
                    <input name="name" type="text" required>
                </label>
                <label>
                    <span>Логин</span>
                    <input name="login" type="text" required autocomplete="off">
                </label>
                <label>
                    <span>Пароль</span>
                    <span class="password-field">
                        <input name="password" type="password" minlength="6" required autocomplete="new-password">
                        <button class="password-toggle" type="button" data-password-toggle aria-label="Показать пароль">Показать</button>
                    </span>
                </label>
                <label>
                    <span>Роль</span>
                    <select name="role">
                        <option value="manager" selected>Менеджер</option>
                        <option value="admin">Админ</option>
                    </select>
                </label>
                <button type="submit">Создать пользователя</button>
            </form>

            <div class="settings-users-list">
                ${renderSettingsUsersList()}
            </div>
        </section>
    `;
}

function renderSettings() {
    if (!settingsView) return;

    if (!canManageUsers() && activeSettingsTab === "users") {
        activeSettingsTab = "profile";
    }

    settingsView.innerHTML = `
        <header class="crm-topbar">
            <div>
                <h1>Настройки</h1>
                <p>Профиль и пользователи MatMix CRM</p>
            </div>
        </header>

        ${renderSettingsTabs()}
        ${activeSettingsTab === "users" ? renderUsersSettings() : renderProfileSettings()}
    `;
    bindSettingsFormEvents();
}

async function loadSettings() {
    renderSettings();

    if (canManageUsers() && activeSettingsTab === "users") {
        await loadUsers();
    }
}

async function loadUsers() {
    if (!canManageUsers()) return;

    settingsUsersLoading = true;
    settingsUsersError = "";
    renderSettings();

    try {
        const response = await fetch("/api/users", { credentials: "include" });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Список пользователей не загрузился.");
        }

        settingsUsers = result.users || [];
        settingsUsersLoaded = true;
    } catch (error) {
        settingsUsersError = error.message || "Не удалось загрузить пользователей.";
        setMessage(settingsUsersError);
    } finally {
        settingsUsersLoading = false;
        renderSettings();
    }
}

async function changeOwnPassword(form) {
    console.log("[settings] change password handler", { formId: form?.id || "" });
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const payload = { currentPassword, newPassword };
    console.log("[settings] change password endpoint", "/api/auth/password");
    console.log("[settings] change password payload", getSafePayloadInfo({
        ...payload,
        confirmPassword
    }));

    if (newPassword.length < 6) {
        setMessage("Новый пароль должен быть не короче 6 символов.");
        logSettingsWarn("change password validation failed", "short password");
        return;
    }

    if (newPassword !== confirmPassword) {
        setMessage("Новый пароль и повтор не совпадают.");
        logSettingsWarn("change password validation failed", "password mismatch");
        return;
    }

    try {
        const response = await fetch("/api/auth/password", {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        console.log("[settings] change password response", response.status, result);

        if (!response.ok || !result.success) {
            const message = result.message || "Пароль не изменен.";
            logSettingsWarn("change password backend rejected", message);
            throw new Error(message);
        }

        form.reset();
        setMessage("Пароль изменен.");
    } catch (error) {
        logSettingsError("change password error", error);
        setMessage(error.message || "Ошибка соединения с сервером");
    }
}

async function createUser(form) {
    console.log("[settings] create user handler", { formId: form?.id || "" });
    const formData = new FormData(form);
    const payload = {
        name: String(formData.get("name") || "").trim(),
        login: String(formData.get("login") || "").trim(),
        password: String(formData.get("password") || ""),
        role: String(formData.get("role") || "manager")
    };
    console.log("[settings] create user endpoint", "/api/users");
    console.log("[settings] create user payload", getSafePayloadInfo(payload));

    if (!payload.name || !payload.login || payload.password.length < 6) {
        setMessage("Заполните имя, логин и пароль от 6 символов.");
        logSettingsWarn("create user validation failed", getSafePayloadInfo(payload));
        return;
    }

    try {
        const response = await fetch("/api/users", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        console.log("[settings] create user response", response.status, result);

        if (!response.ok || !result.success) {
            const message = result.message || "Пользователь не создан.";
            logSettingsWarn("create user backend rejected", message);
            throw new Error(message);
        }

        form.reset();
        setMessage("Пользователь создан.");
        await loadUsers();
    } catch (error) {
        logSettingsError("create user error", error);
        setMessage(error.message || "Ошибка соединения с сервером");
    }
}

async function updateUser(userId, form) {
    const formData = new FormData(form);
    const payload = {
        name: String(formData.get("name") || "").trim(),
        login: String(formData.get("login") || "").trim(),
        role: String(formData.get("role") || "")
    };

    if (!payload.name || !payload.login || !["admin", "manager"].includes(payload.role)) {
        setMessage("Заполните имя, логин и корректную роль.");
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Пользователь не обновлен.");
        }

        if (Number(result.user?.id) === Number(currentUser?.id)) {
            currentUser = result.user;
            managerUserName.textContent = currentUser.name;
            managerUserRole.textContent = getRoleLabel(currentUser.role);
        }

        editingUserId = null;
        setMessage("Пользователь обновлен.");
        await loadUsers();
    } catch (error) {
        setMessage(error.message || "Не удалось обновить пользователя.");
    }
}

async function deleteUser(userId, userName) {
    if (!window.confirm(`Удалить пользователя ${userName}? Пользователь будет отключен и скрыт из списка.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: "DELETE",
            credentials: "include"
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Пользователь не удален.");
        }

        if (Number(editingUserId) === Number(userId)) {
            editingUserId = null;
        }
        setMessage("Пользователь удален.");
        await loadUsers();
    } catch (error) {
        setMessage(error.message || "Не удалось удалить пользователя.");
    }
}

async function toggleUserStatus(userId, isActive) {
    try {
        const response = await fetch(`/api/users/${userId}/status`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive })
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Статус пользователя не изменен.");
        }

        setMessage(isActive ? "Пользователь включен." : "Пользователь отключен.");
        await loadUsers();
    } catch (error) {
        setMessage(error.message || "Не удалось изменить статус пользователя.");
    }
}

async function changeUserPassword(userId, form) {
    const password = String(new FormData(form).get("password") || "");

    if (password.length < 6) {
        setMessage("Пароль должен быть не короче 6 символов.");
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}/password`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Пароль пользователя не изменен.");
        }

        form.reset();
        setMessage("Пароль пользователя изменен.");
    } catch (error) {
        setMessage(error.message || "Не удалось сменить пароль пользователя.");
    }
}
