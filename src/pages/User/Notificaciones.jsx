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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BellIcon className="h-6 w-6 text-yellow-500" />
            Notificaciones
          </h1>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlyUnread}
                onChange={(e) => {
                  setOnlyUnread(e.target.checked);
                  setPage(0);
                }}
              />
              Solo no leídas
            </label>
            <button
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={handleMarkAll}
            >
              Marcar todas como leídas
            </button>
          </div>
        </div>

        {err && <div className="mb-3 text-red-600">{err}</div>}

        {loading ? (
          <div className="py-16 text-center text-gray-500">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No hay notificaciones.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((n) => (
              <li
                key={n.id}
                className="py-4 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    {!n.leida ? (
                      <span className="inline-flex items-center text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                        Nueva
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                        Leída
                      </span>
                    )}
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {new Date(n.creadoEn).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 font-medium text-gray-900">
                    {n.titulo}
                  </div>
                  <div className="text-gray-700 text-sm">{n.mensaje}</div>
                  {n.ticketId && (
                    <button
                      onClick={() => navigate(`/tickets/${n.ticketId}`)}
                      className="mt-2 text-blue-600 text-sm hover:underline"
                    >
                      Ver ticket #{n.ticketId}
                    </button>
                  )}
                </div>
                {!n.leida && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="self-center flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    Marcar leída
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Paginación */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Por página:</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-l-md bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              « Primera
            </button>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm border-t border-b border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              ‹ Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm border-t border-b border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente ›
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-r-md bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Última »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
