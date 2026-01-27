import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';
import Login from './pages/Login';
import DashboardAdmin from './pages/admin/Dashboard';
import InventarioAdmin from './pages/admin/Inventario';
import ReportesAdmin from './pages/admin/Reportes';
import BitacoraAdmin from './pages/admin/Bitacora';
import GuardiasAdmin from './pages/admin/Guardias';
import UsuariosAdmin from './pages/admin/Usuarios';
import BlacklistAdmin from './pages/admin/Blacklist';
import PlaceholderPage from './pages/admin/PlaceholderPage';
import DashboardGuardia from './pages/guardia/DashboardGuardia';

// Componente principal de la aplicación
function App() {
  return (
    <CartProvider>
      <Router>
        <AuthProvider>
          <CartDrawer />
          <Routes>
            {/* Ruta pública: Login */}
            <Route path="/" element={<Login />} />
            
            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />}>
              {/* Rutas de Administración */}
              <Route path="/admin/dashboard" element={<DashboardAdmin />} />
              <Route path="/admin/inventory" element={<InventarioAdmin />} />
              <Route path="/admin/reports" element={<ReportesAdmin />} />
              <Route path="/admin/logs" element={<BitacoraAdmin />} />
              <Route path="/admin/guards" element={<GuardiasAdmin />} />
              <Route path="/admin/users" element={<UsuariosAdmin />} />
              <Route path="/admin/blacklist" element={<BlacklistAdmin />} />
              <Route path="/admin/settings" element={<PlaceholderPage title="Configuración" />} />
              
              {/* Rutas de Guardia */}
              <Route path="/guardia/dashboard" element={<DashboardGuardia />} />
            </Route>
            
            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </CartProvider>
  );
}

export default App;
