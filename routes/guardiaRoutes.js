const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/guardiaController');

/**
 * NOMBRE: Rutas de Guardia
 * FUNCIÓN: Define los endpoints para la gestión integral del personal de seguridad.
 * USO: CRUD completo incluyendo perfil, tallas, datos bancarios y documentos.
 * -----------------------------------------------------------------------
 * Requiere permisos específicos para cada operación (CREAR, VER, EDITAR, ELIMINAR).
 */
module.exports = function(app) {
    // Rutas para gestión de Guardias
    app.post("/api/guardias", [verifyToken, hasPermission('CREAR_GUARDIA')], controller.crear);          // Crear nuevo guardia
    app.get("/api/guardias", [verifyToken, hasPermission('VER_GUARDIAS')], controller.buscarTodos);              // Listar todos los guardias
    app.get("/api/guardias/:id", [verifyToken, hasPermission('VER_GUARDIAS')], controller.buscarUno);            // Obtener detalles de un guardia
    app.put("/api/guardias/:id", [verifyToken, hasPermission('EDITAR_GUARDIA')], controller.actualizar);  // Actualizar datos de guardia
    app.delete("/api/guardias/:id", [verifyToken, hasPermission('ELIMINAR_GUARDIA')], controller.eliminar); // Eliminar guardia
};
