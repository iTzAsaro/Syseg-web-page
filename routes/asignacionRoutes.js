const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/asignacionController');

/**
 * NOMBRE: Rutas de Asignación
 * FUNCIÓN: Define los endpoints para la gestión de turnos y asignaciones.
 * USO: Asocia las URL con los métodos del controlador correspondiente.
 * -----------------------------------------------------------------------
 * Protegido por middleware de token y permisos específicos (CREAR, VER, ELIMINAR).
 */
module.exports = function(app) {
    app.post("/api/asignaciones", [verifyToken, hasPermission('CREAR_ASIGNACION')], controller.createAsignacion);
    app.get("/api/asignaciones", [verifyToken, hasPermission('VER_ASIGNACIONES')], controller.getAsignaciones);
    app.put("/api/asignaciones/:id", [verifyToken, hasPermission('CREAR_ASIGNACION')], controller.updateAsignacion); 
    app.delete("/api/asignaciones/:id", [verifyToken, hasPermission('ELIMINAR_ASIGNACION')], controller.deleteAsignacion);
};
