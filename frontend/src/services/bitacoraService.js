import api from '../api/axios';

const BitacoraService = {
  // Obtener registros con filtros
  getAll: async (params) => {
    // params puede incluir: page, limit, search, nivel, fechaInicio, fechaFin
    const response = await api.get('/bitacora', { params });
    return response.data;
  },

  // Crear un nuevo registro
  create: async (data) => {
    const response = await api.post('/bitacora', data);
    return response.data;
  },

  // Actualizar un registro existente
  update: async (id, data) => {
    const response = await api.put(`/bitacora/${id}`, data);
    return response.data;
  },

  // Eliminar un registro
  delete: async (id) => {
    const response = await api.delete(`/bitacora/${id}`);
    return response.data;
  }
};

export default BitacoraService;
