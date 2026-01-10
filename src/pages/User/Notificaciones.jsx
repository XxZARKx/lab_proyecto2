import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../../services/notificaciones";
import { useNavigate } from "react-router-dom";
import {
  BellIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";

export default function NotificacionesPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await getNotifications(token, {
        page,
        size,
        unread: onlyUnread,
      });
      // data: Page<NotificacionResponse>
      setItems(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [page, size, onlyUnread]);

  const handleMarkAsRead = async (id) => {
    await markAsRead(token, id);
    load();
  };

  const handleMarkAll = async () => {
    await markAllAsRead(token);
    setPage(0);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition"
              title="Volver atrás"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>

            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BellIcon className="h-6 w-6 text-yellow-500" />
              Notificaciones
            </h1>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <label className="text-sm text-gray-700 flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyUnread}
                onChange={(e) => {
                  setOnlyUnread(e.target.checked);
                  setPage(0);
                }}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Solo no leídas
            </label>
            <button
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm"
              onClick={handleMarkAll}
            >
              Marcar todas leídas
            </button>
          </div>
        </div>

        {err && (
          <div className="mb-3 text-red-600 bg-red-50 p-3 rounded">{err}</div>
        )}

        {loading ? (
          <div className="py-16 text-center text-gray-500 flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
            Cargando...
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            No tienes notificaciones {onlyUnread ? "sin leer" : ""}.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((n) => (
              <li
                key={n.id}
                className={`py-4 flex items-start justify-between gap-4 transition-colors ${
                  !n.leida ? "bg-blue-50/30 -mx-2 px-2 rounded" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!n.leida ? (
                      <span className="inline-flex items-center text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        Nueva
                      </span>
                    ) : null}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {new Date(n.creadoEn).toLocaleString()}
                    </span>
                  </div>
                  <div
                    className={`text-base ${
                      !n.leida
                        ? "font-bold text-gray-900"
                        : "font-medium text-gray-700"
                    }`}
                  >
                    {n.titulo}
                  </div>
                  <div className="text-gray-600 text-sm mt-1 leading-relaxed">
                    {n.mensaje}
                  </div>

                  {n.ticketId && (
                    <button
                      onClick={() => navigate(`/usuario/tickets/${n.ticketId}`)}
                      className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium group"
                    >
                      Ver ticket #{n.ticketId}
                      <span className="ml-1 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </button>
                  )}
                </div>

                {!n.leida && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition"
                    title="Marcar como leída"
                  >
                    <CheckCircleIcon className="h-6 w-6" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Paginación */}
        {items.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Mostrar:</span>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                « Inicio
              </button>
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹ Ant
              </button>
              <span className="text-sm text-gray-600 px-2">
                Página {page + 1} de {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sig ›
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Fin »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
