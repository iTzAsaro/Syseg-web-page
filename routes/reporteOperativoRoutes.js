const { verifyToken } = require('../middleware/authJwt');
const controller = require('../controllers/reporteOperativoController');

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

