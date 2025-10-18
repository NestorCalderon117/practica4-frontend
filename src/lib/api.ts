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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/autenticacion/iniciar-sesion';
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