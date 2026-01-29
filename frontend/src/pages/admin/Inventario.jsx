import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Box, Edit, Trash2, ShoppingCart, Download 
} from 'lucide-react';
import Layout from '../../components/Layout';
import ProductModal from '../../components/ProductModal';
import { useCart } from '../../context/CartContext';
import RequirePermission from '../../components/RequirePermission';
import productoService from '../../services/productoService';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

// --- VISTA: INVENTARIO CON CARRITO Y MODAL ---
const Inventario = () => {
  // Estado de los productos
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el Modal de Producto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Cargar productos desde el backend
  const fetchProducts = async () => {
      try {
          setLoading(true);
          const data = await productoService.getAll();
          // Mapear datos si es necesario para ajustar nombres de propiedades
          // Backend: nombre, stock_actual, stock_minimo, categoria_id, Categoria.nombre
          const mappedProducts = data.map(p => ({
              ...p,
              name: p.nombre,
              stock: p.stock_actual,
              minStock: p.stock_minimo,
              category: p.Categoria ? p.Categoria.nombre : 'Sin Categoría'
          }));
          setProducts(mappedProducts);
      } catch (error) {
          console.error("Error cargando productos:", error);
          Swal.fire('Error', 'No se pudieron cargar los productos.', 'error');
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchProducts();
  }, []);

  // --- LÓGICA DE PRODUCTOS ---
  const handleAddNew = () => {
      setEditingProduct(null);
      setIsModalOpen(true);
  };

  const handleEdit = (product) => {
      setEditingProduct(product);
      setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
      if (await Swal.fire({
          title: '¿Estás seguro?',
          text: "No podrás revertir esto. Se eliminará el producto permanentemente.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
      }).then(result => result.isConfirmed)) {
          try {
              await productoService.delete(id);
              setProducts(products.filter(p => p.id !== id));
              Swal.fire('Eliminado', 'El producto ha sido eliminado.', 'success');
          } catch (error) {
              console.error("Error eliminando producto:", error);
              Swal.fire('Error', 'No se pudo eliminar el producto.', 'error');
          }
      }
  };

  const handleSaveProduct = async (productData) => {
      try {
          // Adaptar datos para el backend
          const payload = {
              nombre: productData.name,
              stock_actual: parseInt(productData.stock),
            stock_minimo: parseInt(productData.minStock),
            descripcion: productData.description, // Asumiendo que el modal enviará description
              precio: parseInt(productData.price),
              costo: parseInt(productData.cost),
              categoria_id: productData.categoryId // El modal debe enviar el ID
          };

          if (editingProduct) {
              // Editar existente
              await productoService.update(editingProduct.id, payload);
              Swal.fire('Actualizado', 'Producto actualizado correctamente.', 'success');
          } else {
              // Crear nuevo
              await productoService.create(payload);
              Swal.fire('Creado', 'Producto creado correctamente.', 'success');
          }
          fetchProducts(); // Recargar lista
          setIsModalOpen(false);
      } catch (error) {
          console.error("Error guardando producto:", error);
          Swal.fire('Error', 'No se pudo guardar el producto.', 'error');
      }
  };

  // Exportar a Excel
  const handleExport = () => {
      const ws = XLSX.utils.json_to_sheet(products.map(p => ({
        ID: p.id,
        Nombre: p.name,
        Categoría: p.category,
          Stock: p.stock,
          'Stock Mínimo': p.minStock
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventario");
      XLSX.writeFile(wb, "Inventario_Syseg.xlsx");
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
              <button 
                  onClick={handleExport}
                  className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                  <Download className="w-4 h-4" />
                  Exportar
              </button>
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
                            <th className="px-6 py-4 w-1/4 align-middle text-center">Producto</th>
                            <th className="px-6 py-4 w-1/6 align-middle text-center">Nivel de Stock</th>
                            <th className="px-6 py-4 w-1/6 align-middle text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200 group-hover:border-red-200 group-hover:bg-red-50 group-hover:text-red-600 transition-all">
                                            <Box className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 mt-1">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {/* DISEÑO STOCK SIN BARRA */}
                                    <div className="flex items-center justify-center max-w-[180px] mx-auto bg-gray-50 rounded-lg p-2 border border-gray-100 gap-4">
                                        <div className="text-left">
                                            <span className="block text-sm font-bold text-gray-900">{item.stock} <span className="text-[10px] text-gray-400 font-normal">unid.</span></span>
                                            <span className="block text-[10px] text-gray-400">Min: {item.minStock}</span>
                                        </div>
                                        {getStockBadge(item.stock, item.minStock)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
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
