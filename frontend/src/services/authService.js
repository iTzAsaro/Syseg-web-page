import api from '../api/axios';

const AuthService = {
  /**
   * Inicia sesión en la plataforma web (Administradores/Supervisores).
   * @param {string} email - Correo del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<Object>} Datos del usuario y token.
   */
  loginWeb: async (email, password) => {
    const response = await api.post('/auth/signin/web', {
      email,
      password
    });
    return response.data;
  },

  /**
   * Inicia sesión en la aplicación móvil/operativa (Guardias).
   * @param {string} rut - RUT del guardia.
   * @param {string} password - Contraseña del guardia.
   * @returns {Promise<Object>} Datos del usuario y token.
   */
  loginApp: async (rut, password) => {
    const response = await api.post('/auth/signin/app', {
      rut,
      password
    });
    return response.data;
  },

  /**
   * Cierra la sesión actual (opcional, si el backend tuviera endpoint de logout).
   * Actualmente se maneja en frontend borrando token.
   */
  logout: () => {
    // Si hubiera endpoint: await api.post('/auth/signout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Verifica la validez del token actual con el backend.
   * @returns {Promise<Object>} Datos del usuario actualizados.
   */
  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  }
};

export default AuthService;
