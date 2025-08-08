// src/pages/TicketsPendientes.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { AlertTriangle, TicketIcon, Loader, ArrowLeft } from "lucide-react";

export default function TicketsPendientes() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/tickets/historial`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar tickets");
        const data = await res.json();
        const pendientes = data.filter((t) => t.estado === "PENDIENTE");
        setTickets(pendientes);
        setFiltered(pendientes);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los tickets pendientes");
      } finally {
        setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-3xl font-bold text-blue-700">
              Tickets Pendientes
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-gray-700">
              Total: <span className="font-semibold">{tickets.length}</span>
            </div>
            <input
              type="text"
              placeholder="Buscar por título..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 p-4 rounded border border-red-300">
            <AlertTriangle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin w-10 h-10 text-blue-500" />
          </div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                No hay tickets pendientes.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition relative"
                  >
                    <div className="absolute top-4 right-4">
                      <TicketIcon className="w-6 h-6 text-blue-300" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      #{ticket.id} — {ticket.titulo}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {ticket.descripcion}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.prioridad === "ALTA"
                            ? "bg-red-100 text-red-600"
                            : ticket.prioridad === "MEDIA"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {ticket.prioridad}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(ticket.fechaCreacion)
                          .toLocaleDateString()
                          .replace(/\//g, "-")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
