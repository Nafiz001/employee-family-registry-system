import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api', // Use env var if present, or rely on Nginx proxy at /api
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 s — prevents requests hanging forever on Render cold starts
});

// Retry once on network error (no HTTP response received).
// This handles stale keep-alive TCP connections left over after a Render dyno restart:
// the browser tries the dead connection, gets a network error, we retry on a fresh connection.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        if (config && !config._retried && !error.response) {
            config._retried = true;
            await new Promise(resolve => setTimeout(resolve, 1500));
            return api(config);
        }
        return Promise.reject(error);
    }
);

// Add a request interceptor to inject JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
