// src/pages/HistorialUsuario.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API } from "../../api";
import { ArrowLeft, Search, Loader2, Ticket as TicketIcon } from "lucide-react";

export default function HistorialUsuario() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/tickets/historial`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al obtener el historial");
        const data = await res.json();
        setTickets(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el historial");
      } finally {
        setLoading(false);
      }
    };
    fetchHistorial();
  }, [token]);

  useEffect(() => {
    setFiltered(
      tickets.filter((t) =>
        t.titulo.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, tickets]);

  const getEstadoClasses = (estado) => {
    switch (estado) {
      case "PENDIENTE":
        return "bg-yellow-100 text-yellow-800";
      case "ASIGNADO":
        return "bg-blue-100 text-blue-800";
      case "EN_PROCESO":
        return "bg-orange-100 text-orange-800";
      case "CERRADO":
        return "bg-green-100 text-green-800";
      case "ANULADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPrioridadClasses = (prioridad) => {
    switch (prioridad) {
      case "ALTA":
        return "bg-red-100 text-red-800";
      case "MEDIA":
        return "bg-yellow-100 text-yellow-800";
      case "BAJA":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              Historial de Tickets
            </h1>
            <TicketIcon className="w-6 h-6 text-gray-500" />
          </div>
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Buscar título..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="text-gray-600">
              Total: <span className="font-semibold">{tickets.length}</span>
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-100 text-red-700 p-4 rounded-lg border border-red-300">
            <ArrowLeft className="hidden" /> {/* sólo para spacing */}
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No hay tickets en el historial.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {["N°", "Título", "Estado", "Prioridad", "Fecha"].map(
                    (col, idx) => (
                      <th
                        key={idx}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {ticket.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {ticket.titulo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoClasses(
                          ticket.estado
                        )}`}
                      >
                        {ticket.estado.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getPrioridadClasses(
                          ticket.prioridad
                        )}`}
                      >
                        {ticket.prioridad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(ticket.fechaCreacion).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
