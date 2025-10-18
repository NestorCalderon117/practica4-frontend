'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PublicRoute from '@/components/PublicRoute';

export default function Registrarse() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [confirmarContrasenia, setConfirmarContrasenia] = useState('');
  const [error, setError] = useState('');
  const [correoYaExiste, setCorreoYaExiste] = useState(false);
  const { register, isLoading } = useAuth();
  const enrutador = useRouter();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCorreoYaExiste(false);

    if (!nombre || !apellido || !correo || !contrasenia || !confirmarContrasenia) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (contrasenia !== confirmarContrasenia) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (contrasenia.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const resultado = await register(correo, contrasenia, nombre, apellido);

    if (resultado.needsVerification) {
      // Redirigir a la página de verificación con el email y estado de verificación
      enrutador.push(`/autenticacion/verificar?correo=${encodeURIComponent(resultado.email)}&verificado=${resultado.isEmailVerified}`);
    } else {
      const correoExiste = resultado.message?.includes('ya está registrado');
      setCorreoYaExiste(correoExiste || false);
      setError(resultado.message || 'Error al crear la cuenta');
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link
              href="/autenticacion/iniciar-sesion"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={manejarEnvio}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="given-name"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Apellido
                </label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  autoComplete="family-name"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tu apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="tu@email.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="contrasenia" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <input
                id="contrasenia"
                name="contrasenia"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Mínimo 6 caracteres"
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmarContrasenia" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmar contraseña
              </label>
              <input
                id="confirmarContrasenia"
                name="confirmarContrasenia"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Repite tu contraseña"
                value={confirmarContrasenia}
                onChange={(e) => setConfirmarContrasenia(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
              {correoYaExiste && (
                <div className="mt-2">
                  <Link
                    href="/autenticacion/iniciar-sesion"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Ir a iniciar sesión →
                  </Link>
                </div>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Volver al inicio
            </Link>
          </div>
        </form>
      </div>
      </div>
    </PublicRoute>
  );
}
