# Syseg Web Gestión

Sistema de gestión integral para control de inventario, guardias y reportes operativos.

## Características Principales
- **Gestión de Inventario**: Control de stock, movimientos (entradas/salidas) y categorías.
- **Gestión de Usuarios**: Administración de roles (Admin, Supervisor, Guardia) y permisos granulares.
- **Reportes y Dashboard**: Visualización de KPIs, actividad semanal y estadísticas de consumo.
- **Bitácora**: Registro de eventos y auditoría de acciones.

## Instalación

1.  **Clonar el repositorio**:
    ```bash
    git clone <url-del-repo>
    cd syseg-web-gestion
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    cd frontend
    npm install
    cd ..
    ```

3.  **Configurar entorno**:
    - Crear archivo `.env` en la raíz con las variables necesarias (DB_HOST, JWT_SECRET, etc.).

4.  **Ejecutar la aplicación**:
    - Backend: `npm start` o `npm run dev`
    - Frontend: `npm run dev` (dentro de carpeta frontend)

## Carga de Datos Iniciales (Seeding)

Para poblar la base de datos con datos de prueba para los reportes y pruebas de integración:

1.  **Cargar datos**:
    Ejecuta el script de seeding que generará usuarios, productos y movimientos históricos.
    ```bash
    node scripts/seed_reports.js
    ```
    *Nota: Esto creará usuarios de prueba (ej. `test1@syseg.com` / `123456`) y ~150 movimientos.*

2.  **Limpiar datos**:
    Para eliminar los datos generados (movimientos):
    ```bash
    node scripts/unseed_reports.js
    ```

## Flujo de Trabajo Git

Este proyecto sigue un flujo de trabajo estructurado:
- **main**: Código de producción estable.
- **development**: Rama principal de desarrollo e integración.
- **testing**: Rama para pruebas y validación antes de producción.

## Pruebas

Para ejecutar los tests de integración de reportes:
```bash
npx jest tests/integration/reportes.test.js
```
*Asegúrate de haber ejecutado el seed primero.*
