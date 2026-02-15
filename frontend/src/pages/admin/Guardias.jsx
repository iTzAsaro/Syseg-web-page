import React, { useState, useEffect } from 'react';
import { 
    UserPlus, Search, User, Phone, Mail, AlertOctagon, Shirt, Footprints, Clock,
    CreditCard, Smartphone, Trash2, Save, X, ShieldCheck, Loader2, Map as MapIcon, ChevronDown 
} from 'lucide-react';
import Layout from '../../components/Layout';
import guardiaService from '../../services/guardiaService';
import comunaService from '../../services/comunaService';
import regionService from '../../services/regionService';
import RequirePermission from '../../components/RequirePermission';
import Swal from 'sweetalert2';

// Helper para formatear RUT
const formatRut = (rut) => {
    if (!rut) return '';
    const cleanRut = rut.replace(/[^0-9kK]/g, '');
    if (cleanRut.length <= 1) return cleanRut;
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
};

// Helper para validar RUT
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

// Helper para formatear fecha input (DD/MM/YYYY)
const formatDateInput = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 8);
    if (v.length >= 5) {
        return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length >= 3) {
        return `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    return v;
};

// Helper para convertir ISO (YYYY-MM-DD) a Display (DD/MM/YYYY)
const isoToDisplayDate = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
};

// Helper para convertir Display (DD/MM/YYYY) a ISO (YYYY-MM-DD)
const displayToIsoDate = (displayDate) => {
    if (!displayDate || displayDate.length !== 10) return null;
    const [day, month, year] = displayDate.split('/');
    return `${year}-${month}-${day}`;
};

// Helper para formatear teléfono (+56 9 XXXX XXXX)
const formatPhone = (value) => {
    // 1. Limpiar todo lo que no sea número
    const clean = value.replace(/\D/g, '');
    
    // 2. Si está vacío, retornar vacío
    if (clean.length === 0) return '';

    // 3. Normalizar inicio (si empieza con 56, lo quitamos para procesar)
    let number = clean;
    if (number.startsWith('56')) {
        number = number.slice(2);
    }
    
    // 4. Limitar largo máximo (9 dígitos: 9 + 8 dígitos número)
    if (number.length > 9) {
        number = number.slice(0, 9);
    }

    // 5. Construir formato +56 X XXXX XXXX
    let formatted = '+56';
    
    if (number.length > 0) {
        formatted += ' ' + number.slice(0, 1); // Primer dígito (ej: 9)
    }
    if (number.length > 1) {
        formatted += ' ' + number.slice(1, 5); // Siguientes 4
    }
    if (number.length > 5) {
        formatted += ' ' + number.slice(5); // Resto
    }
    
    return formatted;
};

const Guardias = () => {
    const [guards, setGuards] = useState([]);
    const [comunas, setComunas] = useState([]);
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [regionSearch, setRegionSearch] = useState('');
    const [showRegionDropdown, setShowRegionDropdown] = useState(false);
    const [comunaSearch, setComunaSearch] = useState('');
    const [showComunaDropdown, setShowComunaDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [rutError, setRutError] = useState('');
    const [nacimientoError, setNacimientoError] = useState('');
    const [useRutPass, setUseRutPass] = useState(true);
    
    // Calculate max date (18 years ago) for validation
    // Estado del formulario
    const initialFormState = {
        nombre: '',
        rut: '',
        nacimiento: '',
        tipo_contrato: 'Contratado',
        civil: 'Soltero/a',
        comuna_id: '',
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
        banco_nombre: 'BancoEstado',
        banco_tipo_cuenta: 'Cuenta Vista',
        banco_numero_cuenta: ''
    };
    
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchGuards();
        fetchRegions();
    }, []);

    const fetchRegions = async () => {
        try {
            const data = await regionService.getAll();
            setRegions(data);
        } catch (error) {
            console.error("Error cargando regiones:", error);
        }
    };

    const fetchComunas = async (regionId = null) => {
        try {
            const data = await comunaService.getAll(regionId);
            setComunas(data);
            return data;
        } catch (error) {
            console.error("Error cargando comunas:", error);
            return [];
        }
    };

    const fetchGuards = async () => {
        try {
            const data = await guardiaService.getAll();
            setGuards(data);
        } catch (error) {
            // Ignorar errores 401 ya que son manejados por el interceptor
            if (error.response && error.response.status === 401) return;
            console.error("Error cargando guardias:", error);
        }
    };

    const handleOpenModal = async (guard = null) => {
        setRutError(''); // Limpiar error al abrir modal
        setNacimientoError('');
        if (guard) {
            setUseRutPass(false);
            setEditingId(guard.id);
            const isCuentaRut = guard.banco_nombre === 'BancoEstado' && guard.banco_tipo_cuenta === 'Cuenta Vista';
            
            // Determinar Región y cargar Comunas
            let regionId = '';
            // Asegurar que las regiones estén cargadas
            if (regions.length === 0) {
                await fetchRegions();
            }

            const comunaData = guard.Comuna || guard.comuna;
            if (comunaData && comunaData.region_id) {
                regionId = comunaData.region_id;
            } else if (guard.comuna_id) {
                // Si no viene el objeto Comuna pero sí el ID, tendríamos que buscar la región... 
                // pero asumimos que el backend envía el include Comuna.
            }
            
            setSelectedRegion(regionId);
            if (regionId) {
                const regionName = regions.find(r => r.id === regionId)?.nombre || '';
                setRegionSearch(regionName);
                const loadedComunas = await fetchComunas(regionId);
                
                // Set comuna search text
                const currentComunaId = guard.comuna_id || (guard.Comuna?.id) || (guard.comuna?.id);
                if (currentComunaId) {
                    const comunaName = loadedComunas.find(c => c.id === currentComunaId)?.nombre || '';
                    setComunaSearch(comunaName);
                } else {
                    setComunaSearch('');
                }
            } else {
                setRegionSearch('');
                setComunaSearch('');
                setComunas([]);
            }

            setFormData({
                ...initialFormState,
                ...guard,
                // Mapeo de campos si es necesario (ej. si el backend devuelve null)
                nacimiento: isoToDisplayDate(guard.nacimiento) || '',
                tipo_contrato: guard.tipo_contrato || 'Contratado',
                email: guard.email || '',
                nombre_emergencia: guard.nombre_emergencia || '',
                fono_emergencia: guard.fono_emergencia || '',
                celular: guard.celular || '',
                tiene_cuenta_rut: isCuentaRut,
                banco_nombre: guard.banco_nombre || (isCuentaRut ? 'BancoEstado' : ''),
                banco_tipo_cuenta: guard.banco_tipo_cuenta || (isCuentaRut ? 'Cuenta Vista' : ''),
                banco_numero_cuenta: guard.banco_numero_cuenta || '',
                comuna_id: guard.comuna_id || '',
                talla_camisa: guard.talla_camisa || 'M',
                talla_pantalon: guard.talla_pantalon || '42',
                talla_zapato: guard.talla_zapato || '41',
                afp: guard.afp || 'Modelo',
                salud: guard.salud || 'Fonasa',
                password: '', // Contraseña siempre vacía al editar
                // Asumiendo que el backend devuelve estos campos tal cual
            });
        } else {
            setUseRutPass(true);
            setEditingId(null);
            setSelectedRegion('');
            setComunas([]);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
        setActiveTab('personal');
    };

    const handleRegionSelect = (region) => {
        setSelectedRegion(region.id);
        setRegionSearch(region.nombre);
        setShowRegionDropdown(false);
        setFormData(prev => ({ ...prev, comuna_id: '' }));
        setComunaSearch('');
        fetchComunas(region.id);
    };

    const handleComunaSelect = (comuna) => {
        setFormData(prev => ({ ...prev, comuna_id: comuna.id }));
        setComunaSearch(comuna.nombre);
        setShowComunaDropdown(false);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let newValue = type === 'checkbox' ? checked : value;
        let extraUpdates = {};
        
        if (name === 'rut') {
            newValue = formatRut(value);

            // Auto-generar contraseña si está activado
            if (useRutPass) {
                const cleanBody = newValue.replace(/\./g, '').split('-')[0];
                extraUpdates.password = cleanBody.length >= 4 ? cleanBody.slice(-4) : cleanBody;
            }

            // Validar RUT
            if (newValue.length > 0) {
                if (!validateRut(newValue)) {
                    setRutError('RUT inválido');
                } else {
                    setRutError('');
                }
            } else {
                setRutError('');
            }

            // Actualizar número de cuenta si es Cuenta RUT
            if (formData.tiene_cuenta_rut) {
                extraUpdates.banco_numero_cuenta = newValue.replace(/\./g, '').split('-')[0];
            }
        }

        if (name === 'celular' || name === 'fono_emergencia') {
            newValue = formatPhone(value);
        }

        if (name === 'nacimiento') {
            newValue = formatDateInput(value);
            
            if (newValue.length === 10) { // DD/MM/YYYY
                const [day, month, year] = newValue.split('/').map(Number);
                const date = new Date(year, month - 1, day);
                const today = new Date();
                
                // Validar fecha real (ej: 31/02 no existe)
                if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
                     setNacimientoError('Fecha inválida');
                } else {
                    let age = today.getFullYear() - date.getFullYear();
                    const m = today.getMonth() - date.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
                        age--;
                    }
                    
                    if (age < 18) {
                        setNacimientoError('Debe ser mayor de 18 años');
                    } else {
                        setNacimientoError('');
                    }
                }
            } else if (newValue.length > 0) {
                 // Si está escribiendo pero no ha terminado
                 setNacimientoError('');
            } else {
                setNacimientoError('');
            }
        }

        if (name === 'banco_numero_cuenta' || name === 'talla_pantalon' || name === 'talla_zapato') {
            newValue = value.replace(/\D/g, '');
            // Limitar tallas a 2 dígitos
            if (name === 'talla_pantalon' || name === 'talla_zapato') {
                newValue = newValue.slice(0, 2);
            }
        }

        // Lógica para Cuenta RUT
        if (name === 'tiene_cuenta_rut') {
            if (newValue) {
                extraUpdates.banco_nombre = 'BancoEstado';
                extraUpdates.banco_tipo_cuenta = 'Cuenta Vista';
                extraUpdates.banco_numero_cuenta = formData.rut ? formData.rut.replace(/\./g, '').split('-')[0] : '';
            } else {
                extraUpdates.banco_nombre = '';
                extraUpdates.banco_tipo_cuenta = '';
                extraUpdates.banco_numero_cuenta = '';
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue,
            ...extraUpdates
        }));
    };

    const handleSave = async () => {
        if (rutError) {
            Swal.fire({
                icon: 'error',
                title: 'RUT Inválido',
                text: 'Por favor, corrige el RUT antes de guardar.'
            });
            return;
        }

        if (nacimientoError) {
            Swal.fire({
                icon: 'error',
                title: 'Fecha Inválida',
                text: 'El guardia debe ser mayor de 18 años y la fecha válida.'
            });
            return;
        }

        // Preparar datos para enviar (convertir fecha DD/MM/YYYY a ISO)
        const dataToSend = {
            ...formData,
            nacimiento: displayToIsoDate(formData.nacimiento) || formData.nacimiento,
            comuna_id: formData.comuna_id || null
        };

        try {
            if (editingId) {
                await guardiaService.update(editingId, dataToSend);
            } else {
                await guardiaService.create(dataToSend);
            }
            fetchGuards();
            handleCloseModal();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al guardar el guardia'
            });
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        
        const result = await Swal.fire({
            title: '¿Está seguro de eliminar esta guardia?',
            text: "No podrás revertir esto. Se eliminará el guardia permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí',
            cancelButtonText: 'No'
        });

        if (result.isConfirmed) {
            setDeletingId(id);
            try {
                await guardiaService.remove(id);
                // Optimistic update
                setGuards(prevGuards => prevGuards.filter(g => g.id !== id));
                
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
                Toast.fire({
                    icon: 'success',
                    title: 'Guardia eliminada correctamente'
                });
            } catch (error) {
                console.error("Error eliminando:", error);
                Swal.fire(
                    'Error',
                    'No se pudo eliminar la guardia',
                    'error'
                );
            } finally {
                setDeletingId(null);
            }
        }
    };

    const filteredGuards = guards.filter(g => 
        (g.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (g.rut || '').includes(searchTerm)
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
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="relative w-full">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o RUT..." 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid Cards Guardias */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {filteredGuards.map(guard => (
                    <div key={guard.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col relative">
                        <div className="p-6 pb-4 border-b border-gray-50 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-black text-xl border border-gray-200 shadow-lg relative overflow-hidden">
                                    {guard.nombre ? guard.nombre.charAt(0) : '?'}
                                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${guard.activo_app ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{guard.nombre}</h4>
                                    <p className="text-xs text-gray-400 font-mono mt-1 tracking-wide">{guard.rut}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg">
                                {guard.activo_app ? (
                                    <Smartphone className="w-5 h-5 text-green-600" />
                                ) : (
                                    <Smartphone className="w-5 h-5 text-gray-300" />
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 flex-1 space-y-5">
                            {/* Info Personal & Contacto */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-3.5 h-3.5 text-gray-400" /> 
                                    <span className="truncate font-medium">{guard.celular || 'Sin celular'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="w-4 h-4 text-gray-400" /> 
                                    <span className="truncate">{guard.email || 'Sin email'}</span>
                                </div>
                                {(guard.nombre_emergencia || guard.fono_emergencia) && (
                                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-100 mt-1">
                                        <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate"><strong>{guard.nombre_emergencia}</strong>: {guard.fono_emergencia}</span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Tags Tallas */}
                            <div className="flex gap-2 pt-2">
                                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                    <Shirt className="w-4 h-4" /> {guard.talla_camisa || '-'}
                                </span>
                                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                        <path d="M17 2h-10c-1.1 0-2 .9-2 2v18h4v-8h6v8h4v-18c0-1.1-.9-2-2-2z" />
                                    </svg> {guard.talla_pantalon || '-'}
                                </span>
                                <span className="px-3 py-1.5 bg-gray-100 rounded text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                    <Footprints className="w-4 h-4" />
                                    {guard.talla_zapato || '-'}
                                </span>
                            </div>

                            {/* Banco */}
                             <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-2 mb-1">
                                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="text-xs font-bold text-blue-800">{guard.banco_nombre || (guard.tiene_cuenta_rut ? 'BancoEstado' : 'Sin Banco')}</span>
                                </div>
                                <p className="text-[10px] text-blue-600 pl-5.5">
                                    {guard.banco_tipo_cuenta || (guard.tiene_cuenta_rut ? 'Cuenta Vista' : '')} • {guard.banco_numero_cuenta || (guard.tiene_cuenta_rut && guard.rut ? guard.rut.replace(/\./g, '').split('-')[0] : '')}
                                </p>
                            </div>
                            
                            {/* App Status */}
                            <div className="flex items-center justify-between text-xs pt-3 mt-2 border-t border-gray-50">
                                <span className="text-gray-400 font-medium flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    Último acceso
                                </span>
                                <span className={`px-2.5 py-1 rounded-lg font-bold border shadow-sm ${
                                    guard.ultimo_acceso 
                                        ? 'bg-gray-50 text-gray-700 border-gray-100' 
                                        : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                }`}>
                                    {guard.ultimo_acceso ? new Date(guard.ultimo_acceso).toLocaleString('es-CL', {
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit', hour12: false
                                    }).replace(',', '') : 'Nunca'}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                            <RequirePermission permission="EDITAR_GUARDIA">
                                <button 
                                    onClick={() => handleOpenModal(guard)} 
                                    className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-black hover:text-white hover:border-black transition-colors shadow-sm"
                                >
                                    Ver / Editar
                                </button>
                            </RequirePermission>
                            <RequirePermission permission="ELIMINAR_GUARDIA">
                                <button 
                                    onClick={(e) => handleDelete(guard.id, e)} 
                                    disabled={deletingId === guard.id}
                                    className={`p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 rounded-xl transition-colors shadow-sm ${deletingId === guard.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {deletingId === guard.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            </RequirePermission>
                        </div>
                    </div>
                ))}
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
                                            className={`w-full bg-gray-50 border ${rutError ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black`}
                                            placeholder="12.345.678-9"
                                        />
                                        {rutError && <p className="text-xs text-red-500 mt-1 font-bold">{rutError}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Nacimiento</label>
                                        <input 
                                            type="text" 
                                            name="nacimiento"
                                            value={formData.nacimiento}
                                            onChange={handleChange}
                                            placeholder="DD/MM/YYYY"
                                            maxLength="10"
                                            className={`w-full bg-gray-50 border ${nacimientoError ? 'border-red-500' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black`}
                                        />
                                        {nacimientoError && <p className="text-xs text-red-500 mt-1 font-bold">{nacimientoError}</p>}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {/* Región, Comuna y Estado Civil - Grid unificado */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Región */}
                                        <div className="space-y-1.5 relative">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Región</label>
                                            <div className="relative group">
                                                <MapIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors z-10" />
                                                <input
                                                    type="text"
                                                    value={regionSearch}
                                                    onChange={(e) => {
                                                        setRegionSearch(e.target.value);
                                                        setShowRegionDropdown(true);
                                                        if (e.target.value === '') setSelectedRegion('');
                                                    }}
                                                    onFocus={() => setShowRegionDropdown(true)}
                                                    onBlur={() => setTimeout(() => setShowRegionDropdown(false), 200)}
                                                    placeholder="Buscar Región..."
                                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-black focus:ring-2 focus:ring-black transition-all outline-none"
                                                />
                                                <div className="absolute right-3 top-3.5 pointer-events-none">
                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                </div>
                                                
                                                {/* Dropdown de Regiones */}
                                                {showRegionDropdown && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                                        {regions.filter(r => r.nombre.toLowerCase().includes(regionSearch.toLowerCase())).length > 0 ? (
                                                            regions.filter(r => r.nombre.toLowerCase().includes(regionSearch.toLowerCase())).map(region => (
                                                                <button
                                                                    key={region.id}
                                                                    type="button"
                                                                    onClick={() => handleRegionSelect(region)}
                                                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-black transition-colors flex items-center justify-between group"
                                                                >
                                                                    <span>{region.nombre}</span>
                                                                    {selectedRegion === region.id && (
                                                                        <span className="w-2 h-2 rounded-full bg-black"></span>
                                                                    )}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                                                No se encontraron regiones
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Comuna */}
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Comuna</label>
                                            <div className="relative group">
                                                <MapIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={comunaSearch}
                                                    onChange={(e) => {
                                                        setComunaSearch(e.target.value);
                                                        setShowComunaDropdown(true);
                                                        if (e.target.value === '') setFormData(prev => ({ ...prev, comuna_id: '' }));
                                                    }}
                                                    onFocus={() => setShowComunaDropdown(true)}
                                                    onBlur={() => setTimeout(() => setShowComunaDropdown(false), 200)}
                                                    placeholder={selectedRegion ? "Buscar Comuna..." : "Seleccione Región primero"}
                                                    disabled={!selectedRegion}
                                                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-black focus:ring-2 focus:ring-black transition-all outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                                />
                                                <div className="absolute right-3 top-3.5 pointer-events-none">
                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                </div>
                                                
                                                {/* Dropdown de Comunas */}
                                                {showComunaDropdown && selectedRegion && (
                                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                                        {comunas.filter(c => c.nombre.toLowerCase().includes(comunaSearch.toLowerCase())).length > 0 ? (
                                                            comunas.filter(c => c.nombre.toLowerCase().includes(comunaSearch.toLowerCase())).map(comuna => (
                                                                <button
                                                                    key={comuna.id}
                                                                    type="button"
                                                                    onClick={() => handleComunaSelect(comuna)}
                                                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-black transition-colors flex items-center justify-between group"
                                                                >
                                                                    <span>{comuna.nombre}</span>
                                                                    {formData.comuna_id === comuna.id && (
                                                                        <span className="w-2 h-2 rounded-full bg-black"></span>
                                                                    )}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                                                No se encontraron comunas
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Estado Civil */}
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
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1 mt-3 block">Tipo de Contrato</label>
                                            <select 
                                                name="tipo_contrato"
                                                value={formData.tipo_contrato}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black mt-1"
                                            >
                                                <option value="Contratado">Contratado</option>
                                                <option value="Partime">Partime</option>
                                            </select>
                                        </div>
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
                                             <input 
                                                type="text" 
                                                inputMode="numeric"
                                                name="talla_pantalon"
                                                value={formData.talla_pantalon}
                                                onChange={handleChange}
                                                placeholder="Ej. 42"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 text-center text-sm font-bold outline-none focus:ring-2 focus:ring-black"
                                            />
                                         </div>
                                         <div className="space-y-1 text-center">
                                             <label className="text-[10px] font-bold text-gray-500">CALZADO</label>
                                             <input 
                                                type="text" 
                                                inputMode="numeric"
                                                maxLength={2}
                                                name="talla_zapato"
                                                value={formData.talla_zapato}
                                                onChange={handleChange}
                                                placeholder="Ej. 41"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 text-center text-sm font-bold outline-none focus:ring-2 focus:ring-black"
                                            />
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

                                    {formData.activo_app && (
                                        <div className="flex items-center gap-2 px-1">
                                            <input 
                                                type="checkbox" 
                                                id="useRutPass"
                                                checked={useRutPass}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    setUseRutPass(isChecked);
                                                    if (isChecked) {
                                                        const cleanBody = formData.rut.replace(/\./g, '').split('-')[0];
                                                        const pass = cleanBody.length >= 4 ? cleanBody.slice(-4) : cleanBody;
                                                        setFormData(prev => ({ ...prev, password: pass }));
                                                    } else {
                                                        // Si se desmarca y estamos editando, tal vez limpiar?
                                                        // O dejar el valor actual para que lo editen.
                                                        // Dejarlo es mejor UX.
                                                    }
                                                }}
                                                className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer accent-red-600"
                                            />
                                            <label htmlFor="useRutPass" className="text-xs text-gray-600 cursor-pointer select-none font-medium">
                                                Usar últimos 4 dígitos del RUT como clave
                                            </label>
                                        </div>
                                    )}

                                    <input 
                                        type="password" 
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={useRutPass ? "Clave generada por RUT" : "Contraseña personalizada"} 
                                        readOnly={useRutPass}
                                        disabled={!formData.activo_app}
                                        className={`w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none transition-all ${
                                            useRutPass 
                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-dashed' 
                                                : 'focus:ring-2 focus:ring-black'
                                        } ${!formData.activo_app ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                         <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity duration-200 ${formData.tiene_cuenta_rut ? 'opacity-50' : 'opacity-100'}`}>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Banco</label>
                                                <input 
                                                    type="text" 
                                                    name="banco_nombre"
                                                    value={formData.banco_nombre}
                                                    onChange={handleChange}
                                                    disabled={formData.tiene_cuenta_rut}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                                    placeholder="Ej. Santander"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Tipo de Cuenta</label>
                                                <select 
                                                    name="banco_tipo_cuenta"
                                                    value={formData.banco_tipo_cuenta}
                                                    onChange={handleChange}
                                                    disabled={formData.tiene_cuenta_rut}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">Seleccionar</option>
                                                    <option value="Cuenta Vista">Cuenta Vista</option>
                                                    <option value="Cuenta Corriente">Cuenta Corriente</option>
                                                    <option value="Cuenta Ahorro">Cuenta Ahorro</option>
                                                    <option value="Chequera Electrónica">Chequera Electrónica</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Número</label>
                                                <input 
                                                    type="text" 
                                                    inputMode="numeric"
                                                    name="banco_numero_cuenta"
                                                    value={formData.banco_numero_cuenta}
                                                    onChange={handleChange}
                                                    disabled={formData.tiene_cuenta_rut}
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                                    placeholder="N° Cuenta"
                                                />
                                            </div>
                                         </div>
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
