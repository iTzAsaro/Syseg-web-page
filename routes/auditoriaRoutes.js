const { verifyToken, isAdmin } = require('../middleware/authJwt');
const controller = require('../controllers/auditoriaController');

module.exports = function(app) {
    app.get("/api/auditoria", [verifyToken, isAdmin], controller.listarLogs);
};
