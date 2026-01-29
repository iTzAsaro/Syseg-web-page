import React, { useState, useEffect } from 'react';
import { X, Box, Minus, Plus, Save } from 'lucide-react';
import categoriaService from '../services/categoriaService';

// --- COMPONENTE: MODAL DE PRODUCTO (CREAR / EDITAR) ---
// Permite agregar nuevos productos o editar los existentes
const ProductModal = ({ isOpen, onClose, onSave, product }) => {
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        stock: 0,
        minStock: 5,
        description: '',
        price: 0,
        cost: 0
    });
    
    const [categories, setCategories] = useState([]);

    // Cargar categorías
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoriaService.getAll();
                setCategories(data);
                // Si hay categorías y no hay selección, seleccionar la primera
                if (data.length > 0 && !formData.categoryId) {
                    setFormData(prev => ({ ...prev, categoryId: data[0].id }));
                }
            } catch (error) {
                console.error("Error cargando categorías:", error);
            }
        };
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    // Cargar datos del producto al abrir el modal en modo edición
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                categoryId: product.categoria_id || product.categoryId || '', // Ajustar según backend
                stock: product.stock || 0,
                minStock: product.minStock || 0,
                description: product.descripcion || ''
            });
        } else {
            // Resetear formulario para nuevo producto
            setFormData({
                name: '',
                categoryId: categories.length > 0 ? categories[0].id : '',
                stock: 0,
                minStock: 5,
                description: ''
            });
        }
    }, [product, isOpen, categories.length]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, id: product?.id });
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h3 className="text-lg font-bold text-gray-900">
                        {product ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Categoría</label>
                            <select 
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                value={formData.categoryId}
                                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                                required
                            >
                                <option value="">Seleccione...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Descripción</label>
                        <textarea 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            placeholder="Detalles del producto..."
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
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
