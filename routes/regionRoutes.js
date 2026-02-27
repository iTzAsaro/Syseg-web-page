const { verifyToken } = require('../middleware/authJwt');
const controller = require('../controllers/regionController');

/**
 * NOMBRE: Rutas de Región
 * FUNCIÓN: Define los endpoints para obtener la división política administrativa.
 * USO: Listado de regiones para selectores y filtros geográficos.
 * -----------------------------------------------------------------------
 * Acceso general autenticado.
 */
module.exports = function(app) {
    app.get("/api/regiones", [verifyToken], controller.getAllRegions);
};
