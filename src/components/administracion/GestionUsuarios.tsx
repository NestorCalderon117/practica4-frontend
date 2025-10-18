'use client';

import { useState, useEffect, useCallback } from 'react';
import { administracionAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  Plus,
  UserPlus,
  ArrowRight
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
}

export default function GestionUsuarios() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false);

  // Filtros
  const [rolFiltro, setRolFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Paginación
  const [limite] = useState(10);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [tieneMas, setTieneMas] = useState(false);

  const cargarUsuarios = useCallback(async () => {
    try {
      setEstaCargando(true);
      setError('');

      const filtros: {
        rol?: string;
        estaActivo?: boolean;
        search?: string;
        limit?: number;
        offset?: number;
      } = { limit: limite, offset };

      if (rolFiltro) filtros.rol = rolFiltro;
      if (estadoFiltro) filtros.estaActivo = estadoFiltro === 'true';
      if (busqueda) filtros.search = busqueda;

      const respuesta = await administracionAPI.obtenerUsuarios(filtros);
      setUsuarios(respuesta.usuarios);
      setTotal(respuesta.pagination.total);
      setTieneMas(respuesta.pagination.hasMore);
    } catch (error: unknown) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar los usuarios');
    } finally {
      setEstaCargando(false);
    }
  }, [rolFiltro, estadoFiltro, busqueda, limite, offset]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const limpiarFiltros = () => {
    setRolFiltro('');
    setEstadoFiltro('');
    setBusqueda('');
    setOffset(0);
  };

  const paginaSiguiente = () => {
    if (tieneMas) {
      setOffset(offset + limite);
    }
  };

  const paginaAnterior = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limite));
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const estaBloqueado = (usuario: Usuario): boolean => {
    if (!usuario.bloqueadoHasta) return false;
    return new Date(usuario.bloqueadoHasta) > new Date();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Usuarios
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Administra los usuarios del sistema
          </p>
        </div>
        <button
          onClick={() => setMostrarFormularioNuevo(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Búsqueda
            </label>
            <input
              type="text"
              placeholder="Nombre, apellido o correo..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setOffset(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol
            </label>
            <select
              value={rolFiltro}
              onChange={(e) => {
                setRolFiltro(e.target.value);
                setOffset(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="ADMIN">Admin</option>
              <option value="CLIENTE">Cliente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              value={estadoFiltro}
              onChange={(e) => {
                setEstadoFiltro(e.target.value);
                setOffset(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={limpiarFiltros}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Limpiar Filtros
            </button>
          </div>
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

      {/* Lista de usuarios */}
      {estaCargando && usuarios.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Verificado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {usuarios.map((usuario) => (
                <tr
                  key={usuario.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {usuario.nombre} {usuario.apellido}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {usuario.correo}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      usuario.rol === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {estaBloqueado(usuario) ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        🔒 Bloqueado
                      </span>
                    ) : usuario.estaActivo ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        ✓ Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                        ✗ Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {usuario.correoVerificado ? (
                      <span className="text-green-600 dark:text-green-400">✓</span>
                    ) : (
                      <span className="text-gray-400">✗</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatearFecha(usuario.creado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => router.push(`/administracion/usuarios/${usuario.id}`)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 ml-auto"
                    >
                      Ver detalles
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {total > 0 && (
        <div className="mt-6 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {offset + 1} - {Math.min(offset + limite, total)} de {total} usuarios
          </div>
          <div className="flex gap-2">
            <button
              onClick={paginaAnterior}
              disabled={offset === 0}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <button
              onClick={paginaSiguiente}
              disabled={!tieneMas}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Modal para crear nuevo usuario */}
      {mostrarFormularioNuevo && (
        <NuevoUsuarioModal
          onClose={() => setMostrarFormularioNuevo(false)}
          onSuccess={() => {
            setMostrarFormularioNuevo(false);
            setExito('Usuario creado exitosamente');
            cargarUsuarios();
            setTimeout(() => setExito(''), 3000);
          }}
        />
      )}
    </div>
  );
}

function NuevoUsuarioModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [rol, setRol] = useState('CLIENTE');
  const [error, setError] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombre.trim() || !apellido.trim() || !correo.trim() || !contrasenia.trim()) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (contrasenia.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      setEstaCargando(true);
      await administracionAPI.crearUsuario(nombre, apellido, correo, contrasenia, rol);
      onSuccess();
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al crear el usuario';
      setError(mensajeError || 'Error al crear el usuario');
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
              Nuevo Usuario
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

            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Correo <span className="text-red-500">*</span>
              </label>
              <input
                id="correo"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                disabled={estaCargando}
              />
            </div>

            <div>
              <label htmlFor="contrasenia" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                id="contrasenia"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
                disabled={estaCargando}
              />
            </div>

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

            {error && (
              <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={estaCargando}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {estaCargando ? 'Creando...' : 'Crear Usuario'}
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
