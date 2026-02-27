const { Region } = require('../models');

/**
 * NOMBRE: Listar Regiones
 * FUNCIÓN: Obtiene todas las regiones ordenadas ascendente por ID.
 * USO: GET /regiones - Retorna array JSON de regiones.
 * -----------------------------------------------------------------------
 * Utilizado para poblar selectores geográficos en el frontend.
 */
exports.getAllRegions = async (req, res) => {
    try {
        res.json(await Region.findAll({ order: [['id', 'ASC']] }));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
