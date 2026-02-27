const controller = require('../controllers/reporteController');
const { verifyToken, hasPermission } = require('../middleware/authJwt');

/**
 * NOMBRE: Rutas de Reportes
 * FUNCIÓN: Define los endpoints para la generación de estadísticas y cuadros de mando.
 * USO: Alimenta los gráficos del Dashboard y KPIs principales.
 * -----------------------------------------------------------------------
 * Agrega datos de múltiples fuentes (Asistencia, Inventario, Bitácora).
 */
module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/reportes/dashboard", [verifyToken, hasPermission('VER_REPORTES')], controller.getDashboardStats);
    
    // Resumen Operativo (KPIs Dashboard Principal)
    app.get("/api/reportes/resumen", [verifyToken], controller.getResumenOperativo);
};
