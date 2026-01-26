import axios from '../api/axios';

const API_URL = '/asignaciones';

/**
 * Crea una nueva asignación de turno.
 * @param {Object} data - Datos de la asignación.
 * @returns {Promise<Object>} La asignación creada.
 */
const create = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

/**
 * Obtiene todas las asignaciones, opcionalmente filtradas.
 * @param {Object} params - Parámetros de filtro.
 * @param {string} [params.start_date] - Fecha de inicio para filtrar.
 * @param {string} [params.end_date] - Fecha de fin para filtrar.
 * @param {number} [params.guardia_id] - ID del guardia para filtrar.
 * @param {number} [params.local_id] - ID del local para filtrar.
 * @returns {Promise<Array>} Lista de asignaciones.
 */
const getAll = async (params) => {
    const response = await axios.get(API_URL, { params });
    return response.data;
};

/**
 * Actualiza una asignación existente.
 * @param {number|string} id - ID de la asignación.
 * @param {Object} data - Datos a actualizar.
 * @returns {Promise<Object>} La asignación actualizada.
 */
const update = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

/**
 * Elimina una asignación.
 * @param {number|string} id - ID de la asignación.
 * @returns {Promise<Object>} Respuesta de eliminación.
 */
const remove = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export default {
    create,
    getAll,
    update,
    remove
};
