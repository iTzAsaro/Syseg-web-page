const { verifyToken } = require('../middleware/authJwt');
const controller = require('../controllers/localController');

module.exports = function(app) {
    app.get("/api/locales", [verifyToken], controller.getAllLocals);
};
