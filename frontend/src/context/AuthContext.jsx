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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Verificar sesión al cargar usando el endpoint de backend
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Verificar token contra el servidor
                const userData = await AuthService.verify();
                setUser(userData);
            } catch (error) {
                // Si es error 401, es esperado (sesión expirada), no lo logueamos como error crítico
                if (error.response && error.response.status === 401) {
                    console.log("Sesión expirada o token inválido (verificado al inicio).");
                } else {
                    console.error("Error al verificar sesión:", error);
                }
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
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
