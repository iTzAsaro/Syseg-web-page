import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SysegLogoImg from '../assets/syseg_logo.svg';

// Configuración de la instancia de Axios para peticiones HTTP
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // URL base del backend (Asegúrate de que el puerto coincida)
});

export default function Login() {
  const navigate = useNavigate();
  // Estado para controlar el modo de vista (false: Supervisor, true: Guardia)
  const [isGuardMode, setIsGuardMode] = useState(false);
  
  // --- Estados para el formulario de Supervisor ---
  const [emailSup, setEmailSup] = useState(''); // Correo del supervisor
  const [passSup, setPassSup] = useState(''); // Contraseña del supervisor
  const [showPassSup, setShowPassSup] = useState(false); // Visibilidad de contraseña
  const [isLoadingSup, setIsLoadingSup] = useState(false); // Estado de carga
  const [errorSup, setErrorSup] = useState(''); // Mensajes de error

  // --- Estados para el formulario de Guardia ---
  const [rutGuard, setRutGuard] = useState(''); // RUT del guardia
  const [passGuard, setPassGuard] = useState(''); // Contraseña del guardia
  const [showPassGuard, setShowPassGuard] = useState(false); // Visibilidad de contraseña
  const [isLoadingGuard, setIsLoadingGuard] = useState(false); // Estado de carga
  const [errorGuard, setErrorGuard] = useState(''); // Mensajes de error

  // Manejador de envío del formulario de Supervisor
  const handleSupervisorSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingSup(true);
    setErrorSup('');

    try {
      // Petición de login para administradores/supervisores
      const response = await api.post('/auth/signin/web', {
        email: emailSup,
        password: passSup
      });
      console.log('Sup Login Exitoso:', response.data);
      // Almacenamiento del token y datos de usuario en localStorage
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Redirección al dashboard de administrador
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error Login Sup:', err);
      // Manejo de errores desde el backend o genéricos
      setErrorSup(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoadingSup(false);
    }
  };

  // Manejador de envío del formulario de Guardia
  const handleGuardSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingGuard(true);
    setErrorGuard('');

    try {
      // Petición de login para la aplicación móvil/operativa (Guardias)
      const response = await api.post('/auth/signin/app', {
        rut: rutGuard,
        password: passGuard
      });
      console.log('Guard Login Exitoso:', response.data);
      // Almacenamiento del token y datos de usuario en localStorage
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Redirección al dashboard de guardia
      navigate('/guardia/dashboard');
    } catch (err) {
      console.error('Error Login Guard:', err);
      // Manejo de errores desde el backend o genéricos
      setErrorGuard(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoadingGuard(false);
    }
  };

  return (
    // Contenedor principal con transición de fondo según el modo (Claro/Oscuro)
    <div className={`min-h-screen w-full flex flex-col items-center justify-center font-sans relative overflow-hidden transition-colors duration-700 ${isGuardMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      
      {/* --- Fondo Dinámico --- */}
      {/* Patrón de puntos */}
      <div className={`absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] transition-opacity duration-700 ${isGuardMode ? 'opacity-5' : 'opacity-70'}`}></div>
      {/* Degradado superpuesto */}
      <div className={`absolute inset-0 bg-gradient-to-b pointer-events-none transition-colors duration-700 ${isGuardMode ? 'from-black via-gray-900 to-black' : 'from-transparent via-white/50 to-white/80'}`}></div>

      {/* --- CONTENEDOR FLIP 3D (Tarjeta Giratoria) --- */}
      <div className="relative w-full max-w-[400px] h-[620px] p-4" style={{ perspective: '2000px' }}>
          <div 
              className="relative w-full h-full transition-transform duration-700 cubic-bezier(0.4, 0.0, 0.2, 1)" 
              style={{ transformStyle: 'preserve-3d', transform: isGuardMode ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
              
              {/* --- CARA FRONTAL: SUPERVISOR --- */}
              <main 
                  className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                  {/* Barra superior decorativa */}
                  <div className="h-2 w-full bg-red-600"></div>
                  
                  <div className="p-8 pt-10 flex-1 flex flex-col">
                      <div className="text-center mb-6">
                          {/* Logo Syseg */}
                          <img src={SysegLogoImg} alt="Syseg Logo" className="h-24 w-auto mx-auto mb-4 object-contain" />
                          <div className="flex flex-col">
                              <span className="text-red-600 font-bold text-xs tracking-[0.2em] uppercase">Gestión de Inventario</span>
                              <span className="text-gray-400 text-sm mt-1 font-medium">Portal Administrativo</span>
                          </div>
                      </div>

                      <form onSubmit={handleSupervisorSubmit} className="space-y-5">
                          {/* Mensaje de error Supervisor */}
                          {errorSup && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                              {errorSup}
                            </div>
                          )}
                          
                          {/* Campo Email */}
                          <div className="space-y-1">
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700 ml-1">Correo Corporativo</label>
                              <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      {/* Icono Usuario */}
                                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-gray-400 text-lg" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"></path>
                                      </svg>
                                  </div>
                                  <input 
                                      id="email" 
                                      className="transition-all duration-200 ease-in-out block w-full pl-10 pr-3 h-12 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent sm:text-sm shadow-sm" 
                                      placeholder="soporte@syseg.cl" 
                                      required 
                                      type="email" 
                                      value={emailSup}
                                      onChange={(e) => setEmailSup(e.target.value)}
                                  />
                              </div>
                          </div>

                          {/* Campo Contraseña */}
                          <div className="space-y-1">
                              <label htmlFor="password" className="block text-sm font-medium text-gray-700 ml-1">Contraseña</label>
                              <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      {/* Icono Candado */}
                                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="text-gray-400 text-lg" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"></path>
                                      </svg>
                                  </div>
                                  <input 
                                      id="password" 
                                      className="transition-all duration-200 ease-in-out block w-full pl-10 pr-10 h-12 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent sm:text-sm shadow-sm" 
                                      placeholder="123456" 
                                      required 
                                      type={showPassSup ? 'text' : 'password'}
                                      value={passSup}
                                      onChange={(e) => setPassSup(e.target.value)}
                                  />
                                  {/* Botón Mostrar/Ocultar Contraseña */}
                                  <button 
                                      type="button" 
                                      onClick={() => setShowPassSup(!showPassSup)}
                                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-600 focus:outline-none cursor-pointer transition-colors"
                                  >
                                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"></path>
                                      </svg>
                                  </button>
                              </div>
                          </div>

                          <button 
                              type="submit" 
                              disabled={isLoadingSup}
                              className="w-full flex justify-center items-center h-12 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white transition-all duration-200 transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 bg-red-600 hover:bg-red-700 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                              {isLoadingSup ? 'Verificando...' : (
                                <>
                                  ACCEDER AL SISTEMA
                                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="ml-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M352 96l64 0c17.7 0 32 14.3 32 32l0 256c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32zm-9.4 182.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L242.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"></path>
                                  </svg>
                                </>
                              )}
                          </button>

                          <div className="text-center pt-2">
                              <a className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors" href="/recovery" data-discover="true">¿Primera vez aquí? / Recuperar Contraseña</a>
                          </div>
                      </form>

                      {/* Botón Switch Modo - Ir a Guardia */}
                      <button 
                         onClick={() => setIsGuardMode(true)}
                         className="mx-auto mt-6 text-[10px] uppercase font-bold text-gray-400 hover:text-red-600 flex items-center gap-1.5 transition-colors tracking-widest"
                      >
                         <RefreshCw className="w-3 h-3" />
                         Cambiar a Modo Guardia
                      </button>

                      <div className="mt-4 text-center">
                          <p className="text-sm text-gray-500">¿Problemas técnicos? <a href="#" className="font-medium text-gray-600 hover:text-black transition-colors underline decoration-dotted decoration-2 underline-offset-4">Contactar Soporte TI</a></p>
                      </div>
                  </div>

                  {/* Footer Tarjeta */}
                  <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-400 font-mono">v1.0.4</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                              <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8s0 0 0 0z"></path>
                          </svg> 
                          Seguro
                      </span>
                  </div>
              </main>

              {/* --- CARA TRASERA: GUARDIA --- */}
              <main 
                  className="absolute inset-0 w-full h-full bg-gray-900 rounded-2xl shadow-xl shadow-black border border-gray-700 overflow-hidden flex flex-col"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                  {/* Barra superior con brillo rojo */}
                  <div className="h-2 w-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
                  
                  <div className="p-8 pt-10 flex-1 flex flex-col">
                      <div className="text-center mb-6">
                          {/* Logo Invertido para fondo oscuro */}
                          <img src={SysegLogoImg} alt="Syseg Logo" className="h-24 w-auto mx-auto mb-4 object-contain invert brightness-0" />
                          <div className="flex flex-col">
                              <span className="text-red-500 font-bold text-xs tracking-[0.2em] uppercase">Control de Acceso</span>
                              <span className="text-gray-400 text-sm mt-1 font-medium">Portal Operativo</span>
                          </div>
                      </div>

                      <form onSubmit={handleGuardSubmit} className="space-y-5">
                          {/* Mensaje de error Guardia */}
                          {errorGuard && (
                            <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded-lg text-sm text-center font-medium">
                              {errorGuard}
                            </div>
                          )}
                          
                          {/* Campo RUT */}
                          <div className="space-y-1">
                              <label className="block text-sm font-medium text-gray-300 ml-1">RUT Guardia</label>
                              <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-gray-500 text-lg" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"></path>
                                      </svg>
                                  </div>
                                  <input 
                                      className="transition-all duration-200 ease-in-out block w-full pl-10 pr-3 h-12 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent sm:text-sm shadow-sm" 
                                      placeholder="12.345.678-9" 
                                      required 
                                      type="text" 
                                      value={rutGuard}
                                      onChange={(e) => setRutGuard(e.target.value)}
                                  />
                              </div>
                          </div>

                          {/* Campo Contraseña Guardia */}
                          <div className="space-y-1">
                              <label className="block text-sm font-medium text-gray-300 ml-1">Contraseña</label>
                              <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" className="text-gray-500 text-lg" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"></path>
                                      </svg>
                                  </div>
                                  <input 
                                      className="transition-all duration-200 ease-in-out block w-full pl-10 pr-10 h-12 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent sm:text-sm shadow-sm" 
                                      placeholder="••••••••" 
                                      required 
                                      type={showPassGuard ? 'text' : 'password'}
                                      value={passGuard}
                                      onChange={(e) => setPassGuard(e.target.value)}
                                  />
                                  <button 
                                      type="button" 
                                      onClick={() => setShowPassGuard(!showPassGuard)}
                                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white focus:outline-none cursor-pointer transition-colors"
                                  >
                                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"></path>
                                      </svg>
                                  </button>
                              </div>
                          </div>

                          <button 
                              type="submit" 
                              disabled={isLoadingGuard}
                              className="w-full flex justify-center items-center h-12 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white transition-all duration-200 transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 bg-gradient-to-r from-gray-700 to-black hover:to-gray-800 border-gray-600 disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                              {isLoadingGuard ? 'Verificando...' : (
                                <>
                                  INGRESAR GUARDIA
                                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="ml-2" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M352 96l64 0c17.7 0 32 14.3 32 32l0 256c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32zm-9.4 182.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L242.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"></path>
                                  </svg>
                                </>
                              )}
                          </button>

                          <div className="text-center pt-2">
                              <a className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors" href="/recovery">¿Primera vez aquí? / Recuperar Contraseña</a>
                          </div>
                      </form>

                      {/* Botón Switch Modo - Regresar */}
                      <button 
                         onClick={() => setIsGuardMode(false)}
                         className="mx-auto mt-6 text-[10px] uppercase font-bold text-gray-500 hover:text-white flex items-center gap-1.5 transition-colors tracking-widest"
                      >
                         <RefreshCw className="w-3 h-3 text-red-500" />
                         Regresar a Supervisor
                      </button>

                      {/* AÑADIDO: Enlace Soporte TI para llenar el espacio vacío */}
                      <div className="mt-4 text-center">
                          <p className="text-sm text-gray-500">¿Problemas técnicos? <a href="#" className="font-medium text-gray-400 hover:text-white transition-colors underline decoration-dotted decoration-2 underline-offset-4">Contactar Soporte TI</a></p>
                      </div>
                  </div>

                  <div className="bg-gray-800 px-8 py-4 border-t border-gray-700 flex justify-between items-center">     
                      <span className="text-xs text-gray-500 font-mono">v1.0.4</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                              <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8s0 0 0 0z"></path>
                          </svg>
                          Seguro
                      </span>
                  </div>
              </main>
          </div>
      </div>
    </div>
  );
}
