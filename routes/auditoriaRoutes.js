const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/auditoriaController');

/**
 * NOMBRE: Rutas de Auditoría
 * FUNCIÓN: Define los endpoints para consultar el registro de actividades del sistema.
 * USO: Permite visualizar logs de acciones críticas (creación, edición, eliminación).
 * -----------------------------------------------------------------------
 * Acceso restringido a usuarios con permiso VER_AUDITORIA.
 */
module.exports = function(app) {
    app.get("/api/auditoria", [verifyToken, hasPermission('VER_AUDITORIA')], controller.listarLogs);
};
