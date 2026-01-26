import api from '../api/axios';

const BlacklistService = {
  // Obtener todos los registros
  getAll: async () => {
    const response = await api.get('/blacklist');
    return response.data;
  },

  // Crear nuevo registro
  create: async (data) => {
    const response = await api.post('/blacklist', data);
    return response.data;
  },

  // Actualizar registro
  update: async (id, data) => {
    const response = await api.put(`/blacklist/${id}`, data);
    return response.data;
  },

  // Eliminar registro
  delete: async (id) => {
    const response = await api.delete(`/blacklist/${id}`);
    return response.data;
  }
};

export default BlacklistService;
