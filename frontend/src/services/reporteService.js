import axios from '../api/axios';

const API_URL = '/reportes';

/**
 * Servicio para obtener datos de reportes y estadísticas.
 */

/**
 * Obtiene las estadísticas para el dashboard de reportes.
 * @returns {Promise<Object>} Objeto con activityData, topItems, y recentEvents.
 */
const getDashboardStats = async () => {
    const response = await axios.get(`${API_URL}/dashboard`);
    return response.data;
};

/**
 * Obtiene el resumen operativo (KPIs) para el dashboard principal.
 * @returns {Promise<Object>} Objeto con totalProductos, guardiasActivos, stockCritico, retirosHoy.
 */
const getResumenOperativo = async () => {
    // La ruta en el backend es /api/reportes/resumen, que coincide con API_URL + '/resumen'
    // Asegurarse de que el backend tiene definida esta ruta.
    const response = await axios.get(`${API_URL}/resumen`);
    return response.data;
};

const reporteService = {
    getDashboardStats,
    getResumenOperativo
};

export default reporteService;
