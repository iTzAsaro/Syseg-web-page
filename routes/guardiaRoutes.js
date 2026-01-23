const { verifyToken, isAdmin } = require('../middleware/authJwt');
const controller = require('../controllers/guardiaController');

module.exports = function(app) {
    // Rutas para gestión de Guardias
    app.post("/api/guardias", [verifyToken, isAdmin], controller.crear);          // Crear nuevo guardia (Solo Admin)
    app.get("/api/guardias", [verifyToken], controller.buscarTodos);              // Listar todos los guardias
    app.get("/api/guardias/:id", [verifyToken], controller.buscarUno);            // Obtener detalles de un guardia
    app.put("/api/guardias/:id", [verifyToken, isAdmin], controller.actualizar);  // Actualizar datos de guardia (Solo Admin)
    app.delete("/api/guardias/:id", [verifyToken, isAdmin], controller.eliminar); // Eliminar guardia (Solo Admin)
};
