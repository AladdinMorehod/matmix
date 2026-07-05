(function initCrmApi(window) {
    async function readJson(response) {
        try {
            return await response.json();
        } catch {
            return {};
        }
    }

    async function request(method, url, body) {
        const options = {
            method,
            credentials: "include",
            headers: {}
        };

        if (body !== undefined) {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(body);
        }

        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            throw window.CrmErrorHandler.normalize(error, window.CRM_MESSAGES?.ERROR_NETWORK);
        }

        const data = await readJson(response);
        if (!response.ok || data.success === false) {
            throw new window.CrmApiError(
                window.CrmErrorHandler.getMessage(data.message, window.CRM_MESSAGES?.ERROR_SERVER),
                { status: response.status, data }
            );
        }

        return data;
    }

    window.CrmApi = {
        get(url) {
            return request("GET", url);
        },
        post(url, body) {
            return request("POST", url, body);
        },
        patch(url, body) {
            return request("PATCH", url, body);
        },
        delete(url, body) {
            return request("DELETE", url, body);
        }
    };
})(window);
