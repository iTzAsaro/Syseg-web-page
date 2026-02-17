import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  AlertTriangle, 
  LogOut, 
  X 
} from 'lucide-react';

const GuardSidebar = ({
  isOpen,
  onClose,
  currentView,
  onSelectView,
  sections
}) => {
  const menuSections = useMemo(() => {
    if (sections && sections.length > 0) return sections;
    return [
      {
        id: 'principal',
        label: 'Principal',
        items: [
          {
            id: 'docs',
            label: 'Documentación',
            icon: FileText,
            type: 'view',
            view: 'list'
          },
          {
            id: 'procedimientos',
            label: 'Procedimientos',
            icon: AlertTriangle,
            type: 'view',
            view: 'procedimientos'
          }
        ]
      }
    ];
  }, [sections]);

  const [openSubmenus, setOpenSubmenus] = useState({});

  const handleItemActivate = (item) => {
    if (item.type === 'link' && item.path) {
      if (onClose) onClose();
      return;
    }
    if (item.type === 'view' && item.view && onSelectView) {
      onSelectView(item.view);
      if (onClose) onClose();
      return;
    }
    if (item.type === 'submenu') {
      setOpenSubmenus(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    }
  };

  const handleKeyDown = (e, item) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemActivate(item);
    }
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  const renderItemContent = (item, isActive) => {
    const Icon = item.icon;
    return (
      <>
        {Icon && (
          <Icon
            className={`w-5 h-5 ${
              isActive ? 'text-white' : 'text-gray-400'
            }`}
          />
        )}
        <span className="text-sm font-medium truncate">{item.label}</span>
      </>
    );
  };

  const renderItem = (item) => {
    const isActive =
      (item.type === 'view' && item.view === currentView) ||
      false;

    const baseClasses =
      'w-full flex items-center gap-3 px-3 py-2 rounded-lg border shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900';
    const activeClasses =
      'bg-red-600 text-white border-red-700';
    const inactiveClasses =
      'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-750 hover:text-white transition-colors';

    if (item.type === 'link' && item.path) {
      return (
        <Link
          key={item.id}
          to={item.path}
          onClick={() => handleItemActivate(item)}
          className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
          aria-current={isActive ? 'page' : undefined}
        >
          {renderItemContent(item, isActive)}
        </Link>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        onClick={() => handleItemActivate(item)}
        onKeyDown={(e) => handleKeyDown(e, item)}
        aria-current={isActive ? 'page' : undefined}
      >
        {renderItemContent(item, isActive)}
      </button>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-label="Navegación principal de guardia"
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-900/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 w-8 h-8 rounded flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(220,38,38,0.5)]">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm tracking-widest uppercase leading-none">
                Syseg
              </span>
              <span className="text-gray-500 text-[10px] uppercase font-medium">
                Guardia
              </span>
            </div>
          </div>
          <button
            type="button"
            className="md:hidden text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1"
            onClick={onClose}
            aria-label="Cerrar menú lateral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          {menuSections.map((section) => (
            <div key={section.id}>
              <p className="px-3 text-xs text-gray-600 uppercase tracking-wider font-semibold mb-2">
                {section.label}
              </p>
              <div className="space-y-2">
                {section.items.map((item) => {
                  if (item.type === 'submenu' && item.children) {
                    const isOpenSubmenu = openSubmenus[item.id];
                    return (
                      <div key={item.id} className="space-y-1">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-750 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                          onClick={() => handleItemActivate(item)}
                          onKeyDown={(e) => handleKeyDown(e, item)}
                          aria-expanded={isOpenSubmenu || false}
                          aria-controls={`submenu-${item.id}`}
                        >
                          <span className="flex items-center gap-3">
                            {renderItemContent(item, false)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {isOpenSubmenu ? '−' : '+'}
                          </span>
                        </button>
                        {isOpenSubmenu && (
                          <div
                            id={`submenu-${item.id}`}
                            className="space-y-1 pl-4"
                          >
                            {item.children.map((child) => renderItem(child))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return renderItem(item);
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </Link>
        </div>
      </aside>
    </>
  );
};

export default GuardSidebar;

