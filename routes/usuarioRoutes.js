const { verifyToken, isAdmin } = require('../middleware/authJwt');
const controller = require('../controllers/usuarioController');

module.exports = function(app) {
    // Rutas para gestión de Usuarios (Administradores y personal)
    app.post("/api/usuarios", [verifyToken, isAdmin], controller.crear);          // Crear nuevo usuario (Solo Admin)
    app.get("/api/usuarios", [verifyToken, isAdmin], controller.buscarTodos);     // Listar todos los usuarios (Solo Admin)
    app.get("/api/usuarios/:id", [verifyToken], controller.buscarUno);            // Obtener usuario por ID
    app.put("/api/usuarios/:id", [verifyToken, isAdmin], controller.actualizar);  // Actualizar usuario (Solo Admin)
    app.delete("/api/usuarios/:id", [verifyToken, isAdmin], controller.eliminar); // Eliminar usuario (Solo Admin)
};
