import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, LogOut, User, ChevronLeft, ChevronRight, 
  Eye, CheckCircle, AlertTriangle, Shield, Menu, X,
  Search, Bell, Banknote, Download, Construction
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

// Estilos personalizados inyectados
const CustomStyles = () => (
  <style>{`
    /* Scrollbars */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #111827; }
    ::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #4b5563; }
    
    /* Form Inputs */
    .form-input { 
        width: 100%; background-color: #1f2937; border: 1px solid #374151; 
        border-radius: 0.375rem; padding: 0.5rem 0.75rem; color: #f3f4f6; 
        font-size: 0.875rem; outline: none; transition: all 0.2s; 
    }
    .form-input:focus { border-color: #dc2626; box-shadow: 0 0 0 1px #dc2626; }
    .form-input:disabled, .form-input[readonly] { 
        background-color: #111827; border-color: #374151; color: #6b7280; cursor: not-allowed; 
    }
    .form-label { 
        display: block; font-size: 0.75rem; font-weight: 700; color: #9ca3af; 
        margin-bottom: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; 
    }
    .section-title { 
        color: #ef4444; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; 
        letter-spacing: 0.05em; border-bottom: 1px solid #374151; padding-bottom: 0.25rem; 
        margin-bottom: 1rem; margin-top: 1.5rem; 
    }

    /* Checkbox personalizado */
    .custom-checkbox { 
        appearance: none; background-color: #1f2937; margin: 0; font: inherit; 
        color: #dc2626; width: 1.15em; height: 1.15em; border: 1px solid #374151; 
        border-radius: 0.15em; display: grid; place-content: center; cursor: pointer;
    }
    .custom-checkbox::before { 
        content: ""; width: 0.65em; height: 0.65em; transform: scale(0); 
        transition: 120ms transform ease-in-out; box-shadow: inset 1em 1em white; 
        transform-origin: center; clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%); 
    }
    .custom-checkbox:checked::before { transform: scale(1); background-color: #dc2626; }
    .custom-checkbox:checked { border-color: #dc2626; background-color: #dc2626; }

    /* Tablas */
    .risk-table th { background-color: #1f2937; color: #9ca3af; padding: 0.5rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; border: 1px solid #374151; }
    .risk-table td { border: 1px solid #374151; padding: 0.75rem; vertical-align: top; font-size: 0.8rem; color: #d1d5db; }
    .risk-ul { list-style-type: disc; padding-left: 1rem; }
    .risk-ul li { margin-bottom: 0.25rem; }

    /* Animaciones */
    .fade-in { animation: fadeIn 0.3s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `}</style>
);

