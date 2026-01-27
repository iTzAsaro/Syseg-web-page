const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/asignacionController');

module.exports = function(app) {
    app.post("/api/asignaciones", [verifyToken, hasPermission('CREAR_ASIGNACION')], controller.createAsignacion);
    app.get("/api/asignaciones", [verifyToken, hasPermission('VER_ASIGNACIONES')], controller.getAsignaciones);
    app.put("/api/asignaciones/:id", [verifyToken, hasPermission('CREAR_ASIGNACION')], controller.updateAsignacion); // Reusing 'CREAR' as generic edit for now or 'EDITAR_ASIGNACION'
    app.delete("/api/asignaciones/:id", [verifyToken, hasPermission('ELIMINAR_ASIGNACION')], controller.deleteAsignacion);
};
