const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/bitacoraController');

module.exports = function(app) {
    // Crear registro
    app.post("/api/bitacora", [verifyToken, hasPermission('CREAR_BITACORA')], controller.create);

    // Obtener logs
    app.get("/api/bitacora", [verifyToken, hasPermission('VER_BITACORA')], controller.buscarTodos);
};
