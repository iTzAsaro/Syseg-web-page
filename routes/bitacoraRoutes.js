const { verifyToken, isAdmin } = require('../middleware/authJwt');
const controller = require('../controllers/bitacoraController');

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Crear registro (puede ser llamado desde frontend para eventos de usuario)
    app.post("/api/bitacora", [verifyToken], controller.create);

    // Obtener logs (Solo Admin por ahora, o quien tenga permiso)
    app.get("/api/bitacora", [verifyToken], controller.buscarTodos);
};
