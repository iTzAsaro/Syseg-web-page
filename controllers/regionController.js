const { Region } = require('../models');

const getAllRegions = async (req, res) => {
    try {
        const regions = await Region.findAll({
            order: [['id', 'ASC']]
        });
        res.json(regions);
    } catch (error) {
        console.error('Error obteniendo regiones:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener regiones' });
    }
};

module.exports = {
    getAllRegions
};
