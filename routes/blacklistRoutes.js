const { verifyToken, isAdmin } = require('../middleware/authJwt');
const controller = require('../controllers/blacklistController');

module.exports = function(app) {
    app.post("/api/blacklist", [verifyToken, isAdmin], controller.crear);
    app.get("/api/blacklist", [verifyToken], controller.buscarTodos);
    app.put("/api/blacklist/:id", [verifyToken, isAdmin], controller.actualizar);
    app.delete("/api/blacklist/:id", [verifyToken, isAdmin], controller.eliminar);
};
