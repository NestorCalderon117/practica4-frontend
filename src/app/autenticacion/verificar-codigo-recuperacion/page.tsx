'use client';

import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PublicRoute from '@/components/PublicRoute';

export default function VerificarCodigoRecuperacion() {
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const enrutador = useRouter();
  const parametrosBusqueda = useSearchParams();

  useEffect(() => {
    const correoDesdeUrl = parametrosBusqueda.get('correo');
    if (correoDesdeUrl) {
      setCorreo(decodeURIComponent(correoDesdeUrl));
    }
  }, [parametrosBusqueda]);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!correo || !codigo) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (codigo.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    try {
      setEstaCargando(true);
      const respuesta = await authAPI.verifyResetCode(correo, codigo);

      if (respuesta.statusCode === 200) {
        setExito(respuesta.message);
        // Redirigir a la página de reseteo de contraseña después de 1 segundo
        setTimeout(() => {
          enrutador.push(`/autenticacion/restablecer-contrasenia?correo=${encodeURIComponent(correo)}`);
        }, 1000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Código de verificación inválido o expirado');
    } finally {
      setEstaCargando(false);
    }
  };

  const manejarReenviarCodigo = async () => {
    if (!correo) {
      setError('No se encontró el correo electrónico');
      return;
    }

    try {
      setEstaCargando(true);
      setError('');
      setExito('');

      const respuesta = await authAPI.forgotPassword(correo);

      if (respuesta.statusCode === 200) {
        setExito('Se ha enviado un nuevo código a tu correo');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al reenviar el código');
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Verificar Código
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Ingresa el código de 6 dígitos que enviamos a tu correo
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={manejarEnvio}>
            <div className="space-y-4">
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Correo electrónico
                </label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Correo electrónico"
                  value={correo}
                  disabled
                />
              </div>
              <div>
                <label htmlFor="codigo" className="sr-only">
                  Código de verificación
                </label>
                <input
                  id="codigo"
                  name="codigo"
                  type="text"
                  required
                  maxLength={6}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                  placeholder="000000"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                  disabled={estaCargando}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            {exito && (
              <div className="text-green-600 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                {exito}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={estaCargando}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {estaCargando ? 'Verificando...' : 'Verificar Código'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={manejarReenviarCodigo}
                disabled={estaCargando}
                className="font-medium text-blue-600 hover:text-blue-500 text-sm disabled:opacity-50"
              >
                Reenviar código
              </button>
              <Link
                href="/autenticacion/iniciar-sesion"
                className="font-medium text-blue-600 hover:text-blue-500 text-sm"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Información:
            </h3>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div>• El código tiene 6 dígitos numéricos</div>
              <div>• Revisa tu bandeja de entrada y spam</div>
              <div>• El código expira en 5 minutos</div>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
