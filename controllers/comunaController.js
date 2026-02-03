const { Comuna } = require('../models');

const getAllComunas = async (req, res) => {
    try {
        const { region_id } = req.query;
        const whereClause = {};
        
        if (region_id) {
            whereClause.region_id = region_id;
        }

        const comunas = await Comuna.findAll({
            where: whereClause,
            order: [['nombre', 'ASC']]
        });
        res.json(comunas);
    } catch (error) {
        console.error('Error obteniendo comunas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener comunas' });
    }
};

module.exports = {
    getAllComunas
};
