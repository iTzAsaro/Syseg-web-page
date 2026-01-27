import React, { useState } from 'react';
import { 
  Search, Filter, Plus, Box, Edit, Trash2, ShoppingCart 
} from 'lucide-react';
import Layout from '../../components/Layout';
import ProductModal from '../../components/ProductModal';
import { useCart } from '../../context/CartContext';
import RequirePermission from '../../components/RequirePermission';

// --- VISTA: INVENTARIO CON CARRITO Y MODAL ---
const Inventario = () => {
  // Estado de los productos
  const [products, setProducts] = useState([
    { id: 1, name: 'Radio Motorola X1', category: 'Comunicación', sku: 'RAD-001', stock: 15, minStock: 5 },
    { id: 2, name: 'Chaleco Reflectante', category: 'EPP', sku: 'EPP-004', stock: 4, minStock: 10 },
    { id: 3, name: 'Linterna Táctica LED', category: 'Iluminación', sku: 'LIN-022', stock: 8, minStock: 8 },
    { id: 4, name: 'Tablet Samsung Tab A', category: 'Tecnología', sku: 'TEC-101', stock: 12, minStock: 3 },
    { id: 5, name: 'Llaves Maestras Set', category: 'Seguridad', sku: 'KEY-999', stock: 2, minStock: 2 },
    { id: 6, name: 'Botas de Seguridad T42', category: 'EPP', sku: 'EPP-B42', stock: 20, minStock: 5 },
  ]);

  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el Modal de Producto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Datos simulados de guardias para asignar
  // const guards = ["Juan Pérez", "María González", "Pedro Silva", "Ana López"];

  // --- LÓGICA DE PRODUCTOS ---
  const handleAddNew = () => {
      setEditingProduct(null);
      setIsModalOpen(true);
  };

  const handleEdit = (product) => {
      setEditingProduct(product);
      setIsModalOpen(true);
  };

  const handleDelete = (id) => {
      if (window.confirm('¿Estás seguro de eliminar este producto?')) {
          setProducts(products.filter(p => p.id !== id));
      }
  };

  const handleSaveProduct = (productData) => {
      if (editingProduct) {
          // Editar existente
          setProducts(products.map(p => p.id === productData.id ? productData : p));
      } else {
          // Crear nuevo
          setProducts([...products, productData]);
      }
      setIsModalOpen(false);
  };



  // --- FILTROS ---
  const filteredProducts = products.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper visual para BADGES (Sin barras)
  const getStockBadge = (stock, min) => {
    if (stock <= min / 2) return <span className="text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Crítico</span>;
    if (stock <= min) return <span className="text-orange-700 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Bajo</span>;
    return <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Óptimo</span>;
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500 relative">
        
        {/* Modal de Producto */}
        <ProductModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSaveProduct}
            product={editingProduct}
        />

        {/* Header Inventario */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Gestión de Inventario</h2>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Control de existencias y asignación de equipos</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
              <RequirePermission permission="CREAR_PRODUCTO">
                  <button 
                      onClick={handleAddNew}
                      className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-900 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2 transform active:scale-95"
                  >
                      <Plus className="w-4 h-4" /> 
                      Nuevo / Ingreso
                  </button>
              </RequirePermission>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 lg:items-center">
          <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input 
                  type="text" 
                  placeholder="Buscar artículo..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <button className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  <Filter className="w-4 h-4" /> Categoría
              </button>
          </div>
          <div className="hidden lg:block h-8 w-px bg-gray-200 mx-2"></div>
          <span className="text-xs text-gray-400 self-end lg:self-center hidden lg:block">{filteredProducts.length} artículos</span>
        </div>

        {/* Grid de Inventario */}
        <div className="md:bg-white md:rounded-2xl md:border md:border-gray-200 md:shadow-sm md:overflow-hidden">
            
            {/* VISTA ESCRITORIO */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-gray-50/50 text-gray-500 font-bold uppercase text-[11px] tracking-wider border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 w-1/3">Producto</th>
                            <th className="px-6 py-4 w-1/3">Nivel de Stock</th>
                            <th className="px-6 py-4 w-1/3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200 group-hover:border-red-200 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                                            <Box className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 mt-1">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {/* DISEÑO STOCK SIN BARRA */}
                                    <div className="flex items-center justify-between max-w-[180px] bg-gray-50 rounded-lg p-2 border border-gray-100">
                                        <div>
                                            <span className="block text-sm font-bold text-gray-900">{item.stock} <span className="text-[10px] text-gray-400 font-normal">unid.</span></span>
                                            <span className="block text-[10px] text-gray-400">Min: {item.minStock}</span>
                                        </div>
                                        {getStockBadge(item.stock, item.minStock)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <RequirePermission permission="AJUSTAR_STOCK">
                                            <button 
                                              onClick={() => addToCart(item)}
                                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-600 hover:text-white transition-all text-xs font-bold border border-red-100"
                                            >
                                                <ShoppingCart className="w-3.5 h-3.5" />
                                                Retirar
                                            </button>
                                            
                                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                        </RequirePermission>

                                        <RequirePermission permission="EDITAR_PRODUCTO">
                                            <button 
                                              onClick={() => handleEdit(item)}
                                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                              title="Editar Producto y Stock"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </RequirePermission>
                                        <RequirePermission permission="ELIMINAR_PRODUCTO">
                                            <button 
                                              onClick={() => handleDelete(item.id)}
                                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                              title="Eliminar Producto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </RequirePermission>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* VISTA MÓVIL (TARJETAS INDIVIDUALES) */}
            <div className="md:hidden">
                <div className="flex flex-col gap-4">
                    {filteredProducts.map((item) => (
                        <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                            {/* Decoración lateral */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                item.stock <= item.minStock / 2 ? 'bg-red-500' : 
                                item.stock <= item.minStock ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}></div>

                            {/* Header de la tarjeta */}
                            <div className="flex items-start justify-between gap-3 pl-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 shrink-0 shadow-sm">
                                        <Box className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-base line-clamp-2">{item.name}</div>
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 mt-1">
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    {getStockBadge(item.stock, item.minStock)}
                                </div>
                            </div>

                            {/* Información de Stock */}
                            <div className="flex items-center justify-between bg-gray-50/80 rounded-xl p-4 border border-gray-100 mx-2">
                                 <div>
                                    <span className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Stock Actual</span>
                                    <div className="text-xl font-black text-gray-900 leading-none mt-1">{item.stock} <span className="text-xs font-medium text-gray-400">unid.</span></div>
                                 </div>
                                 <div className="text-right">
                                    <span className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Mínimo</span>
                                    <div className="text-sm font-bold text-gray-700 mt-1">{item.minStock}</div>
                                 </div>
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex items-center gap-3 pl-2">
                                <RequirePermission permission="AJUSTAR_STOCK">
                                    <button 
                                      onClick={() => addToCart(item)}
                                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm font-bold shadow-md shadow-red-200 active:scale-95 active:shadow-none"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Retirar
                                    </button>
                                </RequirePermission>
                                <RequirePermission permission="EDITAR_PRODUCTO">
                                    <button 
                                      onClick={() => handleEdit(item)}
                                      className="p-3 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors border border-gray-200 hover:border-blue-200 active:scale-95 shadow-sm"
                                      title="Editar"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                </RequirePermission>
                                <RequirePermission permission="ELIMINAR_PRODUCTO">
                                    <button 
                                      onClick={() => handleDelete(item.id)}
                                      className="p-3 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors border border-gray-200 hover:border-red-200 active:scale-95 shadow-sm"
                                      title="Eliminar"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </RequirePermission>
                            </div>
                        </div>
                    ))}
                    
                    {filteredProducts.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-200 border-dashed">
                            No se encontraron productos
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default Inventario;
