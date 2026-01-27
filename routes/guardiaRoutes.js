const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/guardiaController');

module.exports = function(app) {
    // Rutas para gestión de Guardias
    app.post("/api/guardias", [verifyToken, hasPermission('CREAR_GUARDIA')], controller.crear);          // Crear nuevo guardia
    app.get("/api/guardias", [verifyToken, hasPermission('VER_GUARDIAS')], controller.buscarTodos);              // Listar todos los guardias
    app.get("/api/guardias/:id", [verifyToken, hasPermission('VER_GUARDIAS')], controller.buscarUno);            // Obtener detalles de un guardia
    app.put("/api/guardias/:id", [verifyToken, hasPermission('EDITAR_GUARDIA')], controller.actualizar);  // Actualizar datos de guardia
    app.delete("/api/guardias/:id", [verifyToken, hasPermission('ELIMINAR_GUARDIA')], controller.eliminar); // Eliminar guardia
};
