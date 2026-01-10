import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { getUnreadCount } from "../../services/notificaciones";
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
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { toLocalFromApi } from "../../utils/dates";

export default function UsuarioDashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const count = await getUnreadCount(token);
        if (mounted) setUnreadCount(count);
      } catch {}
    })();
    // opcional: refrescar cada 30s
    const iv = setInterval(async () => {
      try {
        const count = await getUnreadCount(token);
        setUnreadCount(count);
      } catch {}
    }, 5000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [token]);

  // PAGINACIÓN
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch(`${API}/tickets/historial`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();

        // Ordenar por fecha (más recientes primero)
        const sorted = [...data].sort(
          (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
        );

        setTickets(sorted);
        setFiltered(sorted);
        setCurrentPage(1);
      } catch {
        // manejar error
      }
    };
    fetchTickets();
  }, [token]);

  // Buscar por ID, título y descripción
  useEffect(() => {
    const q = query.trim().toLowerCase();
    const next = q
      ? tickets.filter(
          (t) =>
            t.titulo?.toLowerCase().includes(q) ||
            t.descripcion?.toLowerCase().includes(q) ||
            String(t.id).includes(q)
        )
      : tickets;

    setFiltered(next);
    setCurrentPage(1); // reset al cambiar filtro/búsqueda
  }, [query, tickets]);

  // Derivados de paginación (sobre filtered)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);
  const pageItems = filtered.slice(startIndex, endIndex);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > pages) setCurrentPage(pages);
  }, [filtered.length, pageSize, currentPage]);

  const goTo = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

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
            <button
              onClick={() => navigate("/usuario/notificaciones")}
              className="relative"
              title="Ver notificaciones"
            >
              <BellIcon className="h-6 w-6 text-yellow-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-none px-1.5 py-0.5 rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
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
            label="Cerrados"
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
              placeholder="Buscar por ID, título o descripción…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <div className="p-6 overflow-x-auto">
          {/* Controles de paginación arriba */}
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando{" "}
              <span className="font-semibold">
                {filtered.length === 0 ? 0 : startIndex + 1}
              </span>{" "}
              a <span className="font-semibold">{endIndex}</span> de{" "}
              <span className="font-semibold">{filtered.length}</span>{" "}
              resultados
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Por página:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

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
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No se encontraron tickets.
                  </td>
                </tr>
              ) : (
                pageItems.map((t, idx) => (
                  <tr
                    key={t.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-2 text-sm">{t.id}</td>
                    <td className="px-4 py-2 text-sm">
                      <Link
                        to={`/usuario/tickets/${t.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {t.titulo}
                      </Link>
                    </td>

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
                      {toLocalFromApi(t.fechaCreacion)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Controles de paginación abajo */}
          {filtered.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página <span className="font-semibold">{currentPage}</span> de{" "}
                <span className="font-semibold">{totalPages}</span>
              </div>

              <div className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => goTo(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-l-md bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  « Primera
                </button>
                <button
                  onClick={() => goTo(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border-t border-b border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  ‹ Anterior
                </button>
                <button
                  onClick={() => goTo(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border-t border-b border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente ›
                </button>
                <button
                  onClick={() => goTo(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-r-md bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Última »
                </button>
              </div>
            </div>
          )}
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
