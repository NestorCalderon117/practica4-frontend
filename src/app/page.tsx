import Link from "next/link";
import PublicRoute from "@/components/PublicRoute";

export default function Home() {
  return (
    <PublicRoute>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Bienvenido
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sistema de Gestión con Autenticación
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/autenticacion/iniciar-sesion"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
            >
              Iniciar Sesión
            </Link>

            <Link
              href="/autenticacion/registrarse"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
