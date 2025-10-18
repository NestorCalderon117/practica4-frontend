'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { Users, Ticket, Shield } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user?.nombreCompleto} ({user?.role})
                </span>
                <button
                  onClick={() => router.push('/mi-cuenta')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Mi Cuenta
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Bienvenido, {user?.nombre}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                        Información Personal
                      </h3>
                    </div>
                    <p className="text-blue-700 dark:text-blue-300">
                      Email: {user?.email}
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Nombre: {user?.nombreCompleto}
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Rol: {user?.role}
                    </p>
                    <button
                      onClick={() => router.push('/mi-cuenta')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm w-full"
                    >
                      Ver Mi Cuenta
                    </button>
                  </div>

                  {user?.role === 'ADMIN' && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                          Panel de Administración
                        </h3>
                      </div>
                      <p className="text-green-700 dark:text-green-300 mb-2">
                        Gestiona usuarios y auditoría del sistema
                      </p>
                      <button
                        onClick={() => router.push('/administracion')}
                        className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm w-full"
                      >
                        Ir a Administración
                      </button>
                    </div>
                  )}

                  {user?.role === 'CLIENTE' && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Ticket className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                          Tickets de Soporte
                        </h3>
                      </div>
                      <p className="text-orange-700 dark:text-orange-300 mb-2">
                        Gestiona tus solicitudes de soporte
                      </p>
                      <button
                        onClick={() => router.push('/tickets')}
                        className="mt-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm w-full"
                      >
                        Ver Mis Tickets
                      </button>
                    </div>
                  )}

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                        Seguridad
                      </h3>
                    </div>
                    <p className="text-purple-700 dark:text-purple-300 mb-2">
                      Gestiona tu seguridad y privacidad
                    </p>
                    <button
                      onClick={() => router.push('/mi-cuenta')}
                      className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm w-full"
                    >
                      Configurar Seguridad
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}