const { Categoria, Producto } = require('../models');

/**
 * ================================================================================================
 * NOMBRE: Listar Categorías
 * FUNCIÓN: Obtiene todas las categorías de productos disponibles en el sistema.
 * USO: GET /categorias - Retorna array JSON con objetos de categoría.
 * -----------------------------------------------------------------------
 * Recupera todos los registros sin filtros ni paginación, ideal para llenar selectores en el frontend.
 * ================================================================================================
 */
exports.getAll = async (req, res) => {
    try {
        const categorias = await Categoria.findAll();
        res.status(200).json(categorias);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * ================================================================================================
 * NOMBRE: Crear Categoría
 * FUNCIÓN: Registra una nueva categoría para la clasificación de productos.
 * USO: POST /categorias - Retorna el objeto de la categoría creada.
 * -----------------------------------------------------------------------
 * Valida la presencia del campo 'nombre' antes de intentar la inserción en base de datos.
 * ================================================================================================
 */
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

/**
 * ================================================================================================
 * NOMBRE: Eliminar Categoría
 * FUNCIÓN: Elimina una categoría existente y desvincula los productos asociados.
 * USO: DELETE /categorias/:id - Retorna 204 No Content si es exitoso.
 * -----------------------------------------------------------------------
 * Antes de eliminar, actualiza los productos asociados seteando 'categoria_id' a NULL para mantener integridad referencial sin borrar productos.
 * ================================================================================================
 */
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
