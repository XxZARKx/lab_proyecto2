import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { ESTADO } from "../../utils/tickets";
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
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import TicketStatusBadge from "../../components/shared/TicketStatusBadge";
import { PriorityBadge } from "../../components/shared/PriorityBadge";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({
    pendiente: 0,
    cerrado: 0,
    anulado: 0,
  });

  // BUSCADOR
  const [query, setQuery] = useState("");

  // PAGINACIÓN
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

        // Orden: más recientes primero
        const sorted = [...data].sort(
          (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
        );
        setTickets(sorted);
        setCounts({
          pendiente: data.filter((t) => t.estado === ESTADO.PENDIENTE).length,
          cerrado: data.filter((t) => t.estado === ESTADO.CERRADO).length,
          anulado: data.filter((t) => t.estado === ESTADO.ANULADO).length,
        });

        setCurrentPage(1);
      } catch (err) {
        console.error("Error al obtener tickets:", err);
      }
    })();
  }, []);

  // FILTRADO por query (título, descripción, id)
  const q = query.trim().toLowerCase();
  const filtered = q
    ? tickets.filter(
        (t) =>
          t.titulo?.toLowerCase().includes(q) ||
          t.descripcion?.toLowerCase().includes(q) ||
          String(t.id).includes(q)
      )
    : tickets;

  // Reset página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // PAGINACIÓN sobre "filtered"
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);
  const pageItems = filtered.slice(startIndex, endIndex);

  // Ajuste si cambia pageSize o cantidad total
  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > pages) setCurrentPage(pages);
  }, [filtered.length, pageSize, currentPage]);

  const goTo = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

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
              label="Cerrados"
              value={counts.cerrado}
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
          {/* Controles: buscador + paginación superior */}
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Buscar por ID, título o descripción…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">
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
          </div>

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
              {pageItems.map((t, i) => (
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

              {pageItems.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500 text-sm"
                  >
                    No hay tickets para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Paginación inferior */}
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
