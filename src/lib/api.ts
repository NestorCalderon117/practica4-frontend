import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token siendo enviado:', token.substring(0, 20) + '...');
    } else {
      console.warn('No hay token disponible para esta petición');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en respuesta API:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });

    if (error.response?.status === 401) {
      console.warn('Token inválido o expirado (401), redirigiendo a login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/autenticacion/iniciar-sesion';
    } else if (error.response?.status === 403) {
      console.error('Acceso prohibido (403). El usuario no tiene permisos para esta operación.');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (correo: string, contrasenia: string) => {
    const response = await api.post('/auth/login', {
      correo,
      contrasenia,
    });
    return response.data;
  },

  verifyCode: async (correo: string, mfaToken: string) => {
    const response = await api.post('/auth/validate-mfa', {
      correo,
      mfaToken,
    });
    return response.data;
  },

  resendMFA: async (correo: string) => {
    const response = await api.post(`/auth/resend-mfa/${encodeURIComponent(correo)}`);
    return response.data;
  },

  register: async (correo: string, contrasenia: string, nombre: string, apellido: string) => {
    const response = await api.post('/auth/register', {
      nombre,
      apellido,
      correo,
      contrasenia,
    });
    return response.data;
  },

  forgotPassword: async (correo: string) => {
    const response = await api.post('/auth/forgot-password', {
      correo,
    });
    return response.data;
  },

  verifyResetCode: async (correo: string, codigoVerificacion: string) => {
    const response = await api.post('/auth/verify-reset-code', {
      correo,
      codigoVerificacion,
    });
    return response.data;
  },

  resetPassword: async (correo: string, nuevaContrasenia: string) => {
    const response = await api.post(`/auth/reset-password/${encodeURIComponent(correo)}`, {
      nuevaContrasenia,
    });
    return response.data;
  },
};

export const miCuentaAPI = {
  // Perfil
  obtenerPerfil: async () => {
    const response = await api.get('/mi-cuenta/perfil');
    return response.data;
  },

  actualizarPerfil: async (nombre: string, apellido: string, correo: string) => {
    const response = await api.put('/mi-cuenta/perfil', {
      nombre,
      apellido,
      correo,
    });
    return response.data;
  },

  verificarCambioCorreo: async (codigoVerificacion: string) => {
    const response = await api.post('/mi-cuenta/perfil/verificar-correo', {
      codigoVerificacion,
    });
    return response.data;
  },

  // Contraseña
  cambiarContrasenia: async (contraseniaActual: string, nuevaContrasenia: string, confirmarContrasenia: string) => {
    const response = await api.put('/mi-cuenta/contrasenia', {
      contraseniaActual,
      nuevaContrasenia,
      confirmarContrasenia,
    });
    return response.data;
  },

  // MFA
  reenrollMFA: async (tipoDispositivo: string, nombreDispositivo: string) => {
    const response = await api.post('/mi-cuenta/mfa/reenroll', {
      tipoDispositivo,
      nombreDispositivo,
    });
    return response.data;
  },

  obtenerDispositivosMFA: async () => {
    const response = await api.get('/mi-cuenta/mfa/dispositivos');
    return response.data;
  },

  // Sesiones
  obtenerSesiones: async () => {
    const response = await api.get('/mi-cuenta/sesiones');
    return response.data;
  },

  terminarSesion: async (sessionId: string) => {
    const response = await api.delete(`/mi-cuenta/sesiones/${sessionId}`);
    return response.data;
  },

  terminarTodasLasSesiones: async (currentSessionId: string) => {
    const response = await api.delete(`/mi-cuenta/sesiones?currentSessionId=${currentSessionId}`);
    return response.data;
  },

  // Historial
  obtenerHistorial: async (limit: number = 20) => {
    const response = await api.get(`/mi-cuenta/historial?limit=${limit}`);
    return response.data;
  },
};