const { verifyToken } = require('../middleware/authJwt');
const controller = require('../controllers/reporteOperativoController');

/**
 * NOMBRE: Rutas de Reporte Operativo
 * FUNCIÓN: Define los endpoints para que guardias y usuarios registren novedades.
 * USO: Creación de reportes de incidentes y consulta de historial personal.
 * -----------------------------------------------------------------------
 * Fundamental para la bitácora de terreno.
 */
module.exports = function(app) {
  app.use(function(req, res, next) {
      res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
      );
      next();
  });

  app.post("/api/reportes-operativos", [verifyToken], controller.create);
  app.get("/api/reportes-operativos/mis", [verifyToken], controller.getMyReports);
};

