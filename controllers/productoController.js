const { Producto, Categoria, Auditoria } = require('../models');

// Helper para auditoría
const audit = (userId, objId, accion, detalles) => Auditoria.create({ usuario_id: userId, objetivo_id: objId, accion, detalles });

/**
 * ================================================================================================
 * NOMBRE: Listar Productos
 * FUNCIÓN: Obtiene el catálogo completo de productos con su categoría.
 * USO: GET /productos - Retorna array JSON de productos.
 * -----------------------------------------------------------------------
 * Incluye la relación con Categoría para mostrar el nombre en lugar del ID.
 * ================================================================================================
 */
exports.getAll = async (req, res) => {
    try {
        const productos = await Producto.findAll({ include: [{ model: Categoria, attributes: ['id', 'nombre'] }] });
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Obtener Producto por ID
 * FUNCIÓN: Busca un producto específico por su identificador único.
 * USO: GET /productos/:id - Retorna objeto JSON o 404 si no existe.
 * -----------------------------------------------------------------------
 * Retorna detalle completo incluyendo la categoría asociada.
 * ================================================================================================
 */
exports.getById = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id, { include: [{ model: Categoria, attributes: ['id', 'nombre'] }] });
        producto ? res.status(200).json(producto) : res.status(404).send({ message: "Producto no encontrado." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Crear Producto
 * FUNCIÓN: Registra un nuevo producto en el sistema y genera auditoría.
 * USO: POST /productos - Retorna el producto creado.
 * -----------------------------------------------------------------------
 * Valida campos obligatorios y establece valores por defecto para stocks si no se envían.
 * ================================================================================================
 */
exports.create = async (req, res) => {
    try {
        const { nombre, stock_actual = 0, stock_minimo = 0, categoria_id, descripcion } = req.body;
        if (!nombre || !categoria_id) return res.status(400).send({ message: "Nombre y Categoría son obligatorios." });

        const producto = await Producto.create({ nombre, stock_actual, stock_minimo, categoria_id, descripcion });
        await audit(req.userId, producto.id, 'CREAR_PRODUCTO', `Producto creado: ${nombre}`);

        res.status(201).json(producto);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Actualizar Producto
 * FUNCIÓN: Modifica datos de un producto existente y registra el cambio.
 * USO: PUT /productos/:id - Retorna el producto actualizado.
 * -----------------------------------------------------------------------
 * Verifica existencia antes de actualizar y audita la acción con el nombre del producto.
 * ================================================================================================
 */
exports.update = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).send({ message: "Producto no encontrado." });

        await producto.update(req.body);
        await audit(req.userId, producto.id, 'EDITAR_PRODUCTO', `Producto actualizado: ${producto.nombre}`);

        res.status(200).json(producto);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Eliminar Producto
 * FUNCIÓN: Elimina un producto del sistema y guarda registro en auditoría.
 * USO: DELETE /productos/:id - Retorna mensaje de éxito.
 * -----------------------------------------------------------------------
 * Realiza eliminación física (destroy) y registra quién realizó la acción.
 * ================================================================================================
 */
exports.delete = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).send({ message: "Producto no encontrado." });

        await producto.destroy();
        await audit(req.userId, req.params.id, 'ELIMINAR_PRODUCTO', `Producto eliminado: ${producto.nombre}`);

        res.status(200).send({ message: "Producto eliminado exitosamente." });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
