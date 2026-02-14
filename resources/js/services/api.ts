import axios, { AxiosError, AxiosInstance } from 'axios';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Para CSRF token
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add CSRF token if available
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (token) {
            config.headers['X-CSRF-TOKEN'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            const status = error.response.status;
            
            // Handle 401 - Unauthorized
            if (status === 401) {
                window.location.href = '/login';
            }
            
            // Handle 403 - Forbidden
            if (status === 403) {
                console.error('Acceso denegado');
            }
            
            // Handle 422 - Validation errors
            if (status === 422) {
                // Return validation errors to be handled by the caller
                return Promise.reject(error);
            }
            
            // Handle 500 - Server error
            if (status === 500) {
                console.error('Error del servidor. Por favor, intenta más tarde.');
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
