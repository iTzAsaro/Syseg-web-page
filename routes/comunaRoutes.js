const { verifyToken } = require('../middleware/authJwt');
const controller = require('../controllers/comunaController');

/**
 * NOMBRE: Rutas de Comuna
 * FUNCIÓN: Define los endpoints para obtener información geográfica (comunas).
 * USO: Listado simple para poblar selectores en formularios.
 * -----------------------------------------------------------------------
 * Acceso general autenticado.
 */
module.exports = function(app) {
    app.get("/api/comunas", [verifyToken], controller.getAllComunas);
};
