// src/pages/LandingPage.jsx
import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  TicketIcon,
  ShieldCheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  const { user } = useAuth();

  // Si ya está logeado, redirige según su rol:
  if (user) {
    switch (user.rol) {
      case "ADMINISTRADOR":
        return <Navigate to="/admin" replace />;
      case "TECNICO":
        return <Navigate to="/tecnico" replace />;
      case "USUARIO":
        return <Navigate to="/usuario" replace />;
      default:
        return <Navigate to="/home" replace />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          HelpDeskX
        </Link>
        <div className="space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 font-medium text-blue-600 hover:text-white hover:bg-blue-600 rounded"
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="flex-grow bg-gradient-to-r from-blue-50 to-blue-100 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
          Simplifica la gestión de incidencias
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-xl">
          Registra, asigna y da seguimiento a tus tickets de soporte de forma
          rápida y organizada.
        </p>
        <div className="space-x-4">
          <Link
            to="/login"
            className="px-6 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </header>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <TicketIcon className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Genera Tickets</h3>
            <p className="text-gray-600">
              Crea solicitudes con toda la información necesaria en segundos.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <ClockIcon className="w-12 h-12 text-yellow-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Monitorea el Progreso
            </h3>
            <p className="text-gray-600">
              Visualiza el estado de cada ticket y recibe notificaciones.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 border rounded-lg shadow-sm hover:shadow-md transition">
            <ShieldCheckIcon className="w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Servicio Confiable</h3>
            <p className="text-gray-600">
              Mantén un historial completo y seguro de todas tus incidencias.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-200 py-6">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <p>© 2025 HelpDeskX. Todos los derechos reservados.</p>
          <div className="space-x-4">
            <Link to="#" className="hover:underline">
              Política de Privacidad
            </Link>
            <Link to="#" className="hover:underline">
              Términos de Uso
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
