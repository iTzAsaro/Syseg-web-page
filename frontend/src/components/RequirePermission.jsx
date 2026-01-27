import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para renderizar contenido condicionalmente basado en permisos.
 * @param {string} permission - Código del permiso requerido (ej: 'CREAR_USUARIO').
 * @param {ReactNode} children - Contenido a mostrar si tiene permiso.
 * @param {ReactNode} fallback - (Opcional) Contenido a mostrar si NO tiene permiso.
 */
const RequirePermission = ({ permission, children, fallback = null }) => {
    const { hasPermission } = useAuth();

    if (hasPermission(permission)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};

export default RequirePermission;
