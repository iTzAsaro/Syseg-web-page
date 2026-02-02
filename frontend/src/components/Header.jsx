import React from 'react';
import { Menu, Bell, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const { getCartCount, toggleCart } = useCart();
  const { user } = useAuth();
  const cartCount = getCartCount();

  const getInitials = (name) => {
    if (!name) return 'US';
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const displayName = user?.nombre || 'Usuario';
  const displayEmail = user?.email || '';
  const displayInitials = getInitials(displayName);

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-sm shrink-0 z-30">
        <div className="flex items-center gap-4">
            <button 
                onClick={onMenuClick}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
                <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 hidden sm:block">Panel de Control</h2>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
            <button 
              onClick={toggleCart}
              className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full relative transition-all"
              title="Ver Carrito"
            >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
            </button>
            <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full relative transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-3 pl-2 sm:pl-0 cursor-pointer hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{displayEmail}</p>
                </div>
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold border-2 border-gray-100 shadow-sm ring-2 ring-gray-50">{displayInitials}</div>
            </div>
        </div>
    </header>
  );
};

export default Header;
