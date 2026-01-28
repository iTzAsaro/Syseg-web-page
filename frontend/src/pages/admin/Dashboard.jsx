import React, { useState, useEffect } from 'react';
import { 
  Box, ShieldCheck, AlertTriangle, ClipboardList, Package, ArrowUpRight, ArrowDownLeft 
} from 'lucide-react';
import Layout from '../../components/Layout';
import KpiCard from '../../components/KpiCard';
import MovimientoService from '../../services/movimientoService';
import ReporteService from '../../services/reporteService';

const Dashboard = () => {
  const [recentMovements, setRecentMovements] = useState([]);
  const [stats, setStats] = useState({
      totalProductos: 0,
      guardiasActivos: 0,
      stockCritico: 0,
      retirosHoy: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const [movements, kpiStats] = await Promise.all([
                  MovimientoService.getAll(),
                  ReporteService.getResumenOperativo()
              ]);
              setRecentMovements(movements.slice(0, 5));
              setStats(kpiStats);
          } catch (error) {
              console.error("Error fetching dashboard data:", error);
          } finally {
              setLoading(false);
          }
      };

      fetchData();
  }, []);

  // Datos KPI
  const kpiData = [
    { 
      title: 'Total Artículos', 
      value: stats.totalProductos.toLocaleString(), 
      trend: 'Inventario Total', 
      icon: Box, 
      trendColor: 'text-emerald-700', 
      trendBg: 'bg-emerald-50' 
    },
    { 
      title: 'Guardias Activos', 
      value: stats.guardiasActivos.toString(), 
      trend: 'Habilitados App', 
      icon: ShieldCheck, 
      trendColor: 'text-blue-700', 
      trendBg: 'bg-blue-50' 
    },
    { 
      title: 'Stock Crítico', 
      value: stats.stockCritico.toString(), 
      trend: 'Requiere Atención', 
      icon: AlertTriangle, 
      trendColor: 'text-red-700', 
      trendBg: 'bg-red-50' 
    },
    { 
      title: 'Retiros Hoy', 
      value: stats.retirosHoy.toString(), 
      trend: 'Movimientos Salida', 
      icon: ClipboardList, 
      trendColor: 'text-orange-700', 
      trendBg: 'bg-orange-50' 
    },
  ];

  return (
    <Layout>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Resumen Operativo</h2>
                <p className="text-gray-500 mt-1">Vista general del estado actual del sistema</p>
            </div>
            <button className="w-full sm:w-auto bg-black text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-gray-900 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2 transform active:scale-95">
                <Package className="w-4 h-4" /> 
                Nuevo Producto
            </button>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {kpiData.map((kpi, index) => (
                <KpiCard key={index} {...kpi} trendIcon={kpi.icon} /> 
            ))}
        </div>

        {/* Últimos Movimientos */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Últimos Movimientos de Inventario</h3>
                <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                    Tiempo Real
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Producto</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Cantidad</th>
                            <th className="px-6 py-4">Responsable</th>
                            <th className="px-6 py-4 text-right">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                             <tr>
                                 <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                     Cargando movimientos...
                                 </td>
                             </tr>
                        ) : recentMovements.length === 0 ? (
                             <tr>
                                 <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                     No hay movimientos registrados.
                                 </td>
                             </tr>
                        ) : (
                            recentMovements.map((mov) => (
                                <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {mov.Producto ? mov.Producto.nombre : 'Producto Eliminado'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                                            (mov.TipoMovimiento?.nombre || '').toLowerCase().includes('entrada') || (mov.TipoMovimiento?.nombre || '').toLowerCase().includes('devolución')
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {(mov.TipoMovimiento?.nombre || '').toLowerCase().includes('entrada') || (mov.TipoMovimiento?.nombre || '').toLowerCase().includes('devolución') ? (
                                                <ArrowDownLeft className="w-3 h-3" />
                                            ) : (
                                                <ArrowUpRight className="w-3 h-3" />
                                            )}
                                            {mov.TipoMovimiento ? mov.TipoMovimiento.nombre : 'Desconocido'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-700">
                                        {mov.cantidad}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {mov.Usuario ? mov.Usuario.nombre : 'Sistema'}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500">
                                        {new Date(mov.fecha_hora || mov.fecha).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </Layout>
  );
};

export default Dashboard;
