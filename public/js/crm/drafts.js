(function initCrmDrafts(window) {
    const prefix = "matmix_crm_draft:";

    function getKey(key) {
        return `${prefix}${key}`;
    }

    function read(key, fallback = null) {
        try {
            const value = localStorage.getItem(getKey(key));
            return value === null ? fallback : JSON.parse(value);
        } catch {
            return fallback;
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(getKey(key), JSON.stringify(value));
        } catch {
            // Drafts are a convenience layer; form submit should keep working without storage.
        }
    }

    function clear(key) {
        try {
            localStorage.removeItem(getKey(key));
        } catch {
            // Ignore storage errors.
        }
    }

    function serializeForm(form) {
        const values = {};
        form.querySelectorAll("input[name], textarea[name], select[name]").forEach(field => {
            if (field.type === "password" || field.type === "file") return;
            if (field.type === "radio" && !field.checked) return;
            values[field.name] = field.type === "checkbox" ? field.checked : field.value;
        });
        return values;
    }

    function restoreForm(form, key) {
        const values = read(key, {});
        Object.entries(values).forEach(([name, value]) => {
            const fields = Array.from(form.querySelectorAll("input[name], textarea[name], select[name]"))
                .filter(field => field.name === name);
            fields.forEach(field => {
                if (field.type === "password" || field.type === "file") return;
                if (field.type === "checkbox") {
                    field.checked = Boolean(value);
                } else if (field.type === "radio") {
                    field.checked = field.value === String(value);
                } else {
                    field.value = value;
                }
            });
        });
    }

    function bindForm(form, key) {
        if (!form || !key) return;
        restoreForm(form, key);
        form.addEventListener("input", () => write(key, serializeForm(form)));
        form.addEventListener("change", () => write(key, serializeForm(form)));
    }

    window.CrmDrafts = {
        read,
        write,
        clear,
        bindForm,
        getValue(key, fallback = "") {
            return read(key, fallback);
        },
        setValue(key, value) {
            write(key, value);
        }
    };
})(window);
