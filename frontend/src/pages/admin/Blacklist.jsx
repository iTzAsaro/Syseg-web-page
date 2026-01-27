import React, { useState, useEffect } from 'react';
import { 
  Ban, UserX, Store, Calendar, Edit, Trash2, X, Plus, AlertTriangle, ShieldAlert
} from 'lucide-react';
import Layout from '../../components/Layout';
import blacklistService from '../../services/blacklistService';
import Swal from 'sweetalert2';

export default function Blacklist() {
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  
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
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
      }
    }
  };

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
            <button 
                onClick={() => handleOpenModal()} 
                className="w-full md:w-auto bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-red-700 active:scale-95 transition-transform"
            >
                <ShieldAlert className="w-5 h-5" /> Agregar Bloqueo
            </button>
        </div>

        {/* Grid de Tarjetas */}
        {loading ? (
           <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
           </div>
        ) : blacklist.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <UserX className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No hay registros en la lista negra</h3>
                <p className="text-gray-500 mt-1">La lista de bloqueos está vacía.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {blacklist.map((record) => (
                    <div key={record.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative flex flex-col">
                        {/* Borde Rojo Izquierdo */}
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
                        
                        <div className="p-6 pl-8 flex-1 flex flex-col">
                            {/* Header Tarjeta */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg leading-tight line-clamp-2">{record.nombre}</h3>
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-mono font-bold rounded">
                                        {record.rut}
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shadow-sm shrink-0">
                                    <UserX className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="space-y-3 mb-6 flex-1">
                                {/* Recintos */}
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <Store className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <span className="font-medium leading-tight">{record.recintos || 'No especificado'}</span>
                                </div>

                                {/* Fechas Box */}
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> Ingreso
                                        </span>
                                        <span className="font-mono font-bold text-gray-700">{record.fecha_ingreso || '-'}</span>
                                    </div>
                                    <div className="w-full h-px bg-gray-200"></div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-red-500 flex items-center gap-1 font-bold">
                                            <Ban className="w-3 h-3" /> Bloqueo
                                        </span>
                                        <span className="font-mono font-bold text-red-700">{record.fecha_bloqueo}</span>
                                    </div>
                                </div>

                                {/* Motivo */}
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Motivo del Bloqueo</p>
                                    <p className="text-sm text-gray-700 italic leading-relaxed line-clamp-3">"{record.motivo}"</p>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 mt-auto">
                                <button 
                                    onClick={() => handleOpenModal(record)} 
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(record.id)} 
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* MODAL FORMULARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
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
