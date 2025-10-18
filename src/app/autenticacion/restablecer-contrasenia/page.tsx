'use client';

import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PublicRoute from '@/components/PublicRoute';

export default function RestablecerContrasenia() {
  const [correo, setCorreo] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [confirmarContrasenia, setConfirmarContrasenia] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const enrutador = useRouter();
  const parametrosBusqueda = useSearchParams();

  useEffect(() => {
    const correoDesdeUrl = parametrosBusqueda.get('correo');
    if (correoDesdeUrl) {
      setCorreo(decodeURIComponent(correoDesdeUrl));
    } else {
      setError('No se encontró el correo electrónico. Por favor inicia el proceso de recuperación nuevamente.');
    }
  }, [parametrosBusqueda]);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!correo || !contrasenia || !confirmarContrasenia) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (contrasenia.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (contrasenia !== confirmarContrasenia) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setEstaCargando(true);
      const respuesta = await authAPI.resetPassword(correo, contrasenia);

      if (respuesta.statusCode === 200) {
        setExito(respuesta.message);
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          enrutador.push('/autenticacion/iniciar-sesion');
        }, 2000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al actualizar la contraseña');
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
              Nueva Contraseña
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Ingresa tu nueva contraseña
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
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  value={correo}
                  disabled
                />
              </div>
              <div>
                <label htmlFor="contrasenia" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nueva contraseña
                </label>
                <input
                  id="contrasenia"
                  name="contrasenia"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Ingresa tu nueva contraseña"
                  value={contrasenia}
                  onChange={(e) => setContrasenia(e.target.value)}
                  disabled={estaCargando}
                />
              </div>
              <div>
                <label htmlFor="confirmarContrasenia" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmarContrasenia"
                  name="confirmarContrasenia"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirma tu nueva contraseña"
                  value={confirmarContrasenia}
                  onChange={(e) => setConfirmarContrasenia(e.target.value)}
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
                {estaCargando ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>

            <div className="text-center">
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
              Requisitos de la contraseña:
            </h3>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <div>• Mínimo 8 caracteres</div>
              <div>• Debe contener letras y números</div>
              <div>• Se recomienda usar mayúsculas, minúsculas y símbolos</div>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
