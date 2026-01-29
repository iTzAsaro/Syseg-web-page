import React, { useState, useEffect } from 'react';
import { 
    UserPlus, Search, User, Phone, Mail, AlertOctagon, Shirt, 
    CreditCard, Smartphone, Trash2, Save, X, ShieldCheck,
    ChevronLeft, ChevronRight, AlertCircle, Loader2
} from 'lucide-react';
import Layout from '../../components/Layout';
import guardiaService from '../../services/guardiaService';
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

const Guardias = () => {
    const [guards, setGuards] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchError, setSearchError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Estado del formulario
    const initialFormState = {
        nombre: '',
        rut: '',
        nacimiento: '',
        civil: 'Soltero/a',
        comuna: 'Santiago',
        email: '',
        celular: '',
        nombre_emergencia: '',
        fono_emergencia: '',
        talla_camisa: 'M',
        talla_pantalon: '42',
        talla_zapato: '41',
        afp: 'Modelo',
        salud: 'Fonasa',
        activo_app: true,
        password: '',
        tiene_cuenta_rut: true,
        banco_nombre: '',
        banco_tipo_cuenta: '',
        banco_numero_cuenta: ''
    };
    
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchGuards();
    }, []);

    const fetchGuards = async () => {
        setLoading(true);
        try {
            const data = await guardiaService.getAll();
            setGuards(data);
        } catch (error) {
            // Ignorar errores 401 ya que son manejados por el interceptor
            if (error.response && error.response.status === 401) return;
            console.error("Error cargando guardias:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (guard = null) => {
        if (guard) {
            setEditingId(guard.id);
            setFormData({
                ...initialFormState,
                ...guard,
                // Mapeo de campos si es necesario (ej. si el backend devuelve null)
                nacimiento: guard.nacimiento || '',
                email: guard.email || '',
                nombre_emergencia: guard.nombre_emergencia || '',
                fono_emergencia: guard.fono_emergencia || '',
                celular: guard.celular || '',
                banco_nombre: guard.banco_nombre || '',
                banco_tipo_cuenta: guard.banco_tipo_cuenta || '',
                banco_numero_cuenta: guard.banco_numero_cuenta || '',
                comuna: guard.comuna || 'Santiago',
                talla_camisa: guard.talla_camisa || 'M',
                talla_pantalon: guard.talla_pantalon || '42',
                talla_zapato: guard.talla_zapato || '41',
                afp: guard.afp || 'Modelo',
                salud: guard.salud || 'Fonasa',
                password: '', // Contraseña siempre vacía al editar
                // Asumiendo que el backend devuelve estos campos tal cual
            });
        } else {
            setEditingId(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
        setActiveTab('personal');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        try {
            if (editingId) {
                await guardiaService.update(editingId, formData);
            } else {
                await guardiaService.create(formData);
            }
            fetchGuards();
            handleCloseModal();
        } catch (error) {
            alert("Error guardando: " + error.message);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('¿Seguro que desea eliminar este guardia?')) {
            try {
                await guardiaService.remove(id);
                fetchGuards();
            } catch (error) {
                alert("Error eliminando: " + error.message);
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

    const filteredGuards = guards.filter(g => 
        (g.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (g.rut || '').includes(searchTerm)
    );

    // Paginación
    const totalPages = Math.ceil(filteredGuards.length / itemsPerPage);
    const paginatedGuards = filteredGuards.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );

    return (
        <Layout>
            <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Guardias</h2>
                    <p className="text-gray-500 mt-1 text-sm">Gestión de dotación</p>
                </div>
                <RequirePermission permission="CREAR_GUARDIA">
                    <button 
                        onClick={() => handleOpenModal()} 
                        className="w-full md:w-auto bg-black text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-gray-900 active:scale-95 transition-transform"
                    >
                        <UserPlus className="w-5 h-5" /> Nuevo Guardia
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
                            className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border ${searchError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-black'} rounded-xl text-sm font-medium outline-none focus:ring-2 transition-all`}
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
                                <th className="px-6 py-4 font-bold text-gray-900 text-center">Estado</th>
                                <th className="px-6 py-4 font-bold text-gray-900 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedGuards.length > 0 ? (
                                paginatedGuards.map(guard => (
                                    <tr key={guard.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                                    {guard.nombre ? guard.nombre.charAt(0) : '?'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{guard.nombre}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                        <Mail className="w-3 h-3" /> {guard.email || 'Sin email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-600">
                                            {guard.rut}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${guard.activo_app ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                <div className={`w-2 h-2 rounded-full ${guard.activo_app ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                {guard.activo_app ? 'Activo' : 'Inactivo'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <RequirePermission permission="EDITAR_GUARDIA">
                                                    <button 
                                                        onClick={() => handleOpenModal(guard)} 
                                                        className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-black hover:text-white hover:border-black transition-all shadow-sm"
                                                        title="Editar ficha"
                                                    >
                                                        <User className="w-4 h-4" />
                                                    </button>
                                                </RequirePermission>
                                                <RequirePermission permission="ELIMINAR_GUARDIA">
                                                    <button 
                                                        onClick={(e) => handleDelete(guard.id, e)} 
                                                        className="p-2 bg-white border border-gray-200 text-gray-400 rounded-lg hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
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
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
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
                            Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredGuards.length)} - {Math.min(currentPage * itemsPerPage, filteredGuards.length)} de {filteredGuards.length} guardias
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

            {/* MODAL GUARDIA */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200"
                    style={{
                        backgroundColor: 'var(--overlay-fallback-color)',
                        backdropFilter: 'blur(var(--overlay-blur-intensity))',
                        WebkitBackdropFilter: 'blur(var(--overlay-blur-intensity))'
                    }}
                >
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[90vh] sm:h-auto sm:max-h-[90vh]">
                        
                        {/* Header Modal */}
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0 bg-white">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Ficha del Guardia</h3>
                                <p className="text-xs text-gray-500">Gestión integral de personal</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Tabs de Navegación */}
                        <div className="flex overflow-x-auto border-b border-gray-100 shrink-0 bg-gray-50/50 hide-scroll">
                            <button 
                                onClick={() => setActiveTab('personal')} 
                                className={`flex-none flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${activeTab === 'personal' ? 'active border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-gray-500'}`}
                            >
                                <User className="w-4 h-4" /> Personal
                            </button>
                            <button 
                                onClick={() => setActiveTab('contacto')} 
                                className={`flex-none flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${activeTab === 'contacto' ? 'active border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-gray-500'}`}
                            >
                                <Phone className="w-4 h-4" /> Contacto
                            </button>
                            <button 
                                onClick={() => setActiveTab('uniforme')} 
                                className={`flex-none flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${activeTab === 'uniforme' ? 'active border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-gray-500'}`}
                            >
                                <Shirt className="w-4 h-4" /> Uniforme
                            </button>
                            <button 
                                onClick={() => setActiveTab('banco')} 
                                className={`flex-none flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${activeTab === 'banco' ? 'active border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-gray-500'}`}
                            >
                                <CreditCard className="w-4 h-4" /> Bancario
                            </button>
                        </div>

                        {/* Contenido del Formulario */}
                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            
                            {/* Tab: Personal */}
                            <div className={`space-y-5 ${activeTab === 'personal' ? '' : 'hidden'}`}>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Nombre Completo</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                                        <input 
                                            type="text" 
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black transition-all" 
                                            placeholder="Ej. Juan Pérez"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">RUT</label>
                                        <input 
                                            type="text" 
                                            name="rut"
                                            value={formData.rut}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black" 
                                            placeholder="12.345.678-9"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Nacimiento</label>
                                        <input 
                                            type="date" 
                                            name="nacimiento"
                                            value={formData.nacimiento}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                         <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Estado Civil</label>
                                         <select 
                                            name="civil"
                                            value={formData.civil}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                                        >
                                             <option>Soltero/a</option><option>Casado/a</option><option>Divorciado/a</option>
                                         </select>
                                    </div>
                                     <div className="space-y-1.5">
                                         <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Comuna</label>
                                         <select 
                                            name="comuna"
                                            value={formData.comuna}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black"
                                        >
                                             <option>Santiago</option><option>Providencia</option><option>Maipú</option>
                                         </select>
                                    </div>
                                </div>
                            </div>

                            {/* Tab: Contacto */}
                            <div className={`space-y-5 ${activeTab === 'contacto' ? '' : 'hidden'}`}>
                                 <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Correo Electrónico</label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                                        <input 
                                            type="email" 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black" 
                                            placeholder="guardia@empresa.cl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Teléfono Móvil</label>
                                    <div className="relative">
                                        <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                                        <input 
                                            type="tel" 
                                            name="celular"
                                            value={formData.celular}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black" 
                                            placeholder="+569..."
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100 space-y-3">
                                     <h4 className="text-xs font-bold text-red-700 uppercase flex items-center gap-2"><AlertOctagon className="w-4 h-4" /> Contacto de Emergencia</h4>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                         <input 
                                            type="text" 
                                            name="nombre_emergencia"
                                            value={formData.nombre_emergencia}
                                            onChange={handleChange}
                                            placeholder="Nombre Contacto" 
                                            className="w-full bg-white border border-red-200 rounded-lg px-3 py-3 text-sm text-red-900 placeholder-red-300 outline-none focus:border-red-500"
                                        />
                                         <input 
                                            type="tel" 
                                            name="fono_emergencia"
                                            value={formData.fono_emergencia}
                                            onChange={handleChange}
                                            placeholder="Fono Emergencia" 
                                            className="w-full bg-white border border-red-200 rounded-lg px-3 py-3 text-sm text-red-900 placeholder-red-300 outline-none focus:border-red-500"
                                        />
                                     </div>
                                </div>
                            </div>

                            {/* Tab: Uniforme / Salud */}
                            <div className={`space-y-5 ${activeTab === 'uniforme' ? '' : 'hidden'}`}>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Tallas de Vestuario</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                         <div className="space-y-1 text-center">
                                             <label className="text-[10px] font-bold text-gray-500">CAMISA</label>
                                             <select 
                                                name="talla_camisa"
                                                value={formData.talla_camisa}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 text-center text-sm font-bold"
                                            >
                                                <option>S</option><option>M</option><option>L</option><option>XL</option>
                                            </select>
                                         </div>
                                         <div className="space-y-1 text-center">
                                             <label className="text-[10px] font-bold text-gray-500">PANTALÓN</label>
                                             <select 
                                                name="talla_pantalon"
                                                value={formData.talla_pantalon}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 text-center text-sm font-bold"
                                            >
                                                <option>40</option><option>42</option><option>44</option><option>46</option>
                                            </select>
                                         </div>
                                         <div className="space-y-1 text-center">
                                             <label className="text-[10px] font-bold text-gray-500">CALZADO</label>
                                             <select 
                                                name="talla_zapato"
                                                value={formData.talla_zapato}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 text-center text-sm font-bold"
                                            >
                                                <option>39</option><option>40</option><option>41</option><option>42</option>
                                            </select>
                                         </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">Previsión Social</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">AFP</label>
                                            <select 
                                                name="afp"
                                                value={formData.afp}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                                            >
                                                <option>Modelo</option><option>Habitat</option><option>Provida</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">Sistema Salud</label>
                                            <select 
                                                name="salud"
                                                value={formData.salud}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none"
                                            >
                                                <option>Fonasa</option><option>Banmédica</option><option>Consalud</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tab: Bancario / App */}
                            <div className={`space-y-6 ${activeTab === 'banco' ? '' : 'hidden'}`}>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2"><Smartphone className="w-4 h-4 text-green-600" /> Acceso App Móvil</label>
                                        {/* Toggle Visual */}
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                name="activo_app"
                                                checked={formData.activo_app}
                                                onChange={handleChange}
                                                className="sr-only peer" 
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </div>
                                    <input 
                                        type="password" 
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Contraseña de acceso" 
                                        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Datos de Transferencia</h4>
                                    <div className="flex items-center gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                                         <input 
                                            type="checkbox" 
                                            name="tiene_cuenta_rut"
                                            checked={formData.tiene_cuenta_rut}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-black rounded border-gray-300 focus:ring-black"
                                        />
                                         <span className="text-sm text-gray-700 font-medium">Usar Cuenta RUT (BancoEstado)</span>
                                    </div>
                                    <div className="space-y-1.5">
                                         <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Otro Banco / Tipo / N°</label>
                                         <input 
                                            type="text" 
                                            disabled={formData.tiene_cuenta_rut}
                                            className="w-full bg-gray-100 text-gray-400 border border-gray-200 rounded-xl px-4 py-3 text-sm" 
                                            placeholder="Ej. Santander - Cta Cte - 099..."
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer Modal */}
                        <div className="p-5 border-t border-gray-100 bg-white shrink-0 safe-area-bottom">
                            <button 
                                onClick={handleSave} 
                                className="w-full bg-black text-white py-4 rounded-xl text-sm font-bold shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Guardar Ficha Completa
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </Layout>
    );
};

export default Guardias;