
export const apiCall = async (endpoint, method = 'GET', data = null) => {
    const headers = {
        'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }

    const config = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
    };

    try {
        const response = await fetch(endpoint, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || errorData.detail || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const dashboardAPI = {
    getStats: () => apiCall('/api/dashboard/stats'),
    getActivity: () => apiCall('/api/dashboard/activity'),
    getEvents: () => apiCall('/api/dashboard/events'),
};

export const aptitudeAPI = {
    getTests: () => apiCall('/api/aptitude/tests'),
    getResults: () => apiCall('/api/aptitude/results'),
};

export const codingAPI = {
    getProblems: () => apiCall('/api/coding/problems'),
    getSubmissions: () => apiCall('/api/coding/submissions'),
};
