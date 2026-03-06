import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7196/api', // HTTPS port from launchSettings.json usually, or we can use generic 5001/5000. Let's assume standard ASP.NET dev port or we will configure via env
    headers: {
        'Content-Type': 'application/json',
    },
});

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
