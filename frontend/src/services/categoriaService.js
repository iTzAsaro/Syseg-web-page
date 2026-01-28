import api from '../api/axios';

const categoriaService = {
    getAll: async () => {
        const response = await api.get('/categorias');
        return response.data;
    }
};

export default categoriaService;
