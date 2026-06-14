const API_BASE = 'http://localhost:3000/api';

async function parseApiError(response, fallbackMessage) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `${fallbackMessage} (${response.status})`);
    error.status = response.status;
    return error;
}

async function apiGet(path) {
    const response = await fetch(`${API_BASE}${path}`);

    if (!response.ok) {
        throw await parseApiError(response, 'Không thể lấy dữ liệu từ API');
    }

    return response.json();
}

async function apiPost(path, data) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw await parseApiError(response, 'Không thể gửi đến API');
    }

    return response.json();
}

function getApiHeaders() {
    const token = localStorage.getItem('authToken');

    return {
        'Content-Type': 'application/json',
        ...(token ? {
            Authorization: `Bearer ${token}`
        } : {})
    };
}

async function apiPatch(path, data) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw await parseApiError(response, 'Không thể cập nhật dữ liệu đến API');
    }

    return response.json();
}
async function apiPut(path, data) {
    const response = await fetch(`${API_BASE}${path}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw await parseApiError(
            response,
            'Không thể cập nhật dữ liệu'
        );
    }

    return response.json();
}
