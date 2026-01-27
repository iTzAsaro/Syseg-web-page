const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/movimientoInventarioController');

module.exports = function(app) {
    app.get("/api/movimientos", [verifyToken, hasPermission('VER_INVENTARIO')], controller.getAll);
    app.post("/api/movimientos", [verifyToken, hasPermission('AJUSTAR_STOCK')], controller.create); 
};
