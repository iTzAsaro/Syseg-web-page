import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, ShieldAlert, ClipboardList, Save, X, Loader, FileDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import Layout from '../../components/Layout';
import BitacoraService from '../../services/bitacoraService';

// --- COMPONENTE: MODAL DE NUEVA ENTRADA DE BITÁCORA ---
const LogEntryModal = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'Rutina',
        priority: 'Informativa',
        shift: 'Mañana',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Adaptar datos para el backend
            // accion = title
            // nivel = priority
            // detalles = JSON string con category, shift, description
            const detallesObj = {
                category: formData.category,
                shift: formData.shift,
                description: formData.description
            };
            
            const payload = {
                accion: formData.title,
                nivel: formData.priority,
                detalles: JSON.stringify(detallesObj)
            };

            await onSave(payload);
            setFormData({ title: '', category: 'Rutina', priority: 'Informativa', shift: 'Mañana', description: '' });
        } catch (error) {
            console.error("Error saving log:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0 bg-gray-50">
                    <div>
                        <h3 className="text-lg sm:text-xl font-black text-gray-900">Nuevo Reporte</h3>
                        <p className="text-xs text-gray-500">Registro de novedad en bitácora</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-gray-200 border border-gray-200 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Título del Evento</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all placeholder-gray-300" 
                            placeholder="Ej. Ronda perimetral completada"
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</label>
                            <select 
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                                value={formData.category} 
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="Rutina">Rutina / Ronda</option>
                                <option value="Incidente">Incidente</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prioridad</label>
                            <select 
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                                value={formData.priority} 
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                            >
                                <option value="Informativa">Informativa</option>
                                <option value="Baja">Baja</option>
                                <option value="Media">Media</option>
                                <option value="Alta">Alta</option>
                                <option value="Critica">Crítica</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Turno</label>
                        <div className="flex gap-2">
                            {['Mañana', 'Tarde', 'Noche'].map(shift => (
                                <button
                                    key={shift}
                                    type="button"
                                    onClick={() => setFormData({...formData, shift})}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                                        formData.shift === shift 
                                        ? 'bg-black text-white border-black' 
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {shift}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción Detallada</label>
                        <textarea 
                            required
                            rows="4"
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none transition-all resize-none placeholder-gray-300"
                            placeholder="Describa los detalles del evento, involucrados y acciones tomadas..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-red-600 text-white py-4 rounded-xl text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all disabled:opacity-50">
                        {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Registrar en Bitácora</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- VISTA: BITÁCORA (LOGS) ---
const BitacoraAdmin = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('Todos');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchLogs = async (currentPage = 1) => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 10
            };
            if (searchTerm) params.search = searchTerm;
            if (filterPriority !== 'Todos') params.nivel = filterPriority;
            
            const data = await BitacoraService.getAll(params);
            
            // Transformar datos del backend al formato de UI
            const formattedLogs = data.bitacoras.map(log => {
                let detalles = {};
                try {
                    detalles = JSON.parse(log.detalles || '{}');
                } catch (e) {
                    detalles = { description: log.detalles };
                }

                return {
                    id: log.id,
                    title: log.accion,
                    category: detalles.category || 'General',
                    priority: log.nivel,
                    shift: detalles.shift || '-',
                    author: log.autor,
                    time: new Date(log.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    date: new Date(log.fecha).toLocaleDateString(),
                    description: detalles.description || log.detalles || 'Sin detalles'
                };
            });
            
            setLogs(formattedLogs);
            setTotalPages(data.totalPages);
            setTotalItems(data.totalItems);
            setPage(data.currentPage);
        } catch (error) {
            // Ignorar errores 401 ya que son manejados por el interceptor
            if (error.response && error.response.status === 401) return;
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar logs al inicio y cuando cambien filtros
    useEffect(() => {
        // Debounce para búsqueda
        const timeoutId = setTimeout(() => {
            fetchLogs(1); // Reset a página 1 al filtrar
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterPriority]);

    // Cargar logs al cambiar de página
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchLogs(newPage);
        }
    };

    const handleSaveLog = async (newEntry) => {
        try {
            await BitacoraService.create(newEntry);
            await fetchLogs(1); // Recargar y volver a la primera página
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error creating log:", error);
            alert("Error al guardar el registro");
        }
    };

    const handleExport = async () => {
        try {
            // Obtener todos los datos para exportar (limit alto)
            const params = { limit: 1000 };
            if (searchTerm) params.search = searchTerm;
            if (filterPriority !== 'Todos') params.nivel = filterPriority;

            const data = await BitacoraService.getAll(params);
            
            if (!data.bitacoras || data.bitacoras.length === 0) {
                alert("No hay datos para exportar");
                return;
            }

            // Convertir a CSV
            const headers = ["ID", "Fecha", "Hora", "Autor", "Acción", "Nivel", "Detalles", "IP"];
            const csvRows = [headers.join(",")];

            data.bitacoras.forEach(log => {
                let detallesStr = log.detalles || "";
                // Escapar comillas dobles para CSV
                detallesStr = detallesStr.replace(/"/g, '""');
                
                const row = [
                    log.id,
                    new Date(log.fecha).toLocaleDateString(),
                    new Date(log.fecha).toLocaleTimeString(),
                    `"${log.autor}"`,
                    `"${log.accion}"`,
                    log.nivel,
                    `"${detallesStr}"`,
                    log.ip_address || ""
                ];
                csvRows.push(row.join(","));
            });

            const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `bitacora_export_${new Date().toISOString().slice(0,10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Error exporting logs:", error);
            alert("Error al exportar datos");
        }
    };

    const getPriorityStyles = (p) => {
        switch(p) {
            case 'Critica': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-l-4 border-red-600', badge: 'bg-red-100 text-red-800' };
            case 'Alta': return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-l-4 border-orange-500', badge: 'bg-orange-100 text-orange-800' };
            case 'Media': return { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-l-4 border-yellow-500', badge: 'bg-yellow-100 text-yellow-800' };
            case 'Baja': return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-l-4 border-blue-500', badge: 'bg-blue-100 text-blue-800' };
            case 'Informativa': return { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-l-4 border-gray-500', badge: 'bg-gray-100 text-gray-800' };
            default: return { bg: 'bg-white', text: 'text-gray-800', border: 'border-l-4 border-green-500', badge: 'bg-green-50 text-green-700' };
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 p-2 sm:p-0">
                <LogEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveLog} />

                {/* Header Bitácora */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Bitácora de Supervisión</h2>
                        <p className="text-gray-500 mt-1 text-sm">Registro diario de actividades y novedades</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleExport}
                            className="bg-white text-gray-700 border border-gray-200 px-5 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <FileDown className="w-4 h-4" /> 
                            Exportar
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-black text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-gray-900 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2 transform active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> 
                            Nuevo Reporte
                        </button>
                    </div>
                </div>

                {/* KPI Resumen Turno (Nota: Estos KPI ahora reflejan solo la página actual o necesitaríamos un endpoint de stats) */}
                {/* Por simplicidad, mantenemos el conteo basado en logs actuales o podríamos ocultarlos si confunden */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Total Registros</p>
                        <p className="text-2xl font-black text-gray-900">{totalItems}</p>
                    </div>
                    {/* Estos contadores de incidentes/rondas solo serían precisos con un endpoint de estadísticas. 
                        Los mostramos basados en la página actual como referencia visual rápida */}
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
                        <p className="text-[10px] font-bold text-red-400 uppercase">Incidentes (Pág)</p>
                        <p className="text-2xl font-black text-red-700">{logs.filter(l => l.category === 'Incidente').length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
                        <p className="text-[10px] font-bold text-green-600 uppercase">Rondas OK (Pág)</p>
                        <p className="text-2xl font-black text-green-800">{logs.filter(l => l.category === 'Rutina').length}</p>
                    </div>
                </div>

                {/* Filtros y Búsqueda */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input 
                            type="text" 
                            placeholder="Buscar en bitácora..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                        {['Todos', 'Informativa', 'Baja', 'Media', 'Alta', 'Critica'].map(p => (
                            <button
                                key={p}
                                onClick={() => setFilterPriority(p)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                                    filterPriority === p 
                                    ? 'bg-black text-white border-black' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feed de Bitácora */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10">
                            <Loader className="w-8 h-8 mx-auto animate-spin text-gray-400" />
                            <p className="text-gray-400 mt-2">Cargando bitácora...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No se encontraron registros</p>
                        </div>
                    ) : (
                        <>
                            {logs.map((log) => {
                                const styles = getPriorityStyles(log.priority);
                                return (
                                    <div key={log.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${styles.border}`}>
                                        <div className="p-5 flex flex-col gap-4">
                                            {/* Header Card */}
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-3 items-center">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                                                        {log.priority}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-1 rounded">
                                                        {log.category}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-gray-900">{log.date}</p>
                                                    <p className="text-[10px] font-mono text-gray-400">{log.time}</p>
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{log.title}</h3>
                                                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    {log.description}
                                                </p>
                                            </div>

                                            {/* Footer Card */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                                                        {(log.author || 'S').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-700">{log.author}</p>
                                                        <p className="text-[10px] text-gray-400">Turno {log.shift}</p>
                                                    </div>
                                                </div>
                                                {log.priority === 'Critica' && (
                                                    <ShieldAlert className="w-5 h-5 text-red-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Paginación */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-sm font-bold text-gray-600">
                                    Página {page} de {totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default BitacoraAdmin;
