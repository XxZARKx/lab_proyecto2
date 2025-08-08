// src/pages/UsuarioDashboard.jsx
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  PlusIcon,
  TicketIcon,
  BellIcon,
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

export default function UsuarioDashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch(`${API}/tickets/historial`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTickets(data);
        setFiltered(data);
      } catch {
        // manejar error
      }
    };
    fetchTickets();
  }, [token]);

  useEffect(() => {
    setFiltered(
      tickets.filter((t) =>
        t.titulo.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, tickets]);

  const counts = {
    PENDIENTE: tickets.filter((t) => t.estado === "PENDIENTE").length,
    CERRADO: tickets.filter((t) => t.estado === "CERRADO").length,
    ANULADO: tickets.filter((t) => t.estado === "ANULADO").length,
    TOTAL: tickets.length,
  };

  const navItems = [
    {
      to: "/usuario",
      label: "Inicio",
      icon: <TicketIcon className="h-5 w-5" />,
    },
    {
      to: "/usuario/tickets",
      label: "Pendientes",
      icon: <ClockIcon className="h-5 w-5" />,
    },
    {
      to: "/usuario/historial",
      label: "Historial",
      icon: <TicketIcon className="h-5 w-5" />,
    },
  ];

  const badgeClasses = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    ASIGNADO: "bg-blue-100 text-blue-800",
    EN_PROCESO: "bg-orange-100 text-orange-800",
    CERRADO: "bg-green-100 text-green-800",
    ANULADO: "bg-red-100 text-red-800",
    ALTA: "bg-red-100 text-red-800",
    MEDIA: "bg-yellow-100 text-yellow-800",
    BAJA: "bg-green-100 text-green-800",
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Overlay en móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-gray-900 text-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform md:translate-x-0 z-20`}
      >
        <div className="flex items-center justify-between p-6">
          <span className="text-xl font-bold">❖ HelpDesk</span>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="px-4 space-y-2">
          {navItems.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition ${
                location.pathname.startsWith(to)
                  ? "bg-gray-700 font-semibold"
                  : ""
              }`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Header */}
        <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold">Tablero de Usuario</h1>
          </div>
          <div className="flex items-center gap-4">
            <BellIcon className="h-6 w-6 text-yellow-500" />
            <span className="font-medium">Usuario</span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="p-1"
            >
              <ArrowLeftStartOnRectangleIcon className="h-6 w-6 text-red-500" />
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          <StatCard
            icon={<ClockIcon />}
            label="Pendientes"
            value={counts.PENDIENTE}
            color="yellow"
          />
          <StatCard
            icon={<CheckCircleIcon />}
            label="Completados"
            value={counts.CERRADO}
            color="green"
          />
          <StatCard
            icon={<XCircleIcon />}
            label="Anulados"
            value={counts.ANULADO}
            color="red"
          />
          <StatCard
            icon={<TicketIcon />}
            label="Total Tickets"
            value={counts.TOTAL}
            color="purple"
          />
        </div>

        {/* Actions + Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6">
          <div className="flex gap-3">
            <Link
              to="/usuario/tickets/nuevo"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <PlusIcon className="h-5 w-5" />
              Nuevo Ticket
            </Link>
            <Link
              to="/usuario/historial"
              className="flex items-center gap-2 border border-gray-400 hover:border-gray-600 text-gray-700 px-4 py-2 rounded-lg transition"
            >
              <TicketIcon className="h-5 w-5" />
              Ver Historial
            </Link>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar por título..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 16.65z"
              />
            </svg>
          </div>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                {["N°", "Título", "Estado", "Prioridad", "Fecha"].map(
                  (h, i) => (
                    <th
                      key={i}
                      className="px-4 py-2 text-left text-sm font-medium text-gray-600 uppercase"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => (
                <tr
                  key={t.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2 text-sm">{t.id}</td>
                  <td className="px-4 py-2 text-sm">{t.titulo}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        badgeClasses[t.estado]
                      }`}
                    >
                      {t.estado.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        badgeClasses[t.prioridad]
                      }`}
                    >
                      {t.prioridad}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(t.fechaCreacion).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No se encontraron tickets.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Componente reutilizable para cards
function StatCard({ icon, label, value, color }) {
  const colors = {
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    purple: "bg-purple-100 text-purple-800",
  };
  return (
    <div className="flex items-center gap-4 bg-white rounded-lg shadow p-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}
