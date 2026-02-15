import React, { useState, useEffect } from 'react';
import { 
    Ban, UserX, Store, Calendar, Edit, Trash2, X, Plus, AlertTriangle, 
    ShieldAlert, Search, Loader2, AlertCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';
import Layout from '../../components/Layout';
import blacklistService from '../../services/blacklistService';
import Swal from 'sweetalert2';
import RequirePermission from '../../components/RequirePermission';

// Funciones auxiliares para RUT y Texto
const formatRut = (rut) => {
    if (!rut) return '';
    const cleanRut = rut.replace(/[^0-9kK]/g, '');
    if (cleanRut.length <= 1) return cleanRut;
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
};

const validateRut = (rut) => {
    if (!rut) return false;
    const cleanRut = rut.replace(/[^0-9kK]/g, '');
    if (cleanRut.length < 2) return false;
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();
    let sum = 0;
    let multiplier = 2;
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    const res = 11 - (sum % 11);
    const calculatedDv = res === 11 ? '0' : res === 10 ? 'K' : res.toString();
    return dv === calculatedDv;
};

const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

export default function Blacklist() {
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  
  // Búsqueda avanzada
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    rut: '',
    recintos: '',
    fecha_ingreso: '',
    fecha_bloqueo: new Date().toISOString().split('T')[0],
    motivo: ''
  });

  useEffect(() => {
    fetchBlacklist();
  }, []);

  const fetchBlacklist = async () => {
    try {
      setLoading(true);
      const data = await blacklistService.getAll();
      setBlacklist(data);
    } catch (error) {
      // Ignorar errores 401 ya que son manejados por el interceptor
      if (error.response && error.response.status === 401) return;
      console.error("Error al cargar blacklist:", error);
      Swal.fire('Error', 'No se pudo cargar la lista negra', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (entry = null) => {
    if (entry) {
      setCurrentEntry(entry);
      setFormData({
        nombre: entry.nombre || '',
        rut: entry.rut || '',
        recintos: entry.recintos || '',
        fecha_ingreso: entry.fecha_ingreso || '',
        fecha_bloqueo: entry.fecha_bloqueo || '',
        motivo: entry.motivo || ''
      });
    } else {
      setCurrentEntry(null);
      setFormData({
        nombre: '',
        rut: '',
        recintos: '',
        fecha_ingreso: new Date().toISOString().split('T')[0],
        fecha_bloqueo: new Date().toISOString().split('T')[0],
        motivo: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEntry(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentEntry) {
        await blacklistService.update(currentEntry.id, formData);
        Swal.fire('Actualizado', 'Registro actualizado correctamente', 'success');
      } else {
        await blacklistService.create(formData);
        Swal.fire('Registrado', 'Usuario agregado a la lista negra', 'success');
      }
      handleCloseModal();
      fetchBlacklist();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminará este registro de la lista negra.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await blacklistService.delete(id);
        Swal.fire('Eliminado', 'Registro eliminado correctamente', 'success');
        fetchBlacklist();
      } catch {
        Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
      }
    }
  };

  const handleSearchChange = (e) => {
    let value = e.target.value;
    
    if (value.length === 0) {
        setSearchTerm('');
        setSearchError('');
        setCurrentPage(1);
        return;
    }

    const firstChar = value.charAt(0);
    
    // Detectar tipo de búsqueda y aplicar lógica
    if (/[0-9]/.test(firstChar)) {
        // Lógica RUT: solo números y k/K
        const clean = value.replace(/[^0-9kK]/g, '');
        // Formatear mientras escribe
        const formatted = formatRut(clean);
        value = formatted;
        
        // Validar RUT completo (si tiene al menos un cuerpo y DV)
        if (clean.length > 1 && !validateRut(clean)) {
            setSearchError('RUT inválido');
        } else {
            setSearchError('');
        }
    } else if (/[a-zA-Z\u00C0-\u00FF]/.test(firstChar)) {
        // Lógica Nombre: solo letras y espacios
        value = value.replace(/[^a-zA-Z\u00C0-\u00FF\s]/g, ''); // Incluir acentos
        value = toTitleCase(value);
        
        if (value.length > 0 && value.length < 3) {
            setSearchError('Mínimo 3 caracteres');
        } else {
            setSearchError('');
        }
    }
    
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const filteredBlacklist = blacklist.filter(item => 
    (item.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (item.rut || '').includes(searchTerm)
  );

  // Paginación
  const totalPages = Math.ceil(filteredBlacklist.length / itemsPerPage);
  const currentItems = filteredBlacklist.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
        
        {/* Header de la Sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    Blacklist 
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full border border-red-200 font-bold uppercase flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Acceso Denegado
                    </span>
                </h2>
                <p className="text-gray-500 mt-1 text-sm">Gestión de personal bloqueado</p>
            </div>
            <RequirePermission permission="GESTIONAR_BLACKLIST">
                <button 
                    onClick={() => handleOpenModal()} 
                    className="w-full md:w-auto bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-red-700 active:scale-95 transition-transform"
                >
                    <ShieldAlert className="w-5 h-5" /> Agregar Bloqueo
                </button>
            </RequirePermission>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="relative w-full max-w-xl">
                <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Buscar por RUT o nombre" 
                        className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${searchError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-red-500'} rounded-xl text-sm font-medium outline-none focus:ring-2 transition-all`}
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {loading && (
                        <Loader2 className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 transform -translate-y-1/2 animate-spin" />
                    )}
                </div>
                {searchError && (
                    <div className="absolute -bottom-6 left-0 flex items-center gap-1.5 text-xs text-red-600 font-medium animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {searchError}
                    </div>
                )}
            </div>
        </div>

        {/* Tabla Responsive */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 font-bold text-gray-900">Nombre Completo</th>
                            <th className="px-6 py-4 font-bold text-gray-900">RUT</th>
                            <th className="px-6 py-4 font-bold text-gray-900">Motivo / Recinto</th>
                            <th className="px-6 py-4 font-bold text-gray-900 text-center">Fechas</th>
                            <th className="px-6 py-4 font-bold text-gray-900 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentItems.length > 0 ? (
                            currentItems.map(record => (
                                <tr key={record.id} className="hover:bg-red-50/10 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-sm shadow-sm shrink-0">
                                                <UserX className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{record.nombre}</h4>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-600">
                                        {record.rut}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="font-medium text-gray-900 line-clamp-1" title={record.motivo}>
                                                {record.motivo}
                                            </p>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <Store className="w-3 h-3" />
                                                <span className="truncate max-w-[200px]">{record.recintos || 'No especificado'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-center">
                                            <div className="flex items-center gap-1.5 text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 font-bold">
                                                <Ban className="w-3 h-3" />
                                                {record.fecha_bloqueo}
                                            </div>
                                            {record.fecha_ingreso && (
                                                <span className="text-[10px] text-gray-400">
                                                    Ingreso: {record.fecha_ingreso}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <RequirePermission permission="GESTIONAR_BLACKLIST">
                                                <button 
                                                    onClick={() => handleOpenModal(record)} 
                                                    className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </RequirePermission>
                                            <RequirePermission permission="GESTIONAR_BLACKLIST">
                                                <button 
                                                    onClick={() => handleDelete(record.id)} 
                                                    className="p-2 bg-white border border-gray-200 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </RequirePermission>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                            <Search className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <p className="font-medium">No se encontraron resultados</p>
                                        <p className="text-xs text-gray-400">Intente con otro término de búsqueda</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <span className="text-xs text-gray-500 font-medium">
                        Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredBlacklist.length)} - {Math.min(currentPage * itemsPerPage, filteredBlacklist.length)} de {filteredBlacklist.length} registros
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-xs font-bold text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* MODAL FORMULARIO */}
      {isModalOpen && (
        <div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200"
            style={{
                backgroundColor: 'var(--overlay-fallback-color)',
                backdropFilter: 'blur(var(--overlay-blur-intensity))',
                WebkitBackdropFilter: 'blur(var(--overlay-blur-intensity))'
            }}
        >
            <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-auto max-h-[90vh] animate-in slide-in-from-bottom-10 duration-300">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10 shrink-0">
                    <h3 className="text-xl font-bold text-gray-900">
                        {currentEntry ? 'Editar Bloqueo' : 'Nuevo Bloqueo'}
                    </h3>
                    <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                    <form id="blacklist-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                            <input 
                                type="text" 
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                placeholder="Ej: Juan Pérez" 
                                required
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">RUT</label>
                                <input 
                                    type="text" 
                                    name="rut"
                                    value={formData.rut}
                                    onChange={handleInputChange}
                                    placeholder="12.345.678-9" 
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha Bloqueo</label>
                                <input 
                                    type="date" 
                                    name="fecha_bloqueo"
                                    value={formData.fecha_bloqueo}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Recintos / Locales</label>
                            <input 
                                type="text" 
                                name="recintos"
                                value={formData.recintos}
                                onChange={handleInputChange}
                                placeholder="Ej: Mall Plaza, Costanera..." 
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
                            />
                        </div>

                         <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha Ingreso (Opcional)</label>
                            <input 
                                type="date" 
                                name="fecha_ingreso"
                                value={formData.fecha_ingreso}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Motivo del Bloqueo</label>
                            <textarea 
                                name="motivo"
                                value={formData.motivo}
                                onChange={handleInputChange}
                                rows="3" 
                                placeholder="Describa la razón del bloqueo..." 
                                required
                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                            ></textarea>
                        </div>
                    </form>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-100 bg-white shrink-0 safe-area-bottom">
                    <button 
                        type="submit" 
                        form="blacklist-form"
                        className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <ShieldAlert className="w-5 h-5" />
                        {currentEntry ? 'Actualizar Bloqueo' : 'Confirmar Bloqueo'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </Layout>
  );
}
