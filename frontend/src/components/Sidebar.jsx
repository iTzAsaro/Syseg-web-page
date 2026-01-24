import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Box, Users, FileText, Settings, LogOut, 
  ArrowUpRight, ArrowDownRight, ShieldCheck, 
  FileSpreadsheet, UserX, X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { id: 'dashboard', label: 'Panel General', icon: Home, path: '/admin/dashboard' },
    { id: 'inventory', label: 'Inventario', icon: Box, path: '/admin/inventory' },
    // Placeholder paths for other items
    { id: 'entry', label: 'Ingreso Inventario', icon: ArrowUpRight, path: '/admin/entry' },
    { id: 'withdrawal', label: 'Retiro Inventario', icon: ArrowDownRight, path: '/admin/withdrawal' },
    { id: 'reports', label: 'Reportes', icon: FileText, path: '/admin/reports' },
    { id: 'logs', label: 'Bitácora', icon: FileSpreadsheet, path: '/admin/logs' },
    { id: 'users', label: 'Gestión de Usuarios', icon: Users, path: '/admin/users' },
    { id: 'guards', label: 'Guardias', icon: ShieldCheck, path: '/admin/guards' },
    { id: 'blacklist', label: 'Blacklist', icon: UserX, path: '/admin/blacklist' },
    { id: 'settings', label: 'Configuración', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <>
      {/* --- OVERLAY MÓVIL --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* --- SIDEBAR NEGRO --- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-black border-r border-gray-800 shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800 bg-black shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-900/40">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                        <path d="M352 96l64 0c17.7 0 32 14.3 32 32l0 256c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0c53 0 96-43 96-96l0-256c0-53-43-96-96-96l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32zm-9.4 182.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L242.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"></path>
                    </svg>
                </div>
                <div className="flex flex-col">
                    <h1 className="font-extrabold text-xl tracking-tight text-white leading-none">SYSEG</h1>
                    <span className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase mt-1">Admin Panel</span>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="lg:hidden text-gray-400 hover:text-white"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          <div className="mb-6">
            <p className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3 mt-2">Principal</p>
            {menuItems.slice(0, 6).map((item) => (
                <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive(item.path)
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white' 
                }`}
                >
                <item.icon 
                    className={`w-5 h-5 transition-colors relative z-10 ${
                        isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-white'
                    }`} 
                />
                <span className="relative z-10">{item.label}</span>
                {isActive(item.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-100 z-0"></div>
                )}
                </Link>
            ))}
          </div>

          <div>
            <p className="px-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Administración</p>
            {menuItems.slice(6).map((item) => (
                <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive(item.path)
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white' 
                }`}
                >
                <item.icon 
                    className={`w-5 h-5 transition-colors relative z-10 ${
                        isActive(item.path) ? 'text-white' : 'text-gray-500 group-hover:text-white'
                    }`} 
                />
                <span className="relative z-10">{item.label}</span>
                </Link>
            ))}
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-800 bg-black shrink-0">
            <Link to="/" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 rounded-xl transition-colors group">
                <LogOut className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                Cerrar Sesión
            </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
