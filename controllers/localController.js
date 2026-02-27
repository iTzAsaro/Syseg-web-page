const { Local, Comuna } = require('../models');

/**
 * ================================================================================================
 * NOMBRE: Listar Locales Activos
 * FUNCIÓN: Obtiene todos los locales que están marcados como activos (estado: true).
 * USO: GET /locales - Retorna array JSON de locales con nombre de comuna asociada.
 * -----------------------------------------------------------------------
 * Filtra automáticamente por 'estado: true' para no mostrar locales deshabilitados.
 * ================================================================================================
 */
exports.getAllLocals = async (req, res) => {
    try {
        const locals = await Local.findAll({
            include: [{ model: Comuna, attributes: ['nombre'] }],
            where: { estado: true }
        });
        res.json(locals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
