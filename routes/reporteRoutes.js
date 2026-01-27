const controller = require('../controllers/reporteController');
const { verifyToken, hasPermission } = require('../middleware/authJwt');

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/reportes/dashboard", [verifyToken, hasPermission('VER_REPORTES')], controller.getDashboardStats);
};
