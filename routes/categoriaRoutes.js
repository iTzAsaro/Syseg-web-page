const { verifyToken } = require('../middleware/authJwt');
const controller = require('../controllers/categoriaController');

/**
 * NOMBRE: Rutas de Categoría
 * FUNCIÓN: Define los endpoints para clasificar productos.
 * USO: Gestión básica (listar, crear, eliminar) de categorías de inventario.
 * -----------------------------------------------------------------------
 * Acceso general autenticado (sin permisos granulares por el momento).
 */
module.exports = function(app) {
    app.get("/api/categorias", [verifyToken], controller.getAll);
    app.post("/api/categorias", [verifyToken], controller.create);
    app.delete("/api/categorias/:id", [verifyToken], controller.delete);
};
