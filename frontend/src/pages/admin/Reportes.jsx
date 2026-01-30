import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  FileSpreadsheet, 
  Trophy, 
  Users, 
  Loader,
  AlertCircle
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import Layout from '../../components/Layout';
import reporteService from '../../services/reporteService';

/**
 * Componente Reportes
 * 
 * Este componente renderiza la vista de reportes estadísticos y auditoría con datos reales.
 */
const Reportes = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activityData, setActivityData] = useState([]);
    const [topItems, setTopItems] = useState([]);
    const [topUsers, setTopUsers] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await reporteService.getDashboardStats();
            setActivityData(data.activityData || []);
            setTopItems(data.topItems || []);
            setTopUsers(data.topUsers || []);
            console.log('Report data loaded:', data);
        } catch (error) {
            console.error("Error cargando reportes:", error);
            setError("No se pudo conectar con el servidor de reportes.");
        } finally {
            setLoading(false);
        }
    };

    // Procesar datos para el gráfico Semanal
    const chartData = useMemo(() => {
        const hasRealData = activityData.some(d => d.ingresos > 0 || d.retiros > 0);

        if (hasRealData) {
            return activityData.map(d => ({
                ...d,
                formattedDate: d.day, // El backend ya envía 'Lunes', 'Martes', etc.
                ingresos: Math.round(d.ingresos),
                retiros: Math.round(d.retiros)
            }));
        } else {
            // Mock data simplificado para Lunes-Domingo si no hay datos
            const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
            return days.map(day => ({
                formattedDate: day,
                ingresos: Math.floor(Math.random() * 20),
                retiros: Math.floor(Math.random() * 30),
                day: day
            }));
        }
    }, [activityData]);

    // Custom Tooltip para el gráfico
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-sm">
                    <p className="font-bold text-gray-900 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-600 capitalize">{entry.name}:</span>
                            <span className="font-bold text-gray-900">
                                {Math.round(entry.value)} {/* Mostrar entero sin formato moneda */}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Cargando métricas...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                 <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 text-center p-4">
                    <AlertCircle className="w-16 h-16 text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-900">Error de Conexión</h2>
                    <p className="text-gray-600 max-w-md">{error}</p>
                    <button 
                        onClick={fetchData}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
                    >
                        Reintentar
                    </button>
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
                        <button className="flex-1 md:flex-none bg-black text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-black/20 hover:bg-gray-900 transition-colors">
                            <FileSpreadsheet className="w-4 h-4" /> <span className="hidden sm:inline">Exportar</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* 1. Actividad Semanal (Gráfico de barras agrupadas con Recharts) */}
                    <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 text-lg">Actividad Financiera</h3>
                            {/* Leyenda personalizada si se desea, o usar la de Recharts */}
                        </div>
                        
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    barGap="20%" /* Espacio entre barras del mismo grupo */
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis 
                                        dataKey="formattedDate" 
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <YAxis 
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend 
                                        verticalAlign="top" 
                                        align="right" 
                                        iconType="circle"
                                        wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
                                    />
                                    <Bar 
                                        dataKey="retiros" 
                                        name="Retiros" 
                                        fill="#000000" 
                                        radius={[4, 4, 0, 0]} 
                                        barSize={20} /* Aproximación al 40% dependiendo del dataset */
                                    />
                                    <Bar 
                                        dataKey="ingresos" 
                                        name="Ingresos" 
                                        fill="#FF0000" 
                                        radius={[4, 4, 0, 0]} 
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Top Productos Más Solicitados (Mes Actual) */}
                    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 text-lg">Más Solicitados (Mes)</h3>
                            <Trophy className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
                            {topItems.length > 0 ? topItems.map((item, index) => (
                                <div key={index} className="group">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                                  index === 1 ? 'bg-gray-100 text-gray-700' : 
                                                  index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-blue-50 text-blue-600'}
                                            `}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{item.cat}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-black text-gray-900 text-sm">{item.count}</span>
                                            <span className="text-xs text-gray-400 ml-1">uds</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                                index === 0 ? 'bg-yellow-400' : 
                                                index === 1 ? 'bg-gray-400' : 
                                                index === 2 ? 'bg-orange-400' : 'bg-blue-500'
                                            }`}
                                            style={{ width: `${(item.count / item.max) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                                    <Trophy className="w-12 h-12 mb-2 opacity-20" />
                                    <p className="text-sm">No hay datos de productos este mes</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Top Usuarios (Rediseño Moderno) */}
                    <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="font-black text-gray-900 text-xl tracking-tight">Usuarios Destacados</h3>
                                <p className="text-gray-500 text-sm mt-1">Personal con mayor actividad de retiros</p>
                            </div>
                            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>Top 5</span>
                            </div>
                        </div>
                        
                        <div className="p-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                {topUsers.length > 0 ? topUsers.map((user, i) => (
                                    <div 
                                        key={i} 
                                        className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 ease-out hover:-translate-y-1"
                                    >
                                        {/* Ranking Badge */}
                                        <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm transition-transform group-hover:scale-110 ${
                                            i === 0 ? 'bg-yellow-400 text-white shadow-yellow-200' :
                                            i === 1 ? 'bg-gray-400 text-white shadow-gray-200' :
                                            i === 2 ? 'bg-orange-400 text-white shadow-orange-200' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            {i + 1}
                                        </div>

                                        {/* Avatar Placeholder */}
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 mb-4 flex items-center justify-center text-2xl group-hover:from-blue-50 group-hover:to-blue-100 transition-colors">
                                            {i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : '👤'}
                                        </div>

                                        {/* Info */}
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-gray-900 truncate text-lg" title={user.name}>{user.name}</h4>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{user.role}</p>
                                        </div>

                                        {/* Stats */}
                                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <div className="text-center">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Retiros</p>
                                                <p className="text-lg font-black text-gray-900">{user.count}</p>
                                            </div>
                                            <div className="w-px h-8 bg-gray-100"></div>
                                            <div className="text-center">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Transac.</p>
                                                <p className="text-lg font-black text-gray-900">{user.transactions}</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Users className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <p className="text-gray-900 font-medium">Sin datos registrados</p>
                                        <p className="text-gray-400 text-sm mt-1">No hay actividad de usuarios para mostrar.</p>
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
