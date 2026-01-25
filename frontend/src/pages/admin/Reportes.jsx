import React, { useState } from 'react';
import { 
  Calendar, 
  FileSpreadsheet, 
  Trophy, 
  UserCheck, 
  Box, 
  ShieldAlert, 
  Users, 
  Activity 
} from 'lucide-react';
import Layout from '../../components/Layout';

/**
 * Componente Reportes
 * 
 * Este componente renderiza la vista de reportes estadísticos y auditoría.
 * Muestra gráficos de actividad, items más solicitados y una bitácora de eventos recientes.
 */
const Reportes = () => {
    // Datos simulados para la gráfica de actividad semanal
    const activityData = [
        { day: 'Lun', val: 65 }, { day: 'Mar', val: 45 }, { day: 'Mié', val: 80 }, 
        { day: 'Jue', val: 55 }, { day: 'Vie', val: 90 }, { day: 'Sáb', val: 30 }, { day: 'Dom', val: 20 }
    ];

    // Datos simulados para los productos más solicitados (Top 5)
    const topItems = [
        { name: 'Radio Motorola X1', cat: 'Comunicación', count: 142, max: 150 },
        { name: 'Chaleco Reflectante', cat: 'EPP', count: 98, max: 150 },
        { name: 'Linterna Táctica', cat: 'Iluminación', count: 85, max: 150 },
        { name: 'Tablet Samsung', cat: 'Tecnología', count: 62, max: 150 },
        { name: 'Botas Seguridad', cat: 'EPP', count: 45, max: 150 },
    ];

    // Estado para el filtro de reportes
    const [filter, setFilter] = useState('all');
    
    // Datos simulados de reportes/eventos
    const reportData = [
        { id: 1, type: 'inventory', action: 'Retiro de Producto', detail: 'Radio Motorola X1', user: 'Carlos Ruiz', role: 'Supervisor', time: '10:45 AM', date: 'Hoy', status: 'success' },
        { id: 2, type: 'security', action: 'Ingreso a Blacklist', detail: 'Roberto Díaz (RUT: 15.x)', user: 'Admin General', role: 'Admin', time: '09:30 AM', date: 'Hoy', status: 'critical' },
        { id: 3, type: 'inventory', action: 'Ingreso de Stock', detail: '50 Chalecos', user: 'Carlos Ruiz', role: 'Supervisor', time: '08:15 AM', date: 'Hoy', status: 'success' },
        { id: 4, type: 'personnel', action: 'Nuevo Guardia', detail: 'Ana López', user: 'Admin General', role: 'Admin', time: '18:30 PM', date: 'Ayer', status: 'info' },
    ];
    
    // Filtrar los reportes según el tipo seleccionado
    const filteredReports = filter === 'all' ? reportData : reportData.filter(r => r.type === filter);
    
    /**
     * Obtiene los estilos (icono y colores) según el tipo de reporte.
     * @param {string} type - Tipo de reporte (inventory, security, personnel, etc.)
     * @returns {object} Objeto con el icono y clases de color.
     */
    const getTypeStyles = (type) => {
        switch(type) {
            case 'inventory': return { icon: Box, color: 'text-orange-600', bg: 'bg-orange-50' };
            case 'security': return { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' };
            case 'personnel': return { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' };
            default: return { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-50' };
        }
    };

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
                                            <div className="w-full bg-black relative transition-all duration-500" style={{ height: `${d.val}%` }}></div>
                                            <div className="absolute bottom-0 w-full bg-red-600 z-10 transition-all duration-500" style={{ height: `${d.val * 0.4}%` }}></div>
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

                    {/* 3. Bitácora (Timeline compacta) */}
                    <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-lg">Últimos Eventos</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {filteredReports.map((report) => {
                                const style = getTypeStyles(report.type);
                                const Icon = style.icon;
                                return (
                                    <div key={report.id} className="p-4 hover:bg-gray-50 flex items-start gap-4 transition-colors">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                                <h4 className="font-bold text-gray-900 text-sm truncate">{report.action}</h4>
                                                <span className="text-[10px] text-gray-400 font-mono">{report.time}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-0.5 truncate">{report.detail}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                                    <UserCheck className="w-3 h-3" /> {report.user}
                                                </span>
                                                {report.status === 'critical' && (
                                                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">CRÍTICO</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default Reportes;
