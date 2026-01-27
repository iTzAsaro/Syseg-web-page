const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/usuarioController');

module.exports = function(app) {
    // Rutas de Metadatos (Roles y Permisos)
    app.get("/api/roles", [verifyToken, hasPermission('VER_USUARIOS')], controller.obtenerRoles);
    app.get("/api/permisos", [verifyToken, hasPermission('GESTIONAR_PERMISOS')], controller.obtenerPermisos);

    // Rutas CRUD Básicas
    app.post("/api/usuarios", [verifyToken, hasPermission('CREAR_USUARIO')], controller.crear);
    app.get("/api/usuarios", [verifyToken, hasPermission('VER_USUARIOS')], controller.buscarTodos);
    app.get("/api/usuarios/:id", [verifyToken, hasPermission('VER_USUARIOS')], controller.buscarUno);
    app.put("/api/usuarios/:id", [verifyToken, hasPermission('EDITAR_USUARIO')], controller.actualizar);
    app.delete("/api/usuarios/:id", [verifyToken, hasPermission('ELIMINAR_USUARIO')], controller.eliminar);

    // Rutas de Gestión Específica
    app.put("/api/usuarios/:id/estado", [verifyToken, hasPermission('EDITAR_USUARIO')], controller.cambiarEstado);
    app.put("/api/usuarios/:id/permisos", [verifyToken, hasPermission('GESTIONAR_PERMISOS')], controller.gestionarPermisos);
};
