'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

type UserRole = 'ADMIN' | 'CLIENTE';

type User = {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  role: UserRole;
};

type LoginResponse = {
  needsVerification: boolean;
  email: string;
  isEmailVerified: boolean;
  message?: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
  resendMFA: (email: string) => Promise<boolean>;
  register: (email: string, password: string, nombre: string, apellido: string) => Promise<LoginResponse>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      setIsLoading(true);

      const response = await authAPI.login(email, password);

      if (response.statusCode === 200) {
        return {
          needsVerification: true,
          email: response.usuario.correo,
          isEmailVerified: response.usuario.correoVerificado,
          message: response.usuario.correoVerificado
            ? 'Código de seguridad enviado'
            : 'Código de verificación de email enviado'
        };
      }

      return {
        needsVerification: false,
        email: '',
        isEmailVerified: false,
        message: 'Error en el login'
      };
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Error de conexión';
      return {
        needsVerification: false,
        email: '',
        isEmailVerified: false,
        message: errorMessage || 'Error de conexión'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (email: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await authAPI.verifyCode(email, code);

      if (response.statusCode === 200) {
        const userData: User = {
          id: response.usuario.id || '1',
          email: response.usuario.correo,
          nombre: response.usuario.nombre,
          apellido: response.usuario.apellido,
          nombreCompleto: response.usuario.nombreCompleto,
          role: response.usuario.rol
        };

        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        return true;
      }

      return false;
    } catch (error: unknown) {
      console.error('Verify code error:', error);

      // El error específico se manejará en la página de verificación
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendMFA = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await authAPI.resendMFA(email);

      if (response.statusCode === 200) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Resend MFA error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, nombre: string, apellido: string): Promise<LoginResponse> => {
    try {
      setIsLoading(true);

      const response = await authAPI.register(email, password, nombre, apellido);

      if (response.statusCode === 201) {
        return {
          needsVerification: true,
          email: response.usuario.correo,
          isEmailVerified: false, // Nuevo usuario siempre necesita verificar email
          message: 'Registro exitoso. Código de verificación de email enviado'
        };
      }

      return {
        needsVerification: false,
        email: '',
        isEmailVerified: false,
        message: 'Error en el registro'
      };
    } catch (error: unknown) {
      console.error('Register error:', error);

      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 409) {
          return {
            needsVerification: false,
            email: '',
            isEmailVerified: false,
            message: 'Este correo ya está registrado. Por favor inicia sesión.'
          };
        }

        return {
          needsVerification: false,
          email: '',
          isEmailVerified: false,
          message: axiosError.response?.data?.message || 'Error de conexión'
        };
      }

      return {
        needsVerification: false,
        email: '',
        isEmailVerified: false,
        message: 'Error de conexión'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    verifyCode,
    resendMFA,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};