import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Lock, CheckCircle, AlertCircle, Save } from 'lucide-react';
import api from '../../api/axios';
import Swal from 'sweetalert2';

const Settings = () => {
    const { user } = useAuth();
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Las contraseñas nuevas no coinciden.');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            setError('La nueva contraseña debe ser diferente a la actual.');
            return;
        }

        setLoading(true);
        try {
            await api.put('/usuarios/perfil/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            Swal.fire({
                icon: 'success',
                title: 'Contraseña Actualizada',
                text: 'Tu contraseña ha sido modificada correctamente.',
                confirmButtonColor: '#dc2626'
            });

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            console.error('Error al cambiar contraseña:', err.response?.data || err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error de Actualización',
                text: err.response?.data?.message || 'Ocurrió un error inesperado al actualizar la contraseña.',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Layout>
            <div className="p-8 max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-red-100 rounded-xl">
                        <User className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Configuración de Cuenta</h1>
                        <p className="text-gray-500 text-sm">Gestiona tu información personal y seguridad</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna Izquierda: Tarjeta de Perfil */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col items-center">
                            <div className="h-24 bg-gradient-to-r from-red-600 to-red-800 w-full"></div>
                            
                            <div className="-mt-10 w-20 h-20 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center text-2xl font-bold text-red-600 z-10">
                                {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                            </div>
                            
                            <div className="px-6 pb-6 w-full relative">
                                <div className="mt-4 text-center space-y-1">
                                    <h2 className="text-xl font-bold text-gray-900">{user.nombre}</h2>
                                    <p className="text-sm text-gray-500 font-medium">{user.roles || 'Usuario'}</p>
                                </div>

                                <div className="mt-6 space-y-4 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Shield className="w-4 h-4 text-gray-400" />
                                        <span>Rol: <span className="font-semibold text-gray-800">{user.roles || 'Sin Rol'}</span></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full text-xs">Cuenta Activa</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Formulario de Seguridad */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <Lock className="w-5 h-5 text-gray-400" />
                                <h3 className="text-lg font-bold text-gray-900">Seguridad</h3>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña Actual</label>
                                    <input 
                                        type="password" 
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                        placeholder="Ingresa tu contraseña actual"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva Contraseña</label>
                                        <input 
                                            type="password" 
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                            placeholder="Mínimo 6 caracteres"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar Nueva Contraseña</label>
                                        <input 
                                            type="password" 
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                            placeholder="Repite la nueva contraseña"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div className="pt-4 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:bg-red-700 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Actualizando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Guardar Cambios
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
