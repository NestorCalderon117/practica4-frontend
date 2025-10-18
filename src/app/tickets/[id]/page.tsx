'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ticketsAPI } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

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

function DetalleTicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Campos editables
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');
  const [prioridad, setPrioridad] = useState(3);

  const cargarTicket = useCallback(async () => {
    try {
      setEstaCargando(true);
      setError('');
      const respuesta = await ticketsAPI.obtenerTicket(ticketId);
      setTicket(respuesta.ticket);

      // Inicializar campos de edición
      setTitulo(respuesta.ticket.titulo);
      setDescripcion(respuesta.ticket.descripcion || '');
      setCategoria(respuesta.ticket.categoria);
      setEstado(respuesta.ticket.estado);
      setPrioridad(respuesta.ticket.prioridad);
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al cargar el ticket';
      setError(mensajeError || 'Error al cargar el ticket');
    } finally {
      setEstaCargando(false);
    }
  }, [ticketId]);

  useEffect(() => {
    cargarTicket();
  }, [cargarTicket]);

  const manejarActualizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (titulo.length < 5 || titulo.length > 100) {
      setError('El título debe tener entre 5 y 100 caracteres');
      return;
    }

    try {
      setEstaCargando(true);

      const datos: {
        titulo?: string;
        descripcion?: string;
        categoria?: string;
        estado?: string;
        prioridad?: number;
      } = {};

      if (titulo !== ticket?.titulo) datos.titulo = titulo;
      if (descripcion !== (ticket?.descripcion || '')) datos.descripcion = descripcion;
      if (categoria !== ticket?.categoria) datos.categoria = categoria;
      if (estado !== ticket?.estado) datos.estado = estado;
      if (prioridad !== ticket?.prioridad) datos.prioridad = prioridad;

      if (Object.keys(datos).length === 0) {
        setError('No hay cambios para guardar');
        return;
      }

      const respuesta = await ticketsAPI.actualizarTicket(ticketId, datos);
      setTicket(respuesta.ticket);
      setExito('Ticket actualizado exitosamente');
      setModoEdicion(false);

      // Actualizar campos de edición con los nuevos valores
      setTitulo(respuesta.ticket.titulo);
      setDescripcion(respuesta.ticket.descripcion || '');
      setCategoria(respuesta.ticket.categoria);
      setEstado(respuesta.ticket.estado);
      setPrioridad(respuesta.ticket.prioridad);
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al actualizar el ticket';
      setError(mensajeError || 'Error al actualizar el ticket');
    } finally {
      setEstaCargando(false);
    }
  };

  const manejarEliminar = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setEstaCargando(true);
      setError('');
      await ticketsAPI.eliminarTicket(ticketId);
      router.push('/tickets');
    } catch (error: unknown) {
      const mensajeError = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Error al eliminar el ticket';
      setError(mensajeError || 'Error al eliminar el ticket');
      setEstaCargando(false);
    }
  };

  const cancelarEdicion = () => {
    if (ticket) {
      setTitulo(ticket.titulo);
      setDescripcion(ticket.descripcion || '');
      setCategoria(ticket.categoria);
      setEstado(ticket.estado);
      setPrioridad(ticket.prioridad);
    }
    setModoEdicion(false);
    setError('');
    setExito('');
  };

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const obtenerTransicionesPermitidas = (estadoActual: string): string[] => {
    const transiciones: Record<string, string[]> = {
      ABIERTO: ['EN_PROGRESO', 'CERRADO', 'CANCELADO'],
      EN_PROGRESO: ['ABIERTO', 'CERRADO', 'CANCELADO'],
      CERRADO: ['ABIERTO'],
      CANCELADO: ['ABIERTO'],
    };
    return [estadoActual, ...(transiciones[estadoActual] || [])];
  };

  if (estaCargando && !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
            {error}
          </div>
          <button
            onClick={() => router.push('/tickets')}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver a Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/tickets')}
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 flex items-center gap-1"
          >
            ← Volver a Tickets
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Detalle del Ticket
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ticket #{ticket?.id.substring(0, 8)}
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
                <button
                  onClick={manejarEliminar}
                  disabled={ticket?.estado === 'EN_PROGRESO'}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={ticket?.estado === 'EN_PROGRESO' ? 'No se pueden eliminar tickets en progreso' : ''}
                >
                  Eliminar
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
        {ticket && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {modoEdicion ? (
              // Modo Edición
              <form onSubmit={manejarActualizacion} className="p-6 space-y-4">
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
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {descripcion.length}/1000 caracteres
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estado
                    </label>
                    <select
                      id="estado"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      disabled={estaCargando}
                    >
                      {obtenerTransicionesPermitidas(ticket.estado).map((estadoOpcion) => (
                        <option key={estadoOpcion} value={estadoOpcion}>
                          {formatearEstado(estadoOpcion)}
                        </option>
                      ))}
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
                    {ticket.titulo}
                  </h2>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${obtenerColorEstado(ticket.estado)}`}>
                      {formatearEstado(ticket.estado)}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${obtenerColorPrioridad(ticket.prioridad)}`}>
                      Prioridad {formatearPrioridad(ticket.prioridad)}
                    </span>
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                      {formatearCategoria(ticket.categoria)}
                    </span>
                  </div>

                  {ticket.descripcion && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md mb-6">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción:
                      </h3>
                      <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                        {ticket.descripcion}
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Información del Usuario
                    </h3>
                    <div className="space-y-1 text-sm text-gray-900 dark:text-white">
                      <p><strong>Nombre:</strong> {ticket.usuario.nombre} {ticket.usuario.apellido}</p>
                      <p><strong>Correo:</strong> {ticket.usuario.correo}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fechas
                    </h3>
                    <div className="space-y-1 text-sm text-gray-900 dark:text-white">
                      <p><strong>Creado:</strong> {formatearFecha(ticket.creado)}</p>
                      <p><strong>Actualizado:</strong> {formatearFecha(ticket.actualizado)}</p>
                      {ticket.cerrado && (
                        <p><strong>Cerrado:</strong> {formatearFecha(ticket.cerrado)}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    ℹ️ Transiciones de Estado Permitidas:
                  </h3>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    {ticket.estado === 'ABIERTO' && (
                      <>
                        <li>• Abierto → En Progreso</li>
                        <li>• Abierto → Cerrado</li>
                        <li>• Abierto → Cancelado</li>
                      </>
                    )}
                    {ticket.estado === 'EN_PROGRESO' && (
                      <>
                        <li>• En Progreso → Abierto</li>
                        <li>• En Progreso → Cerrado</li>
                        <li>• En Progreso → Cancelado</li>
                      </>
                    )}
                    {ticket.estado === 'CERRADO' && (
                      <li>• Cerrado → Abierto (reapertura)</li>
                    )}
                    {ticket.estado === 'CANCELADO' && (
                      <li>• Cancelado → Abierto (reapertura)</li>
                    )}
                  </ul>
                </div>

                {ticket.estado === 'EN_PROGRESO' && (
                  <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ Los tickets en progreso no se pueden eliminar. Cambia el estado antes de intentar eliminarlo.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DetalleTicketPageWrapper() {
  return (
    <ProtectedRoute>
      <DetalleTicketPage />
    </ProtectedRoute>
  );
}
