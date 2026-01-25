const { verifyToken, isAdmin } = require('../middleware/authJwt');
const controller = require('../controllers/bitacoraController');

module.exports = function(app) {
    // Crear registro (puede ser llamado desde frontend para eventos de usuario)
    app.post("/api/bitacora", [verifyToken], controller.create);

    // Obtener logs (Solo Admin por ahora, o quien tenga permiso)
    app.get("/api/bitacora", [verifyToken], controller.buscarTodos);
};
