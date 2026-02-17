const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { sequelize } = require('./models');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rutas
require('./routes/authRoutes')(app);
require('./routes/usuarioRoutes')(app);
require('./routes/guardiaRoutes')(app);
require('./routes/bitacoraRoutes')(app);
require('./routes/asignacionRoutes')(app);
require('./routes/localRoutes')(app);
require('./routes/blacklistRoutes')(app);
require('./routes/auditoriaRoutes')(app);
require('./routes/productoRoutes')(app);
require('./routes/movimientoInventarioRoutes')(app);
require('./routes/reporteRoutes')(app);
require('./routes/categoriaRoutes')(app);
require('./routes/entregaEppRoutes')(app);
require('./routes/regionRoutes')(app);
require('./routes/comunaRoutes')(app);
require('./routes/reporteOperativoRoutes')(app);

// Ruta de vida del servidor
app.get('/', (req, res) => {
    res.json({ message: 'API Syseg Web Gestion Corriendo', timestamp: new Date() });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
}

module.exports = app;
