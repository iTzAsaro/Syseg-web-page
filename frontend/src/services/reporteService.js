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

const reporteService = {
    getDashboardStats
};

export default reporteService;
