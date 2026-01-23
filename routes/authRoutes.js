const { verifyToken } = require('../middleware/authJwt');
const controller = require('../controllers/authController');

module.exports = function(app) {
    // Middleware para configurar cabeceras de CORS
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    // Rutas de Autenticación
    app.post("/api/auth/signin/web", controller.iniciarSesionWeb); // Login para plataforma web
    app.post("/api/auth/signin/app", controller.iniciarSesionApp); // Login para aplicación móvil
};
