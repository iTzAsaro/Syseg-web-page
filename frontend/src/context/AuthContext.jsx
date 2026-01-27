import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // 1. Inicializar estado desde localStorage para persistencia inmediata
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Error recuperando usuario:", error);
            return null;
        }
    });
    
    // 2. Loading inicial depende de si tenemos token. Si tenemos, mostramos UI optimista mientras verificamos.
    const [loading, setLoading] = useState(() => !localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar sesión al cargar usando el endpoint de backend
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            
            // Si no hay token, asegurar estado limpio y terminar carga
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                // Verificar token contra el servidor
                const userData = await AuthService.verify();
                
                // Si el token es válido, actualizamos el estado y localStorage con la data fresca
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
                // Si es error 401/403, el token no sirve -> Logout
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    console.log("Sesión expirada o token inválido (verificado al inicio).");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                } else {
                    // Si es otro error (ej. red), mantenemos la sesión local si existe (estrategia offline-first opcional)
                    // O podemos decidir cerrar sesión por seguridad. Por ahora, solo logueamos.
                    console.error("Error al verificar sesión (posible error de red):", error);
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    // Verificar permiso
    const hasPermission = (permissionCode) => {
        if (!user) return false;
        // Si es Admin (rol 1 o nombre 'Admin'), tiene todos los permisos
        if (user.roles === 'Admin' || user.roles === 1 || user.rol_id === 1) return true;
        // Si no tiene permisos definidos, denegar
        if (!user.permisos || !Array.isArray(user.permisos)) return false;
        
        return user.permisos.includes(permissionCode);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
