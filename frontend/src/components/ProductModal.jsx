import React, { useState, useEffect } from 'react';
import { X, Box, Minus, Plus, Save } from 'lucide-react';

// --- COMPONENTE: MODAL DE PRODUCTO (CREAR / EDITAR) ---
// Permite agregar nuevos productos o editar los existentes
const ProductModal = ({ isOpen, onClose, onSave, product }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'General',
        sku: '',
        stock: 0,
        minStock: 5,
    });

    // Cargar datos del producto al abrir el modal en modo edición
    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
            // Resetear formulario para nuevo producto
            setFormData({
                name: '',
                category: 'General',
                sku: '',
                stock: 0,
                minStock: 5,
            });
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, id: product?.id || Date.now() });
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            style={{
                backgroundColor: 'var(--overlay-fallback-color)',
                backdropFilter: 'blur(var(--overlay-blur-intensity))',
                WebkitBackdropFilter: 'blur(var(--overlay-blur-intensity))'
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre del Producto</label>
                        <input 
                            type="text" 
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            placeholder="Ej. Radio Motorola"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Categoría</label>
                            <select 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="General">General</option>
                                <option value="Comunicación">Comunicación</option>
                                <option value="EPP">EPP</option>
                                <option value="Tecnología">Tecnología</option>
                                <option value="Seguridad">Seguridad</option>
                                <option value="Iluminación">Iluminación</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">SKU / Código</label>
                            <input 
                                type="text" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                placeholder="COD-001"
                                value={formData.sku}
                                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                <Box className="w-4 h-4 text-red-500" /> Stock Actual
                            </label>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => setFormData(prev => ({...prev, stock: Math.max(0, prev.stock - 1)}))} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">
                                    <Minus className="w-3 h-3" />
                                </button>
                                <input 
                                    type="number" 
                                    min="0"
                                    className="w-16 text-center bg-white border border-gray-200 rounded-lg py-1.5 text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                                />
                                <button type="button" onClick={() => setFormData(prev => ({...prev, stock: prev.stock + 1}))} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Stock Mínimo (Alerta)</label>
                            <input 
                                type="number" 
                                min="1"
                                className="w-20 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                value={formData.minStock}
                                onChange={(e) => setFormData({...formData, minStock: parseInt(e.target.value) || 0})}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit"
                            className="w-full bg-black text-white py-3 rounded-xl text-sm font-bold hover:bg-gray-900 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {product ? 'Guardar Cambios' : 'Registrar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
