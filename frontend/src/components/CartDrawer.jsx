import React, { useState } from 'react';
import { X, ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../context/useCart';
import RecipientSelector from './RecipientSelector';
import movimientoService from '../services/movimientoService';
import Swal from 'sweetalert2';

const CartDrawer = () => {
  const { 
    cartItems, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateRecipient,
    getCartCount,
    clearCart
  } = useCart();
  
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    if (processing) return;

    // 1. Validaciones previas en Frontend
    for (const item of cartItems) {
      if (!item.stock || item.stock <= 0) {
         await Swal.fire({
            icon: 'error',
            title: 'Stock Insuficiente',
            text: `El producto "${item.name}" no tiene stock disponible para retiro.`
         });
         return;
      }
      
      // Contar cuántas veces aparece este producto en el carrito
      const totalRequested = cartItems.filter(i => i.productId === item.productId).length;
      if (totalRequested > item.stock) {
         await Swal.fire({
            icon: 'error',
            title: 'Stock Insuficiente',
            text: `Estás solicitando ${totalRequested} unidades de "${item.name}", pero solo hay ${item.stock} disponibles.`
         });
         return;
      }
      
      if (!item.recipient || (!item.recipient.id && !item.recipient.name)) {
          await Swal.fire({
            icon: 'warning',
            title: 'Faltan Destinatarios',
            text: `Por favor asigna un destinatario para "${item.name}".`
         });
         return;
      }
    }

    try {
      setProcessing(true);
      
      // 2. Obtener tipos de movimiento para encontrar "Salida"
      let exitType;
      try {
        const types = await movimientoService.getTypes();
        exitType = types.find(t => 
          t.nombre.toLowerCase().includes('salida') || 
          t.nombre.toLowerCase().includes('entrega') || 
          t.nombre.toLowerCase().includes('retiro')
        );
      } catch (err) {
        console.warn("No se pudieron cargar los tipos de movimiento (posiblemente falta reiniciar backend). Usando fallback ID 2.", err);
        // Fallback: Si falla la API (ej. endpoint no existe aun), usamos ID 2 que verificamos en DB es "Salida"
        exitType = { id: 2, nombre: 'Salida' };
      }
      
      if (!exitType) {
        throw new Error('No se encontró el tipo de movimiento "Salida" en el sistema.');
      }

      // 3. Procesar retiros uno por uno (Secuencial para evitar condiciones de carrera en Backend)
      // Mostramos loading
      Swal.fire({
        title: 'Procesando retiro...',
        text: 'Registrando movimientos y actualizando stock',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      for (const item of cartItems) {
        const payload = {
          producto_id: item.productId,
          tipo_movimiento_id: exitType.id,
          cantidad: 1, 
          documento_asociado_id: item.recipient ? item.recipient.id : null,
        };
        console.log("Enviando movimiento:", payload);
        await movimientoService.create(payload);
      }

      // await Promise.all(promises);

      // 4. Finalizar
      await Swal.fire({
        icon: 'success',
        title: '¡Retiro Exitoso!',
        text: 'El stock ha sido actualizado correctamente.',
        timer: 2000
      });
      
      clearCart();
      toggleCart();
      window.location.reload(); // Recargar para actualizar inventario visual

    } catch (error) {
      console.error("Error en checkout:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Hubo un problema al procesar el retiro.';
      
      Swal.fire({
        icon: 'error',
        title: 'Error en Retiro',
        text: `Detalles: ${errorMessage}`
      });
    } finally {
      setProcessing(false);
    }
  };

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
                    <p className="text-xs text-gray-500 mt-0.5 mb-2">{item.category}</p>
                    
                    {/* Controls Removed as per requirement */}

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
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-black/20 hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCheckout}
              disabled={processing}
            >
              <span>{processing ? 'Procesando...' : 'Confirmar Retiro'}</span>
              {!processing && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