const DashboardGuardia = () => {
  const { user } = useAuth();
  // --- Estados ---
  const [currentView, setCurrentView] = useState('list'); // list, ficha, irl
  const [irlPage, setIrlPage] = useState(1);
  const [viewMode, setViewMode] = useState('paginated'); // paginated, scroll
  const [showModal, setShowModal] = useState(false);
  const [docsStatus, setDocsStatus] = useState({
    ficha: 'pending',
    irl: 'pending',
    reglamento: 'pending',
    pactoHoras: 'pending',
    actaDeberes: 'pending',
    entregaEpp: 'pending',
    liquidaciones: 'pending'
  });
  
  // Estado para formulario EPP
  const [eppForm, setEppForm] = useState({
    nombre: '',
    rut: '',
    cargo: 'Guardia de Seguridad',
    area: '',
    fecha: new Date().toISOString().split('T')[0]
  });
  
  const [eppItems, setEppItems] = useState([
    { name: 'Zapatos de seguridad', cantidad: '', talla: '', observaciones: '' },
    { name: 'Zapatos de vestir', cantidad: '', talla: '', observaciones: '' },
    { name: 'Pantalón largo', cantidad: '', talla: '', observaciones: '' },
    { name: 'Polera', cantidad: '', talla: '', observaciones: '' },
    { name: 'Camisa o blusa', cantidad: '', talla: '', observaciones: '' },
    { name: 'Geólogo', cantidad: '', talla: '', observaciones: '' },
    { name: 'Chaleco anti corte', cantidad: '', talla: '', observaciones: '' },
    { name: 'Chaqueta', cantidad: '', talla: '', observaciones: '' },
    { name: 'Corta viento', cantidad: '', talla: '', observaciones: '' },
    { name: 'Chaleco', cantidad: '', talla: '', observaciones: '' },
    { name: 'Polar', cantidad: '', talla: '', observaciones: '' },
    { name: 'Casco', cantidad: '', talla: '', observaciones: '' },
    { name: 'Lentes U.V.', cantidad: '', talla: '', observaciones: '' },
    { name: 'Bloqueador solar', cantidad: '', talla: '', observaciones: '' }
  ]);

  const [externalHtml, setExternalHtml] = useState(null);
  const [isLoadingExternal, setIsLoadingExternal] = useState(false);

  // Estados Liquidaciones
  const [liqMonth, setLiqMonth] = useState('Enero');
  const [liqYear, setLiqYear] = useState('2026');
  const [showLiqDoc, setShowLiqDoc] = useState(false);
  const [liqLoading, setLiqLoading] = useState(false);
  const [liqData, setLiqData] = useState(null);
  
  // Canvas Refs
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Scroll Ref
  const mainScrollAreaRef = useRef(null);

  // Total de páginas del documento IRL
  const totalPages = 12;

  // --- Efectos ---
  useEffect(() => {
    if ((currentView === 'ficha' || currentView === 'irl' || currentView === 'reglamento' || currentView === 'pactoHoras' || currentView === 'actaDeberes' || currentView === 'entregaEpp') && canvasRef.current) {
      initCanvas();
    }
  }, [currentView, irlPage, viewMode]);

  // Listener para mensajes desde el iframe (2.documento.html)
  useEffect(() => {
    const handleIframeMessage = (event) => {
      if (event.data === 'close-irl') {
        handleViewChange('list');
      }
    };

    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  // --- Funciones de Navegación ---
  const formatRut = (rut) => {
    if (!rut) return '';
    const cleanRut = rut.replace(/[^0-9kK]/g, '');
    if (cleanRut.length <= 1) return cleanRut;
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === 'irl') {
      setIrlPage(1);
      setViewMode('paginated');
    }
  };

  const handlePageChange = (delta) => {
    if (viewMode === 'scroll') return;
    const newPage = irlPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
      setIrlPage(newPage);
      if (mainScrollAreaRef.current) mainScrollAreaRef.current.scrollTop = 0;
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'paginated' ? 'scroll' : 'paginated');
  };

  const loadExternalIrlDocument = async () => {
    setIsLoadingExternal(true);
    try {
      const response = await fetch('/2.documento.html');
      if (!response.ok) {
        throw new Error(`No se pudo cargar el documento (Estado: ${response.status})`);
      }
      const htmlContent = await response.text();
      setExternalHtml(htmlContent);
      setCurrentView('irl-external');
    } catch (error) {
      console.error('Error cargando documento externo:', error);
      alert('Error al cargar el documento: ' + error.message);
    } finally {
      setIsLoadingExternal(false);
    }
  };

  // --- Funciones de Canvas ---
  const initCanvas = () => {
    // Pequeño delay para asegurar que el DOM está listo y visible (especialmente transiciones)
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const resize = () => {
        const parent = canvas.parentElement;
        if (parent) {
          const ratio = Math.max(window.devicePixelRatio || 1, 1);
          canvas.width = parent.offsetWidth * ratio;
          canvas.height = parent.offsetHeight * ratio;
          ctx.scale(ratio, ratio);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
        }
      };
      resize();
    }, 200);
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    if (docsStatus[currentView] === 'completed') return;
    isDrawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
    // Ocultar placeholder
    const placeholder = e.target.parentElement.querySelector('.sign-placeholder');
    if (placeholder) placeholder.style.opacity = '0';
  };

  const draw = (e) => {
    if (!isDrawing.current || docsStatus[currentView] === 'completed') return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    lastPos.current = pos;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearSignature = () => {
    if (docsStatus[currentView] === 'completed') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Mostrar placeholder
    const placeholder = canvas.parentElement.querySelector('.sign-placeholder');
    if (placeholder) placeholder.style.opacity = '1';
  };

  // --- Finalización ---
  const finalizeDocument = () => {
    setDocsStatus(prev => ({ ...prev, [currentView]: 'completed' }));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    handleViewChange('list');
  };

  // --- Lógica Liquidaciones (ELIMINADO - FEATURE DISABLED) ---
  /*
  const handleSearchLiquidacion = async () => {
    setLiqLoading(true);
    setShowLiqDoc(false);
    setLiqData(null);
    try {
        const response = await api.get(`/liquidaciones?mes=${liqMonth}&anio=${liqYear}`);
        setLiqData(response.data);
        setShowLiqDoc(true);
        if (response.data.es_simulacion) {
          // Opcional: Podríamos mostrar un toast o alerta no bloqueante aquí si se desea
          console.log("Visualizando datos simulados");
        }
    } catch (error) {
        // Si es 401, el interceptor ya muestra el modal de sesión expirada
        if (error.response && error.response.status === 401) return;
        
        console.error("Error fetching liquidacion:", error);
        const msg = error.response?.data?.message || "No se pudo obtener la liquidación para el periodo seleccionado.";
        alert(msg);
    } finally {
        setLiqLoading(false);
    }
  };
  */

  const handleFinalizeLiquidacion = () => {
      setDocsStatus(prev => ({ ...prev, liquidaciones: 'completed' }));
      setShowModal(true);
  };

  /*
  const handleDownloadLiquidacion = () => {
      const input = document.getElementById('liq-content');
      if (!input) return;

      // Ocultar botones antes de generar
      const btns = input.querySelector('.liq-actions');
      if(btns) btns.style.display = 'none';

      html2canvas(input, { scale: 2 }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'letter');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`Liquidacion_${liqMonth}_${liqYear}.pdf`);

          // Restaurar botones
          if(btns) btns.style.display = 'flex';
      }).catch(err => {
          console.error("Error generating PDF:", err);
          if(btns) btns.style.display = 'flex';
          alert("Error al generar el PDF");
      });
  };
  */

  // --- Lógica EPP ---
  const handleEppChange = (e) => {
    const { name, value } = e.target;
    setEppForm(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...eppItems];
    newItems[index][field] = value;
    setEppItems(newItems);
  };

  const submitEpp = async () => {
    try {
        if (docsStatus.entregaEpp === 'completed') return;

        // Validaciones básicas
        if (!eppForm.nombre || !eppForm.rut) {
            alert('Nombre y RUT son obligatorios.');
            return;
        }

        // Obtener firma
        const canvas = canvasRef.current;
        const isCanvasEmpty = !isDrawing.current && canvas.toDataURL() === document.createElement('canvas').toDataURL();
        // Nota: la validación de canvas vacío es compleja, asumimos que si no ha dibujado nada (isDrawing flag) podría estar vacío, pero mejor confiar en visual.
        // Una validación simple es verificar si hay datos de píxeles, pero por ahora confiaremos en que el usuario firme.
        const signatureData = canvas.toDataURL('image/png');
        
        // Filtrar items con cantidad > 0
        const itemsToSend = eppItems.filter(item => item.cantidad && parseInt(item.cantidad) > 0).map(item => ({
            nombre_producto: item.name,
            cantidad: parseInt(item.cantidad),
            talla: item.talla,
            tipo: 'Ropa/EPP', 
            observaciones: item.observaciones
        }));

        if (itemsToSend.length === 0) {
            alert('Debe registrar al menos un ítem entregado.');
            return;
        }

        const payload = {
            nombre_receptor: eppForm.nombre,
            rut_receptor: eppForm.rut,
            cargo_receptor: eppForm.cargo,
            fecha_entrega: eppForm.fecha,
            observaciones: `Área: ${eppForm.area}`,
            firma_receptor: signatureData,
            items: itemsToSend
        };

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/entrega-epp', { // Ajustar URL base si es necesario
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar la entrega');
        }

        finalizeDocument();
    } catch (error) {
        console.error('Error submitting EPP:', error);
        alert('Hubo un error al guardar el documento: ' + error.message);
    }
  };

  // --- Renderizado de Páginas IRL ---
  const renderIrlPage = (pageNum) => {
    const isVisible = viewMode === 'scroll' || irlPage === pageNum;
    if (!isVisible) return null;

    const pageClasses = "bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden flex-col relative mb-8 fade-in";

    switch (pageNum) {
      case 1:
        return (
          <div key={1} className={pageClasses}>
             <div className="p-6 md:p-8 space-y-8">
                <div className="relative bg-gray-900 rounded-lg p-6 border-l-4 border-red-600 shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                        <div className="md:col-span-6 space-y-5">
                            <div><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Empresa</span><div className="text-xl md:text-2xl text-white font-bold tracking-tight">SYSEG SUR SPA</div></div>
                            <div><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">R.U.T</span><div className="text-sm text-gray-300 font-mono bg-gray-800 inline-block px-2 py-1 rounded border border-gray-700">77.056.732-7</div></div>
                        </div>
                        <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-gray-700 to-transparent mx-auto"></div>
                        <div className="md:col-span-5 space-y-5">
                            <div><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rep. Legal</span><div className="text-sm text-gray-200 font-medium border-b border-gray-800 pb-1">MANUEL EASTON YAÑEZ</div></div>
                            <div><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dirección Casa Matriz</span><div className="text-sm text-gray-400 leading-snug">AV LIBERTADOR BERNARDO OHIGGINS 2525, TALAGANTE</div></div>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="section-title">Datos Personales del Trabajador</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8"><label className="form-label">Nombre y Apellidos</label><input type="text" className="form-input" placeholder="Nombre completo" disabled={docsStatus.irl === 'completed'} /></div>
                        <div className="md:col-span-4"><label className="form-label">R.U.T</label><input type="text" className="form-input" placeholder="12.345.678-9" disabled={docsStatus.irl === 'completed'} /></div>
                        <div className="md:col-span-6"><label className="form-label">Cargo</label><input type="text" className="form-input" value="Guardia de Seguridad" readOnly /></div>
                        <div className="md:col-span-6"><label className="form-label">Fecha</label><input type="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} disabled={docsStatus.irl === 'completed'} /></div>
                    </div>
                </div>
            </div>
          </div>
        );
      case 2:
        return (
            <div key={2} className={pageClasses}>
                <div className="p-6 md:p-8">
                    <h3 className="section-title">Ficha Médica del Trabajador</h3>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-gray-800/50 text-xs uppercase font-bold text-gray-300">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-gray-700 w-12 text-center">N.º</th>
                                        <th className="px-4 py-3 border-b border-gray-700">Enfermedad / Condición</th>
                                        <th className="px-4 py-3 border-b border-gray-700 w-24 text-center">¿Padece?</th>
                                        <th className="px-4 py-3 border-b border-gray-700 min-w-[200px]">Observaciones / Diagnóstico</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    <tr className="bg-gray-900/50"><td colSpan="4" className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Enfermedades</td></tr>
                                    {[
                                        { id: '01', name: 'Epilepsia' },
                                        { id: '02', name: 'Lumbago' },
                                        { id: '03', name: 'Hipertensión Arterial' }
                                    ].map(item => (
                                        <tr key={item.id} className="hover:bg-gray-800/30">
                                            <td className="px-4 py-3 text-center">{item.id}</td>
                                            <td className="px-4 py-3 text-gray-200">{item.name}</td>
                                            <td className="px-4 py-3 text-center"><input type="checkbox" className="custom-checkbox" disabled={docsStatus.irl === 'completed'} /></td>
                                            <td className="px-4 py-2"><input type="text" className="form-input py-1 text-sm bg-transparent border-gray-700/50" disabled={docsStatus.irl === 'completed'} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // Agrupar normas generales simplificadas para el ejemplo
        const normas = {
            3: [
                { id: 1, title: "Ley 16.744 Accidentes del Trabajo", items: ["Definición legal Accidentes.", "Beneficios médicos y subsidiarios.", "Pasos a seguir.", "Medios probatorios."] },
                { id: 2, title: "Manejo Manual de Cargas", items: ["Hombres >18: 25Kg / Mujeres: 20Kg.", "Técnica de levantamiento."] }
            ],
            4: [
                { id: 3, title: "Emergencias e Incendios", items: ["Brigada, Alarmas, Criterio Evacuación."] },
                { id: 4, title: "Accidentes Graves y Fatales", items: ["Definición y Procedimiento SUSESO."] },
                { id: 5, title: "EPP", items: ["Entrega, Uso y Cuidado."] }
            ],
            5: [
                { id: 6, title: "Ergonomía", items: ["Postura correcta en silla."] },
                { id: 7, title: "Extintores", items: ["Tipos de fuego y uso."] },
                { id: 8, title: "Señalética", items: ["Colores y significados."] }
            ],
            6: [
                { id: 9, title: "AST/ART", items: [] },
                { id: 10, title: "PST", items: [] },
                { id: 11, title: "Bloqueo", items: [] },
                { id: 12, title: "Protocolos MINSAL", items: [] }
            ],
            7: [
                 { id: 13, title: "Sustancias Químicas", items: ["HDS, EPP, Primeros Auxilios."] }
            ]
        };

        return (
            <div key={pageNum} className={pageClasses}>
                <div className="p-6 md:p-8">
                    <h3 className="section-title">NORMAS GENERALES ({Object.keys(normas).indexOf(String(pageNum)) !== -1 ? 'Cont.' : ''})</h3>
                    <div className="space-y-6">
                        {normas[pageNum].map((norma) => (
                            <div key={norma.id} className="bg-gray-900/30 border border-gray-700/50 rounded-lg p-4">
                                <label className="flex items-start cursor-pointer mb-3 group">
                                    <div className="pt-1"><input type="checkbox" className="custom-checkbox" disabled={docsStatus.irl === 'completed'} /></div>
                                    <span className="ml-3 text-sm font-bold text-gray-200 group-hover:text-red-400 transition-colors">{norma.id}.- {norma.title}.</span>
                                </label>
                                {norma.items.length > 0 && (
                                    <ul className="list-disc pl-10 space-y-2 text-xs text-gray-400">
                                        {norma.items.map((item, idx) => <li key={idx}>{item}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
      case 8:
      case 9:
      case 10:
      case 11:
         const riesgos = {
             8: [{ r: "Caídas y Golpes", c: "Esguinces, Heridas", m: ["Orden y aseo.", "No correr."] }],
             9: [{ r: "Agresión / Delincuencia", c: "Lesiones físicas", m: ["Protocolos seguridad.", "Botón pánico."] }],
             10: [{ r: "Fatiga / Evacuación", c: "Accidentes, Pánico", m: ["Pausas activas.", "Simulacros."] }],
             11: [
                 { r: "Digitación", sub: "En trabajos con computador", c: "Contractura muscular (Dorsales, Cuello, Lumbares). Circulatorias.", m: ["Diseño ergonómico.", "Limpieza pantalla.", "Posición segura.", "Pausas activas."] },
                 { r: "Manejo de materiales", sub: "Sobreesfuerzos", c: "Lumbagos.", m: ["Técnica de levantamiento (rodillas dobladas).", "Uso de elementos auxiliares.", "Uso de EPP."] },
                 { r: "Riesgos en la Vía Pública", sub: "Trayecto", c: "Heridas, Fracturas, Muerte.", m: ["Respetar señalización.", "Cruzar por pasos habilitados."] }
             ]
         };
         return (
            <div key={pageNum} className={pageClasses}>
                <div className="p-6 md:p-8 flex-grow relative">
                    <div className="overflow-x-auto rounded border border-gray-700">
                        <table className="w-full text-left border-collapse risk-table">
                            <thead><tr><th className="w-1/4">RIESGOS</th><th className="w-1/4">CONSECUENCIAS</th><th className="w-1/2">MEDIDAS PREVENTIVAS</th></tr></thead>
                            <tbody>
                                {riesgos[pageNum].map((row, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <strong>{row.r}</strong>
                                            {row.sub && <><br/><span className="text-xs text-gray-500">{row.sub}</span></>}
                                        </td>
                                        <td>{row.c}</td>
                                        <td>
                                            <ul className="risk-ul">
                                                {row.m.map((med, midx) => <li key={midx}>{med}</li>)}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
         );
      case 12:
        return (
            <div key={12} className={pageClasses}>
                <div className="p-6 md:p-8 flex-grow relative">
                    <h3 className="section-title">DECLARACIÓN Y FIRMAS</h3>
                    <div className="bg-gray-900/50 p-4 rounded border border-gray-700 mb-6">
                        <p className="text-sm text-gray-300 text-justify mb-4">
                            Declaro haber recibido la información de riesgos (ODI), haber sido instruido sobre las medidas preventivas y me comprometo a cumplir con las normas de seguridad establecidas por SYSEG SUR SPA.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Firma Trabajador */}
                        <div className="bg-gray-200 rounded-lg p-4 text-gray-800">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-gray-900 text-xs uppercase">Firma del Trabajador</h3>
                                {docsStatus.irl !== 'completed' && (
                                    <button onClick={clearSignature} className="text-xs text-red-600 hover:text-red-800 font-bold underline">Borrar</button>
                                )}
                            </div>
                            <div className={`bg-white border-2 border-dashed border-gray-400 rounded cursor-crosshair relative h-32 ${docsStatus.irl === 'completed' ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                                <canvas 
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    className="w-full h-full touch-none"
                                />
                                <span className="sign-placeholder absolute bottom-2 left-2 text-[10px] text-gray-400 pointer-events-none">Dibuje su firma aquí</span>
                            </div>
                        </div>
                        
                        {/* Firmas Instructores (Estáticas) */}
                        <div className="grid grid-cols-1 gap-4">
                                <div className="border border-gray-600 rounded bg-gray-900/50 p-3 opacity-70">
                                <div className="h-12 border-b border-gray-600 mb-1 flex items-end justify-center"><span className="text-[10px] text-gray-500 italic">Pendiente de firma</span></div>
                                <p className="text-[10px] text-center text-gray-400 font-bold uppercase">Instructor</p>
                                </div>
                                <div className="border border-gray-600 rounded bg-gray-900/50 p-3 opacity-70">
                                <div className="h-12 border-b border-gray-600 mb-1 flex items-end justify-center"><span className="text-[10px] text-gray-500 italic">Enrique Díaz Venegas</span></div>
                                <p className="text-[10px] text-center text-gray-400 font-bold uppercase">Ingeniero en Prevención de Riesgos</p>
                                </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        {docsStatus.irl !== 'completed' && (
                            <button onClick={finalizeDocument} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-lg hover:bg-blue-700 flex items-center gap-2 transform active:scale-95 transition-all">
                                <CheckCircle className="w-5 h-5" />
                                Finalizar Acta IRL
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
      default: return null;
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 h-screen w-full flex overflow-hidden font-sans">
      <CustomStyles />
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full shrink-0 z-20 shadow-xl hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center gap-3">
                <div className="bg-red-600 w-8 h-8 rounded flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(220,38,38,0.5)]">S</div>
                <div className="flex flex-col">
                    <span className="text-white font-bold text-sm tracking-widest uppercase leading-none">Syseg</span>
                    <span className="text-gray-500 text-[10px] uppercase font-medium">Guardia</span>
                </div>
            </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            <p className="px-3 text-xs text-gray-600 uppercase tracking-wider font-semibold mb-2">Principal</p>
            <button onClick={() => handleViewChange('list')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 shadow-sm mt-2">
                <FileText className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">Documentación</span>
            </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
                <LogOut className="w-4 h-4" /> Cerrar Sesión
            </Link>
        </div>
      </aside>

      {/* AREA PRINCIPAL */}
      <main className="flex-1 relative flex flex-col min-w-0 bg-black/20">
        <div className="absolute inset-0 bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:20px_20px] opacity-5 pointer-events-none"></div>

        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-4 sm:px-8 bg-gray-900/80 backdrop-blur shrink-0 z-10">
            <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2">
                {currentView === 'list' ? (
                    <><span className="text-red-600">Sistema</span> / Documentación</>
                ) : (
                    <><span className="text-red-600">Documentación</span> / {
                        currentView === 'ficha' ? 'Ficha de Postulación' : 
                        currentView === 'irl' ? 'Acta IRL / ODI' : 
                        currentView === 'entregaEpp' ? 'Entrega de EPP' :
                        currentView === 'actaDeberes' ? 'Acta Deberes' :
                        currentView === 'pactoHoras' ? 'Pacto Horas Extras' :
                        'Reglamento Interno'
                    }</>
                )}
            </h2>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-800 h-10">
                {user && (
                    <div className="flex flex-col items-end mr-1 hidden sm:flex">
                        {(() => {
                            const parts = user.nombre.split(' ');
                            let line1 = '', line2 = '';
                            if (parts.length >= 4) {
                                line1 = parts.slice(0, 2).join(' ');
                                line2 = parts.slice(2).join(' ');
                            } else if (parts.length === 3) {
                                line1 = parts[0];
                                line2 = parts.slice(1).join(' ');
                            } else if (parts.length === 2) {
                                line1 = parts[0];
                                line2 = parts[1];
                            } else {
                                line1 = user.nombre;
                            }
                            return (
                                <>
                                    <span className="text-sm font-bold text-white leading-tight">{line1}</span>
                                    {line2 && <span className="text-xs font-medium text-gray-400 leading-tight">{line2}</span>}
                                </>
                            );
                        })()}
                    </div>
                )}
                <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 border border-gray-600 shadow-sm">
                    {user ? user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'G'}
                </div>
            </div>
        </header>

        <div ref={mainScrollAreaRef} className={`flex-1 relative ${(currentView === 'irl-external' || currentView === 'decalogo') ? 'p-0 overflow-hidden' : 'overflow-y-auto p-4 sm:p-8'}`}>
            
            {/* VISTA 1: LISTA */}
            {currentView === 'list' && (
                <div className="fade-in max-w-6xl mx-auto">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white">Centro de Documentación</h3>
                        <p className="text-gray-400 text-sm mt-1">Seleccione el documento que debe completar y firmar.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Ficha Card */}
                        <div onClick={() => handleViewChange('ficha')} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 hover:border-red-500/50 cursor-pointer transition-all group relative overflow-hidden shadow-lg">
                            <div className="relative z-10">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 border ${docsStatus.ficha === 'completed' ? 'bg-green-900/30 text-green-400 border-green-900/50' : 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50'}`}>
                                    {docsStatus.ficha === 'completed' ? 'Completado' : 'Pendiente'}
                                </span>
                                <h4 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">Ficha de Postulación</h4>
                                <p className="text-gray-400 text-xs mt-2 leading-relaxed">Formulario de ingreso de datos personales, previsionales y tallas de vestuario.</p>
                            </div>
                        </div>

                        {/* IRL Card */}
                        <div onClick={loadExternalIrlDocument} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 hover:border-blue-500/50 cursor-pointer transition-all group relative overflow-hidden shadow-lg">
                             <div className="relative z-10">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 border ${docsStatus.irl === 'completed' ? 'bg-green-900/30 text-green-400 border-green-900/50' : 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50'}`}>
                                    {docsStatus.irl === 'completed' ? 'Completado' : 'Pendiente'}
                                </span>
                                <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Acta IRL / ODI (Completa)</h4>
                                <p className="text-gray-400 text-xs mt-2 leading-relaxed">Información de Riesgos Laborales y Obligación de Informar (D.S. 44).</p>
                            </div>
                             {isLoadingExternal && (
                                <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                             )}
                        </div>

                        {/* Reglamento Interno Card */}
                        <div onClick={() => handleViewChange('reglamento')} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 hover:border-blue-500/50 cursor-pointer transition-all group relative overflow-hidden shadow-lg">
                             <div className="relative z-10">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 border ${docsStatus.reglamento === 'completed' ? 'bg-green-900/30 text-green-400 border-green-900/50' : 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50'}`}>
                                    {docsStatus.reglamento === 'completed' ? 'Completado' : 'Pendiente'}
                                </span>
                                <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Reglamento Interno</h4>
                                <p className="text-gray-400 text-xs mt-2 leading-relaxed">Reglamento Interno de Orden, Higiene y Seguridad (RIOHS).</p>
                            </div>
                        </div>

                        {/* Pacto Horas Extras Card */}
                        <div onClick={() => handleViewChange('pactoHoras')} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 hover:border-blue-500/50 cursor-pointer transition-all group relative overflow-hidden shadow-lg">
                             <div className="relative z-10">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 border ${docsStatus.pactoHoras === 'completed' ? 'bg-green-900/30 text-green-400 border-green-900/50' : 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50'}`}>
                                    {docsStatus.pactoHoras === 'completed' ? 'Completado' : 'Pendiente'}
                                </span>
                                <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Pacto Horas Extras</h4>
                                <p className="text-gray-400 text-xs mt-2 leading-relaxed">Pacto de horas extraordinarias (Art. 32 Código del Trabajo).</p>
                            </div>
                        </div>

                        {/* Entrega EPP Card */}
                        <div onClick={() => handleViewChange('entregaEpp')} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 hover:border-green-500/50 cursor-pointer transition-all group relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Shield className="w-24 h-24 text-green-500 transform rotate-12" />
                            </div>
                             <div className="relative z-10">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 border ${docsStatus.entregaEpp === 'completed' ? 'bg-green-900/30 text-green-400 border-green-900/50' : 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50'}`}>
                                    {docsStatus.entregaEpp === 'completed' ? 'Completado' : 'Pendiente'}
                                </span>
                                <h4 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">Entrega de EPP</h4>
                                <p className="text-gray-400 text-xs mt-2 leading-relaxed">Registro de entrega de ropa corporativa y elementos de protección.</p>
                            </div>
                        </div>

                        {/* Acta Deberes Card */}
                        <div onClick={() => handleViewChange('actaDeberes')} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 hover:border-blue-500/50 cursor-pointer transition-all group relative overflow-hidden shadow-lg">
                             <div className="relative z-10">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 border ${docsStatus.actaDeberes === 'completed' ? 'bg-green-900/30 text-green-400 border-green-900/50' : 'bg-yellow-900/30 text-yellow-500 border-yellow-900/50'}`}>
                                    {docsStatus.actaDeberes === 'completed' ? 'Completado' : 'Pendiente'}
                                </span>
                                <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Acta Deberes y Obligaciones</h4>
                                <p className="text-gray-400 text-xs mt-2 leading-relaxed">Notificación oficial de deberes y obligaciones del guardia.</p>
                            </div>
                        </div>

                        {/* Decálogo Card */}
                        <div onClick={() => handleViewChange('decalogo')} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 hover:border-purple-500/50 cursor-pointer transition-all group relative overflow-hidden shadow-lg">
                             <div className="relative z-10">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 border bg-purple-900/30 text-purple-400 border-purple-900/50">
                                    Lectura Obligatoria
                                </span>
                                <h4 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Decálogo de Buenos Tratos</h4>
                                <p className="text-gray-400 text-xs mt-2 leading-relaxed">Normas básicas de convivencia y buen trato en el ambiente laboral.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VISTA 2: FICHA (Simplificada) */}
            {currentView === 'ficha' && (
                <div className="fade-in max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => handleViewChange('list')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-700 text-sm">
                            <ChevronLeft className="w-4 h-4" /> Volver
                        </button>
                    </div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
                         <h2 className="text-xl font-bold mb-4">Ficha de Postulación</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" className="form-input" placeholder="Nombre Completo" disabled={docsStatus.ficha === 'completed'} />
                            <input type="text" className="form-input" placeholder="RUT" disabled={docsStatus.ficha === 'completed'} />
                         </div>
                         <div className="mt-6 bg-gray-200 rounded p-4 h-32 relative">
                             {/* Canvas para Ficha (Simplificado, usando misma lógica que IRL si fuera necesario, pero aquí solo placeholder visual) */}
                             <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                                 [Área de Firma - Implementación similar a IRL]
                             </div>
                         </div>
                         <div className="mt-4 flex justify-end">
                             {docsStatus.ficha !== 'completed' && (
                                <button onClick={finalizeDocument} className="px-6 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700">Firmar Ficha</button>
                             )}
                         </div>
                    </div>
                </div>
            )}

            {/* VISTA 3: IRL */}
            {currentView === 'irl' && (
                <div className="fade-in max-w-5xl mx-auto">
                    {/* Header "Volver al Dashboard" */}
                    <div className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 p-4 -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 mb-6 flex justify-between items-center shadow-md">
                        <button onClick={() => handleViewChange('list')} className="flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Volver al Dashboard
                        </button>
                        <span className="text-gray-500 text-xs uppercase font-bold">Vista Documento Completo</span>
                    </div>

                    {/* Toolbar */}
                    <div className="sticky top-[73px] z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 pb-4 mb-6 pt-2">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            {/* Espaciador para equilibrar el layout (reemplaza botón Volver) */}
                            <div className="hidden md:block w-32"></div>
                            
                            {/* Paginación */}
                            {viewMode === 'paginated' && (
                                <div className="flex items-center bg-gray-800 rounded-full p-1 border border-gray-700 shadow-lg">
                                    <button onClick={() => handlePageChange(-1)} disabled={irlPage === 1} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <span className="mx-4 text-sm font-mono font-bold text-gray-200 min-w-[90px] text-center">Página {irlPage}/{totalPages}</span>
                                    <button onClick={() => handlePageChange(1)} disabled={irlPage === totalPages} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 rounded text-xs uppercase font-bold tracking-wider border ${docsStatus.irl === 'completed' ? 'bg-green-900/20 text-green-500 border-green-900/50' : 'bg-blue-900/20 text-blue-500 border-blue-900/50'}`}>
                                    {docsStatus.irl === 'completed' ? 'Completado' : 'Acta IRL'}
                                </div>
                                <button onClick={toggleViewMode} className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-800 border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-all flex items-center gap-2">
                                    <Menu className="h-4 w-4" />
                                    <span>{viewMode === 'paginated' ? 'Ver Todo' : 'Ver por Páginas'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Contenido Paginas */}
                    <div className={viewMode === 'scroll' ? 'space-y-8' : ''}>
                        {viewMode === 'scroll' 
                            ? Array.from({ length: totalPages }, (_, i) => renderIrlPage(i + 1))
                            : renderIrlPage(irlPage)
                        }
                    </div>
                </div>
            )}

            {/* VISTA 4: IRL EXTERNA */}
            {currentView === 'irl-external' && (
                <div className="fade-in w-full h-full flex flex-col bg-gray-900">

                     <div className="flex-1 relative w-full h-full bg-gray-900 p-0 overflow-hidden">
                         <iframe 
                            srcDoc={externalHtml} 
                            className="w-full h-full border-none block" 
                            title="Documento IRL Externo"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                         />
                     </div>
                </div>
            )}

            {/* VISTA: DECÁLOGO (LECTURA PDF) */}
            {currentView === 'decalogo' && (
                <div className="fade-in w-full h-full flex flex-col bg-gray-900">
                     <div className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center shrink-0">
                        <button onClick={() => setCurrentView('list')} className="flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Volver al Dashboard
                        </button>
                        <span className="text-gray-500 text-xs uppercase font-bold">Documento de Lectura</span>
                     </div>
                     <div className="flex-1 relative w-full h-full bg-gray-900 p-0 overflow-hidden">
                         <iframe 
                            src="/docs/Decalogo_Buenos_Tratos.pdf" 
                            className="w-full h-full border-none block" 
                            title="Decálogo de Buenos Tratos"
                         />
                     </div>
                </div>
            )}

            {/* VISTA 5: REGLAMENTO INTERNO (FORMULARIO) */}
            {currentView === 'reglamento' && (
                <div className="fade-in max-w-4xl mx-auto">
                     <div className="flex justify-between items-center mb-6">
                         <button onClick={() => handleViewChange('list')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-700 text-sm">
                             <ChevronLeft className="w-4 h-4" /> Volver
                         </button>
                         <div className="flex items-center gap-3">
                             {docsStatus.reglamento === 'completed' && (
                                <span className="px-3 py-1 rounded text-xs uppercase font-bold tracking-wider bg-green-900/20 text-green-500 border border-green-900/50 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Firmado y Entregado
                                </span>
                             )}
                         </div>
                     </div>

                     <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden p-6 md:p-8 space-y-8">
                          {/* Title */}
                          <div className="text-center border-b border-gray-700 pb-6">
                              <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide">Comprobante de Entrega</h2>
                              <h3 className="text-sm md:text-lg text-red-500 font-bold uppercase mt-2">Reglamento Interno de Orden, Higiene y Seguridad</h3>
                          </div>

                          {/* Content Text */}
                          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700/50 text-gray-300 leading-relaxed text-justify text-sm md:text-base">
                              <p>
                                  En conformidad a lo dispuesto en el Código del Trabajo y la Ley 16.744, declaro haber recibido gratuitamente de la empresa 
                                  <strong className="text-white"> SYSEG SUR SPA</strong> (R.U.T. 77.056.732-7), 
                                  una copia del Reglamento Interno de Orden, Higiene y Seguridad.
                              </p>
                              <p className="mt-4">
                                  Asimismo, declaro haber sido instruido sobre su contenido, las obligaciones y prohibiciones que en él se establecen, 
                                  y me comprometo a leerlo íntegramente y a dar estricto cumplimiento a sus disposiciones.
                              </p>
                          </div>

                          {/* Form Fields */}
                          <div>
                              <h3 className="section-title">Datos del Trabajador</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="md:col-span-2">
                                      <label className="form-label">Nombre Completo</label>
                                      <input type="text" className="form-input" placeholder="Ingrese su nombre completo" disabled={docsStatus.reglamento === 'completed'} />
                                  </div>
                                  <div>
                                      <label className="form-label">R.U.T.</label>
                                      <input type="text" className="form-input" placeholder="12.345.678-9" disabled={docsStatus.reglamento === 'completed'} />
                                  </div>
                                  <div>
                                      <label className="form-label">Fecha de Recepción</label>
                                      <input type="date" className="form-input" defaultValue={new Date().toISOString().split('T')[0]} disabled={docsStatus.reglamento === 'completed'} />
                                  </div>
                                   <div>
                                      <label className="form-label">Cargo</label>
                                      <input type="text" className="form-input" value="Guardia de Seguridad" readOnly />
                                  </div>
                                  <div>
                                       <label className="form-label">Ciudad / Faena</label>
                                       <input type="text" className="form-input" placeholder="Ej: Talagante" disabled={docsStatus.reglamento === 'completed'} />
                                  </div>
                              </div>
                          </div>

                          {/* Signature Section */}
                          <div>
                              <h3 className="section-title">Firma de Recepción</h3>
                              <div className="bg-gray-200 rounded-lg p-4 text-gray-800 max-w-md mx-auto">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-gray-900 text-xs uppercase">Firma del Trabajador</h3>
                                        {docsStatus.reglamento !== 'completed' && (
                                            <button onClick={clearSignature} className="text-xs text-red-600 hover:text-red-800 font-bold underline">Borrar</button>
                                        )}
                                    </div>
                                    <div className={`bg-white border-2 border-dashed border-gray-400 rounded cursor-crosshair relative h-32 ${docsStatus.reglamento === 'completed' ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                                        <canvas 
                                            ref={canvasRef}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                            className="w-full h-full touch-none"
                                        />
                                        <span className="sign-placeholder absolute bottom-2 left-2 text-[10px] text-gray-400 pointer-events-none">Dibuje su firma aquí</span>
                                    </div>
                              </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-end pt-4 border-t border-gray-700">
                              {docsStatus.reglamento !== 'completed' && (
                                 <button onClick={finalizeDocument} className="px-6 py-3 rounded-lg bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2 transform active:scale-95 transition-all">
                                     <CheckCircle className="w-5 h-5" />
                                     Confirmar Recepción y Firma
                                 </button>
                              )}
                           </div>
                      </div>
                 </div>
            )}

            {/* VISTA 6: PACTO HORAS EXTRAS (FORMULARIO) */}
            {currentView === 'pactoHoras' && (
                <div className="fade-in max-w-4xl mx-auto">
                     <div className="flex justify-between items-center mb-6">
                         <button onClick={() => handleViewChange('list')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-700 text-sm">
                             <ChevronLeft className="w-4 h-4" /> Volver
                         </button>
                         <div className="flex items-center gap-3">
                             {docsStatus.pactoHoras === 'completed' && (
                                <span className="px-3 py-1 rounded text-xs uppercase font-bold tracking-wider bg-green-900/20 text-green-500 border border-green-900/50 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Firmado y Entregado
                                </span>
                             )}
                         </div>
                     </div>

                     <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden p-6 md:p-8 space-y-8">
                          {/* Title */}
                          <div className="text-center border-b border-gray-700 pb-6">
                              <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide">Pacto de Horas Extraordinarias</h2>
                              <h3 className="text-sm md:text-lg text-blue-500 font-bold uppercase mt-2">Art. 32 Código del Trabajo</h3>
                          </div>

                          {/* Content Text */}
                          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700/50 text-gray-300 leading-relaxed text-justify text-sm md:text-base space-y-4">
                              <p>
                                  En Santiago, a <strong className="text-white">{new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>, entre <strong className="text-white">SYSEG SUR SPA</strong>,
                                  R.U.T. 77.056.732-7, representada por Don <strong>MANUEL EASTON YAÑEZ</strong>, en adelante el "Empleador", y el trabajador individualizado más abajo, se ha convenido el siguiente pacto de horas extraordinarias:
                              </p>
                              <ol className="list-decimal pl-5 space-y-2">
                                  <li>
                                      El trabajador se compromete a realizar horas extraordinarias cuando las necesidades de funcionamiento de la empresa así lo requieran, y siempre que no sean perjudiciales para su salud.
                                  </li>
                                  <li>
                                      Las horas extraordinarias se pagarán con un recargo del 50% sobre el sueldo convenido para la jornada ordinaria y deberán liquidarse y pagarse conjuntamente con las remuneraciones ordinarias del respectivo período.
                                  </li>
                                  <li>
                                      Este pacto tendrá una vigencia transitoria máxima de tres meses, pudiendo renovarse por acuerdo de las partes.
                                  </li>
                              </ol>
                          </div>

                          {/* Form Fields */}
                          <div>
                              <h3 className="section-title">Individualización del Trabajador</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="md:col-span-2">
                                      <label className="form-label">Nombre Completo</label>
                                      <input type="text" className="form-input" placeholder="Ingrese su nombre completo" disabled={docsStatus.pactoHoras === 'completed'} />
                                  </div>
                                  <div>
                                      <label className="form-label">R.U.T.</label>
                                      <input type="text" className="form-input" placeholder="12.345.678-9" disabled={docsStatus.pactoHoras === 'completed'} />
                                  </div>
                                  <div>
                                      <label className="form-label">Cargo</label>
                                      <input type="text" className="form-input" value="Guardia de Seguridad" readOnly />
                                  </div>
                              </div>
                          </div>

                          {/* Signature Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                              <div>
                                  <h3 className="section-title text-center mb-4">Firma Trabajador</h3>
                                  <div className="bg-gray-200 rounded-lg p-4 text-gray-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-500 font-bold uppercase">Firma Digital</span>
                                            {docsStatus.pactoHoras !== 'completed' && (
                                                <button onClick={clearSignature} className="text-xs text-red-600 hover:text-red-800 font-bold underline">Borrar</button>
                                            )}
                                        </div>
                                        <div className={`bg-white border-2 border-dashed border-gray-400 rounded cursor-crosshair relative h-32 ${docsStatus.pactoHoras === 'completed' ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                                            <canvas 
                                                ref={canvasRef}
                                                onMouseDown={startDrawing}
                                                onMouseMove={draw}
                                                onMouseUp={stopDrawing}
                                                onMouseLeave={stopDrawing}
                                                onTouchStart={startDrawing}
                                                onTouchMove={draw}
                                                onTouchEnd={stopDrawing}
                                                className="w-full h-full touch-none"
                                            />
                                            <span className="sign-placeholder absolute bottom-2 left-2 text-[10px] text-gray-400 pointer-events-none">Dibuje su firma aquí</span>
                                        </div>
                                  </div>
                              </div>
                              
                              <div>
                                  <h3 className="section-title text-center mb-4">Firma Empleador</h3>
                                  <div className="bg-gray-200 rounded-lg p-4 text-gray-800 opacity-80">
                                        <div className="h-32 border-2 border-solid border-gray-400 bg-white rounded flex flex-col items-center justify-center">
                                            <span className="font-script text-2xl text-blue-900 mb-1" style={{ fontFamily: 'cursive' }}>Manuel Easton Y.</span>
                                            <div className="w-3/4 h-px bg-gray-400 mb-1"></div>
                                            <span className="text-[10px] font-bold uppercase text-gray-600">p.p. Syseg Sur SpA</span>
                                        </div>
                                  </div>
                              </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-end pt-4 border-t border-gray-700">
                             {docsStatus.pactoHoras !== 'completed' && (
                                <button onClick={finalizeDocument} className="px-6 py-3 rounded-lg bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2 transform active:scale-95 transition-all">
                                    <CheckCircle className="w-5 h-5" />
                                    Aceptar Pacto y Firmar
                                </button>
                             )}
                          </div>
                     </div>
                </div>
            )}

            {/* VISTA: ENTREGA EPP (FORMULARIO) */}
            {currentView === 'entregaEpp' && (
                <div className="fade-in max-w-4xl mx-auto">
                     <div className="flex justify-between items-center mb-6">
                         <button onClick={() => handleViewChange('list')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-700 text-sm">
                             <ChevronLeft className="w-4 h-4" /> Volver
                         </button>
                         <div className="flex items-center gap-3">
                             {docsStatus.entregaEpp === 'completed' && (
                                <>
                                    <button onClick={generateEppPdf} className="px-3 py-1 rounded text-xs font-bold tracking-wider bg-blue-900/20 text-blue-400 border border-blue-900/50 flex items-center gap-2 hover:bg-blue-900/40 transition-colors">
                                        <Download className="w-4 h-4" /> Descargar PDF
                                    </button>
                                    <span className="px-3 py-1 rounded text-xs uppercase font-bold tracking-wider bg-green-900/20 text-green-500 border border-green-900/50 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Firmado y Entregado
                                    </span>
                                </>
                             )}
                         </div>
                     </div>

                     <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden relative">
                        {/* HEADER DEL DOCUMENTO */}
                        <div className="bg-gray-900 border-b border-gray-700 p-6 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="bg-white p-2 rounded w-12 h-12 flex items-center justify-center">
                                    <span className="text-red-600 font-black text-xl">S</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-white tracking-wide">ENTREGA DE EPP Y ROPA CORPORATIVA</h1>
                                    <p className="text-xs text-gray-400">GUARDIAS Y SUPERVISORES DE SEGURIDAD - SYSEG SUR SPA</p>
                                </div>
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] text-gray-500 font-mono">CÓDIGO: PPRRSRS</p>
                                <p className="text-[10px] text-gray-500 font-mono">VERSIÓN: 01</p>
                            </div>
                        </div>

                        {/* FORMULARIO EPP */}
                        <div className="p-6 sm:p-8 space-y-6 relative z-10">
                            {/* Datos Trabajador */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-8">
                                    <label className="form-label">Nombre Trabajador</label>
                                    <input type="text" className="form-input" name="nombre" value={eppForm.nombre} onChange={handleEppChange} disabled={docsStatus.entregaEpp === 'completed'} />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="form-label">RUT</label>
                                    <input type="text" className="form-input" name="rut" value={eppForm.rut} onChange={handleEppChange} disabled={docsStatus.entregaEpp === 'completed'} />
                                </div>
                                <div className="md:col-span-6">
                                    <label className="form-label">Cargo</label>
                                    <input type="text" className="form-input" name="cargo" value={eppForm.cargo} onChange={handleEppChange} disabled={docsStatus.entregaEpp === 'completed'} />
                                </div>
                                <div className="md:col-span-6">
                                    <label className="form-label">Área</label>
                                    <input type="text" className="form-input" name="area" value={eppForm.area} onChange={handleEppChange} disabled={docsStatus.entregaEpp === 'completed'} />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="form-label">Fecha</label>
                                    <input type="date" className="form-input" name="fecha" value={eppForm.fecha} onChange={handleEppChange} disabled={docsStatus.entregaEpp === 'completed'} />
                                </div>
                            </div>

                            {/* Tabla EPP */}
                            <div>
                                <h3 className="section-title">Detalle de Entrega</h3>
                                <div className="overflow-x-auto rounded border border-gray-700">
                                    <table className="w-full text-left text-sm text-gray-400">
                                        <thead className="bg-gray-900 text-xs uppercase font-bold text-gray-300">
                                            <tr>
                                                <th className="px-4 py-3 border-b border-gray-700 w-1/3">EPP - Ropa Corporativa</th>
                                                <th className="px-4 py-3 border-b border-gray-700 w-24 text-center">Cantidad</th>
                                                <th className="px-4 py-3 border-b border-gray-700 w-24 text-center">Talla</th>
                                                <th className="px-4 py-3 border-b border-gray-700">Observaciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700/50">
                                            {eppItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-700/30">
                                                    <td className="px-4 py-2 text-gray-200">{item.name}</td>
                                                    <td className="px-2 py-2">
                                                        <input 
                                                            type="number" 
                                                            className="form-input py-1 text-center bg-gray-900/50" 
                                                            value={item.cantidad} 
                                                            onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                                                            disabled={docsStatus.entregaEpp === 'completed'}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <input 
                                                            type="text" 
                                                            className="form-input py-1 text-center bg-gray-900/50" 
                                                            value={item.talla} 
                                                            onChange={(e) => handleItemChange(index, 'talla', e.target.value)}
                                                            disabled={docsStatus.entregaEpp === 'completed'}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <input 
                                                            type="text" 
                                                            className="form-input py-1 bg-gray-900/50" 
                                                            value={item.observaciones} 
                                                            onChange={(e) => handleItemChange(index, 'observaciones', e.target.value)}
                                                            disabled={docsStatus.entregaEpp === 'completed'}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Texto Legal */}
                            <div className="bg-gray-900/50 p-4 rounded border border-gray-700 text-xs text-gray-400 space-y-2">
                                 <p className="flex gap-2">
                                    <span className="text-green-500 font-bold">➤</span>
                                    El trabajador se compromete a mantener los elementos de protección personal en buen estado, y además de solicitar el cambio de este cuando se encuentre en mal estado.
                                 </p>
                                 <p className="flex gap-2">
                                    <span className="text-green-500 font-bold">➤</span>
                                    <span className="block">
                                        <strong className="text-gray-300">Decreto Supremo 594, Artículo 53°:</strong> El empleador deberá proporcionar a sus trabajadores, libres de costo, los elementos de protección personal adecuados al riesgo a cubrir y el adiestramiento necesario para su correcto empleo, debiendo, además, mantenerlos en perfecto estado de funcionamiento. Por su parte, el trabajador deberá usarlos en forma permanente mientras se encuentre expuesto al riesgo.
                                    </span>
                                 </p>
                                 <p className="flex gap-2">
                                    <span className="text-green-500 font-bold">➤</span>
                                    <span className="block">
                                        <strong className="text-gray-300">Decreto Supremo 594, Artículo 54°:</strong> Los elementos de protección personal usados en los lugares de trabajo, sean de procedencia nacional o extranjera, deberán cumplir con las normas y exigencias de calidad que rijan a tales artículos según su naturaleza.
                                    </span>
                                 </p>
                            </div>

                             {/* Firmas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-200 rounded-lg p-4 text-gray-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-gray-900 text-xs uppercase">Firma del Trabajador</h3>
                                        {docsStatus.entregaEpp !== 'completed' && (
                                            <button onClick={clearSignature} className="text-[10px] text-red-600 hover:text-red-800 font-bold underline">Borrar</button>
                                        )}
                                    </div>
                                    <div className={`bg-white border-2 border-dashed border-gray-400 rounded cursor-crosshair relative h-32 ${docsStatus.entregaEpp === 'completed' ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                                        <canvas 
                                            ref={canvasRef}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                            className="w-full h-full touch-none"
                                        />
                                        <span className="sign-placeholder absolute bottom-2 left-2 text-[10px] text-gray-400 pointer-events-none">Dibuje su firma aquí</span>
                                    </div>
                                </div>
                                
                                 <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 flex flex-col justify-end items-center opacity-70">
                                     <div className="h-12 border-b border-gray-500 w-3/4 mb-2"></div>
                                     <p className="text-[10px] text-center text-gray-400 font-bold uppercase">Nombre y Firma Entregador</p>
                                 </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end pt-4 border-t border-gray-800">
                                {docsStatus.entregaEpp !== 'completed' && (
                                    <button onClick={submitEpp} className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold text-sm shadow-lg hover:bg-green-700 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        Finalizar Entrega
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VISTA 7: ACTA DEBERES (PDF + FIRMA) */}
            {currentView === 'actaDeberes' && (
                <div className="fade-in max-w-4xl mx-auto">
                     <div className="flex justify-between items-center mb-6">
                         <button onClick={() => handleViewChange('list')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg border border-gray-700 text-sm">
                             <ChevronLeft className="w-4 h-4" /> Volver
                         </button>
                         <div className="flex items-center gap-3">
                             {docsStatus.actaDeberes === 'completed' && (
                                <span className="px-3 py-1 rounded text-xs uppercase font-bold tracking-wider bg-green-900/20 text-green-500 border border-green-900/50 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Firmado y Entregado
                                </span>
                             )}
                         </div>
                     </div>

                     <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden p-6 md:p-8 space-y-8">
                          {/* Title */}
                          <div className="text-center border-b border-gray-700 pb-6">
                              <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide">Acta de Notificación</h2>
                              <h3 className="text-sm md:text-lg text-blue-500 font-bold uppercase mt-2">Deberes y Obligaciones Guardias de Seguridad</h3>
                          </div>

                          {/* Content Text */}
                          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700/50 text-gray-300 leading-relaxed text-justify text-sm md:text-base space-y-6">
                              <p>
                                  En Santiago, a <strong className="text-white">{new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>, se deja constancia que el trabajador individualizado al pie de la presente,
                                  ha sido notificado de sus <strong>Deberes y Obligaciones</strong> fundamentales para el desempeño de sus funciones como Guardia de Seguridad en <strong>SYSEG SUR SPA</strong>.
                              </p>

                              <div className="bg-gray-800/50 p-5 rounded border border-gray-700">
                                  <h4 className="text-red-500 font-bold uppercase text-xs mb-4 border-b border-gray-600 pb-2 tracking-wider">1. Obligaciones Fundamentales (Normativa OS-10)</h4>
                                  <ul className="list-disc pl-5 space-y-3 text-xs md:text-sm text-gray-300">
                                      <li><strong className="text-white">Credencial OS-10:</strong> Portar siempre su credencial de Guardia de Seguridad vigente y visible en la parte superior izquierda del pecho.</li>
                                      <li><strong className="text-white">Uniforme e Imagen:</strong> Mantener una presentación personal impecable (afeitado, pelo corto/ordenado), usando correctamente el uniforme completo entregado por la empresa.</li>
                                      <li><strong className="text-white">Puntualidad y Asistencia:</strong> Presentarse en su puesto de trabajo con la debida antelación. Cualquier inasistencia debe ser avisada y justificada de inmediato.</li>
                                      <li><strong className="text-white">Libro de Novedades:</strong> Es obligación registrar cronológicamente todas las novedades, rondas, ingresos y sucesos relevantes en el Libro de Novedades (Bitácora).</li>
                                  </ul>
                              </div>

                              <div className="bg-gray-800/50 p-5 rounded border border-gray-700">
                                  <h4 className="text-red-500 font-bold uppercase text-xs mb-4 border-b border-gray-600 pb-2 tracking-wider">2. Prohibiciones Estrictas</h4>
                                  <ul className="list-disc pl-5 space-y-3 text-xs md:text-sm text-gray-300">
                                      <li><strong className="text-red-400">Consumo de Sustancias:</strong> Queda estrictamente prohibido presentarse bajo la influencia del alcohol o drogas, o consumirlos durante el turno.</li>
                                      <li><strong className="text-red-400">Abandono de Puesto:</strong> Nunca abandonar el puesto de trabajo sin relevo autorizado o instrucción directa de supervisión.</li>
                                      <li><strong className="text-red-400">Uso de Celular:</strong> Se prohíbe el uso de teléfonos celulares para juegos, videos o redes sociales que distraigan de la función de vigilancia.</li>
                                      <li><strong className="text-red-400">Dormir:</strong> Dormir durante el turno de trabajo es una falta grave a la seguridad de la instalación.</li>
                                  </ul>
                              </div>
                          </div>

                          {/* Form Fields */}
                          <div>
                              <h3 className="section-title">Individualización del Trabajador</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="md:col-span-2">
                                      <label className="form-label">Nombre Completo</label>
                                      <input type="text" className="form-input" placeholder="Ingrese su nombre completo" disabled={docsStatus.actaDeberes === 'completed'} />
                                  </div>
                                  <div>
                                      <label className="form-label">R.U.T.</label>
                                      <input type="text" className="form-input" placeholder="12.345.678-9" disabled={docsStatus.actaDeberes === 'completed'} />
                                  </div>
                                  <div>
                                      <label className="form-label">Instalación</label>
                                      <input type="text" className="form-input" placeholder="Lugar de trabajo" disabled={docsStatus.actaDeberes === 'completed'} />
                                  </div>
                              </div>
                          </div>
                          
                          <div className="bg-gray-900/50 p-4 rounded border border-gray-700">
                                <p className="text-sm text-gray-300 text-justify">
                                    Declaro haber recibido, leído y comprendido el presente documento "Acta de Notificación Deberes y Obligaciones Guardias de Seguridad SYSEG", y me comprometo a cumplir con lo estipulado.
                                </p>
                          </div>

                          {/* Signature Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                              <div>
                                  <h3 className="section-title text-center mb-4">Firma Trabajador</h3>
                                  <div className="bg-gray-200 rounded-lg p-4 text-gray-800">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-gray-500 font-bold uppercase">Firma Digital</span>
                                            {docsStatus.actaDeberes !== 'completed' && (
                                                <button onClick={clearSignature} className="text-xs text-red-600 hover:text-red-800 font-bold underline">Borrar</button>
                                            )}
                                        </div>
                                        <div className={`bg-white border-2 border-dashed border-gray-400 rounded cursor-crosshair relative h-32 ${docsStatus.actaDeberes === 'completed' ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
                                            <canvas 
                                                ref={canvasRef}
                                                onMouseDown={startDrawing}
                                                onMouseMove={draw}
                                                onMouseUp={stopDrawing}
                                                onMouseLeave={stopDrawing}
                                                onTouchStart={startDrawing}
                                                onTouchMove={draw}
                                                onTouchEnd={stopDrawing}
                                                className="w-full h-full touch-none"
                                            />
                                            <span className="sign-placeholder absolute bottom-2 left-2 text-[10px] text-gray-400 pointer-events-none">Dibuje su firma aquí</span>
                                        </div>
                                  </div>
                              </div>
                              
                              <div>
                                  <h3 className="section-title text-center mb-4">Firma Supervisor / Empleador</h3>
                                  <div className="bg-gray-200 rounded-lg p-4 text-gray-800 opacity-80">
                                        <div className="h-32 border-2 border-solid border-gray-400 bg-white rounded flex flex-col items-center justify-center">
                                            <span className="font-script text-2xl text-blue-900 mb-1" style={{ fontFamily: 'cursive' }}>Syseg Sur SpA</span>
                                            <div className="w-3/4 h-px bg-gray-400 mb-1"></div>
                                            <span className="text-[10px] font-bold uppercase text-gray-600">Supervisor de Turno</span>
                                        </div>
                                  </div>
                              </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-end pt-4 border-t border-gray-700">
                             {docsStatus.actaDeberes !== 'completed' && (
                                <button onClick={finalizeDocument} className="px-6 py-3 rounded-lg bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2 transform active:scale-95 transition-all">
                                    <CheckCircle className="w-5 h-5" />
                                    Confirmar Recepción y Firmar
                                </button>
                             )}
                          </div>
                     </div>
                </div>
            )}

            {/* VISTA 8: DECÁLOGO (PDF LECTURA) */}
            {currentView === 'decalogo' && (
                <div className="fade-in w-full h-full flex flex-col bg-gray-900">
                     <div className="sticky top-0 z-40 bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center shrink-0">
                        <button onClick={() => setCurrentView('list')} className="flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Volver al Dashboard
                        </button>
                        <span className="text-gray-500 text-xs uppercase font-bold">Documento de Lectura</span>
                     </div>
                     <div className="flex-1 relative w-full h-full bg-gray-900 p-0 overflow-hidden">
                         <iframe 
                            src="/docs/Decalogo_Buenos_Tratos.pdf" 
                            className="w-full h-full border-none block" 
                            title="Decálogo de Buenos Tratos"
                         />
                     </div>
                </div>
            )}
        </div>
      </main>

      {/* MODAL EXITOSO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
            <div className="bg-gray-900 border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform scale-100 fade-in text-center p-8 z-10">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Documento Firmado</h3>
                <div className="bg-yellow-900/20 border border-yellow-900/50 p-3 rounded-lg text-left mt-4 mb-6">
                    <div className="flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                        <p className="text-sm text-yellow-200">Este documento ha sido bloqueado y enviado a supervisión.</p>
                    </div>
                </div>
                <button onClick={closeModal} className="w-full px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-bold border border-gray-600 transition-all">Continuar</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default DashboardGuardia;
