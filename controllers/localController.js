const { Local, Comuna } = require('../models');

const getAllLocals = async (req, res) => {
    try {
        const locals = await Local.findAll({
            include: [{ model: Comuna, attributes: ['nombre'] }],
            where: { estado: true }
        });
        res.json(locals);
    } catch (error) {
        console.error('Error fetching locals:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { getAllLocals };
