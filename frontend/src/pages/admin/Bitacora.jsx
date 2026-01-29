import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
    Calendar, ChevronRight, Clock, Plus, X, 
    AlertTriangle, CheckCircle, Info, ShieldAlert,
    Edit2, Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';
import Layout from '../../components/Layout';
import BitacoraService from '../../services/bitacoraService';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const BitacoraPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'Rutina',
    title: '',
    description: '',
    severity: 'Baja'
  });

  // Fetch reports function
  const fetchReports = async () => {
    try {
      const data = await BitacoraService.getAll({ limit: 100 });
      
      if (data.bitacoras) {
        // Transform backend data to frontend model
        const transformedReports = data.bitacoras.map(log => {
            // Prefer new columns
            const desc = log.descripcion || '';
            const type = log.categoria || 'Rutina';
            
            // Priority: Prefer 'prioridad' column, fallback to 'nivel' mapped
            let severity = log.prioridad;
            
            if (!severity) {
                if (log.nivel === 'Informativa' || log.nivel === 'Baja') severity = 'Baja';
                else if (log.nivel === 'Advertencia' || log.nivel === 'Media') severity = 'Media';
                else if (log.nivel === 'Alta') severity = 'Alta';
                else if (log.nivel === 'Critica' || log.nivel === 'Error') severity = 'Critica';
                else severity = 'Baja';
            }

            return {
                id: log.id,
                title: log.accion,
                description: desc,
                type: type,
                severity: severity,
                timestamp: log.fecha, 
                author: log.autor
            };
        });
        setReports(transformedReports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar la bitácora',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReports();
    } else if (!authLoading) {
        setLoading(false);
    }
  }, [user, authLoading]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = (report) => {
    setFormData({
        type: report.type,
        title: report.title,
        description: report.description,
        severity: report.severity
    });
    setEditingId(report.id);
    setIsModalOpen(true);
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
            Swal.fire(
                'Eliminado!',
                'El registro ha sido eliminado.',
                'success'
            );
            fetchReports();
        } catch (error) {
            console.error('Error deleting report:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el registro',
            });
        }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
        type: 'Rutina',
        title: '',
        description: '',
        severity: 'Baja'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Map Frontend Severity -> Backend Nivel (still useful for filtering/logic)
        let backendNivel = 'Informativa';
        if (formData.severity === 'Baja') backendNivel = 'Baja';
        else if (formData.severity === 'Media') backendNivel = 'Media';
        else if (formData.severity === 'Alta') backendNivel = 'Alta';
        else if (formData.severity === 'Critica') backendNivel = 'Critica';

        const payload = {
            accion: formData.title,
            descripcion: formData.description,
            categoria: formData.type,
            prioridad: formData.severity,
            nivel: backendNivel
        };

        let response;
        if (editingId) {
            response = await BitacoraService.update(editingId, payload);
        } else {
            response = await BitacoraService.create(payload);
        }
      
        if (response || response.success) { // Some backends return just the object, others {success: true}
            Swal.fire({
                icon: 'success',
                title: editingId ? 'Reporte actualizado' : 'Reporte creado',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            fetchReports(); 
            handleCloseModal();
        }
    } catch (error) {
      console.error('Error saving report:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error de conexión al guardar reporte',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critica': return 'bg-red-100 text-red-600';
      case 'Alta': return 'bg-orange-100 text-orange-600';
      case 'Media': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading || loading) {
    return (
        <Layout>
            <div className="p-8 text-center flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        </Layout>
    );
  }

  return (
    <Layout>
        <div className="p-4 md:p-8 max-w-4xl mx-auto w-full relative animate-in fade-in duration-500">
        {/* Header Sección */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
            <h1 className="text-2xl font-bold text-black tracking-tight">Mi Bitácora</h1>
            <p className="text-sm text-gray-500 mt-1">Novedades del turno en curso.</p>
            </div>
            
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-gray-800 transition-colors flex items-center gap-2 transform active:scale-95"
                >
                    <Plus size={16} /> Nuevo Reporte
                </button>

                {/* Usuario Widget (Visible Desktop) */}
                <div className="hidden md:flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors pr-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                    {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden md:block text-right">
                    <p className="text-sm font-semibold text-gray-700 leading-tight">{user?.nombre || 'Usuario'}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{user?.roles || 'En Turno'}</p>
                    </div>
                </div>
                </div>
            </div>
        </div>

        {/* Filtros Rápidos */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar items-center">
            <div className="relative shrink-0">
            <input type="date" className="absolute inset-0 opacity-0 z-10 w-full h-full cursor-pointer" id="date-filter" />
            <button className="whitespace-nowrap bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-full text-xs font-bold shadow-sm flex items-center gap-2 active:bg-gray-100">
                <Calendar size={14} /> Fecha
            </button>
            </div>
            <div className="w-px h-6 bg-gray-300 mx-1 shrink-0"></div>
            <button className="whitespace-nowrap bg-black text-white px-4 py-2 rounded-full text-xs font-bold shadow-md">Todas</button>
            <button className="whitespace-nowrap bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-gray-50">Incidentes</button>
            <button className="whitespace-nowrap bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-gray-50">Visitas</button>
        </div>

        {/* Lista Vertical (Stack) */}
        <div className="space-y-4 pb-20">
            {reports.length > 0 ? (
                reports.map(report => (
                    <div key={report.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group relative">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <div className={`mt-1 p-2 rounded-full ${getSeverityColor(report.severity)}`}>
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{report.title}</h3>
                                    <p className="text-sm text-gray-500">{report.description}</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">{report.type}</span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            {report.timestamp ? new Date(report.timestamp).toLocaleDateString() : ''} {formatTime(report.timestamp)}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1 border-l pl-2 ml-1">
                                            {report.author}
                                        </span>
                                        {report.ip && (
                                            <span className="text-xs text-gray-400 flex items-center gap-1 border-l pl-2 ml-1 font-mono">
                                                IP: {report.ip}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => handleEdit(report)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(report.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <ChevronRight className="text-gray-300 group-hover:hidden" size={20} />
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8 text-gray-400">
                    <p>No hay novedades registradas.</p>
                </div>
            )}
        </div>

        {/* Modal Crear/Editar Reporte */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                    <div className="flex justify-between items-center p-5 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">
                            {editingId ? 'Editar Reporte' : 'Nuevo Reporte'}
                        </h2>
                        <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Reporte</label>
                            <select 
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                            >
                                <option value="Rutina">Rutina</option>
                                <option value="Incidente">Incidente</option>
                                <option value="Visita">Visita</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gravedad</label>
                            <div className="flex gap-2">
                                {['Baja', 'Media', 'Alta', 'Critica'].map((sev) => (
                                    <button
                                        key={sev}
                                        type="button"
                                        onClick={() => setFormData({...formData, severity: sev})}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                                            formData.severity === sev 
                                            ? 'bg-black text-white border-black' 
                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {sev}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Título</label>
                            <input 
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Ej: Ronda perimetral completada"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descripción</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Detalles adicionales..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors resize-none h-24"
                            ></textarea>
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-red-700 transition-all transform active:scale-95 mt-2"
                        >
                            {editingId ? 'Guardar Cambios' : 'Registrar Reporte'}
                        </button>
                    </form>
                </div>
            </div>
        )}
        </div>
    </Layout>
  );
};

export default BitacoraPage;
