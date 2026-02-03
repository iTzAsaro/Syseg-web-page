const { verifyToken } = require('../middleware/authJwt');
const controller = require('../controllers/comunaController');

module.exports = function(app) {
    app.get("/api/comunas", [verifyToken], controller.getAllComunas);
};
