# Implementación de Seguridad y Filtrado de Bitácoras

## Descripción General
Se ha implementado un sistema de filtrado estricto en el módulo de Bitácora para garantizar que cada usuario autenticado tenga acceso únicamente a sus propios registros. Esta medida asegura la confidencialidad y la integridad de los datos operativos personales.

## Detalles de Implementación Técnica

### 1. Filtrado en Consultas (GET)
Se modificó el método `buscarTodos` en `controllers/bitacoraController.js` para inyectar forzosamente el ID del usuario en las condiciones de búsqueda.

**Código Clave:**
```javascript
const usuario_id = req.userId; // Obtenido del token JWT verificado

// El filtro base SIEMPRE incluye usuario_id
let condition = { usuario_id };

// Cualquier búsqueda adicional (OR) se anida dentro de un AND con el usuario_id
if (search) {
    condition[Op.and] = [
        { usuario_id },
        {
            [Op.or]: [
                { autor: { [Op.like]: `%${search}%` } },
                { accion: { [Op.like]: `%${search}%` } },
                { detalles: { [Op.like]: `%${search}%` } }
            ]
        }
    ];
}
```

### 2. Validación de Propiedad en Modificaciones (PUT/DELETE)
Se añadieron verificaciones de propiedad en los métodos `update` y `delete`. Antes de ejecutar cualquier cambio, el sistema consulta el registro y compara el `usuario_id` del registro con el `req.userId` del solicitante.

**Lógica:**
- Si `log.usuario_id !== req.userId`: Se retorna **403 Forbidden**.
- Mensaje de error: "Acceso denegado. No tienes permiso para [editar/eliminar] esta bitácora."

## Criterios de Aceptación y Verificación

| ID | Criterio | Resultado Esperado | Estado |
|----|----------|-------------------|--------|
| 1 | Visualización Propia | El endpoint `GET /api/bitacora` retorna solo registros donde `usuario_id` coincide con el token. | ✅ Implementado |
| 2 | Visualización Ajena | El endpoint `GET /api/bitacora` NUNCA retorna registros de otros usuarios, incluso usando parámetros de búsqueda. | ✅ Implementado |
| 3 | Edición Propia | El usuario puede editar sus propios registros. | ✅ Implementado |
| 4 | Edición Ajena | Intentar editar (PUT) un registro ajeno retorna `403 Forbidden`. | ✅ Implementado |
| 5 | Eliminación Propia | El usuario puede eliminar sus propios registros. | ✅ Implementado |
| 6 | Eliminación Ajena | Intentar eliminar (DELETE) un registro ajeno retorna `403 Forbidden`. | ✅ Implementado |

## Pruebas Unitarias
Se han creado pruebas unitarias automatizadas utilizando **Jest** para validar esta lógica sin depender de la base de datos real.

**Archivo de pruebas:** `tests/unit/bitacoraController.test.js`

**Ejecución:**
```bash
npx jest tests/unit/bitacoraController.test.js
```

**Cobertura de Pruebas:**
- ✅ Mock de `Bitacora.findAndCountAll` verificando la presencia de `where: { usuario_id: ... }`.
- ✅ Mock de `Bitacora.findByPk` simulando registros propios y ajenos.
- ✅ Verificación de respuestas HTTP 403 en intentos de acceso no autorizado.
