import api from '../api/axios';

export const crearReporteOperativo = async (payload) => {
  const response = await api.post('/reportes-operativos', payload);
  return response.data;
};

