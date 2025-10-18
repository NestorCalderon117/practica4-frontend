'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { administracionAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
  estaActivo: boolean;
  correoVerificado: boolean;
  intentosFallidos: number;
  bloqueadoHasta: string | null;
  creado: string;
  actualizado: string;
  _count?: {
    tickets: number;
    sesiones: number;
    historialActividad: number;
  };
}

function DetalleUsuarioPage() {
  const params = useParams();
  const router = useRouter();
  const usuarioId = params.id as string;

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Campos editables
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [rol, setRol] = useState('');
  const [estaActivo, setEstaActivo] = useState(true);

  // Bloqueo
  const [mostrarModalBloqueo, setMostrarModalBloqueo] = useState(false);

  const cargarUsuario = useCallback(async () => {
    try {
      setEstaCargando(true);
      setError('');
      const respuesta = await administracionAPI.obtenerUsuario(usuarioId);
      setUsuario(respuesta.usuario);

      // Inicializar campos de edición
      setNombre(respuesta.usuario.nombre);
      setApellido(respuesta.usuario.apellido);
      setRol(respuesta.usuario.rol);
      setEstaActivo(respuesta.usuario.estaActivo);
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al cargar el usuario';
      setError(mensajeError || 'Error al cargar el usuario');
    } finally {
      setEstaCargando(false);
    }
  }, [usuarioId]);

  useEffect(() => {
    cargarUsuario();
  }, [cargarUsuario]);

  const manejarActualizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    try {
      setEstaCargando(true);

      const datos: {
        nombre?: string;
        apellido?: string;
        rol?: string;
        estaActivo?: boolean;
      } = {};

      if (nombre !== usuario?.nombre) datos.nombre = nombre;
      if (apellido !== usuario?.apellido) datos.apellido = apellido;
      if (rol !== usuario?.rol) datos.rol = rol;
      if (estaActivo !== usuario?.estaActivo) datos.estaActivo = estaActivo;

      if (Object.keys(datos).length === 0) {
        setError('No hay cambios para guardar');
        return;
      }

      const respuesta = await administracionAPI.actualizarUsuario(usuarioId, datos);
      setUsuario(respuesta.usuario);
      setExito('Usuario actualizado exitosamente');
      setModoEdicion(false);
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al actualizar el usuario';
      setError(mensajeError || 'Error al actualizar el usuario');
    } finally {
      setEstaCargando(false);
    }
  };

  const manejarDesbloqueo = async () => {
    if (!confirm('¿Estás seguro de que deseas desbloquear este usuario?')) {
      return;
    }

    try {
      setEstaCargando(true);
      setError('');
      const respuesta = await administracionAPI.desbloquearUsuario(usuarioId);
      setExito(respuesta.mensaje || 'Usuario desbloqueado exitosamente');
      await cargarUsuario();
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al desbloquear el usuario';
      setError(mensajeError || 'Error al desbloquear el usuario');
    } finally {
      setEstaCargando(false);
    }
  };

  const manejarResetMFA = async () => {
    if (!confirm('¿Estás seguro de que deseas resetear el MFA de este usuario? El usuario deberá reconfigurar MFA en su próximo login.')) {
      return;
    }

    try {
      setEstaCargando(true);
      setError('');
      const respuesta = await administracionAPI.resetearMFA(usuarioId);
      setExito(respuesta.mensaje || 'MFA reseteado exitosamente');
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al resetear MFA';
      setError(mensajeError || 'Error al resetear MFA');
    } finally {
      setEstaCargando(false);
    }
  };

  const cancelarEdicion = () => {
    if (usuario) {
      setNombre(usuario.nombre);
      setApellido(usuario.apellido);
      setRol(usuario.rol);
      setEstaActivo(usuario.estaActivo);
    }
    setModoEdicion(false);
    setError('');
    setExito('');
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const estaBloqueado = (usuario: Usuario): boolean => {
    if (!usuario.bloqueadoHasta) return false;
    return new Date(usuario.bloqueadoHasta) > new Date();
  };

  if (estaCargando && !usuario) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !usuario) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push('/administracion')}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver a Administración
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/administracion')}
              className="text-blue-600 dark:text-blue-400 hover:underline mb-4 flex items-center gap-1"
            >
              ← Volver a Administración
            </button>

            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Detalle del Usuario
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {usuario?.id.substring(0, 8)}...
                </p>
              </div>

              {!modoEdicion && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setModoEdicion(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mensajes */}
          {error && (
            <div className="mb-4 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              {error}
            </div>
          )}

          {exito && (
            <div className="mb-4 text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
              {exito}
            </div>
          )}

          {/* Contenido */}
          {usuario && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {modoEdicion ? (
                // Modo Edición
                <form onSubmit={manejarActualizacion} className="p-6 space-y-4">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      disabled={estaCargando}
                    />
                  </div>

                  <div>
                    <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="apellido"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      disabled={estaCargando}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="rol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rol
                      </label>
                      <select
                        id="rol"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={rol}
                        onChange={(e) => setRol(e.target.value)}
                        disabled={estaCargando}
                      >
                        <option value="CLIENTE">Cliente</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="estaActivo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Estado
                      </label>
                      <select
                        id="estaActivo"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={estaActivo.toString()}
                        onChange={(e) => setEstaActivo(e.target.value === 'true')}
                        disabled={estaCargando}
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="submit"
                      disabled={estaCargando}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {estaCargando ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      disabled={estaCargando}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                // Modo Vista
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {usuario.nombre} {usuario.apellido}
                    </h2>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        usuario.rol === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {usuario.rol}
                      </span>
                      {estaBloqueado(usuario) ? (
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          🔒 Bloqueado
                        </span>
                      ) : usuario.estaActivo ? (
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          ✓ Activo
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                          ✗ Inactivo
                        </span>
                      )}
                      {usuario.correoVerificado && (
                        <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          ✓ Correo Verificado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Información Personal
                      </h3>
                      <div className="space-y-2 text-sm text-gray-900 dark:text-white">
                        <p><strong>Correo:</strong> {usuario.correo}</p>
                        <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}</p>
                        <p><strong>Intentos fallidos:</strong> {usuario.intentosFallidos}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fechas
                      </h3>
                      <div className="space-y-2 text-sm text-gray-900 dark:text-white">
                        <p><strong>Creado:</strong> {formatearFecha(usuario.creado)}</p>
                        <p><strong>Actualizado:</strong> {formatearFecha(usuario.actualizado)}</p>
                        {usuario.bloqueadoHasta && (
                          <p><strong>Bloqueado hasta:</strong> {formatearFecha(usuario.bloqueadoHasta)}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {usuario._count && (
                    <div className="mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Estadísticas
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {usuario._count.tickets}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Tickets</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {usuario._count.sesiones}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Sesiones</div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {usuario._count.historialActividad}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Actividades</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Acciones Administrativas
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {estaBloqueado(usuario) ? (
                        <button
                          onClick={manejarDesbloqueo}
                          disabled={estaCargando}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <Unlock className="w-4 h-4" />
                          Desbloquear Usuario
                        </button>
                      ) : (
                        <button
                          onClick={() => setMostrarModalBloqueo(true)}
                          disabled={estaCargando}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          Bloquear Usuario
                        </button>
                      )}
                      <button
                        onClick={manejarResetMFA}
                        disabled={estaCargando}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reset MFA
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Bloqueo */}
      {mostrarModalBloqueo && usuario && (
        <ModalBloqueo
          usuarioId={usuario.id}
          onClose={() => setMostrarModalBloqueo(false)}
          onSuccess={() => {
            setMostrarModalBloqueo(false);
            setExito('Usuario bloqueado exitosamente');
            cargarUsuario();
          }}
        />
      )}
    </ProtectedRoute>
  );
}

function ModalBloqueo({
  usuarioId,
  onClose,
  onSuccess,
}: {
  usuarioId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [razon, setRazon] = useState('');
  const [duracion, setDuracion] = useState('permanent');
  const [error, setError] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!razon.trim()) {
      setError('La razón del bloqueo es requerida');
      return;
    }

    try {
      setEstaCargando(true);
      await administracionAPI.bloquearUsuario(usuarioId, razon, duracion);
      onSuccess();
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al bloquear el usuario';
      setError(mensajeError || 'Error al bloquear el usuario');
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Bloquear Usuario
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={manejarEnvio} className="space-y-4">
            <div>
              <label htmlFor="razon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Razón del bloqueo <span className="text-red-500">*</span>
              </label>
              <textarea
                id="razon"
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={razon}
                onChange={(e) => setRazon(e.target.value)}
                disabled={estaCargando}
                placeholder="Describe la razón del bloqueo..."
              />
            </div>

            <div>
              <label htmlFor="duracion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duración del bloqueo
              </label>
              <select
                id="duracion"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                disabled={estaCargando}
              >
                <option value="1h">1 hora</option>
                <option value="24h">24 horas</option>
                <option value="7d">7 días</option>
                <option value="permanent">Permanente</option>
              </select>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={estaCargando}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {estaCargando ? 'Bloqueando...' : 'Bloquear Usuario'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={estaCargando}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function DetalleUsuarioPageWrapper() {
  return <DetalleUsuarioPage />;
}
