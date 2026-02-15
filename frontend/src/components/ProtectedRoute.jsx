import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // Puedes reemplazar esto con un componente de carga más elaborado
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>;
    }

    if (!isAuthenticated) {
        // Redirigir al login guardando la ubicación original
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
