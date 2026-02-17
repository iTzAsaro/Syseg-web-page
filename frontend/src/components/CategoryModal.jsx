import React, { useState } from 'react';
import { X, Save, Tag, Trash2 } from 'lucide-react';

const CategoryModal = ({ isOpen, onClose, onSave, categories = [], onDeleteCategory }) => {
    const [nombre, setNombre] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ nombre });
        setNombre('');
    };

    const handleDelete = (id) => {
        if (!onDeleteCategory) {
            return;
        }
        onDeleteCategory(id);
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
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white z-10">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-gray-500" />
                        Categorías de Inventario
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Nombre de la Categoría</label>
                        <input 
                            type="text" 
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                            placeholder="Ej. Electrónica"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Categorías existentes</p>
                        {categories.length === 0 ? (
                            <div className="w-full bg-gray-50 border border-dashed border-gray-200 rounded-lg px-4 py-3 text-xs text-gray-400">
                                Aún no hay categorías creadas.
                            </div>
                        ) : (
                            <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50 divide-y divide-gray-100">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="flex items-center justify-between px-3 py-2.5">
                                        <span className="text-sm text-gray-700">{cat.nombre}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end pt-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="mr-3 px-5 py-2.5 text-gray-500 font-bold text-sm hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-900 transition-all shadow-lg shadow-black/20 flex items-center gap-2 transform active:scale-95"
                        >
                            <Save className="w-4 h-4" />
                            Guardar Categoría
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;
