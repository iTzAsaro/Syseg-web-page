import axios from '../api/axios';

const API_URL = '/locales';

/**
 * Servicio para gestionar las operaciones relacionadas con los locales (instalaciones).
 */

/**
 * Obtiene todos los locales registrados.
 * @returns {Promise<Array>} Lista de locales.
 */
const getAll = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export default {
    getAll
};
