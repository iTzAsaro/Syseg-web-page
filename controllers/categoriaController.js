const { Categoria } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.status(200).json(categorias);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).send({ message: "El nombre de la categoría es obligatorio." });
        }
        
        const nuevaCategoria = await Categoria.create({ nombre });
        res.status(201).json(nuevaCategoria);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
