import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Info,
  AlertTriangle,
  FileText,
  Loader
} from 'lucide-react';
import Layout from '../../components/Layout';
import BitacoraService from '../../services/bitacoraService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Bitacora = () => {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        totalItems: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        nivel: 'Todos',
        limit: 10
    });

    // Debounce para búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters, pagination.page]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: filters.limit,
                search: filters.search,
                nivel: filters.nivel !== 'Todos' ? filters.nivel : undefined
            };
            
            const data = await BitacoraService.getAll(params);
            
            setLogs(data.bitacoras || []);
            setPagination(prev => ({
                ...prev,
                totalPages: data.totalPages,
                totalItems: data.totalItems
            }));
        } catch (error) {
            console.error("Error cargando bitácora:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset a página 1 al buscar
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const getNivelBadge = (nivel) => {
        switch(nivel) {
            case 'Critica': 
            case 'Error':
                return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 w-fit"><ShieldAlert className="w-3 h-3" /> {nivel}</span>;
            case 'Advertencia': 
                return <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> {nivel}</span>;
            default: 
                return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 w-fit"><Info className="w-3 h-3" /> {nivel || 'Informativa'}</span>;
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 p-2 sm:p-0">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Bitácora del Sistema</h2>
                        <p className="text-gray-500 mt-1 text-sm">Registro de eventos y auditoría</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input 
                            type="text" 
                            placeholder="Buscar por usuario, acción o detalles..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
                            value={filters.search}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select 
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black cursor-pointer"
                            value={filters.nivel}
                            onChange={(e) => handleFilterChange('nivel', e.target.value)}
                        >
                            <option value="Todos">Todos los Niveles</option>
                            <option value="Informativa">Informativa</option>
                            <option value="Advertencia">Advertencia</option>
                            <option value="Critica">Crítica</option>
                            <option value="Error">Error</option>
                        </select>
                    </div>
                </div>

                {/* Tabla de Logs */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center p-20">
                            <Loader className="w-8 h-8 text-gray-400 animate-spin" />
                        </div>
                    ) : logs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="p-4">Fecha/Hora</th>
                                        <th className="p-4">Usuario</th>
                                        <th className="p-4">Acción</th>
                                        <th className="p-4">Nivel</th>
                                        <th className="p-4">Detalles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                                                {log.fecha ? format(new Date(log.fecha), 'dd MMM yyyy HH:mm', { locale: es }) : '-'}
                                            </td>
                                            <td className="p-4 text-sm font-bold text-gray-900">
                                                {log.autor || 'Sistema'}
                                            </td>
                                            <td className="p-4 text-sm text-gray-800 font-medium">
                                                {log.accion}
                                            </td>
                                            <td className="p-4">
                                                {getNivelBadge(log.nivel)}
                                            </td>
                                            <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={log.detalles}>
                                                {log.detalles || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>No se encontraron registros en la bitácora</p>
                        </div>
                    )}
                    
                    {/* Paginación */}
                    {!loading && logs.length > 0 && (
                        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50">
                            <span className="text-xs text-gray-500 font-medium">
                                Mostrando {((pagination.page - 1) * filters.limit) + 1} a {Math.min(pagination.page * filters.limit, pagination.totalItems)} de {pagination.totalItems} registros
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold flex items-center">
                                    {pagination.page} / {pagination.totalPages}
                                </span>
                                <button 
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Bitacora;
