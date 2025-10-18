'use client';

import { useState, useEffect } from 'react';
import { miCuentaAPI } from '@/lib/api';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  correoVerificado: boolean;
  rol: string;
  creado: string;
  actualizado: string;
}

export default function PerfilUsuario() {
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [correoOriginal, setCorreoOriginal] = useState('');
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  const [mostrarVerificacion, setMostrarVerificacion] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setEstaCargando(true);
      const respuesta = await miCuentaAPI.obtenerPerfil();
      setPerfil(respuesta.usuario);
      setNombre(respuesta.usuario.nombre);
      setApellido(respuesta.usuario.apellido);
      setCorreo(respuesta.usuario.correo);
      setCorreoOriginal(respuesta.usuario.correo);
    } catch (error: unknown) {
      console.error('Error al cargar el perfil:', error);
      setError('Error al cargar el perfil');
    } finally {
      setEstaCargando(false);
    }
  };

  const manejarActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!nombre || !apellido || !correo) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setEstaCargando(true);
      const respuesta = await miCuentaAPI.actualizarPerfil(nombre, apellido, correo);

      if (correo !== correoOriginal) {
        setMostrarVerificacion(true);
        setExito('Perfil actualizado. Se ha enviado un código de verificación a tu nuevo correo.');
      } else {
        setExito(respuesta.mensaje || 'Perfil actualizado exitosamente');
        setPerfil(respuesta.usuario);
        setEditando(false);
      }
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al actualizar el perfil';
      setError(mensajeError || 'Error al actualizar el perfil');
    } finally {
      setEstaCargando(false);
    }
  };

  const manejarVerificarCorreo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!codigoVerificacion || codigoVerificacion.length !== 6) {
      setError('Por favor ingresa un código de 6 dígitos');
      return;
    }

    try {
      setEstaCargando(true);
      const respuesta = await miCuentaAPI.verificarCambioCorreo(codigoVerificacion);
      setExito(respuesta.mensaje || 'Correo verificado exitosamente');
      setMostrarVerificacion(false);
      setCodigoVerificacion('');
      setEditando(false);
      await cargarPerfil();
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Código de verificación inválido';
      setError(mensajeError || 'Código de verificación inválido');
    } finally {
      setEstaCargando(false);
    }
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setMostrarVerificacion(false);
    setNombre(perfil?.nombre || '');
    setApellido(perfil?.apellido || '');
    setCorreo(perfil?.correo || '');
    setCodigoVerificacion('');
    setError('');
    setExito('');
  };

  if (estaCargando && !perfil) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (mostrarVerificacion) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Verificar Nuevo Correo
        </h2>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Se ha enviado un código de verificación a <strong>{correo}</strong>
          </p>
        </div>

        <form onSubmit={manejarVerificarCorreo} className="space-y-6">
          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código de Verificación
            </label>
            <input
              id="codigo"
              type="text"
              maxLength={6}
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
              placeholder="000000"
              value={codigoVerificacion}
              onChange={(e) => setCodigoVerificacion(e.target.value.replace(/\D/g, ''))}
              disabled={estaCargando}
            />
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

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={estaCargando || codigoVerificacion.length !== 6}
              className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {estaCargando ? 'Verificando...' : 'Verificar Código'}
            </button>
            <button
              type="button"
              onClick={cancelarEdicion}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mi Perfil
        </h2>
        {!editando && (
          <button
            onClick={() => setEditando(true)}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Editar
          </button>
        )}
      </div>

      {editando ? (
        <form onSubmit={manejarActualizar} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={estaCargando}
              />
            </div>

            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apellido
              </label>
              <input
                id="apellido"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                disabled={estaCargando}
              />
            </div>
          </div>

          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo Electrónico
            </label>
            <input
              id="correo"
              type="email"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={estaCargando}
            />
            {correo !== correoOriginal && (
              <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Se enviará un código de verificación al nuevo correo
              </p>
            )}
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

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={estaCargando}
              className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {estaCargando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={cancelarEdicion}
              disabled={estaCargando}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Nombre
              </label>
              <p className="text-gray-900 dark:text-white">{perfil?.nombre}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Apellido
              </label>
              <p className="text-gray-900 dark:text-white">{perfil?.apellido}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Correo Electrónico
            </label>
            <p className="text-gray-900 dark:text-white flex items-center gap-2">
              {perfil?.correo}
              {perfil?.correoVerificado && (
                <span className="text-green-600 dark:text-green-400 text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Verificado
                </span>
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Rol
            </label>
            <p className="text-gray-900 dark:text-white">{perfil?.rol}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Fecha de Registro
              </label>
              <p className="text-gray-900 dark:text-white">
                {perfil?.creado ? new Date(perfil.creado).toLocaleDateString('es-ES') : '-'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Última Actualización
              </label>
              <p className="text-gray-900 dark:text-white">
                {perfil?.actualizado ? new Date(perfil.actualizado).toLocaleDateString('es-ES') : '-'}
              </p>
            </div>
          </div>

          {exito && (
            <div className="text-green-600 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
              {exito}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
