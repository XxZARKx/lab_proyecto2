import { useEffect, useState } from "react";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BellAlertIcon,
  UserCircleIcon,
  ArrowRightEndOnRectangleIcon,
  TicketIcon,
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import TicketStatusBadge from "../../components/shared/TicketStatusBadge";
import { PriorityBadge } from "../../components/shared/PriorityBadge";
import { toLocalFromApi } from "../../utils/dates";
// 1. IMPORTAR EL NUEVO COMPONENTE
import StatusSummaryGrid from "./StatusSummaryGrid";

export default function DashboardTecnico() {
  const [tickets, setTickets] = useState([]);
  // Eliminamos el estado 'counts' manual

  // BUSCADOR
  const [query, setQuery] = useState("");

  // PAGINACIÓN
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { logout, token } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    (async () => {
      try {
        // Usamos el historial para ver los tickets asignados al técnico
        const res = await fetch(`${API}/tickets/historial`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // Orden: más recientes primero
        const sorted = [...data].sort(
          (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
        );
        setTickets(sorted);
        // Ya no necesitamos calcular 'counts' manualmente

        setCurrentPage(1); // reset al cargar
      } catch (err) {
        console.error("Error al obtener tickets:", err);
      }
    })();
  }, [token]);

  // FILTRO por ID, título y descripción
  const q = query.trim().toLowerCase();
  const filtered = q
    ? tickets.filter(
        (t) =>
          t.titulo?.toLowerCase().includes(q) ||
          t.descripcion?.toLowerCase().includes(q) ||
          String(t.id).includes(q)
      )
    : tickets;

  // reset de página al cambiar filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  // DERIVADOS DE PAGINACIÓN (sobre filtered)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filtered.length);
  const pageItems = filtered.slice(startIndex, endIndex);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > pages) setCurrentPage(pages);
  }, [filtered.length, pageSize, currentPage]);

  const goTo = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

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
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <BellAlertIcon className="h-6 w-6 text-yellow-500" />
            <UserCircleIcon className="h-6 w-6 text-blue-500" />
            <span className="font-medium text-gray-800">Panel Técnico</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-500 hover:text-red-600"
          >
            <ArrowRightEndOnRectangleIcon className="w-5 h-5" />
            <span className="ml-2">Cerrar Sesión</span>
          </button>
        </header>

        {/* 2. ESTADÍSTICAS REEMPLAZADAS */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 px-1">
            Resumen de asignaciones
          </h2>
          <StatusSummaryGrid tickets={tickets} />
        </section>

        {/* Tabla de tickets */}
        <section className="bg-white shadow rounded overflow-hidden p-4">
          {/* Controles arriba: buscador + per-page */}
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

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-semibold">
                  {filtered.length === 0 ? 0 : startIndex + 1}
                </span>{" "}
                a <span className="font-semibold">{endIndex}</span> de{" "}
                <span className="font-semibold">{filtered.length}</span>{" "}
                resultados
              </span>
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

          <div className="overflow-x-auto">
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
                {pageItems.map((t, i) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-blue-600 font-medium">
                      #{t.id}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {t.titulo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 line-clamp-1 max-w-xs">
                      {t.descripcion}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <TicketStatusBadge status={t.estado} />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <PriorityBadge priority={t.prioridad} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {toLocalFromApi(t.fechaCreacion)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        to={`/tecnico/tickets/${t.id}/actualizar`}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        Gestionar
                      </Link>
                    </td>
                  </tr>
                ))}

                {pageItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500 text-sm"
                    >
                      No hay tickets asignados para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Controles abajo */}
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
        </section>
      </main>
    </div>
  );
}
