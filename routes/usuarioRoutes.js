const { verifyToken, isAdmin } = require('../middleware/authJwt');
const controller = require('../controllers/usuarioController');

module.exports = function(app) {
    // Rutas de Metadatos (Roles y Permisos)
    app.get("/api/roles", [verifyToken, isAdmin], controller.obtenerRoles);
    app.get("/api/permisos", [verifyToken, isAdmin], controller.obtenerPermisos);

    // Rutas CRUD Básicas
    app.post("/api/usuarios", [verifyToken, isAdmin], controller.crear);
    app.get("/api/usuarios", [verifyToken, isAdmin], controller.buscarTodos);
    app.get("/api/usuarios/:id", [verifyToken, isAdmin], controller.buscarUno);
    app.put("/api/usuarios/:id", [verifyToken, isAdmin], controller.actualizar);
    app.delete("/api/usuarios/:id", [verifyToken, isAdmin], controller.eliminar);

    // Rutas de Gestión Específica
    app.put("/api/usuarios/:id/estado", [verifyToken, isAdmin], controller.cambiarEstado);
    app.put("/api/usuarios/:id/permisos", [verifyToken, isAdmin], controller.gestionarPermisos);
};
