// src/pages/Admin/AdminReportsPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeftIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/solid";
import TicketStatusBadge from "../../components/shared/TicketStatusBadge";
import { PriorityBadge } from "../../components/shared/PriorityBadge";

export default function AdminReportsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Datos del backend (ya filtrados por estado/prioridad/fechas)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Filtros "de servidor"
  const [estado, setEstado] = useState(""); // "", "PENDIENTE", ...
  const [prioridad, setPrioridad] = useState(""); // "", "ALTA", ...
  const [desde, setDesde] = useState(""); // input type="date" -> "YYYY-MM-DD"
  const [hasta, setHasta] = useState("");

  // Filtros "de cliente"
  const [categoria, setCategoria] = useState(""); // "", "SOFTWARE", ...
  const [q, setQ] = useState(""); // búsqueda por título

  // Paginación
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // para evitar doble fetch al montar
  const didMount = useRef(false);

  const fetchReporte = async () => {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      if (estado) params.set("estado", estado);
      if (prioridad) params.set("prioridad", prioridad);
      if (desde) params.set("fechaInicio", `${desde}T00:00:00`);
      if (hasta) params.set("fechaFin", `${hasta}T23:59:59`);

      const url =
        params.toString().length > 0
          ? `${API}/tickets/reporte?${params.toString()}`
          : `${API}/tickets/reporte`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
      setPage(1); // reset paginación tras fetch de servidor
    } catch (e) {
      setErr(e.message || "No se pudo cargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchReporte();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Auto-aplicar filtros de servidor con debounce
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    const t = setTimeout(() => {
      fetchReporte();
    }, 400); // debounce 400ms
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, prioridad, desde, hasta]);

  // Categorías únicas (derivadas de data)
  const categoriasOptions = useMemo(() => {
    const set = new Set();
    data.forEach((t) => {
      if (t.categoria) set.add(t.categoria);
    });
    return Array.from(set).sort();
  }, [data]);

  // Filtro cliente: categoría + búsqueda por título
  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    return data.filter((t) => {
      const okCat = categoria ? t.categoria === categoria : true;
      const okQ = qLower
        ? (t.titulo || "").toLowerCase().includes(qLower)
        : true;
      return okCat && okQ;
    });
  }, [data, categoria, q]);

  // Orden: más recientes primero
  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
    );
  }, [filtered]);

  // Paginación derivada
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sorted.length);
  const pageItems = sorted.slice(startIndex, endIndex);

  // Acomodar página si cambia el tamaño del listado
  useEffect(() => {
    const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
    if (page > pages) setPage(pages);
  }, [sorted.length, pageSize, page]);

  // Reset page cuando cambian filtros cliente
  useEffect(() => {
    setPage(1);
  }, [categoria, q]);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  const exportCSV = () => {
    const rows = [
      [
        "ID",
        "Titulo",
        "Descripcion",
        "Estado",
        "Prioridad",
        "Categoria",
        "Fecha Creacion",
      ],
      ...sorted.map((t) => [
        t.id,
        sanitizeCSV(t.titulo),
        sanitizeCSV(t.descripcion),
        t.estado,
        t.prioridad,
        t.categoria || "",
        t.fechaCreacion,
      ]),
    ];
    const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const now = new Date();
    link.download = `reporte_tickets_${now.toISOString().slice(0, 19)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded hover:bg-gray-100"
              title="Volver"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Reportes de Tickets
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center px-3 py-2 bg-white border rounded hover:bg-gray-50 text-gray-700"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-1" />
              <span className="text-sm">Exportar CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-2 text-gray-700 mb-3">
            <FunnelIcon className="h-5 w-5" />
            <span className="font-medium">Filtros</span>
            {loading && (
              <span className="ml-auto text-sm text-blue-600 animate-pulse">
                Actualizando…
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Estado (server-side) */}
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="border rounded-lg px-3 py-2 bg-white"
              title="Estado"
            >
              <option value="">Estado (todos)</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="ASIGNADO">ASIGNADO</option>
              <option value="EN_PROCESO">EN_PROCESO</option>
              <option value="CERRADO">CERRADO</option>
              <option value="ANULADO">ANULADO</option>
            </select>

            {/* Prioridad (server-side) */}
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
              className="border rounded-lg px-3 py-2 bg-white"
              title="Prioridad"
            >
              <option value="">Prioridad (todas)</option>
              <option value="ALTA">ALTA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="BAJA">BAJA</option>
            </select>

            {/* Desde/Hasta (server-side) */}
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border rounded-lg px-3 py-2"
              title="Desde"
            />
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border rounded-lg px-3 py-2"
              title="Hasta"
            />

            {/* Categoría (client-side) */}
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="border rounded-lg px-3 py-2 bg-white"
              title="Categoría"
            >
              <option value="">Categoría (todas)</option>
              {categoriasOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Buscar por título (client-side) */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar título…"
                className="w-full border rounded-lg pl-9 pr-3 py-2"
              />
            </div>
          </div>

          {/* Botón manual opcional por si el usuario quiere refrescar al toque */}
          <div className="mt-3">
            <button
              onClick={fetchReporte}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Actualizando…" : "Refrescar"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Controles arriba */}
          <div className="px-4 py-3 flex items-center justify-between text-sm text-gray-600">
            <div>
              Mostrando{" "}
              <span className="font-semibold">
                {sorted.length === 0 ? 0 : startIndex + 1}
              </span>{" "}
              a <span className="font-semibold">{endIndex}</span> de{" "}
              <span className="font-semibold">{sorted.length}</span> resultados
            </div>
            <div className="flex items-center gap-2">
              <span>Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border rounded px-2 py-1 bg-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {[
                  "#",
                  "Título",
                  "Descripción",
                  "Estado",
                  "Prioridad",
                  "Categoría",
                  "Fecha",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Cargando…
                  </td>
                </tr>
              ) : err ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-red-600"
                  >
                    {err}
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No hay resultados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                pageItems.map((t, i) => (
                  <tr
                    key={t.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-2 text-sm text-gray-700">{t.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
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
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {t.categoria || "—"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {new Date(t.fechaCreacion).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Controles abajo */}
          <div className="px-4 py-3 flex items-center justify-between text-sm text-gray-600">
            <div>
              Página <span className="font-semibold">{page}</span> de{" "}
              <span className="font-semibold">{totalPages}</span>
            </div>
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => goTo(1)}
                disabled={page === 1}
                className="px-3 py-1.5 border rounded-l bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                « Primera
              </button>
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                className="px-3 py-1.5 border-t border-b bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                ‹ Anterior
              </button>
              <button
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1.5 border-t border-b bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente ›
              </button>
              <button
                onClick={() => goTo(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-1.5 border rounded-r bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Última »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helpers CSV */
function sanitizeCSV(str) {
  if (!str) return "";
  return String(str)
    .replace(/\r?\n|\r/g, " ")
    .trim();
}
function csvCell(v) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
