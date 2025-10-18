'use client';

import { useState, useEffect, useCallback, ReactElement } from 'react';
import { administracionAPI } from '@/lib/api';
import {
  Unlock,
  XCircle,
  Mail,
  CheckCircle,
  UserPlus,
  RefreshCw,
  Lock,
  CheckSquare,
  User,
  Key,
  Ticket,
  Edit,
  Trash2,
  DoorOpen,
  Ban,
  Smartphone,
  MapPin,
  Clock as ClockIcon,
  EyeOff,
  Eye
} from 'lucide-react';

interface Actividad {
  id: string;
  tipo: string;
  descripcion: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  fecha: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    correo: string;
    rol: string;
  };
  admin: {
    id: string;
    nombre: string;
    apellido: string;
    correo: string;
  } | null;
}

interface Estadisticas {
  total: number;
  porTipo: Record<string, number>;
  eventosPorDia: Array<{
    fecha: string;
    cantidad: number;
  }>;
}

export default function Auditoria() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [error, setError] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(true);

  // Filtros
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [fechaDesdeFiltro, setFechaDesdeFiltro] = useState('');
  const [fechaHastaFiltro, setFechaHastaFiltro] = useState('');

  // Paginación
  const [limite] = useState(20);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [tieneMas, setTieneMas] = useState(false);

  const tiposEvento = [
    { value: 'LOGIN_SUCCESS', label: 'Login Exitoso' },
    { value: 'LOGIN_FAILED', label: 'Login Fallido' },
    { value: 'MFA_SENT', label: 'Código MFA Enviado' },
    { value: 'MFA_SUCCESS', label: 'MFA Exitoso' },
    { value: 'MFA_FAILED', label: 'MFA Fallido' },
    { value: 'USER_CREATED', label: 'Usuario Creado' },
    { value: 'ROLE_CHANGED', label: 'Rol Cambiado' },
    { value: 'ACCOUNT_LOCKED', label: 'Cuenta Bloqueada' },
    { value: 'ACCOUNT_UNLOCKED', label: 'Cuenta Desbloqueada' },
    { value: 'MFA_RESET', label: 'MFA Reseteado' },
    { value: 'PROFILE_UPDATED', label: 'Perfil Actualizado' },
    { value: 'PASSWORD_CHANGED', label: 'Contraseña Cambiada' },
    { value: 'EMAIL_CHANGED', label: 'Correo Cambiado' },
    { value: 'EMAIL_VERIFIED', label: 'Correo Verificado' },
    { value: 'TICKET_CREATED', label: 'Ticket Creado' },
    { value: 'TICKET_UPDATED', label: 'Ticket Actualizado' },
    { value: 'TICKET_DELETED', label: 'Ticket Eliminado' },
    { value: 'SESSION_TERMINATED', label: 'Sesión Terminada' },
    { value: 'ALL_SESSIONS_TERMINATED', label: 'Todas las Sesiones Terminadas' },
    { value: 'MFA_REENROLL', label: 'Dispositivo MFA Registrado' },
  ];

  const cargarActividades = useCallback(async () => {
    try {
      setEstaCargando(true);
      setError('');

      const filtros: {
        tipo?: string;
        fechaDesde?: string;
        fechaHasta?: string;
        limit?: number;
        offset?: number;
      } = { limit: limite, offset };

      if (tipoFiltro) filtros.tipo = tipoFiltro;
      if (fechaDesdeFiltro) filtros.fechaDesde = new Date(fechaDesdeFiltro).toISOString();
      if (fechaHastaFiltro) filtros.fechaHasta = new Date(fechaHastaFiltro).toISOString();

      const respuesta = await administracionAPI.obtenerAuditoria(filtros);
      setActividades(respuesta.actividades);
      setTotal(respuesta.pagination.total);
      setTieneMas(respuesta.pagination.hasMore);
    } catch (error: unknown) {
      console.error('Error al cargar auditoría:', error);
      setError('Error al cargar el historial de auditoría');
    } finally {
      setEstaCargando(false);
    }
  }, [tipoFiltro, fechaDesdeFiltro, fechaHastaFiltro, limite, offset]);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const respuesta = await administracionAPI.obtenerEstadisticasAuditoria();
      setEstadisticas(respuesta.estadisticas);
    } catch (error: unknown) {
      console.error('Error al cargar estadísticas:', error);
    }
  }, []);

  useEffect(() => {
    cargarActividades();
    cargarEstadisticas();
  }, [cargarActividades, cargarEstadisticas]);

  const limpiarFiltros = () => {
    setTipoFiltro('');
    setFechaDesdeFiltro('');
    setFechaHastaFiltro('');
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
      second: '2-digit',
    });
  };

  const obtenerIconoTipo = (tipo: string) => {
    const iconos: Record<string, ReactElement> = {
      LOGIN_SUCCESS: <Unlock className="w-5 h-5" />,
      LOGIN_FAILED: <XCircle className="w-5 h-5" />,
      MFA_SENT: <Mail className="w-5 h-5" />,
      MFA_SUCCESS: <CheckCircle className="w-5 h-5" />,
      MFA_FAILED: <XCircle className="w-5 h-5" />,
      USER_CREATED: <UserPlus className="w-5 h-5" />,
      ROLE_CHANGED: <RefreshCw className="w-5 h-5" />,
      ACCOUNT_LOCKED: <Lock className="w-5 h-5" />,
      ACCOUNT_UNLOCKED: <Unlock className="w-5 h-5" />,
      MFA_RESET: <RefreshCw className="w-5 h-5" />,
      PROFILE_UPDATED: <User className="w-5 h-5" />,
      PASSWORD_CHANGED: <Key className="w-5 h-5" />,
      EMAIL_CHANGED: <Mail className="w-5 h-5" />,
      EMAIL_VERIFIED: <CheckSquare className="w-5 h-5" />,
      TICKET_CREATED: <Ticket className="w-5 h-5" />,
      TICKET_UPDATED: <Edit className="w-5 h-5" />,
      TICKET_DELETED: <Trash2 className="w-5 h-5" />,
      SESSION_TERMINATED: <DoorOpen className="w-5 h-5" />,
      ALL_SESSIONS_TERMINATED: <Ban className="w-5 h-5" />,
      MFA_REENROLL: <Smartphone className="w-5 h-5" />,
    };
    return iconos[tipo] || <Edit className="w-5 h-5" />;
  };

  const obtenerColorTipo = (tipo: string): string => {
    if (tipo.includes('FAILED') || tipo.includes('LOCKED') || tipo.includes('DELETED')) {
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    }
    if (tipo.includes('SUCCESS') || tipo.includes('VERIFIED') || tipo.includes('CREATED')) {
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    }
    if (tipo.includes('CHANGED') || tipo.includes('UPDATED') || tipo.includes('RESET')) {
      return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
    }
    return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
  };

  const formatearTipo = (tipo: string): string => {
    const tipoEncontrado = tiposEvento.find((t) => t.value === tipo);
    return tipoEncontrado ? tipoEncontrado.label : tipo;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Auditoría del Sistema
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Historial completo de eventos y acciones
          </p>
        </div>
        <button
          onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {mostrarEstadisticas ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {mostrarEstadisticas ? 'Ocultar' : 'Mostrar'} Estadísticas
        </button>
      </div>

      {/* Estadísticas */}
      {mostrarEstadisticas && estadisticas && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total de Eventos</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {estadisticas.total.toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">Logins Exitosos</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {(estadisticas.porTipo.LOGIN_SUCCESS || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">Logins Fallidos</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {(estadisticas.porTipo.LOGIN_FAILED || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">Usuarios Creados</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(estadisticas.porTipo.USER_CREATED || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Top eventos */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Top 10 Eventos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(estadisticas.porTipo)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 10)
                .map(([tipo, cantidad]) => (
                  <div key={tipo} className="text-xs">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {cantidad as number}
                    </span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatearTipo(tipo)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Evento
            </label>
            <select
              value={tipoFiltro}
              onChange={(e) => {
                setTipoFiltro(e.target.value);
                setOffset(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Todos</option>
              {tiposEvento.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Desde
            </label>
            <input
              type="date"
              value={fechaDesdeFiltro}
              onChange={(e) => {
                setFechaDesdeFiltro(e.target.value);
                setOffset(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={fechaHastaFiltro}
              onChange={(e) => {
                setFechaHastaFiltro(e.target.value);
                setOffset(0);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={limpiarFiltros}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Lista de actividades */}
      {estaCargando && actividades.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : actividades.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No se encontraron eventos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actividades.map((actividad) => (
            <div
              key={actividad.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${obtenerColorTipo(actividad.tipo)}`}>
                  {obtenerIconoTipo(actividad.tipo)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatearTipo(actividad.tipo)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {actividad.descripcion}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatearFecha(actividad.fecha)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <strong>Usuario:</strong> {actividad.usuario.nombre} {actividad.usuario.apellido} ({actividad.usuario.correo})
                    </span>
                    {actividad.admin && (
                      <span className="flex items-center gap-1">
                        <strong>Admin:</strong> {actividad.admin.nombre} {actividad.admin.apellido}
                      </span>
                    )}
                    {actividad.ipAddress && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {actividad.ipAddress}
                      </span>
                    )}
                  </div>

                  {actividad.metadata && Object.keys(actividad.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                        Ver metadatos
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                        {JSON.stringify(actividad.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {total > 0 && (
        <div className="mt-6 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {offset + 1} - {Math.min(offset + limite, total)} de {total} eventos
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
    </div>
  );
}
