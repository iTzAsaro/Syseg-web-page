const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/movimientoInventarioController');

/**
 * NOMBRE: Rutas de Movimiento de Inventario
 * FUNCIÓN: Define los endpoints para registrar entradas y salidas de stock.
 * USO: Permite auditar el historial de movimientos y realizar ajustes manuales.
 * -----------------------------------------------------------------------
 * Vincula acciones con permisos de inventario (VER_INVENTARIO, AJUSTAR_STOCK).
 */
module.exports = function(app) {
    app.get("/api/movimientos", [verifyToken, hasPermission('VER_INVENTARIO')], controller.getAll);
    app.get("/api/tipos-movimiento", [verifyToken], controller.getTypes); // Permitir a autenticados ver tipos
    app.post("/api/movimientos", [verifyToken, hasPermission('AJUSTAR_STOCK')], controller.create); 
};
