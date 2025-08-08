import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  HomeIcon,
  UsersIcon,
  WrenchIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/solid";
import TicketStatusBadge from "../../components/shared/TicketStatusBadge";
import { PriorityBadge } from "../../components/shared/PriorityBadge";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({
    pendiente: 0,
    completado: 0,
    anulado: 0,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API}/tickets/reporte`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTickets(data);
        setCounts({
          pendiente: data.filter((t) => t.estado === "PENDIENTE").length,
          completado: data.filter((t) => t.estado === "COMPLETADO").length,
          anulado: data.filter((t) => t.estado === "ANULADO").length,
        });
      } catch (err) {
        console.error("Error al obtener tickets:", err);
      }
    })();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebarLinks = [
    { to: "/admin", icon: <HomeIcon className="w-5 h-5" />, label: "Inicio" },
    {
      to: "/admin/users",
      icon: <UsersIcon className="w-5 h-5" />,
      label: "Usuarios",
    },
    {
      to: "/admin/register",
      icon: <UserIcon className="w-5 h-5" />,
      label: "Nuevo Usuario",
    },
    {
      to: "/admin/asignar",
      icon: <WrenchIcon className="w-5 h-5" />,
      label: "Asignar Tickets",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-800 text-gray-200 flex-shrink-0">
        <div className="py-6 px-4 text-xl font-bold flex items-center space-x-2 border-b border-gray-700">
          <UsersIcon className="w-6 h-6 text-yellow-400" />
          <span>Admin</span>
        </div>
        <nav className="mt-4">
          {sidebarLinks.map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center px-6 py-3 hover:bg-gray-700 transition-colors ${
                location.pathname === to ? "bg-gray-700 font-semibold" : ""
              }`}
            >
              {icon}
              <span className="ml-3">{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex justify-between items-center bg-white shadow px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Panel de Control
          </h2>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-500 hover:text-red-600"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="ml-2">Cerrar Sesión</span>
          </button>
        </header>

        {/* Estadísticas */}
        <section className="p-6 bg-white border-b border-gray-200">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            <StatCard
              icon={<ClockIcon className="w-6 h-6 text-yellow-500" />}
              label="Pendientes"
              value={counts.pendiente}
            />
            <StatCard
              icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
              label="Completados"
              value={counts.completado}
            />
            <StatCard
              icon={<XCircleIcon className="w-6 h-6 text-red-600" />}
              label="Anulados"
              value={counts.anulado}
            />
            <StatCard
              icon={<DocumentChartBarIcon className="w-6 h-6 text-gray-700" />}
              label="Total"
              value={tickets.length}
            />
          </div>
        </section>

        {/* Tabla */}
        <section className="p-6 overflow-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {[
                  "#",
                  "Título",
                  "Descripción",
                  "Estado",
                  "Prioridad",
                  "Fecha",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-sm font-medium text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((t, i) => (
                <tr
                  key={t.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2 text-sm text-gray-700">{t.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {t.titulo}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 line-clamp-1">
                    {t.descripcion}
                  </td>
                  <td className="px-4 py-2">
                    <TicketStatusBadge status={t.estado} />
                  </td>
                  <td className="px-4 py-2">
                    <PriorityBadge priority={t.prioridad} />
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {new Date(t.fechaCreacion).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex items-center p-4 bg-gray-50 rounded-lg shadow-sm">
      <div className="p-3 bg-white rounded-full">{icon}</div>
      <div className="ml-4">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
