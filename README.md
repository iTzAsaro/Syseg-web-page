# Syseg Web Gestión

Sistema integral para la gestión de seguridad, control de personal e inventario.

## Descripción

Este proyecto es una plataforma web diseñada para optimizar la administración de recursos de seguridad. Permite gestionar guardias, controlar inventario de uniformes y equipos, mantener bitácoras de eventos y administrar usuarios con roles específicos.

## Características Principales

- **Gestión de Guardias:** Administración de perfiles, asignaciones y documentación.
- **Inventario:** Control de stock, categorías y movimientos de productos (uniformes, equipos).
- **Bitácora Digital:** Registro de eventos e incidentes con seguimiento de autoría.
- **Blacklist:** Registro y control de personal no autorizado.
- **Gestión de Usuarios:** Sistema de roles y permisos granulares (RBAC).
- **Reportes:** Visualización de métricas y estadísticas operativas.
- **Seguridad:** Autenticación JWT y auditoría de acciones.

## Tecnologías Utilizadas

- **Backend:** Node.js, Express, Sequelize ORM.
- **Frontend:** React, Tailwind CSS, Lucide React.
- **Base de Datos:** MySQL / PostgreSQL.

## Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/iTzAsaro/Syseg-web-page.git
   cd Syseg-web-page
   ```

2. **Instalar dependencias del Backend:**
   ```bash
   npm install
   ```

3. **Instalar dependencias del Frontend:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configuración:**
   - Crear un archivo `.env` en la raíz basado en el ejemplo proporcionado.
   - Configurar las credenciales de la base de datos y claves secretas JWT.

5. **Ejecutar la aplicación:**
   ```bash
   # En modo desarrollo
   npm run dev
   ```

## Estructura del Proyecto

- `/controllers`: Lógica de negocio y controladores de la API.
- `/models`: Definiciones de modelos de datos (Sequelize).
- `/routes`: Definición de rutas de la API.
- `/frontend`: Código fuente de la interfaz de usuario (React).
- `/middleware`: Middlewares de autenticación y validación.

## Flujo de Trabajo Git

Este proyecto utiliza el siguiente flujo de ramas:
- `main`: Rama de producción (estable).
- `testing`: Rama para pruebas de integración y QA.
- `desarrollo`: Rama principal de desarrollo para nuevas características.

## Contribución

1. Crear una rama desde `desarrollo` para la nueva característica.
2. Realizar los cambios y hacer commits descriptivos en español.
3. Enviar un Pull Request hacia `desarrollo`.
