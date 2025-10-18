'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PublicRoute from '@/components/PublicRoute';

export default function Verificar() {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [tiempoRestante, setTiempoRestante] = useState(300); // 5 minutos
  const [puedeReenviar, setPuedeReenviar] = useState(false);
  const { verifyCode, resendMFA, isLoading } = useAuth();
  const enrutador = useRouter();
  const parametrosBusqueda = useSearchParams();
  const correo = parametrosBusqueda.get('correo') || '';
  const correoVerificado = parametrosBusqueda.get('verificado') === 'true';

  useEffect(() => {
    if (!correo) {
      enrutador.push('/autenticacion/iniciar-sesion');
      return;
    }

    const temporizador = setInterval(() => {
      setTiempoRestante((anterior) => {
        if (anterior <= 1) {
          clearInterval(temporizador);
          setPuedeReenviar(true);
          return 0;
        }
        // Permitir reenvío después de 1 minuto
        if (anterior === 240) {
          setPuedeReenviar(true);
        }
        return anterior - 1;
      });
    }, 1000);

    return () => clearInterval(temporizador);
  }, [correo, enrutador]);

  const formatearTiempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!codigo || codigo.length !== 6) {
      setError('Por favor ingresa un código de 6 dígitos');
      return;
    }

    try {
      const exitoso = await verifyCode(correo, codigo);
      if (exitoso) {
        enrutador.push('/dashboard');
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        const mensajeError = correoVerificado
          ? 'Código de seguridad inválido o expirado'
          : 'Código de verificación inválido o expirado';
        setError(mensajeError);
      } else {
        setError('Error al verificar el código. Inténtalo de nuevo.');
      }
    }
  };

  const manejarReenviarCodigo = async () => {
    setError('');
    setExito('');

    try {
      const exitoso = await resendMFA(correo);
      if (exitoso) {
        const mensajeExito = correoVerificado
          ? 'Nuevo código de seguridad enviado'
          : 'Nuevo código de verificación enviado';
        setExito(mensajeExito);
        setTiempoRestante(300); // Reiniciar timer a 5 minutos
        setPuedeReenviar(false);
        setCodigo(''); // Limpiar código anterior
      }
    } catch (error: any) {
      setError('Error al enviar el código. Inténtalo de nuevo.');
    }
  };

  const manejarCambioCodigo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCodigo(valor);
  };

  if (!correo) {
    return null;
  }

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {correoVerificado ? 'Código de Seguridad' : 'Verificar Correo'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {correoVerificado
              ? 'Por tu seguridad, ingresa el código enviado a'
              : 'Para completar tu registro, verifica tu correo con el código enviado a'
            }
          </p>
          <p className="font-medium text-blue-600 dark:text-blue-400">
            {correo}
          </p>

          {!correoVerificado && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Tu correo aún no está verificado. Completa este paso para activar tu cuenta.
              </p>
            </div>
          )}

          {correoVerificado && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                🔒 Autenticación de dos factores para proteger tu cuenta.
              </p>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={manejarEnvio}>
          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {correoVerificado ? 'Código de seguridad' : 'Código de verificación'}
            </label>
            <input
              id="codigo"
              name="codigo"
              type="text"
              maxLength={6}
              required
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
              placeholder="123456"
              value={codigo}
              onChange={manejarCambioCodigo}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              {correoVerificado
                ? 'Código de seguridad de 6 dígitos enviado por correo'
                : 'Código de verificación de 6 dígitos enviado por correo'
              }
            </p>
          </div>

          <div className="text-center">
            {tiempoRestante > 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                El código expira en: <span className="font-mono text-blue-600 dark:text-blue-400">{formatearTiempo(tiempoRestante)}</span>
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

          {exito && (
            <div className="text-green-600 text-sm text-center">{exito}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || codigo.length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? (correoVerificado ? 'Autenticando...' : 'Verificando...')
                : (correoVerificado ? 'Confirmar Acceso' : 'Verificar Correo')
              }
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No recibiste el código?
            </p>
            <button
              type="button"
              disabled={!puedeReenviar || isLoading}
              className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              onClick={manejarReenviarCodigo}
            >
              {puedeReenviar ? 'Reenviar código' : `Reenviar en ${formatearTiempo(Math.max(0, 240 - (300 - tiempoRestante)))}`}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/autenticacion/iniciar-sesion"
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
