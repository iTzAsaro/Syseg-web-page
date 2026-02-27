const { Comuna } = require('../models');

/**
 * ================================================================================================
 * NOMBRE: Listar Comunas
 * FUNCIÓN: Obtiene la lista de comunas, opcionalmente filtradas por región.
 * USO: GET /comunas?region_id=5 - Retorna array JSON de comunas ordenadas alfabéticamente.
 * -----------------------------------------------------------------------
 * Permite filtrar dinámicamente por 'region_id' para implementar selectores en cascada en el frontend.
 * ================================================================================================
 */
exports.getAllComunas = async (req, res) => {
    try {
        const { region_id } = req.query;
        const where = region_id ? { region_id } : {};

        const comunas = await Comuna.findAll({
            where,
            order: [['nombre', 'ASC']]
        });
        res.json(comunas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
