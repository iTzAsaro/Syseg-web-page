import axios from 'axios';
import Swal from 'sweetalert2';

// Configuración de la instancia de Axios para peticiones HTTP
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // URL base del backend
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores globales
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Evitar bucles de redirección si ya estamos en login
      if (window.location.pathname !== '/') {
        Swal.fire({
          title: 'Sesión Expirada',
          text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          icon: 'warning',
          confirmButtonText: 'Ir al Login'
        }).then(() => {
           window.location.href = '/';
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
