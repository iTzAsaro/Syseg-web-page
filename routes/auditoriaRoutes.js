const { verifyToken, hasPermission } = require('../middleware/authJwt');
const controller = require('../controllers/auditoriaController');

module.exports = function(app) {
    app.get("/api/auditoria", [verifyToken, hasPermission('VER_AUDITORIA')], controller.listarLogs);
};
