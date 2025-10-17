import Link from 'next/link';
import PublicRoute from '@/components/PublicRoute';

export default function Unauthorized() {
  return (
    <PublicRoute redirectTo="/dashboard">
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center space-y-8 p-8">
        <div>
          <h1 className="text-6xl font-bold text-red-600">403</h1>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Acceso No Autorizado
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder a esta página.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
          >
            Ir al Dashboard
          </Link>

          <Link
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
      </div>
    </PublicRoute>
  );
}