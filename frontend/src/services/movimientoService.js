import api from '../api/axios';

const MovimientoService = {
    /**
     * Obtiene todos los movimientos de inventario
     * @returns {Promise<Array>} Lista de movimientos
     */
    getAll: async () => {
        const response = await api.get('/movimientos');
        return response.data;
    },

    /**
     * Obtiene los tipos de movimiento
     * @returns {Promise<Array>} Lista de tipos
     */
    getTypes: async () => {
        const response = await api.get('/tipos-movimiento');
        return response.data;
    },

    /**
     * Crea un nuevo movimiento de inventario (Entrada/Salida)
     * @param {Object} data - Datos del movimiento
     * @returns {Promise<Object>} Movimiento creado
     */
    create: async (data) => {
        const response = await api.post('/movimientos', data);
        return response.data;
    }
};

export default MovimientoService;
