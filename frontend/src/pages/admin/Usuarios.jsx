import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    UserPlus, Search, Edit, Trash2, Shield, Check, X, Lock, RefreshCw 
} from 'lucide-react';
import Layout from '../../components/Layout';
import usuarioService from '../../services/usuarioService';
import regionService from '../../services/regionService';
import RequirePermission from '../../components/RequirePermission';
import Swal from 'sweetalert2';

const categoriaPermisoPorCodigo = {
    VER_USUARIOS: 'Gestión de Usuarios',
    CREAR_USUARIO: 'Gestión de Usuarios',
    EDITAR_USUARIO: 'Gestión de Usuarios',
    ELIMINAR_USUARIO: 'Gestión de Usuarios',
    GESTIONAR_PERMISOS: 'Gestión de Usuarios',
    VER_GUARDIAS: 'Guardias',
    CREAR_GUARDIA: 'Guardias',
    EDITAR_GUARDIA: 'Guardias',
    ELIMINAR_GUARDIA: 'Guardias',
    VER_INVENTARIO: 'Inventario',
    CREAR_PRODUCTO: 'Inventario',
    EDITAR_PRODUCTO: 'Inventario',
    ELIMINAR_PRODUCTO: 'Inventario',
    AJUSTAR_STOCK: 'Inventario',
    VER_REPORTES: 'Reportes',
    VER_BITACORA: 'Bitácora',
    CREAR_BITACORA: 'Bitácora',
    VER_BLACKLIST: 'Blacklist',
    CREAR_BLACKLIST: 'Blacklist',
    EDITAR_BLACKLIST: 'Blacklist',
    ELIMINAR_BLACKLIST: 'Blacklist',
    CREAR_ASIGNACION: 'Asignaciones',
    VER_ASIGNACIONES: 'Asignaciones',
    ELIMINAR_ASIGNACION: 'Asignaciones'
};

