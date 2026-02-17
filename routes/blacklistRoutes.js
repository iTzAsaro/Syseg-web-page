const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/blacklistController');

module.exports = function(app) {
    app.post("/api/blacklist", [verifyToken, hasPermission('CREAR_BLACKLIST')], controller.crear);
    app.get("/api/blacklist", [verifyToken, hasPermission('VER_BLACKLIST')], controller.buscarTodos);
    app.put("/api/blacklist/:id", [verifyToken, hasPermission('EDITAR_BLACKLIST')], controller.actualizar);
    app.delete("/api/blacklist/:id", [verifyToken, hasPermission('ELIMINAR_BLACKLIST')], controller.eliminar);
};
