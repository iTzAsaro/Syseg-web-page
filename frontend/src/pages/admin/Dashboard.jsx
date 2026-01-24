import React from 'react';
import { 
  Box, ShieldCheck, AlertTriangle, ClipboardList, Package 
} from 'lucide-react';
import Layout from '../../components/Layout';
import KpiCard from '../../components/KpiCard';

const Dashboard = () => {
  // Datos KPI
  const kpiData = [
    { 
      title: 'Total Artículos', 
      value: '1,254', 
      trend: '+12 Nuevos', 
      icon: Box, 
      trendColor: 'text-emerald-700', 
      trendBg: 'bg-emerald-50' 
    },
    { 
      title: 'Guardias Activos', 
      value: '42', 
      trend: 'Turno Actual', 
      icon: ShieldCheck, 
      trendColor: 'text-blue-700', 
      trendBg: 'bg-blue-50' 
    },
    { 
      title: 'Stock Crítico', 
      value: '8', 
      trend: 'Requiere Acción', 
      icon: AlertTriangle, 
      trendColor: 'text-red-700', 
      trendBg: 'bg-red-50' 
    },
    { 
      title: 'Retiros Hoy', 
      value: '156', 
      trend: 'En Progreso', 
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

        {/* Placeholder for other dashboard content if any */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500">
            <p>Contenido adicional del Dashboard...</p>
        </div>
    </Layout>
  );
};

export default Dashboard;