const ordenCategorias = [
    'Gestión de Usuarios',
    'Guardias',
    'Inventario',
    'Asignaciones',
    'Reportes',
    'Bitácora',
    'Blacklist',
    'Configuración',
    'Otros'
];

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [allPermisos, setAllPermisos] = useState([]);
    const [allRegiones, setAllRegiones] = useState([]); // Nueva variable de estado para regiones
    const [loading, setLoading] = useState(true);
    
    // Filtros y Paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPermisosModalOpen, setIsPermisosModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Formularios
    const initialFormState = {
        nombre: '',
        email: '',
        password: '',
        rol_id: '',
        regiones: [],
        estado: true
    };
    const [formData, setFormData] = useState(initialFormState);
    const [selectedPermisos, setSelectedPermisos] = useState([]);

    const permisosAgrupados = useMemo(() => {
        const grupos = {};
        const permisosFiltrados = allPermisos.filter(
            (permiso) => permiso.codigo !== 'GESTIONAR_BLACKLIST'
        );
        permisosFiltrados.forEach((permiso) => {
            const categoria = categoriaPermisoPorCodigo[permiso.codigo] || 'Otros';
            if (!grupos[categoria]) {
                grupos[categoria] = [];
            }
            grupos[categoria].push(permiso);
        });
        return grupos;
    }, [allPermisos]);

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchUsuarios = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 10,
                search: searchTerm,
                rol_id: roleFilter
            };
            const response = await usuarioService.getAll(params);
            setUsuarios(response.data.usuarios);
            setTotalPages(response.data.totalPages);
            setTotalItems(response.data.totalItems);
        } catch (error) {
            if (error.response && error.response.status === 401) return;
            console.error("Error cargando usuarios:", error);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, roleFilter]);

    useEffect(() => {
        fetchUsuarios();
    }, [fetchUsuarios]);

    const fetchMetadata = async () => {
        try {
            const [rolesData, permisosData, regionesData] = await Promise.all([
                usuarioService.getRoles(),
                usuarioService.getPermissions(),
                regionService.getAll()
            ]);
            setRoles(rolesData.data);
            setAllPermisos(permisosData.data);
            setAllRegiones(regionesData);
        } catch (error) {
            console.error("Error cargando metadatos:", error);
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                nombre: user.nombre,
                email: user.email,
                password: '',
                rol_id: user.rol_id,
                regiones: user.Regions ? user.Regions.map(r => r.id) : [],
                estado: typeof user.estado === 'boolean' ? user.estado : true
            });
        } else {
            setEditingUser(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleOpenPermisosModal = (user) => {
        setEditingUser(user);
        // Extraer IDs de permisos actuales
        const userPermisos = user.Permisos ? user.Permisos.map(p => p.id) : [];
        setSelectedPermisos(userPermisos);
        setIsPermisosModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsPermisosModalOpen(false);
        setEditingUser(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermisoToggle = (permisoId) => {
        setSelectedPermisos(prev => {
            if (prev.includes(permisoId)) {
                return prev.filter(id => id !== permisoId);
            } else {
                return [...prev, permisoId];
            }
        });
    };

    const handleRegionToggle = (regionId) => {
        setFormData(prev => {
            const currentRegiones = prev.regiones || [];
            if (currentRegiones.includes(regionId)) {
                return { ...prev, regiones: currentRegiones.filter(id => id !== regionId) };
            } else {
                return { ...prev, regiones: [...currentRegiones, regionId] };
            }
        });
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await usuarioService.update(editingUser.id, formData);

                if (typeof editingUser.estado === 'boolean' && formData.estado !== editingUser.estado) {
                    await usuarioService.changeStatus(editingUser.id, formData.estado);
                }

                Swal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
            } else {
                const response = await usuarioService.create(formData);

                if (response?.data?.usuario && formData.estado === false) {
                    await usuarioService.changeStatus(response.data.usuario.id, false);
                }

                Swal.fire('Creado', 'Usuario creado correctamente', 'success');
            }
            handleCloseModal();
            fetchUsuarios();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Error al guardar', 'error');
        }
    };

    const handleSavePermisos = async () => {
        try {
            await usuarioService.updatePermissions(editingUser.id, selectedPermisos);
            Swal.fire('Actualizado', 'Permisos actualizados correctamente', 'success');
            handleCloseModal();
            fetchUsuarios();
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Error al actualizar permisos', 'error');
        }
    };

    const handleStatusChange = async (user) => {
        try {
            await usuarioService.changeStatus(user.id, !user.estado);
            fetchUsuarios();
            const action = !user.estado ? 'activado' : 'desactivado';
            Swal.fire('Estado Cambiado', `Usuario ${action} correctamente`, 'success');
        } catch {
            Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
        }
    };

    const handleDelete = async (user) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará al usuario ${user.nombre}. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await usuarioService.remove(user.id);
                Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
                fetchUsuarios();
            } catch {
                Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
            }
        }
    };

    const getRoleName = (rolId) => {
        const role = roles.find(r => r.id === rolId);
        return role ? role.nombre : 'Desconocido';
    };

    return (
        <Layout title="Gestión de Usuarios">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <select 
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">Todos los Roles</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.nombre}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <UserPlus size={20} />
                        Nuevo Usuario
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                <th className="p-4 border-b">Usuario</th>
                                <th className="p-4 border-b">Rol</th>
                                <th className="p-4 border-b">Zonas</th>
                                <th className="p-4 border-b">Estado</th>
                                <th className="p-4 border-b">Permisos</th>
                                <th className="p-4 border-b text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            ) : usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        No se encontraron usuarios.
                                    </td>
                                </tr>
                            ) : (
                                usuarios.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{user.nombre}</span>
                                                <span className="text-sm text-gray-500">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                {getRoleName(user.rol_id)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {user.Regions && user.Regions.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.Regions.map(r => (
                                                        <span key={r.id} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200">
                                                            {r.nombre}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => handleStatusChange(user)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                                    user.estado 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                }`}
                                            >
                                                {user.estado ? <Check size={12} /> : <X size={12} />}
                                                {user.estado ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs text-gray-500">
                                                {user.Permisos && user.Permisos.length > 0 
                                                    ? `${user.Permisos.length} asignados`
                                                    : 'Sin permisos extras'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <RequirePermission permission="GESTIONAR_PERMISOS">
                                                    <button 
                                                        onClick={() => handleOpenPermisosModal(user)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                        title="Gestionar Permisos"
                                                    >
                                                        <Shield size={18} />
                                                    </button>
                                                </RequirePermission>
                                                <RequirePermission permission="EDITAR_USUARIO">
                                                    <button 
                                                        onClick={() => handleOpenModal(user)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                </RequirePermission>
                                                <RequirePermission permission="ELIMINAR_USUARIO">
                                                    <button 
                                                        onClick={() => handleDelete(user)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </RequirePermission>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                <div className="flex justify-between items-center p-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                        Mostrando {usuarios.length} de {totalItems} usuarios
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                            Anterior
                        </button>
                        <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm flex items-center">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Crear/Editar Usuario */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300"
                    style={{
                        backgroundColor: 'var(--overlay-fallback-color)',
                        backdropFilter: 'blur(var(--overlay-blur-intensity))',
                        WebkitBackdropFilter: 'blur(var(--overlay-blur-intensity))'
                    }}
                >
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Contraseña</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={editingUser ? "Dejar en blanco para mantener" : "Mínimo 6 caracteres"}
                                        required={!editingUser}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Rol</label>
                                    <select
                                        name="rol_id"
                                        value={formData.rol_id}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Seleccionar Rol</option>
                                        {roles.map(rol => (
                                            <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Selector de Regiones (Disponible para todos los roles) */}
                            <div className="space-y-2 mt-4 border-t pt-4">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Shield size={16} />
                                    Zonas Asignadas (Regiones)
                                </label>
                                {allRegiones.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">No hay regiones registradas en el sistema.</p>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                                            {allRegiones.map((region) => (
                                                <label key={region.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.regiones && formData.regiones.includes(region.id)}
                                                        onChange={() => handleRegionToggle(region.id)}
                                                        className="rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">{region.nombre}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {String(formData.rol_id) === '3' 
                                                ? "Seleccione las zonas que supervisará este usuario."
                                                : "Opcional: Asigne zonas si este usuario requiere acceso específico por región."}
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-4 border-t pt-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Estado del usuario</p>
                                    <p className="text-xs text-gray-500">
                                        {formData.estado
                                            ? 'El usuario podrá acceder al sistema.'
                                            : 'Usuario desactivado, sin acceso al sistema.'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData(prev => ({ ...prev, estado: !prev.estado }))
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
                                        formData.estado
                                            ? 'bg-green-500 border-green-500'
                                            : 'bg-gray-200 border-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                            formData.estado ? 'translate-x-5' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Gestión de Permisos */}
            {isPermisosModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300"
                    style={{
                        backgroundColor: 'var(--overlay-fallback-color)',
                        backdropFilter: 'blur(var(--overlay-blur-intensity))',
                        WebkitBackdropFilter: 'blur(var(--overlay-blur-intensity))'
                    }}
                >
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                Gestionar Permisos - {editingUser?.nombre}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-4">
                                Selecciona los permisos adicionales para este usuario. Los permisos definidos por el Rol no se pueden quitar aquí.
                            </p>
                            
                            <div className="space-y-5">
                                {ordenCategorias
                                    .filter((categoria) => permisosAgrupados[categoria] && permisosAgrupados[categoria].length > 0)
                                    .map((categoria) => (
                                        <div key={categoria}>
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                {categoria}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {permisosAgrupados[categoria].map((permiso) => (
                                                    <div
                                                        key={permiso.id}
                                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                                            selectedPermisos.includes(permiso.id)
                                                                ? 'bg-blue-50 border-blue-500'
                                                                : 'hover:bg-gray-50 border-gray-200'
                                                        }`}
                                                        onClick={() => handlePermisoToggle(permiso.id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`w-5 h-5 rounded border flex items-center justify-center ${
                                                                    selectedPermisos.includes(permiso.id)
                                                                        ? 'bg-blue-600 border-blue-600'
                                                                        : 'border-gray-300'
                                                                }`}
                                                            >
                                                                {selectedPermisos.includes(permiso.id) && (
                                                                    <Check size={14} className="text-white" />
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {permiso.descripcion || permiso.codigo}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePermisos}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Guardar Permisos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Usuarios;
