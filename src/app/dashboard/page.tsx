'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

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
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Información Personal
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300">
                      Email: {user?.email}
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Nombre: {user?.nombreCompleto}
                    </p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Rol: {user?.role}
                    </p>
                  </div>

                  {user?.role === 'ADMIN' && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                        Panel de Administración
                      </h3>
                      <p className="text-green-700 dark:text-green-300">
                        Acceso completo al sistema
                      </p>
                      <button className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                        Gestionar Usuarios
                      </button>
                    </div>
                  )}

                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Configuración
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Personaliza tu experiencia
                    </p>
                    <button className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm">
                      Configurar Perfil
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