const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/productoController');

/**
 * NOMBRE: Rutas de Producto
 * FUNCIÓN: Define los endpoints para el mantenimiento del catálogo de productos.
 * USO: CRUD completo de ítems de inventario (uniformes, EPP, etc.).
 * -----------------------------------------------------------------------
 * Gestión centralizada del stock teórico.
 */
module.exports = function(app) {
    app.get("/api/productos", [verifyToken, hasPermission('VER_INVENTARIO')], controller.getAll);
    app.get("/api/productos/:id", [verifyToken, hasPermission('VER_INVENTARIO')], controller.getById);
    app.post("/api/productos", [verifyToken, hasPermission('CREAR_PRODUCTO')], controller.create);
    app.put("/api/productos/:id", [verifyToken, hasPermission('EDITAR_PRODUCTO')], controller.update);
    app.delete("/api/productos/:id", [verifyToken, hasPermission('ELIMINAR_PRODUCTO')], controller.delete);
};
