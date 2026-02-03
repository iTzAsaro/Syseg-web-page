const { TipoMovimiento } = require('./models');

async function checkTypes() {
    try {
        const tipos = await TipoMovimiento.findAll();
        console.log("Tipos de movimiento encontrados:", JSON.stringify(tipos, null, 2));
    } catch (error) {
        console.error("Error al buscar tipos:", error);
    }
}

checkTypes();