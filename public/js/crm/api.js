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

        if (body instanceof FormData) {
            options.body = body;
        } else if (body !== undefined) {
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
            const errorPayload = { ...data, status: response.status };
            throw new window.CrmApiError(
                window.CrmErrorHandler.getMessage(errorPayload, window.CRM_MESSAGES?.ERROR_SERVER),
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
        },
        async download(url) {
            let response;
            try {
                response = await fetch(url, {
                    method: "GET",
                    credentials: "include"
                });
            } catch (error) {
                throw window.CrmErrorHandler.normalize(error, window.CRM_MESSAGES?.ERROR_NETWORK);
            }

            if (!response.ok) {
                const data = await readJson(response);
                const errorPayload = { ...data, status: response.status };
                throw new window.CrmApiError(
                    window.CrmErrorHandler.getMessage(errorPayload, window.CRM_MESSAGES?.ERROR_SERVER),
                    { status: response.status, data }
                );
            }

            const blob = await response.blob();
            const disposition = response.headers.get("Content-Disposition") || "";
            const filenameMatch = disposition.match(/filename\*=UTF-8''([^;]+)/);
            const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : "download.xlsx";
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(objectUrl);

            return { filename };
        }
    };
})(window);
