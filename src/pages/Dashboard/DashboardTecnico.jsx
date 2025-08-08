import { useEffect, useState } from "react";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BellAlertIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  TicketIcon,
  ClipboardDocumentCheckIcon,
  XCircleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";
import TicketStatusBadge from "../../components/shared/TicketStatusBadge";
import { PriorityBadge } from "../../components/shared/PriorityBadge";

export default function DashboardTecnico() {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({
    pendiente: 0,
    completado: 0,
    anulado: 0,
  });
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/tickets/historial`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCounts({
          pendiente: data.filter((t) => t.estado === "PENDIENTE").length,
          completado: data.filter((t) => t.estado === "COMPLETADO").length,
          anulado: data.filter((t) => t.estado === "ANULADO").length,
        });
        setTickets(data);
      } catch (err) {
        console.error("Error al obtener tickets:", err);
      }
    })();
  }, [token]);

  const sidebarLinks = [
    { to: "/tecnico", icon: TicketIcon, label: "Inicio" },
    {
      to: "/tecnico/tickets-asignados",
      icon: TicketIcon,
      label: "Mis Tickets",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-800 text-gray-200 flex-shrink-0">
        <div className="py-6 px-4 text-xl font-bold flex items-center space-x-2 border-b border-gray-700">
          <WrenchScrewdriverIcon className="w-6 h-6 text-green-400" />
          <span>Técnico</span>
        </div>
        <nav className="mt-4">
          {sidebarLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 hover:bg-gray-700 transition-colors ${
                  isActive ? "bg-gray-700 font-semibold" : ""
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="ml-3">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <BellAlertIcon className="h-6 w-6 text-yellow-500" />
            <UserCircleIcon className="h-6 w-6 text-blue-500" />
            <span className="font-medium text-gray-800">Técnico</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-500 hover:text-red-600"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="ml-2">Cerrar Sesión</span>
          </button>
        </header>

        {/* Estadísticas */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pendientes"
            count={counts.pendiente}
            icon={<ClockIcon className="h-6 w-6 text-yellow-600" />}
          />
          <StatCard
            title="Completados"
            count={counts.completado}
            icon={
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-green-600" />
            }
          />
          <StatCard
            title="Anulados"
            count={counts.anulado}
            icon={<XCircleIcon className="h-6 w-6 text-red-600" />}
          />
          <StatCard
            title="Total Tickets"
            count={tickets.length}
            icon={<TicketIcon className="h-6 w-6 text-purple-600" />}
          />
        </section>

        {/* Tabla de tickets */}
        <section className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                {[
                  "#",
                  "Título",
                  "Descripción",
                  "Estado",
                  "Prioridad",
                  "Fecha",
                  "Acciones",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-800">{t.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {t.titulo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 line-clamp-1">
                    {t.descripcion}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <TicketStatusBadge status={t.estado} />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <PriorityBadge priority={t.prioridad} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(t.fechaCreacion).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      to={`/tecnico/tickets/${t.id}/actualizar`}
                      className="text-blue-600 hover:underline"
                    >
                      Actualizar
                    </Link>
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

function StatCard({ title, count, icon }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
      <div className="p-2 bg-gray-100 rounded">{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{count}</p>
      </div>
    </div>
  );
}
