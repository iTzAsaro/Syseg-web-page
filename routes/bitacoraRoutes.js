const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/bitacoraController');

/**
 * NOMBRE: Rutas de Bitácora
 * FUNCIÓN: Define los endpoints para el registro de eventos operativos (Libro de Novedades).
 * USO: CRUD completo para gestionar entradas en la bitácora digital.
 * -----------------------------------------------------------------------
 * Requiere permisos específicos para cada acción.
 */
module.exports = function(app) {
    // Crear registro
    app.post("/api/bitacora", [verifyToken, hasPermission('CREAR_BITACORA')], controller.create);

    // Obtener logs
    app.get("/api/bitacora", [verifyToken, hasPermission('VER_BITACORA')], controller.buscarTodos);

    // Editar registro
    app.put("/api/bitacora/:id", [verifyToken, hasPermission('CREAR_BITACORA')], controller.update);

    // Eliminar registro
    app.delete("/api/bitacora/:id", [verifyToken, hasPermission('CREAR_BITACORA')], controller.delete);
};
