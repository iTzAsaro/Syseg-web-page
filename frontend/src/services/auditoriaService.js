import api from '../api/axios';

const API_URL = '/auditoria';

/**
 * Servicio para gestionar las operaciones de auditoría.
 */
const AuditoriaService = {
  /**
   * Obtiene los registros de auditoría con filtros.
   * @param {Object} params - Parámetros de filtro y paginación.
   * @param {number} [params.page] - Número de página (default 1).
   * @param {number} [params.limit] - Límites por página (default 20).
   * @param {number} [params.usuario_id] - ID del usuario a filtrar.
   * @param {string} [params.accion] - Acción a buscar (filtro like).
   * @param {string} [params.fecha_inicio] - Fecha de inicio (ISO string).
   * @param {string} [params.fecha_fin] - Fecha de fin (ISO string).
   * @returns {Promise<Object>} Objeto con logs, totalItems, totalPages, currentPage.
   */
  getAll: async (params) => {
    const response = await api.get(API_URL, { params });
    return response.data;
  }
};

export default AuditoriaService;
