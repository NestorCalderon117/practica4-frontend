'use client';

import { useState, useEffect, useCallback, ReactElement } from 'react';
import { miCuentaAPI } from '@/lib/api';
import {
  Unlock,
  CheckCircle,
  XCircle,
  User,
  Lock,
  Mail,
  CheckSquare,
  DoorOpen,
  Ban,
  Smartphone,
  MapPin,
  Globe,
  Info
} from 'lucide-react';

interface Actividad {
  id: string;
  tipo: string;
  descripcion: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
  fecha: string;
}

export default function HistorialActividad() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [error, setError] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [limite, setLimite] = useState(20);

  const cargarHistorial = useCallback(async () => {
    try {
      setEstaCargando(true);
      setError('');
      const respuesta = await miCuentaAPI.obtenerHistorial(limite);
      setActividades(respuesta.actividades);
    } catch (error: unknown) {
      console.error('Error al cargar el historial de actividad:', error);
      setError('Error al cargar el historial de actividad');
    } finally {
      setEstaCargando(false);
    }
  }, [limite]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  const obtenerIconoTipo = (tipo: string) => {
    const iconos: Record<string, ReactElement> = {
      LOGIN: <Unlock className="w-5 h-5" />,
      MFA_SUCCESS: <CheckCircle className="w-5 h-5" />,
      MFA_FAILED: <XCircle className="w-5 h-5" />,
      PROFILE_UPDATE: <User className="w-5 h-5" />,
      PASSWORD_CHANGE: <Lock className="w-5 h-5" />,
      EMAIL_CHANGE: <Mail className="w-5 h-5" />,
      EMAIL_VERIFIED: <CheckSquare className="w-5 h-5" />,
      SESSION_TERMINATED: <DoorOpen className="w-5 h-5" />,
      ALL_SESSIONS_TERMINATED: <Ban className="w-5 h-5" />,
      MFA_REENROLL: <Smartphone className="w-5 h-5" />,
    };
    return iconos[tipo] || <User className="w-5 h-5" />;
  };

  const obtenerColorTipo = (tipo: string): string => {
    const colores: Record<string, string> = {
      LOGIN: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
      MFA_SUCCESS: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      MFA_FAILED: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
      PROFILE_UPDATE: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
      PASSWORD_CHANGE: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
      EMAIL_CHANGE: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
      EMAIL_VERIFIED: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
      SESSION_TERMINATED: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20',
      ALL_SESSIONS_TERMINATED: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
      MFA_REENROLL: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
    };
    return colores[tipo] || 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
  };

  const formatearTipo = (tipo: string): string => {
    const tipos: Record<string, string> = {
      LOGIN: 'Inicio de sesión',
      MFA_SUCCESS: 'MFA exitoso',
      MFA_FAILED: 'MFA fallido',
      PROFILE_UPDATE: 'Actualización de perfil',
      PASSWORD_CHANGE: 'Cambio de contraseña',
      EMAIL_CHANGE: 'Cambio de correo',
      EMAIL_VERIFIED: 'Correo verificado',
      SESSION_TERMINATED: 'Sesión terminada',
      ALL_SESSIONS_TERMINATED: 'Todas las sesiones terminadas',
      MFA_REENROLL: 'Re-enrolamiento MFA',
    };
    return tipos[tipo] || tipo;
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMs / 3600000);
    const diffDias = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    if (diffDias < 7) return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;

    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (estaCargando && actividades.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Historial de Actividad
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Registro de las últimas actividades de tu cuenta
          </p>
        </div>
        <select
          value={limite}
          onChange={(e) => setLimite(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value={10}>Últimas 10</option>
          <option value={20}>Últimas 20</option>
          <option value={50}>Últimas 50</option>
          <option value={100}>Últimas 100</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}
        </div>
      )}

      {actividades.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No hay actividades registradas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actividades.map((actividad) => (
            <div
              key={actividad.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${obtenerColorTipo(actividad.tipo)}`}>
                  {obtenerIconoTipo(actividad.tipo)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
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

                  {(actividad.ipAddress || actividad.userAgent) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {actividad.ipAddress && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {actividad.ipAddress}
                        </span>
                      )}
                      {actividad.userAgent && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {actividad.userAgent.includes('Chrome') ? 'Chrome' :
                           actividad.userAgent.includes('Firefox') ? 'Firefox' :
                           actividad.userAgent.includes('Safari') ? 'Safari' :
                           actividad.userAgent.includes('Edge') ? 'Edge' : 'Navegador'}
                        </span>
                      )}
                    </div>
                  )}

                  {actividad.metadata && Object.keys(actividad.metadata).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                        Ver detalles
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
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

      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Información:
        </h3>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Se registran todas las actividades importantes de tu cuenta</li>
          <li>• Los registros incluyen información de IP y navegador para tu seguridad</li>
          <li>• Si detectas actividad sospechosa, cambia tu contraseña inmediatamente</li>
        </ul>
      </div>
    </div>
  );
}
