import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileDown,
  Printer,
  Search,
  LayoutDashboard,
  Layers,
  AlertOctagon,
  Users,
  Filter,
  X,
  History,
  ChevronRight,
  Shield,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import Layout from '../../components/Layout';
import BitacoraService from '../../services/bitacoraService';
import UsuarioService from '../../services/usuarioService';
import { useAuth } from '../../context/useAuth';

const BitacoraPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bitacoras, setBitacoras] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeTab, setActiveTab] = useState('resumen');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [refreshIntervalMs] = useState(300000);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [usuarioId] = useState('');
  const [categoria] = useState('');
  const [search, setSearch] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [fechaFin] = useState('');
  const [limit] = useState(10);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyUser, setHistoryUser] = useState(null);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [myReports, setMyReports] = useState([]);
  const [myLoading, setMyLoading] = useState(false);

  const [formAccion, setFormAccion] = useState('');
  const [formCategoria, setFormCategoria] = useState('Rutina');
  const [formPrioridad, setFormPrioridad] = useState('Media');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    if (user.rol_id === 1) return true;
    if (typeof user.roles === 'string') {
      const rolesLower = user.roles.toLowerCase();
      return rolesLower.includes('admin') || rolesLower.includes('administrador');
    }
    return false;
  }, [user]);

  const fetchUsuarios = useCallback(async () => {
    const res = await UsuarioService.getAll({ page: 1, limit: 200 });
    setUsuarios(res.data.usuarios || []);
  }, []);

  const fetchBitacoras = useCallback(
    async (opts = {}) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit,
          search: search || undefined,
          usuarioId: usuarioId || undefined,
          categoria: categoria || undefined,
          fechaInicio: fechaInicio || undefined,
          fechaFin: fechaFin || undefined,
          ...opts
        };
        const data = await BitacoraService.getAll(params);
        setBitacoras(data.bitacoras || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || (data.bitacoras ? data.bitacoras.length : 0));
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching bitácoras:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la bitácora',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search, usuarioId, categoria, fechaInicio, fechaFin]
  );

  const fetchMyReports = useCallback(async () => {
    try {
      setMyLoading(true);
      const data = await BitacoraService.getAll({
        page: 1,
        limit: 20
      });
      setMyReports(data.bitacoras || []);
    } catch (error) {
      console.error('Error fetching mis reportes:', error);
    } finally {
      setMyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchUsuarios();
      fetchBitacoras({ page: 1 });
    }
  }, [authLoading, isAdmin, fetchUsuarios, fetchBitacoras]);

  useEffect(() => {
    if (!isAdmin) return;
    if (!autoRefreshEnabled) return;
    const id = setInterval(() => {
      fetchBitacoras();
    }, refreshIntervalMs);
    return () => clearInterval(id);
  }, [isAdmin, autoRefreshEnabled, refreshIntervalMs, fetchBitacoras]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      fetchMyReports();
    }
  }, [authLoading, isAdmin, fetchMyReports]);

  const handleBuscar = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchBitacoras({ page: 1 });
  };

  const exportCSV = () => {
    if (!bitacoras || bitacoras.length === 0) return;
    const headers = ['Fecha', 'Usuario', 'Acción', 'Categoría', 'Prioridad', 'Nivel', 'Descripción', 'IP'];
    const rows = bitacoras.map((b) => [
      new Date(b.fecha).toISOString(),
      b.autor || (b.Usuario?.nombre || ''),
      b.accion || '',
      b.categoria || '',
      b.prioridad || '',
      b.nivel || '',
      (b.descripcion || '').replace(/\n/g, ' ').replace(/"/g, '""'),
      b.ip_address || ''
    ]);
    const csvContent = [headers, ...rows]
      .map((r) => r.map((x) => `"${x ?? ''}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitacora_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openUserHistory = async (userData) => {
    if (!userData) return;
    setHistoryUser(userData);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      let events = [];
      if (userData.id) {
        const data = await BitacoraService.getAll({
          page: 1,
          limit: 100,
          usuarioId: userData.id
        });
        events = data.bitacoras || [];
      } else {
        const name = userData.nombre || userData.autor || '';
        events = bitacoras.filter((b) => (b.autor || b.Usuario?.nombre || '') === name);
      }
      setHistoryEvents(events);
    } catch {
      setHistoryEvents([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeUserHistory = () => {
    setHistoryOpen(false);
    setTimeout(() => {
      setHistoryUser(null);
      setHistoryEvents([]);
    }, 300);
  };

  const printPDF = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const rows = bitacoras
      .map(
        (b) => `
      <tr>
        <td>${new Date(b.fecha).toLocaleString()}</td>
        <td>${b.autor || (b.Usuario?.nombre || '')}</td>
        <td>${b.accion || ''}</td>
        <td>${b.categoria || ''}</td>
        <td>${(b.descripcion || '').replace(/</g, '&lt;')}</td>
      </tr>
    `
      )
      .join('');
    w.document.write(`
      <html><head><title>Bitácora</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
      </style>
      </head><body>
      <h2>Bitácora - Reporte</h2>
      <table>
        <thead>
          <tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Categoría</th><th>Detalles</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <script>window.onload = () => window.print();</script>
      </body></html>
    `);
    w.document.close();
  };

  const getCategoryIcon = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('incidente')) return <AlertOctagon className="w-3 h-3" />;
    if (c.includes('rutina')) return <CheckCircle className="w-3 h-3" />;
    if (c.includes('visita')) return <UserCheck className="w-3 h-3" />;
    return <div className="w-1.5 h-1.5 rounded-full bg-current" />;
  };

  const getCategoryClass = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('incidente')) return 'bg-rose-100 text-rose-700';
    if (c.includes('rutina')) return 'bg-blue-100 text-blue-700';
    if (c.includes('visita')) return 'bg-emerald-100 text-emerald-700';
    return 'bg-gray-100 text-gray-600';
  };

  const getTimelineCircleClass = (cat) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('incidente')) return 'bg-rose-50 text-rose-600';
    if (c.includes('rutina')) return 'bg-blue-50 text-blue-600';
    if (c.includes('visita')) return 'bg-emerald-50 text-emerald-600';
    return 'bg-slate-100 text-slate-500';
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!formAccion.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Falta el título',
        text: 'Debes indicar la novedad o título del reporte.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    try {
      setFormSubmitting(true);
      await BitacoraService.create({
        accion: formAccion.trim(),
        descripcion: formDescripcion.trim(),
        categoria: formCategoria,
        prioridad: formPrioridad
      });

      setFormAccion('');
      setFormDescripcion('');

       fetchMyReports();

      Swal.fire({
        icon: 'success',
        title: 'Reporte enviado',
        text: 'Tu novedad fue registrada en la bitácora y será visible para el administrador.',
        timer: 2500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo registrar',
        text:
          error.response?.data?.message ||
          'Ocurrió un error al registrar la novedad. Si el problema persiste, contacta a un administrador.'
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  if (!authLoading && !isAdmin) {
    return (
      <Layout>
        <div className="flex-1 overflow-auto p-3 md:p-8 bg-slate-50">
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10 lg:pb-0">
            <section className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="bg-white border-l-4 border-slate-800 rounded-r-xl rounded-l-md p-5 md:p-6 shadow-sm flex items-start justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 tracking-wider">
                      Panel de Guardia
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">Nueva Novedad</h1>
                  <p className="text-sm text-slate-500 mt-1 max-w-[85%] sm:max-w-none">
                    Complete los campos para registrar el evento central.
                  </p>
                </div>
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-slate-50 to-transparent opacity-50 pointer-events-none" />
                <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg shadow-slate-200 hidden sm:block">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
              </div>

              <form
                onSubmit={handleCreateReport}
                className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm relative"
              >
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                      Título del Evento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formAccion}
                      onChange={(e) => setFormAccion(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-base sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all placeholder:text-slate-400"
                      placeholder="Ej: Portón abierto"
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                        Categoría
                      </label>
                      <select
                        value={formCategoria}
                        onChange={(e) => setFormCategoria(e.target.value)}
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-base sm:text-sm font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <option value="Rutina">📋 Rutina / Ronda</option>
                        <option value="Incidente">🚨 Incidente de Seguridad</option>
                        <option value="Visita">👤 Control de Visitas</option>
                        <option value="Mantenimiento">🛠️ Mantenimiento</option>
                        <option value="Otro">📝 Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                        Nivel de Prioridad
                      </label>
                      <select
                        value={formPrioridad}
                        onChange={(e) => setFormPrioridad(e.target.value)}
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-lg text-base sm:text-sm font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <option value="Baja">🟢 Baja (Informativo)</option>
                        <option value="Media">🟡 Media (Atención)</option>
                        <option value="Alta">🟠 Alta (Urgente)</option>
                        <option value="Critica">🔴 Crítica (Emergencia)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">
                      Descripción Detallada <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formDescripcion}
                      onChange={(e) => setFormDescripcion(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-base sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none placeholder:text-slate-400"
                      placeholder="Describa los hechos de forma clara..."
                    />
                  </div>

                  <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setFormAccion('');
                        setFormDescripcion('');
                        setFormCategoria('Rutina');
                        setFormPrioridad('Media');
                      }}
                      className="w-full sm:w-auto text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center justify-center gap-2 px-4 py-3 rounded transition-colors"
                      disabled={formSubmitting}
                    >
                      Limpiar
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto relative px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      disabled={formSubmitting}
                    >
                      {formSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            <section className="lg:col-span-1">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-full flex flex-col overflow-hidden max-h-[500px] lg:max-h-none">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0 z-20">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-500" />
                      Mis Reportes
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide mt-0.5">
                      Últimos registros
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={fetchMyReports}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors active:bg-slate-200"
                    title="Actualizar"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>

                {myLoading ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-6">
                    Cargando tus reportes...
                  </div>
                ) : myReports.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm py-6">
                    Aún no has registrado novedades en la bitácora.
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="relative space-y-6">
                      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200 -z-10" />
                      {myReports.map((r) => {
                        const date = r.fecha ? new Date(r.fecha) : null;
                        const timeLabel = date
                          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '';
                        return (
                          <div key={r.id} className="relative pl-10">
                            <div
                              className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 ${getTimelineCircleClass(
                                r.categoria
                              )}`}
                            >
                              {getCategoryIcon(r.categoria)}
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                              <div className="flex justify-between items-start mb-1">
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getCategoryClass(
                                    r.categoria
                                  )}`}
                                >
                                  {r.categoria || 'Evento'}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {timeLabel}
                                </span>
                              </div>
                              <h3 className="text-sm font-bold text-slate-800 leading-tight mb-1">
                                {r.accion || r.categoria || 'Sin título'}
                              </h3>
                              {r.descripcion && (
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  {r.descripcion}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 overflow-auto p-4 sm:p-6 scroll-smooth">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Eventos Totales</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalItems}</h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Actualizado: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}
                  </p>
                </div>
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Incidentes</p>
                  <h3 className="text-2xl font-bold text-rose-600 mt-1">
                    {
                      bitacoras.filter((b) => (b.categoria || '').toLowerCase().includes('incidente'))
                        .length
                    }
                  </h3>
                </div>
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                  <AlertOctagon className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Personal</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{usuarios.length}</h3>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex w-full lg:w-auto p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('resumen')}
                className={`flex-1 lg:flex-none px-4 py-2 text-xs font-bold uppercase rounded-md transition-all text-center ${
                  activeTab === 'resumen'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Bitácora Global
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('usuarios')}
                className={`flex-1 lg:flex-none px-4 py-2 text-xs font-bold uppercase rounded-md transition-all text-center ${
                  activeTab === 'usuarios'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Personal
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={exportCSV}
                  title="Exportar CSV"
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                >
                  <FileDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={printPDF}
                  title="Imprimir PDF"
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAutoRefreshEnabled((v) => !v)}
                  title={autoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                  className={`p-2 border border-slate-200 rounded-lg transition-colors ${
                    autoRefreshEnabled
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'hover:bg-slate-50 text-slate-400'
                  }`}
                >
                  <History className="w-4 h-4" />
                </button>
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div className="relative w-full sm:w-auto">
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => {
                    setFechaInicio(e.target.value);
                    setPage(1);
                    fetchBitacoras({ page: 1, fechaInicio: e.target.value });
                  }}
                  className="w-full sm:w-36 pl-3 pr-2 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-white text-slate-600"
                />
              </div>

              <form onSubmit={handleBuscar} className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </form>

              <button
                type="button"
                onClick={() => fetchBitacoras()}
                className="p-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {activeTab === 'resumen' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
                        Hora
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                        Categoría
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase min-w-[200px]">
                        Descripción
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">
                        Usuario
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          Cargando registros...
                        </td>
                      </tr>
                    ) : bitacoras.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          No se encontraron registros.
                        </td>
                      </tr>
                    ) : (
                      bitacoras.map((b) => {
                        const authorName = b.autor || b.Usuario?.nombre || 'Sistema';
                        const userData = b.Usuario ? b.Usuario : { nombre: authorName };
                        return (
                          <tr key={b.id} className="hover:bg-slate-50 group transition-colors">
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">
                              {new Date(b.fecha).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold ${getCategoryClass(
                                  b.categoria
                                )}`}
                              >
                                {getCategoryIcon(b.categoria)} {b.categoria}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {b.accion || b.categoria}
                              </div>
                              <div className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-xs">
                                {b.descripcion}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                              <button
                                type="button"
                                className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                                onClick={() => openUserHistory(userData)}
                              >
                                <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                  {authorName.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-2">
                                  {authorName}
                                </span>
                              </button>
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => openUserHistory(userData)}
                                className="p-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Página {page} de {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (page > 1) {
                        const p = page - 1;
                        setPage(p);
                        fetchBitacoras({ page: p });
                      }
                    }}
                    disabled={page === 1}
                    className="px-3 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (page < totalPages) {
                        const p = page + 1;
                        setPage(p);
                        fetchBitacoras({ page: p });
                      }
                    }}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {usuarios.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => openUserHistory(u)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all p-6 group text-left"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 text-xl font-bold uppercase">
                      {(u.nombre || 'U').substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                        {u.nombre}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium truncate max-w-[140px]">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 w-full">
                    <div className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-colors">
                      <History className="w-3 h-3" /> Ver Historial
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {historyOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={closeUserHistory}
          />
          <div className="fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Historial de Usuario</h3>
                <p className="text-xs text-slate-500">
                  {historyLoading ? 'Cargando eventos...' : `Visualizando ${historyEvents.length} registros`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeUserHistory}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {historyUser && (
              <div className="p-6 bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold uppercase">
                    {(historyUser.nombre || 'U').substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{historyUser.nombre}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded">
                        ID: {historyUser.id || 'N/A'}
                      </span>
                      <span className="text-xs text-slate-500">{historyUser.email}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                    <span className="block text-lg font-bold text-slate-900">
                      {historyEvents.length}
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Total</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                    <span className="block text-lg font-bold text-rose-600">
                      {
                        historyEvents.filter((e) => (e.categoria || '').toLowerCase().includes('incidente'))
                          .length
                      }
                    </span>
                    <span className="text-[9px] text-rose-400 uppercase font-bold">Alertas</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                    <span className="block text-lg font-bold text-emerald-600">
                      {
                        historyEvents.filter((e) => (e.categoria || '').toLowerCase().includes('rutina'))
                          .length
                      }
                    </span>
                    <span className="text-[9px] text-emerald-400 uppercase font-bold">Rutina</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 relative">
              <div className="absolute left-9 top-0 bottom-0 w-px bg-slate-200" />
              <div className="space-y-6 pb-10">
                {historyLoading ? (
                  <div className="text-center py-10 text-slate-400">Cargando...</div>
                ) : historyEvents.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">Sin registros disponibles</div>
                ) : (
                  historyEvents.map((ev, idx) => (
                    <div key={idx} className="relative flex gap-4">
                      <div className="absolute left-[3px] top-2 w-1.5 h-1.5 rounded-full bg-slate-300 ring-4 ring-white" />
                      <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getCategoryClass(
                              ev.categoria
                            )}`}
                          >
                            {ev.categoria}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {new Date(ev.fecha).toLocaleDateString()}{' '}
                            {new Date(ev.fecha).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 mb-1">
                          {ev.accion || ev.categoria}
                        </h5>
                        <p className="text-xs text-slate-500 leading-relaxed">{ev.descripcion}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex justify-end items-center shrink-0">
              <button
                type="button"
                onClick={closeUserHistory}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default BitacoraPage;
