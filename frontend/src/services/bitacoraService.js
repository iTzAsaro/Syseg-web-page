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
  }
};

export default BitacoraService;
