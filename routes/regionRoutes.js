const { verifyToken } = require('../middleware/authJwt');
const controller = require('../controllers/regionController');

module.exports = function(app) {
    app.get("/api/regiones", [verifyToken], controller.getAllRegions);
};
