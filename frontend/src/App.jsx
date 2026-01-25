import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import Login from './pages/Login';
import DashboardAdmin from './pages/admin/Dashboard';
import InventarioAdmin from './pages/admin/Inventario';
import ReportesAdmin from './pages/admin/Reportes';
import DashboardGuardia from './pages/guardia/DashboardGuardia';

// Componente principal de la aplicación
function App() {
  return (
    <CartProvider>
      <Router>
        <CartDrawer />
        <Routes>
          {/* Ruta para el Login como punto de entrada */}
          <Route path="/" element={<Login />} />
          
          {/* Rutas de Administración */}
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/inventory" element={<InventarioAdmin />} />
          <Route path="/admin/reports" element={<ReportesAdmin />} />
          
          {/* Rutas de Guardia */}
          <Route path="/guardia/dashboard" element={<DashboardGuardia />} />
          
          {/* Redirección por defecto si la ruta no existe (Opcional) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
