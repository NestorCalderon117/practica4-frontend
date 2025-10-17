'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PublicRoute from '@/components/PublicRoute';

export default function VerifyCode() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [canResend, setCanResend] = useState(false);
  const { verifyCode, resendMFA, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const isEmailVerified = searchParams.get('verified') === 'true';

  useEffect(() => {
    if (!email) {
      router.push('/auth/login');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        // Permitir reenvío después de 1 minuto
        if (prev === 240) {
          setCanResend(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code || code.length !== 6) {
      setError('Por favor ingresa un código de 6 dígitos');
      return;
    }

    try {
      const isSuccess = await verifyCode(email, code);
      if (isSuccess) {
        router.push('/dashboard');
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMessage = isEmailVerified
          ? 'Código de seguridad inválido o expirado'
          : 'Código de verificación inválido o expirado';
        setError(errorMessage);
      } else {
        setError('Error al verificar el código. Inténtalo de nuevo.');
      }
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');

    try {
      const isSuccess = await resendMFA(email);
      if (isSuccess) {
        const successMessage = isEmailVerified
          ? 'Nuevo código de seguridad enviado'
          : 'Nuevo código de verificación enviado';
        setSuccess(successMessage);
        setTimeLeft(300); // Reiniciar timer a 5 minutos
        setCanResend(false);
        setCode(''); // Limpiar código anterior
      }
    } catch (error: any) {
      setError('Error al enviar el código. Inténtalo de nuevo.');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(value);
  };

  if (!email) {
    return null;
  }

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {isEmailVerified ? 'Código de Seguridad' : 'Verificar Email'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isEmailVerified
              ? 'Por tu seguridad, ingresa el código enviado a'
              : 'Para completar tu registro, verifica tu email con el código enviado a'
            }
          </p>
          <p className="font-medium text-blue-600 dark:text-blue-400">
            {email}
          </p>

          {!isEmailVerified && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Tu email aún no está verificado. Completa este paso para activar tu cuenta.
              </p>
            </div>
          )}

          {isEmailVerified && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                🔒 Autenticación de dos factores para proteger tu cuenta.
              </p>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isEmailVerified ? 'Código de seguridad' : 'Código de verificación'}
            </label>
            <input
              id="code"
              name="code"
              type="text"
              maxLength={6}
              required
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
              placeholder="123456"
              value={code}
              onChange={handleCodeChange}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              {isEmailVerified
                ? 'Código de seguridad de 6 dígitos enviado por email'
                : 'Código de verificación de 6 dígitos enviado por email'
              }
            </p>
          </div>

          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                El código expira en: <span className="font-mono text-blue-600 dark:text-blue-400">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-sm text-red-600">
                El código ha expirado. Solicita uno nuevo.
              </p>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {success && (
            <div className="text-green-600 text-sm text-center">{success}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? (isEmailVerified ? 'Autenticando...' : 'Verificando...')
                : (isEmailVerified ? 'Confirmar Acceso' : 'Verificar Email')
              }
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No recibiste el código?
            </p>
            <button
              type="button"
              disabled={!canResend || isLoading}
              className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              onClick={handleResendCode}
            >
              {canResend ? 'Reenviar código' : `Reenviar en ${formatTime(Math.max(0, 240 - (300 - timeLeft)))}`}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ← Volver al login
            </Link>
          </div>
        </form>
      </div>
      </div>
    </PublicRoute>
  );
}