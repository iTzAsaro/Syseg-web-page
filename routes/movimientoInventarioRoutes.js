const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/movimientoInventarioController');

module.exports = function(app) {
    app.get("/api/movimientos", [verifyToken, hasPermission('VER_INVENTARIO')], controller.getAll);
    app.get("/api/tipos-movimiento", [verifyToken], controller.getTypes); // Permitir a autenticados ver tipos
    app.post("/api/movimientos", [verifyToken, hasPermission('AJUSTAR_STOCK')], controller.create); 
};
