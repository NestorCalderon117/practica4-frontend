'use client';

import { useState, useEffect, useCallback } from 'react';
import { ticketsAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface Ticket {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: string;
  estado: string;
  prioridad: number;
  usuarioId: string;
  creado: string;
  actualizado: string;
  cerrado: string | null;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    correo: string;
  };
}

interface Estadisticas {
  total: number;
  porEstado: {
    ABIERTO: number;
    EN_PROGRESO: number;
    CERRADO: number;
    CANCELADO: number;
  };
  porCategoria: {
    TECNICO: number;
    FACTURACION: number;
    GENERAL: number;
    BUG_REPORT: number;
    FEATURE_REQUEST: number;
  };
}

function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [error, setError] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [mostrarFormularioNuevo, setMostrarFormularioNuevo] = useState(false);

  // Filtros
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [prioridadFiltro, setPrioridadFiltro] = useState('');

  // Paginación
  const [limite] = useState(10);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [tieneMas, setTieneMas] = useState(false);

  const cargarTickets = useCallback(async () => {
    try {
      setEstaCargando(true);
      setError('');

      const filtros: {
        estado?: string;
        categoria?: string;
        prioridad?: number;
        limit?: number;
        offset?: number;
      } = { limit: limite, offset };

      if (estadoFiltro) filtros.estado = estadoFiltro;
      if (categoriaFiltro) filtros.categoria = categoriaFiltro;
      if (prioridadFiltro) filtros.prioridad = Number(prioridadFiltro);

      const respuesta = await ticketsAPI.obtenerTickets(filtros);
      setTickets(respuesta.tickets);
      setTotal(respuesta.pagination.total);
      setTieneMas(respuesta.pagination.hasMore);
    } catch (error: unknown) {
      console.error('Error al cargar tickets:', error);
      setError('Error al cargar los tickets');
    } finally {
      setEstaCargando(false);
    }
  }, [estadoFiltro, categoriaFiltro, prioridadFiltro, limite, offset]);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const respuesta = await ticketsAPI.obtenerEstadisticas();
      setEstadisticas(respuesta.estadisticas);
    } catch (error: unknown) {
      console.error('Error al cargar estadísticas:', error);
    }
  }, []);

  useEffect(() => {
    cargarTickets();
    cargarEstadisticas();
  }, [cargarTickets, cargarEstadisticas]);

  const obtenerColorEstado = (estado: string): string => {
    const colores: Record<string, string> = {
      ABIERTO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      EN_PROGRESO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      CERRADO: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      CANCELADO: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  const obtenerColorPrioridad = (prioridad: number): string => {
    const colores: Record<number, string> = {
      1: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      2: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      3: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    };
    return colores[prioridad] || 'bg-gray-100 text-gray-800';
  };

  const formatearCategoria = (categoria: string): string => {
    const categorias: Record<string, string> = {
      TECNICO: 'Técnico',
      FACTURACION: 'Facturación',
      GENERAL: 'General',
      BUG_REPORT: 'Reporte de Bug',
      FEATURE_REQUEST: 'Solicitud de Funcionalidad',
    };
    return categorias[categoria] || categoria;
  };

  const formatearEstado = (estado: string): string => {
    const estados: Record<string, string> = {
      ABIERTO: 'Abierto',
      EN_PROGRESO: 'En Progreso',
      CERRADO: 'Cerrado',
      CANCELADO: 'Cancelado',
    };
    return estados[estado] || estado;
  };

  const formatearPrioridad = (prioridad: number): string => {
    const prioridades: Record<number, string> = {
      1: 'Alta',
      2: 'Media',
      3: 'Baja',
    };
    return prioridades[prioridad] || 'Media';
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

  const limpiarFiltros = () => {
    setEstadoFiltro('');
    setCategoriaFiltro('');
    setPrioridadFiltro('');
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tickets de Soporte
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Gestiona tus solicitudes de soporte
              </p>
            </div>
            <button
              onClick={() => setMostrarFormularioNuevo(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Nuevo Ticket
            </button>
          </div>

          {/* Estadísticas */}
          {estadisticas && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {estadisticas.total}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Abiertos</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {estadisticas.porEstado.ABIERTO}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">En Progreso</div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {estadisticas.porEstado.EN_PROGRESO}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">Cerrados</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {estadisticas.porEstado.CERRADO}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <option value="ABIERTO">Abierto</option>
                <option value="EN_PROGRESO">En Progreso</option>
                <option value="CERRADO">Cerrado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                value={categoriaFiltro}
                onChange={(e) => {
                  setCategoriaFiltro(e.target.value);
                  setOffset(0);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todas</option>
                <option value="TECNICO">Técnico</option>
                <option value="FACTURACION">Facturación</option>
                <option value="GENERAL">General</option>
                <option value="BUG_REPORT">Reporte de Bug</option>
                <option value="FEATURE_REQUEST">Solicitud de Funcionalidad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad
              </label>
              <select
                value={prioridadFiltro}
                onChange={(e) => {
                  setPrioridadFiltro(e.target.value);
                  setOffset(0);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todas</option>
                <option value="1">Alta</option>
                <option value="2">Media</option>
                <option value="3">Baja</option>
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

        {/* Error */}
        {error && (
          <div className="mb-4 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Lista de tickets */}
        {estaCargando && tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No se encontraron tickets</p>
            <button
              onClick={() => setMostrarFormularioNuevo(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Crear primer ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.id}`}
                className="block bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {ticket.titulo}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${obtenerColorPrioridad(ticket.prioridad)}`}>
                        Prioridad {formatearPrioridad(ticket.prioridad)}
                      </span>
                    </div>

                    {ticket.descripcion && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {ticket.descripcion}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${obtenerColorEstado(ticket.estado)}`}>
                        {formatearEstado(ticket.estado)}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                        {formatearCategoria(ticket.categoria)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        🕐 {formatearFecha(ticket.creado)}
                      </span>
                      {ticket.cerrado && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          ✓ Cerrado: {formatearFecha(ticket.cerrado)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4 text-gray-400">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Paginación */}
        {total > 0 && (
          <div className="mt-6 flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {offset + 1} - {Math.min(offset + limite, total)} de {total} tickets
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

      {/* Modal para crear nuevo ticket */}
      {mostrarFormularioNuevo && (
        <NuevoTicketModal
          onClose={() => setMostrarFormularioNuevo(false)}
          onSuccess={() => {
            setMostrarFormularioNuevo(false);
            cargarTickets();
            cargarEstadisticas();
          }}
        />
      )}
    </div>
  );
}

function NuevoTicketModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('GENERAL');
  const [prioridad, setPrioridad] = useState(3);
  const [error, setError] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!titulo.trim()) {
      setError('El título es requerido');
      return;
    }

    if (titulo.length < 5 || titulo.length > 100) {
      setError('El título debe tener entre 5 y 100 caracteres');
      return;
    }

    try {
      setEstaCargando(true);
      await ticketsAPI.crearTicket(titulo, descripcion || undefined, categoria, prioridad);
      onSuccess();
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al crear el ticket';
      setError(mensajeError || 'Error al crear el ticket');
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nuevo Ticket de Soporte
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
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                id="titulo"
                type="text"
                required
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={estaCargando}
                placeholder="Describe brevemente el problema"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {titulo.length}/100 caracteres
              </p>
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                rows={4}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={estaCargando}
                placeholder="Proporciona más detalles sobre el problema"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {descripcion.length}/1000 caracteres
              </p>
            </div>

            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                id="categoria"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                disabled={estaCargando}
              >
                <option value="GENERAL">General</option>
                <option value="TECNICO">Técnico</option>
                <option value="FACTURACION">Facturación</option>
                <option value="BUG_REPORT">Reporte de Bug</option>
                <option value="FEATURE_REQUEST">Solicitud de Funcionalidad</option>
              </select>
            </div>

            <div>
              <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad
              </label>
              <select
                id="prioridad"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={prioridad}
                onChange={(e) => setPrioridad(Number(e.target.value))}
                disabled={estaCargando}
              >
                <option value={1}>Alta</option>
                <option value={2}>Media</option>
                <option value={3}>Baja</option>
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
                {estaCargando ? 'Creando...' : 'Crear Ticket'}
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

export default function TicketsPageWrapper() {
  return (
    <ProtectedRoute>
      <TicketsPage />
    </ProtectedRoute>
  );
}
