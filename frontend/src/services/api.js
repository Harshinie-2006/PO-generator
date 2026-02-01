import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: "http://localhost:5002/api",
    withCredentials: true
});

// Add request interceptor for debugging
api.interceptors.request.use(
    config => {
        console.log('API Request:', config.method.toUpperCase(), config.url, config.data);
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
api.interceptors.response.use(
    response => {
        console.log('API Response:', response.status, response.data);
        return response;
    },
    error => {
        console.error('Response error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);


// Authentication API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    getCurrentUser: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout')
};

// Vendors API
export const vendorsAPI = {
    getAll: () => api.get('/vendors'),
    getById: (id) => api.get(`/vendors/${id}`),
    create: (data) => api.post('/vendors', data),
    update: (id, data) => api.put(`/vendors/${id}`, data),
    delete: (id) => api.delete(`/vendors/${id}`)
};

// Products API
export const productsAPI = {
    getAll: () => api.get('/products'),
    getLowStock: () => api.get('/products/low-stock'),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`)
};

// Purchase Orders API
export const purchaseOrdersAPI = {
    generate: () => api.post('/purchase-orders/generate'),
    getAll: (status) => api.get('/purchase-orders', { params: { status } }),
    getById: (id) => api.get(`/purchase-orders/${id}`),
    update: (id, data) => api.put(`/purchase-orders/${id}`, data),
    send: (id, deliveryMethod) => api.post(`/purchase-orders/${id}/send`, { deliveryMethod }),
    getPDF: (id) => `http://localhost:5002/api/purchase-orders/${id}/pdf`,
    delete: (id) => api.delete(`/purchase-orders/${id}`)
};

// Billing API
export const billingAPI = {
    create: (data) => api.post('/billing', data),
    getAll: () => api.get('/billing'),
    getById: (id) => api.get(`/billing/${id}`)
};

export default api;
