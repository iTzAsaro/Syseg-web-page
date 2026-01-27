import React from 'react';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import RecipientSelector from './RecipientSelector';

const CartDrawer = () => {
  const { 
    cartItems, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity, 
    updateRecipient,
    getCartTotal,
    getCartCount
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay Backdrop */}
      <div 
        className="absolute inset-0 transition-opacity duration-300 animate-in fade-in"
        style={{
            backgroundColor: 'var(--overlay-fallback-color)',
            backdropFilter: 'blur(var(--overlay-blur-intensity))',
            WebkitBackdropFilter: 'blur(var(--overlay-blur-intensity))'
        }}
        onClick={toggleCart}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Carrito de Retiro</h2>
              <p className="text-xs text-gray-500">{getCartCount()} ítems seleccionados</p>
            </div>
          </div>
          <button 
            onClick={toggleCart}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/50">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-900 font-medium">El carrito está vacío</p>
                <p className="text-sm text-gray-500 mt-1">Agrega productos desde el inventario</p>
              </div>
              <button 
                onClick={toggleCart}
                className="text-sm font-bold text-black underline hover:text-gray-700"
              >
                Volver al inventario
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group">
                {/* Product Info */}
                <div className="flex gap-4">
                  {/* Imagen Placeholder o real */}
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 shrink-0">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 mb-2">{item.category} • SKU: {item.sku}</p>
                    
                    {/* Controls Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-black disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-black"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {/* Price (if applicable, assuming price exists or is 0) */}
                      {/* <div className="font-bold text-gray-900 text-sm">
                        ${((item.price || 0) * item.quantity).toLocaleString()}
                      </div> */}
                    </div>
                  </div>
                </div>

                {/* Recipient Selector */}
                <RecipientSelector 
                  item={item} 
                  onUpdate={(recipient) => updateRecipient(item.id, recipient)} 
                />
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-white z-10 space-y-4">
            {/* Summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal ({getCartCount()} ítems)</span>
                {/* <span>${getCartTotal().toLocaleString()}</span> */}
                <span>-</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900">
                <span>Total</span>
                {/* <span>${getCartTotal().toLocaleString()}</span> */}
                <span>Confirmar Retiro</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button 
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-black/20 hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              onClick={() => alert("Procesando retiro... (Lógica pendiente)")}
            >
              <span>Confirmar Retiro</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
