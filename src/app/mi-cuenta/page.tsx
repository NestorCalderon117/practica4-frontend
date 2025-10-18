'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PerfilUsuario from '@/components/mi-cuenta/PerfilUsuario';
import CambiarContrasenia from '@/components/mi-cuenta/CambiarContrasenia';
import GestionSesiones from '@/components/mi-cuenta/GestionSesiones';
import HistorialActividad from '@/components/mi-cuenta/HistorialActividad';

export default function MiCuenta() {
  const [seccionActiva, setSeccionActiva] = useState<'perfil' | 'contrasenia' | 'sesiones' | 'historial'>('perfil');

  const secciones = [
    { id: 'perfil' as const, nombre: 'Mi Perfil', icono: '👤' },
    { id: 'contrasenia' as const, nombre: 'Cambiar Contraseña', icono: '🔒' },
    { id: 'sesiones' as const, nombre: 'Sesiones Activas', icono: '🖥️' },
    { id: 'historial' as const, nombre: 'Historial de Actividad', icono: '📋' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mi Cuenta
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Gestiona tu perfil, seguridad y preferencias
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Navegación lateral */}
            <div className="lg:col-span-1">
              <nav className="space-y-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                {secciones.map((seccion) => (
                  <button
                    key={seccion.id}
                    onClick={() => setSeccionActiva(seccion.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      seccionActiva === seccion.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-3 text-xl">{seccion.icono}</span>
                    {seccion.nombre}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                {seccionActiva === 'perfil' && <PerfilUsuario />}
                {seccionActiva === 'contrasenia' && <CambiarContrasenia />}
                {seccionActiva === 'sesiones' && <GestionSesiones />}
                {seccionActiva === 'historial' && <HistorialActividad />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
