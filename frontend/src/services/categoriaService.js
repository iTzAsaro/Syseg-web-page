import api from '../api/axios';

const categoriaService = {
    getAll: async () => {
        const response = await api.get('/categorias');
        return response.data;
    },
    create: async (data) => {
        const response = await api.post('/categorias', data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/categorias/${id}`);
        return response.data;
    }
};

export default categoriaService;
