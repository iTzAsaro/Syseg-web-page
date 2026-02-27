const { verifyToken, isAdmin } = require('../middleware/authJwt');
const controller = require('../controllers/entregaEppController');

/**
 * NOMBRE: Rutas de Entrega de EPP
 * FUNCIÓN: Define los endpoints para el flujo de entrega de equipos de protección.
 * USO: Permite crear borradores, finalizar entregas, consultar historial y generar PDFs.
 * -----------------------------------------------------------------------
 * Soporta firma digital y envío de correos.
 */
module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/entrega-epp", [verifyToken], controller.createEntrega);
    app.post("/api/entrega-epp/finalize", [verifyToken], controller.finalizeEntrega);
    app.get("/api/entrega-epp", [verifyToken], controller.getEntregas);
    app.get("/api/entrega-epp/draft", [verifyToken], controller.getLastDraft);
    app.get("/api/entrega-epp/:id", [verifyToken], controller.getEntregaById);
};
