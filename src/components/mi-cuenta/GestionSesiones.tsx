'use client';

import { useState, useEffect } from 'react';
import { miCuentaAPI } from '@/lib/api';
import {
  Monitor,
  Laptop,
  Smartphone as SmartphoneIcon,
  Globe as GlobeIcon,
  MapPin,
  Clock,
  Calendar,
  Timer,
  Lightbulb
} from 'lucide-react';

interface Sesion {
  id: string;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
  ubicacion: string | null;
  ultimaActividad: string;
  expiraEn: string;
  creada: string;
}

export default function GestionSesiones() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [sesionActualId, setSesionActualId] = useState<string | null>(null);

  useEffect(() => {
    cargarSesiones();
  }, []);

  const cargarSesiones = async () => {
    try {
      setEstaCargando(true);
      const respuesta = await miCuentaAPI.obtenerSesiones();
      setSesiones(respuesta.sesiones);

      // La sesión actual es la más reciente
      if (respuesta.sesiones.length > 0) {
        const sesionMasReciente = respuesta.sesiones.reduce((prev: Sesion, current: Sesion) =>
          new Date(prev.ultimaActividad) > new Date(current.ultimaActividad) ? prev : current
        );
        setSesionActualId(sesionMasReciente.id);
      }
    } catch (error: unknown) {
      console.error('Error al cargar las sesiones:', error);
      setError('Error al cargar las sesiones');
    } finally {
      setEstaCargando(false);
    }
  };

  const terminarSesion = async (sessionId: string) => {
    if (!confirm('¿Estás seguro de que deseas terminar esta sesión?')) {
      return;
    }

    try {
      setEstaCargando(true);
      setError('');
      setExito('');

      const respuesta = await miCuentaAPI.terminarSesion(sessionId);
      setExito(respuesta.mensaje || 'Sesión terminada exitosamente');
      await cargarSesiones();
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al terminar la sesión';
      setError(mensajeError || 'Error al terminar la sesión');
    } finally {
      setEstaCargando(false);
    }
  };

  const terminarTodasLasSesiones = async () => {
    if (!confirm('¿Estás seguro de que deseas terminar todas las demás sesiones? Permanecerás conectado solo en este dispositivo.')) {
      return;
    }

    if (!sesionActualId) {
      setError('No se pudo identificar la sesión actual');
      return;
    }

    try {
      setEstaCargando(true);
      setError('');
      setExito('');

      const respuesta = await miCuentaAPI.terminarTodasLasSesiones(sesionActualId);
      setExito(respuesta.mensaje || 'Todas las demás sesiones han sido terminadas');
      await cargarSesiones();
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al terminar las sesiones';
      setError(mensajeError || 'Error al terminar las sesiones');
    } finally {
      setEstaCargando(false);
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

  const obtenerIconoDispositivo = (userAgent: string) => {
    if (userAgent.includes('Windows')) return <Monitor className="w-6 h-6" />;
    if (userAgent.includes('Mac')) return <Laptop className="w-6 h-6" />;
    if (userAgent.includes('Linux')) return <Monitor className="w-6 h-6" />;
    if (userAgent.includes('Android')) return <SmartphoneIcon className="w-6 h-6" />;
    if (userAgent.includes('iOS') || userAgent.includes('iPhone')) return <SmartphoneIcon className="w-6 h-6" />;
    return <GlobeIcon className="w-6 h-6" />;
  };

  const obtenerNombreDispositivo = (userAgent: string) => {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS') || userAgent.includes('iPhone')) return 'iPhone';
    return 'Navegador';
  };

  const obtenerNombreNavegador = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Otro';
  };

  if (estaCargando && sesiones.length === 0) {
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
            Sesiones Activas
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona las sesiones activas de tu cuenta
          </p>
        </div>
        {sesiones.length > 1 && (
          <button
            onClick={terminarTodasLasSesiones}
            disabled={estaCargando}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
          >
            Cerrar todas las demás
          </button>
        )}
      </div>

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

      {sesiones.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No hay sesiones activas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sesiones.map((sesion) => (
            <div
              key={sesion.id}
              className={`border rounded-lg p-4 ${
                sesion.id === sesionActualId
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-gray-600 dark:text-gray-400">
                      {obtenerIconoDispositivo(sesion.userAgent)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {obtenerNombreDispositivo(sesion.userAgent)} - {obtenerNombreNavegador(sesion.userAgent)}
                      </h3>
                      {sesion.id === sesionActualId && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Sesión actual
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>IP: {sesion.ipAddress}</span>
                      {sesion.ubicacion && <span>• {sesion.ubicacion}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Última actividad: {formatearFecha(sesion.ultimaActividad)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Creada: {formatearFecha(sesion.creada)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      <span>Expira: {formatearFecha(sesion.expiraEn)}</span>
                    </div>
                  </div>
                </div>

                {sesion.id !== sesionActualId && (
                  <button
                    onClick={() => terminarSesion(sesion.id)}
                    disabled={estaCargando}
                    className="ml-4 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                  >
                    Terminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Consejos de seguridad:
        </h3>
        <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>• Revisa regularmente tus sesiones activas</li>
          <li>• Termina sesiones que no reconozcas</li>
          <li>• Las sesiones expiran automáticamente después de 30 días</li>
          <li>• Si sospechas actividad no autorizada, cambia tu contraseña inmediatamente</li>
        </ul>
      </div>
    </div>
  );
}
