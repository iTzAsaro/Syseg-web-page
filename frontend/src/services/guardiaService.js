import axios from '../api/axios';

const API_URL = '/guardias';

/**
 * Servicio para gestionar las operaciones relacionadas con los guardias.
 * Proporciona métodos para CRUD (Crear, Leer, Actualizar, Eliminar).
 */

/**
 * Obtiene todos los guardias registrados.
 * @returns {Promise<Array>} Lista de guardias.
 */
const getAll = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

/**
 * Obtiene un guardia específico por su ID.
 * @param {number|string} id - ID del guardia.
 * @returns {Promise<Object>} Datos del guardia.
 */
const getById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

/**
 * Crea un nuevo guardia.
 * @param {Object} data - Datos del guardia a crear.
 * @returns {Promise<Object>} El guardia creado.
 */
const create = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

/**
 * Actualiza los datos de un guardia existente.
 * @param {number|string} id - ID del guardia a actualizar.
 * @param {Object} data - Nuevos datos del guardia.
 * @returns {Promise<Object>} El guardia actualizado.
 */
const update = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};

/**
 * Elimina un guardia por su ID.
 * @param {number|string} id - ID del guardia a eliminar.
 * @returns {Promise<Object>} Respuesta del servidor.
 */
const remove = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

const guardiaService = {
    getAll,
    getById,
    create,
    update,
    remove
};

export default guardiaService;
