const { verifyToken } = require('../middleware/authJwt');
const controller = require('../controllers/categoriaController');

module.exports = function(app) {
    app.get("/api/categorias", [verifyToken], controller.getAll);
};
