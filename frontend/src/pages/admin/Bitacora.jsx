import React, { useState, useEffect } from 'react';
import { 
  Search, X, Plus, Save,
  ShieldAlert, ClipboardList, Loader, Edit, Trash2
} from 'lucide-react';
import Layout from '../../components/Layout'; // Asumo que Layout existe y es el contenedor principal
import BitacoraService from '../../services/bitacoraService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';

// --- COMPONENTE: MODAL DE NUEVA ENTRADA DE BITÁCORA ---
const LogEntryModal = ({ isOpen, onClose, onSave, editingLog = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: 'Rutina',
        priority: 'Normal',
        shift: 'Mañana',
        description: ''
    });

    useEffect(() => {
        if (editingLog) {
            // Inicializar valores por defecto
            let desc = editingLog.detalles || '';
            let cat = 'Rutina';
            let shift = 'Mañana';
            let prio = 'Normal';

            // Intentar parsear como JSON primero (nuevo formato)
            try {
                const parsed = JSON.parse(desc);
                // Si es JSON válido, extraer campos
                if (parsed.description) desc = parsed.description;
                if (parsed.category) cat = parsed.category;
                if (parsed.shift) shift = parsed.shift;
                if (parsed.priority) {
                    // Mapeo de prioridad JSON -> Frontend
                    if (parsed.priority === 'Media') prio = 'Normal';
                    else prio = parsed.priority;
                }
            } catch (e) {
                // Si falla JSON, intentar formato legacy regex: "[Categoria] [Turno] Descripcion"
                const catMatch = desc.match(/^\[(.*?)\]/);
                if (catMatch) {
                    cat = catMatch[1];
                    desc = desc.replace(/^\[(.*?)\]\s*/, '');
                }
                
                const shiftMatch = desc.match(/^\[(.*?)\]/);
                if (shiftMatch) {
                    shift = shiftMatch[1];
                    desc = desc.replace(/^\[(.*?)\]\s*/, '');
                }
            }

            // Mapeo de prioridad basado en nivel (si no vino en JSON o para asegurar)
            // Esto sobrescribe si el nivel del objeto editingLog es más confiable que el del JSON
            // Pero si estamos editando, editingLog.nivel viene del backend column 'nivel'
            if (editingLog.nivel) {
                 if (editingLog.nivel === 'Informativa') prio = 'Baja';
                 else if (editingLog.nivel === 'Baja') prio = 'Baja';
                 else if (editingLog.nivel === 'Advertencia') prio = 'Alta';
                 else if (editingLog.nivel === 'Alta') prio = 'Alta';
                 else if (editingLog.nivel === 'Critica') prio = 'Critica';
                 else if (editingLog.nivel === 'Error') prio = 'Critica';
                 // Si nivel es 'Normal' o desconocido, mantenemos lo que hayamos extraído o default
            }

            setFormData({
                title: editingLog.accion || '',
                category: cat,
                priority: prio,
                shift: shift,
                description: desc
            });
        } else {
            setFormData({
                title: '',
                category: 'Rutina',
                priority: 'Normal',
                shift: 'Mañana',
                description: ''
            });
        }
    }, [editingLog, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0 bg-gray-50">
                    <div>
                        <h3 className="text-lg sm:text-xl font-black text-gray-900">
                            {editingLog ? 'Editar Reporte' : 'Nuevo Reporte'}
                        </h3>
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
                                <option value="Mantenimiento">Mantenimiento</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Prioridad</label>
                            <select 
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                                value={formData.priority} 
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                            >
                                <option value="Baja">Baja (Informativo)</option>
                                <option value="Normal">Normal</option>
                                <option value="Alta">Alta (Urgente)</option>
                                <option value="Critica">Crítica (Emergencia)</option>
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

                    <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-xl text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all">
                        <Save className="w-4 h-4" /> {editingLog ? 'Guardar Cambios' : 'Registrar en Bitácora'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- VISTA PRINCIPAL: BITÁCORA ---
const Bitacora = () => {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('Todos');

    // Cargar logs desde el backend
    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await BitacoraService.getAll({ limit: 100 }); // Traemos suficientes para el demo
            
            // Transformar datos del backend al formato visual requerido
            const transformedLogs = (data.bitacoras || []).map(log => {
                // Parsear detalles para extraer estructura JSON o legacy
                let desc = log.detalles || '';
                let cat = 'General';
                let shift = '-';
                let uiPriority = 'Normal';
                
                // 1. Intentar JSON
                try {
                    const parsed = JSON.parse(desc);
                    if (parsed.description) desc = parsed.description;
                    if (parsed.category) cat = parsed.category;
                    if (parsed.shift) shift = parsed.shift;
                    // Prioridad desde JSON si existe
                    if (parsed.priority) {
                        if (parsed.priority === 'Media') uiPriority = 'Normal';
                        else uiPriority = parsed.priority;
                    }
                } catch (e) {
                    // 2. Fallback a Legacy Regex: [Categoria] [Turno] Descripcion
                    const catMatch = desc.match(/^\[(.*?)\]/);
                    if (catMatch) {
                        cat = catMatch[1];
                        desc = desc.replace(/^\[(.*?)\]\s*/, '');
                    }
                    const shiftMatch = desc.match(/^\[(.*?)\]/);
                    if (shiftMatch) {
                        shift = shiftMatch[1];
                        desc = desc.replace(/^\[(.*?)\]\s*/, '');
                    }
                }

                // Normalizar prioridad desde columna nivel si no se definió en JSON (o para asegurar consistencia visual con backend)
                // Preferimos la columna nivel si existe y es válida, ya que es indexable en DB
                if (log.nivel === 'Informativa' || log.nivel === 'Baja') uiPriority = 'Baja';
                if (log.nivel === 'Advertencia' || log.nivel === 'Alta') uiPriority = 'Alta';
                if (log.nivel === 'Critica' || log.nivel === 'Error') uiPriority = 'Critica';
                // Si nivel es 'Normal' o null, mantenemos 'Normal' o lo que vino del JSON

                return {
                    id: log.id,
                    title: log.accion,
                    category: cat,
                    priority: uiPriority,
                    shift: shift,
                    author: log.autor || 'Sistema',
                    date: log.fecha ? format(new Date(log.fecha), 'dd/MM/yyyy') : '',
                    time: log.fecha ? format(new Date(log.fecha), 'HH:mm') : '',
                    description: desc,
                    originalNivel: log.nivel, // Guardamos el nivel original para updates
                    rawDetails: log.detalles // Guardamos detalles crudos para edición fiel
                };
            });

            setLogs(transformedLogs);
        } catch (error) {
            console.error("Error cargando bitácora:", error);
            Swal.fire('Error', 'No se pudieron cargar los registros', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSaveLog = async (formData) => {
        try {
            // Mapear prioridad UI -> Backend Nivel
            let backendNivel = 'Informativa';
            if (formData.priority === 'Baja') backendNivel = 'Baja';
            if (formData.priority === 'Normal') backendNivel = 'Informativa'; // Default mapping
            if (formData.priority === 'Alta') backendNivel = 'Alta';
            if (formData.priority === 'Critica') backendNivel = 'Critica';

            // Empaquetar datos en JSON para el campo detalles
            // Formato JSON solicitado: {"description": "...", "priority": "...", "category": "...", "shift": "..."}
            const detailsObj = {
                description: formData.description,
                priority: formData.priority === 'Normal' ? 'Media' : formData.priority, // Normal -> Media para consistencia con ejemplo
                category: formData.category,
                shift: formData.shift
            };
            const fullDetails = JSON.stringify(detailsObj);

            const payload = {
                accion: formData.title,
                nivel: backendNivel,
                detalles: fullDetails,
                // Fecha automática en backend si es create
            };

            if (editingLog) {
                await BitacoraService.update(editingLog.id, payload);
                Swal.fire('Actualizado', 'Registro actualizado correctamente', 'success');
            } else {
                await BitacoraService.create(payload);
                Swal.fire('Creado', 'Nuevo registro añadido', 'success');
            }
            
            setIsModalOpen(false);
            setEditingLog(null);
            fetchLogs(); // Recargar datos
        } catch (error) {
            console.error("Error guardando:", error);
            Swal.fire('Error', 'No se pudo guardar el registro', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#000',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await BitacoraService.delete(id);
                Swal.fire('Eliminado', 'El registro ha sido eliminado', 'success');
                fetchLogs();
            } catch (error) {
                console.error("Error eliminando:", error);
                Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
            }
        }
    };

    const openEditModal = (log) => {
        // Necesitamos reconstruir el objeto compatible con el modal
        // log ya viene transformado del fetchLogs, así que podemos pasarlo directo
        // pero necesitamos el nivel original del backend para el mapeo inverso si fuera complejo
        // En este caso LogEntryModal ya maneja la lógica de extracción de strings.
        // Pero necesitamos pasarle el objeto 'original' o simularlo.
        // Pasaremos un objeto híbrido.
        setEditingLog({
            id: log.id,
            accion: log.title,
            detalles: `[${log.category}] [${log.shift}] ${log.description}`, // Reconstruir formato raw
            nivel: log.priority // Aproximación, el modal hará el re-mapeo
        });
        setIsModalOpen(true);
    };

    const getPriorityStyles = (p) => {
        switch(p) {
            case 'Critica': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-l-4 border-red-600', badge: 'bg-red-100 text-red-800' };
            case 'Alta': return { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-l-4 border-orange-500', badge: 'bg-orange-100 text-orange-800' };
            case 'Baja': return { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-l-4 border-blue-500', badge: 'bg-blue-100 text-blue-800' };
            default: return { bg: 'bg-white', text: 'text-gray-800', border: 'border-l-4 border-green-500', badge: 'bg-green-50 text-green-700' };
        }
    };

    const filteredLogs = logs.filter(log => 
        (filterPriority === 'Todos' || log.priority === filterPriority) &&
        (log.title.toLowerCase().includes(searchTerm.toLowerCase()) || log.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 p-2 sm:p-0">
                <LogEntryModal 
                    isOpen={isModalOpen} 
                    onClose={() => { setIsModalOpen(false); setEditingLog(null); }} 
                    onSave={handleSaveLog} 
                    editingLog={editingLog}
                />

                {/* Header Bitácora */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Bitácora de Supervisión</h2>
                        <p className="text-gray-500 mt-1 text-sm">Registro diario de actividades y novedades</p>
                    </div>
                    <button 
                        onClick={() => { setEditingLog(null); setIsModalOpen(true); }}
                        className="bg-black text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-gray-900 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2 transform active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> 
                        Nuevo Reporte
                    </button>
                </div>

                {/* KPI Resumen Turno */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Total Registros</p>
                        <p className="text-2xl font-black text-gray-900">{logs.length}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
                        <p className="text-[10px] font-bold text-red-400 uppercase">Incidentes</p>
                        <p className="text-2xl font-black text-red-700">{logs.filter(l => l.category === 'Incidente').length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
                        <p className="text-[10px] font-bold text-green-600 uppercase">Rondas OK</p>
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
                        {['Todos', 'Normal', 'Alta', 'Critica'].map(p => (
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
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <Loader className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredLogs.map((log) => {
                            const styles = getPriorityStyles(log.priority);
                            return (
                                <div key={log.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${styles.border} group`}>
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
                                            <div className="text-right flex items-start gap-3">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-900">{log.date}</p>
                                                    <p className="text-[10px] font-mono text-gray-400">{log.time}</p>
                                                </div>
                                                {/* Actions (Solo visibles en hover) */}
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => openEditModal(log)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(log.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
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
                        {filteredLogs.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No se encontraron registros</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Bitacora;
