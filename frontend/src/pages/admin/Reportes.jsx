import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileSpreadsheet, 
  Trophy, 
  UserCheck, 
  Box, 
  ShieldAlert, 
  Users, 
  Activity,
  Loader
} from 'lucide-react';
import Layout from '../../components/Layout';
import reporteService from '../../services/reporteService';

/**
 * Componente Reportes
 * 
 * Este componente renderiza la vista de reportes estadísticos y auditoría con datos reales.
 */
const Reportes = () => {
    const [loading, setLoading] = useState(true);
    const [activityData, setActivityData] = useState([]);
    const [topItems, setTopItems] = useState([]);
    const [topUsers, setTopUsers] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await reporteService.getDashboardStats();
            setActivityData(data.activityData || []);
            setTopItems(data.topItems || []);
            setTopUsers(data.topUsers || []);
        } catch (error) {
            console.error("Error cargando reportes:", error);
        } finally {
            setLoading(false);
        }
    };

    // Calcular el valor máximo para escalar la gráfica de actividad
    const maxActivity = Math.max(
        ...activityData.map(d => Math.max(d.ingresos, d.retiros)), 
        10 // Valor mínimo para evitar división por cero
    );
    
    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-[80vh]">
                    <Loader className="w-10 h-10 text-gray-300 animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 p-2 sm:p-0">
                {/* Encabezado de la sección */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Reportes</h2>
                        <p className="text-gray-500 mt-1 text-sm">Resumen de actividad y auditoría</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                            <Calendar className="w-4 h-4" /> <span className="hidden sm:inline">Filtrar Fecha</span>
                        </button>
                        <button className="flex-1 md:flex-none bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-black/20 hover:bg-gray-900 transition-colors">
                            <FileSpreadsheet className="w-4 h-4" /> <span className="hidden sm:inline">Exportar</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* 1. Actividad Semanal (Gráfico de barras simple) */}
                    <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 text-lg">Actividad</h3>
                            <div className="flex gap-3 text-xs font-medium text-gray-500">
                                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-black mr-1"></span>Retiros</span>
                                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-600 mr-1"></span>Ingresos</span>
                            </div>
                        </div>
                        {/* Contenedor scrollable para dispositivos móviles */}
                        <div className="overflow-x-auto pb-2">
                            <div className="flex items-end justify-between h-48 gap-3 min-w-[300px]">
                                {activityData.map((d, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                                        <div className="w-full bg-gray-50 rounded-t-lg relative h-full flex items-end overflow-hidden group-hover:bg-gray-100 transition-colors">
                                            {/* Barra de Ingresos (Negra) */}
                                            <div 
                                                className="w-full bg-black relative transition-all duration-500" 
                                                style={{ height: `${(d.ingresos / maxActivity) * 100}%` }}
                                            ></div>
                                            {/* Barra de Retiros (Roja) - Superpuesta o ajustada según diseño */}
                                            <div 
                                                className="absolute bottom-0 w-full bg-red-600 z-10 transition-all duration-500 opacity-80" 
                                                style={{ height: `${(d.retiros / maxActivity) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{d.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 2. Top 5 - Diseño "Tarjeta de Progreso" */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 text-lg">Más Solicitados</h3>
                            <Trophy className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="space-y-3">
                            {topItems.map((item, i) => (
                                <div key={i} className="relative w-full bg-gray-50 rounded-xl overflow-hidden h-14 flex items-center px-4 hover:bg-gray-100 transition-colors">
                                    {/* Barra de fondo con animación */}
                                    <div 
                                        className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${
                                            i === 0 ? 'bg-yellow-100' : 
                                            i === 1 ? 'bg-gray-200' : 
                                            i === 2 ? 'bg-orange-100' : 'bg-gray-100'
                                        }`}
                                        style={{ width: `${(item.count / item.max) * 100}%` }}
                                    ></div>
                                    
                                    {/* Contenido encima de la barra */}
                                    <div className="relative z-10 flex justify-between items-center w-full">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-black ${i < 3 ? 'text-black' : 'text-gray-400'}`}>#{i + 1}</span>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900 leading-none">{item.name}</span>
                                                <span className="text-[9px] text-gray-500 uppercase mt-0.5">{item.cat}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-gray-900">{item.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Top Usuarios (Panel Horizontal o Grid) */}
                    <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 text-lg">Usuarios con Mayor Retiro de Stock</h3>
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="p-6">
                             {/* Grid de usuarios */}
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {topUsers.length > 0 ? topUsers.map((user, i) => (
                                    <div key={i} className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100 hover:border-blue-200 transition-colors group">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 transition-transform ${
                                            i === 0 ? 'bg-yellow-100 text-yellow-600' :
                                            i === 1 ? 'bg-gray-200 text-gray-600' :
                                            i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-white text-blue-600'
                                        }`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 truncate" title={user.name}>{user.name}</h4>
                                            <p className="text-xs text-gray-500 truncate">{user.role}</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                                                    {user.count} items
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {user.transactions} movs.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-center text-gray-400 py-8">
                                        No hay registros de retiros aún.
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Reportes;
