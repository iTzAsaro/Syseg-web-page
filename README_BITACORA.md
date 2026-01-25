# Módulo de Bitácora (Audit Log) - Syseg Web Gestión

Este módulo permite registrar, visualizar y gestionar las actividades y novedades del sistema. Está diseñado para ser utilizado por administradores y supervisores para mantener un control detallado de los eventos ocurridos.

## Características Principales

1.  **Registro de Eventos**:
    *   Permite crear nuevos reportes con Título, Categoría (Rutina/Incidente), Prioridad (Informativa, Baja, Media, Alta, Crítica), Turno y Descripción detallada.
    *   Interfaz modal intuitiva para la captura de datos.

2.  **Visualización de Logs**:
    *   Listado cronológico de eventos.
    *   Indicadores visuales de severidad (colores y bordes según prioridad).
    *   Detalles expandibles (aunque en la vista actual se muestra la descripción directamente).

3.  **Filtrado y Búsqueda**:
    *   Búsqueda en tiempo real (con debouncing) por autor, acción o detalles.
    *   Filtros rápidos por nivel de prioridad (Todos, Informativa, Baja, Media, Alta, Crítica).

4.  **Paginación**:
    *   Navegación eficiente entre páginas de registros.
    *   Cálculo automático de total de páginas y registros.

5.  **Exportación de Datos**:
    *   Funcionalidad para exportar los registros filtrados a formato CSV.
    *   Manejo correcto de caracteres especiales en el archivo exportado.

## Estructura del Código

### Frontend (`frontend/src/pages/admin/Bitacora.jsx`)
*   **LogEntryModal**: Componente para el formulario de creación de registros.
*   **BitacoraAdmin**: Componente principal que gestiona el estado, la carga de datos y la renderización de la lista.
*   **Hooks**: `useState` para gestión de estado local, `useEffect` para efectos secundarios (carga inicial, filtrado).

### Backend
*   **Modelo (`models/Bitacora.js`)**: Definición del esquema de base de datos con Sequelize.
*   **Controlador (`controllers/bitacoraController.js`)**: Lógica de negocio para `create` (crear), `buscarTodos` (listar con filtros/paginación) y `logInterno` (uso interno).
*   **Rutas (`routes/bitacoraRoutes.js`)**: Definición de endpoints API protegidos con middleware de autenticación.

## Endpoints API

*   `POST /api/bitacora`: Crear un nuevo registro.
*   `GET /api/bitacora`: Obtener registros con parámetros de consulta (`page`, `limit`, `search`, `nivel`).

## Notas de Implementación

*   **Seguridad**: Los endpoints están protegidos y requieren un token JWT válido.
*   **Performance**: La búsqueda utiliza `debounce` para minimizar las llamadas al servidor. La exportación tiene un límite de seguridad de 1000 registros.
*   **Accesibilidad**: Se han incluido etiquetas semánticas y estados de carga para mejorar la experiencia de usuario.

## Próximos Pasos (Pendientes)

*   Implementar filtros por rango de fechas en la interfaz de usuario (el backend ya lo soporta).
*   Añadir gráficos estadísticos reales basados en endpoints de agregación.
