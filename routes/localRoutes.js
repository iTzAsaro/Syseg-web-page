const { verifyToken } = require('../middleware/authJwt');
const controller = require('../controllers/localController');

/**
 * NOMBRE: Rutas de Local
 * FUNCIÓN: Define los endpoints para gestionar los recintos (lugares de trabajo).
 * USO: Permite listar y administrar los locales disponibles para asignación.
 * -----------------------------------------------------------------------
 * Base para la planificación de turnos.
 */
module.exports = function(app) {
    app.get("/api/locales", [verifyToken], controller.getAllLocals);
};
