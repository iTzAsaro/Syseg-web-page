const { Categoria } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.status(200).json(categorias);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
