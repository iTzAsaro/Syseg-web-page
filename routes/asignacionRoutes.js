const { verifyToken, isAdmin } = require('../middleware/authJwt');
const controller = require('../controllers/asignacionController');

module.exports = function(app) {
    app.post("/api/asignaciones", [verifyToken, isAdmin], controller.createAsignacion);
    app.get("/api/asignaciones", [verifyToken], controller.getAsignaciones);
    app.put("/api/asignaciones/:id", [verifyToken, isAdmin], controller.updateAsignacion);
    app.delete("/api/asignaciones/:id", [verifyToken, isAdmin], controller.deleteAsignacion);
};
