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
        return renderCrmLoader(CRM_MESSAGES.LOADING_USERS);
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
        const result = await CrmApi.get("/api/users");

        settingsUsers = result.users || [];
        settingsUsersLoaded = true;
    } catch (error) {
        settingsUsersError = getSafeErrorMessage(error, "Не удалось загрузить пользователей.");
        notifyError(error, settingsUsersError);
    } finally {
        settingsUsersLoading = false;
        renderSettings();
    }
}

async function changeOwnPassword(form) {
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") || "");
    const newPassword = String(formData.get("newPassword") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const payload = { currentPassword, newPassword };

    if (newPassword.length < 6) {
        notifyWarning("Новый пароль должен быть не короче 6 символов.");
        return;
    }

    if (newPassword !== confirmPassword) {
        notifyWarning("Новый пароль и повтор не совпадают.");
        return;
    }

    try {
        await CrmApi.patch("/api/auth/password", payload);

        form.reset();
        notifySuccess(CRM_MESSAGES.SUCCESS_PASSWORD_CHANGED);
    } catch (error) {
        notifyError(error, "Ошибка соединения с сервером");
    }
}

async function createUser(form) {
    const formData = new FormData(form);
    const payload = {
        name: String(formData.get("name") || "").trim(),
        login: String(formData.get("login") || "").trim(),
        password: String(formData.get("password") || ""),
        role: String(formData.get("role") || "manager")
    };

    if (!payload.name || !payload.login || payload.password.length < 6) {
        notifyWarning("Заполните имя, логин и пароль от 6 символов.");
        return;
    }

    try {
        await CrmApi.post("/api/users", payload);

        form.reset();
        notifySuccess(CRM_MESSAGES.SUCCESS_USER_CREATED);
        await loadUsers();
    } catch (error) {
        notifyError(error, "Ошибка соединения с сервером");
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
        notifyWarning("Заполните имя, логин и корректную роль.");
        return;
    }

    try {
        const result = await CrmApi.patch(`/api/users/${userId}`, payload);

        if (Number(result.user?.id) === Number(currentUser?.id)) {
            currentUser = result.user;
            managerUserName.textContent = currentUser.name;
            managerUserRole.textContent = getRoleLabel(currentUser.role);
        }

        editingUserId = null;
        notifySuccess(CRM_MESSAGES.SUCCESS_USER_UPDATED);
        await loadUsers();
    } catch (error) {
        notifyError(error, "Не удалось обновить пользователя.");
    }
}

async function deleteUser(userId, userName) {
    const confirmed = await CrmModal.open({
        title: CRM_MESSAGES.CONFIRM_DELETE_USER_TITLE,
        message: `Удалить пользователя ${userName}? Пользователь будет отключен и скрыт из списка.`,
        confirmText: CRM_MESSAGES.CONFIRM_DELETE_USER_ACTION
    });
    if (!confirmed) {
        return;
    }

    try {
        await CrmApi.delete(`/api/users/${userId}`);

        if (Number(editingUserId) === Number(userId)) {
            editingUserId = null;
        }
        notifySuccess(CRM_MESSAGES.SUCCESS_USER_DELETED);
        await loadUsers();
    } catch (error) {
        notifyError(error, "Не удалось удалить пользователя.");
    }
}

async function toggleUserStatus(userId, isActive) {
    const user = settingsUsers.find(item => String(item.id) === String(userId));
    if (!isActive) {
        const confirmed = await CrmModal.open({
            title: CRM_MESSAGES.CONFIRM_DISABLE_USER_TITLE,
            message: `Отключить пользователя ${user?.name || "без имени"}? Он не сможет войти в CRM.`,
            confirmText: CRM_MESSAGES.CONFIRM_DISABLE_USER_ACTION
        });
        if (!confirmed) {
            return;
        }
    }

    try {
        await CrmApi.patch(`/api/users/${userId}/status`, { isActive });

        notifySuccess(isActive ? CRM_MESSAGES.SUCCESS_USER_ENABLED : CRM_MESSAGES.SUCCESS_USER_DISABLED);
        await loadUsers();
    } catch (error) {
        notifyError(error, "Не удалось изменить статус пользователя.");
    }
}

async function changeUserPassword(userId, form) {
    const password = String(new FormData(form).get("password") || "");

    if (password.length < 6) {
        notifyWarning("Пароль должен быть не короче 6 символов.");
        return;
    }

    try {
        await CrmApi.patch(`/api/users/${userId}/password`, { password });

        form.reset();
        notifySuccess(CRM_MESSAGES.SUCCESS_USER_PASSWORD_CHANGED);
    } catch (error) {
        notifyError(error, "Не удалось сменить пароль пользователя.");
    }
}
