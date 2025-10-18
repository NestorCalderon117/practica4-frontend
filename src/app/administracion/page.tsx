'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import GestionUsuarios from '@/components/administracion/GestionUsuarios';
import Auditoria from '@/components/administracion/Auditoria';
import { Users, BarChart3 } from 'lucide-react';

type Seccion = 'usuarios' | 'auditoria';

function AdministracionPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('usuarios');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Panel de Administración
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestión de usuarios y auditoría del sistema
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setSeccionActiva('usuarios')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  seccionActiva === 'usuarios'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                Gestión de Usuarios
              </button>
              <button
                onClick={() => setSeccionActiva('auditoria')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  seccionActiva === 'auditoria'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Auditoría del Sistema
              </button>
            </nav>
          </div>

          {/* Contenido */}
          <div>
            {seccionActiva === 'usuarios' && <GestionUsuarios />}
            {seccionActiva === 'auditoria' && <Auditoria />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdministracionPageWrapper() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdministracionPage />
    </ProtectedRoute>
  );
}
