const { Categoria, Producto } = require('../models');

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

exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        await Producto.update(
            { categoria_id: null },
            { where: { categoria_id: id } }
        );
        const deleted = await Categoria.destroy({
            where: { id }
        });
        if (deleted) {
            return res.status(204).send();
        }
        return res.status(404).send({ message: "Categoría no encontrada." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
