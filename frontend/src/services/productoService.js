import api from '../api/axios';

const PRODUCTO_URL = '/productos';

const productoService = {
    getAll: async () => {
        const response = await api.get(PRODUCTO_URL);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`${PRODUCTO_URL}/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post(PRODUCTO_URL, data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`${PRODUCTO_URL}/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`${PRODUCTO_URL}/${id}`);
        return response.data;
    }
};

export default productoService;
