const { Producto, Categoria } = require('../models');

// Obtener todos los productos
exports.getAll = async (req, res) => {
    try {
        const productos = await Producto.findAll({
            include: [{
                model: Categoria,
                attributes: ['id', 'nombre']
            }]
        });
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Obtener un producto por ID
exports.getById = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id, {
            include: [{
                model: Categoria,
                attributes: ['id', 'nombre']
            }]
        });

        if (!producto) {
            return res.status(404).send({ message: "Producto no encontrado." });
        }

        res.status(200).json(producto);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Crear un nuevo producto
exports.create = async (req, res) => {
    try {
        const { nombre, stock_actual, stock_minimo, categoria_id } = req.body;

        // Validaciones básicas
        if (!nombre || !categoria_id) {
            return res.status(400).send({ message: "Nombre y Categoría son obligatorios." });
        }

        const producto = await Producto.create({
            nombre,
            stock_actual: stock_actual || 0,
            stock_minimo: stock_minimo || 0,
            categoria_id
        });

        res.status(201).json(producto);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Actualizar un producto
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, stock_actual, stock_minimo, categoria_id } = req.body;

        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).send({ message: "Producto no encontrado." });
        }

        await producto.update({
            nombre,
            stock_actual,
            stock_minimo,
            categoria_id
        });

        res.status(200).json(producto);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Eliminar un producto
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const producto = await Producto.findByPk(id);

        if (!producto) {
            return res.status(404).send({ message: "Producto no encontrado." });
        }

        await producto.destroy();
        res.status(200).send({ message: "Producto eliminado exitosamente." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
