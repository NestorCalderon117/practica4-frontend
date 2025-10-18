'use client';

import { useState } from 'react';
import { miCuentaAPI } from '@/lib/api';

export default function CambiarContrasenia() {
  const [contraseniaActual, setContraseniaActual] = useState('');
  const [nuevaContrasenia, setNuevaContrasenia] = useState('');
  const [confirmarContrasenia, setConfirmarContrasenia] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [mostrarContrasenias, setMostrarContrasenias] = useState(false);

  const validarPoliticaContrasenia = (contrasenia: string): string[] => {
    const errores: string[] = [];

    if (contrasenia.length < 8) {
      errores.push('Debe tener al menos 8 caracteres');
    }
    if (!/[a-z]/.test(contrasenia)) {
      errores.push('Debe contener al menos una letra minúscula');
    }
    if (!/[A-Z]/.test(contrasenia)) {
      errores.push('Debe contener al menos una letra mayúscula');
    }
    if (!/[0-9]/.test(contrasenia)) {
      errores.push('Debe contener al menos un número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(contrasenia)) {
      errores.push('Debe contener al menos un carácter especial');
    }

    return errores;
  };

  const manejarCambio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!contraseniaActual || !nuevaContrasenia || !confirmarContrasenia) {
      setError('Por favor completa todos los campos');
      return;
    }

    const erroresValidacion = validarPoliticaContrasenia(nuevaContrasenia);
    if (erroresValidacion.length > 0) {
      setError('La nueva contraseña no cumple con los requisitos:\n' + erroresValidacion.join('\n'));
      return;
    }

    if (nuevaContrasenia !== confirmarContrasenia) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (contraseniaActual === nuevaContrasenia) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    try {
      setEstaCargando(true);
      const respuesta = await miCuentaAPI.cambiarContrasenia(
        contraseniaActual,
        nuevaContrasenia,
        confirmarContrasenia
      );

      setExito(respuesta.mensaje || 'Contraseña actualizada exitosamente');
      setContraseniaActual('');
      setNuevaContrasenia('');
      setConfirmarContrasenia('');
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al cambiar la contraseña';
      setError(mensajeError || 'Error al cambiar la contraseña');
    } finally {
      setEstaCargando(false);
    }
  };

  const limpiarFormulario = () => {
    setContraseniaActual('');
    setNuevaContrasenia('');
    setConfirmarContrasenia('');
    setError('');
    setExito('');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Cambiar Contraseña
      </h2>

      <form onSubmit={manejarCambio} className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="contraseniaActual" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contraseña Actual
          </label>
          <input
            id="contraseniaActual"
            type={mostrarContrasenias ? 'text' : 'password'}
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={contraseniaActual}
            onChange={(e) => setContraseniaActual(e.target.value)}
            disabled={estaCargando}
          />
        </div>

        <div>
          <label htmlFor="nuevaContrasenia" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nueva Contraseña
          </label>
          <input
            id="nuevaContrasenia"
            type={mostrarContrasenias ? 'text' : 'password'}
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={nuevaContrasenia}
            onChange={(e) => setNuevaContrasenia(e.target.value)}
            disabled={estaCargando}
          />
        </div>

        <div>
          <label htmlFor="confirmarContrasenia" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirmar Nueva Contraseña
          </label>
          <input
            id="confirmarContrasenia"
            type={mostrarContrasenias ? 'text' : 'password'}
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={confirmarContrasenia}
            onChange={(e) => setConfirmarContrasenia(e.target.value)}
            disabled={estaCargando}
          />
        </div>

        <div className="flex items-center">
          <input
            id="mostrarContrasenias"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={mostrarContrasenias}
            onChange={(e) => setMostrarContrasenias(e.target.checked)}
          />
          <label htmlFor="mostrarContrasenias" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Mostrar contraseñas
          </label>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Requisitos de la contraseña:
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Mínimo 8 caracteres</li>
            <li>• Al menos una letra minúscula</li>
            <li>• Al menos una letra mayúscula</li>
            <li>• Al menos un número</li>
            <li>• Al menos un carácter especial (!@#$%^&*)</li>
            <li>• No puede ser una de tus últimas 5 contraseñas</li>
          </ul>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md whitespace-pre-line">
            {error}
          </div>
        )}

        {exito && (
          <div className="text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
            {exito}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={estaCargando}
            className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {estaCargando ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
          <button
            type="button"
            onClick={limpiarFormulario}
            disabled={estaCargando}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
