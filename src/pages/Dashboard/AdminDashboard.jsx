import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  HomeIcon,
  UsersIcon,
  WrenchIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  Cog6ToothIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/solid";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({
    pendiente: 0,
    completado: 0,
    anulado: 0,
  });
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API}/tickets/reporte`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const pendiente = data.filter((t) => t.estado === "PENDIENTE").length;
        const completado = data.filter((t) => t.estado === "COMPLETADO").length;
        const anulado = data.filter((t) => t.estado === "ANULADO").length;
        setCounts({ pendiente, completado, anulado });
        setTickets(data);
      } catch (err) {
        console.error("Error al obtener tickets del administrador:", err);
      }
    };

    fetchTickets();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col items-center py-8">
        <div className="text-2xl font-bold mb-8 flex items-center space-x-2">
          <Cog6ToothIcon className="w-6 h-6" />
          <span>Administrador</span>
        </div>
        <nav className="space-y-4">
          <Link
            to="/admin"
            className="flex items-center space-x-2 hover:text-yellow-400"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Inicio</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center space-x-2 hover:text-yellow-400"
          >
            <UsersIcon className="w-5 h-5" />
            <span>Gestión de Usuarios</span>
          </Link>
          <Link
            to="/admin/register"
            className="flex items-center space-x-2 hover:text-yellow-400"
          >
            <UserIcon className="w-5 h-5" />
            <span>Registrar Usuario</span>
          </Link>
          <Link
            to="/admin/asignar"
            className="flex items-center space-x-2 hover:text-yellow-400"
          >
            <WrenchIcon className="w-5 h-5" />
            <span>Asignar Tickets</span>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="flex justify-end mb-6">
          <div className="flex items-center space-x-2">
            <UserCircleIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm">Administrador</span>
            <button onClick={handleLogout}>
              <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-500" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<ClockIcon className="w-6 h-6 mx-auto text-yellow-500" />}
            label="Pendiente"
            value={counts.pendiente}
          />
          <StatCard
            icon={
              <CheckCircleIcon className="w-6 h-6 mx-auto text-green-600" />
            }
            label="Completado"
            value={counts.completado}
          />
          <StatCard
            icon={<XCircleIcon className="w-6 h-6 mx-auto text-red-600" />}
            label="Anulado"
            value={counts.anulado}
          />
          <StatCard
            icon={
              <DocumentChartBarIcon className="w-6 h-6 mx-auto text-gray-700" />
            }
            label="Total de Tickets"
            value={tickets.length}
          />
        </div>

        {/* Tabla de tickets */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 text-white rounded">
            <thead>
              <tr>
                <th className="py-2 px-4">N_TICKET</th>
                <th className="py-2 px-4">TÍTULO</th>
                <th className="py-2 px-4">DESCRIPCIÓN</th>
                <th className="py-2 px-4">ESTADO</th>
                <th className="py-2 px-4">PRIORIDAD</th>
                <th className="py-2 px-4">FECHA CREACIÓN</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-t border-gray-700">
                  <td className="py-2 px-4">{ticket.id}</td>
                  <td className="py-2 px-4">{ticket.titulo}</td>
                  <td className="py-2 px-4">{ticket.descripcion}</td>
                  <td className="py-2 px-4">{ticket.estado}</td>
                  <td className="py-2 px-4">{ticket.prioridad}</td>
                  <td className="py-2 px-4">
                    {new Date(ticket.fechaCreacion).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-gray-200 p-4 rounded text-center">
      {icon}
      <div>{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
