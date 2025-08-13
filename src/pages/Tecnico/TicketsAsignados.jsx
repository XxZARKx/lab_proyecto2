import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API } from "../../api";
import { useNavigate } from "react-router-dom";
import { Clock, FileText, Ban, ArrowLeft } from "lucide-react";

export default function TicketsAsignados() {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({
    pendiente: 0,
    cerrado: 0,
    anulado: 0,
  });
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch(`${API}/tickets/historial`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar tickets");
        const data = await res.json();
        setTickets(data);
        setCounts({
          pendiente: data.filter((t) => t.estado === "PENDIENTE").length,
          cerrado: data.filter((t) => t.estado === "CERRADO").length,
          anulado: data.filter((t) => t.estado === "ANULADO").length,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchTickets();
  }, [token]);

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </button>

        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Mis Tickets Asignados
        </h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Clock className="text-yellow-500" />}
            label="Pendientes"
            value={counts.pendiente}
          />
          <StatCard
            icon={<FileText className="text-green-500" />}
            label="Cerrado"
            value={counts.cerrado}
          />
          <StatCard
            icon={<Ban className="text-red-500" />}
            label="Anulados"
            value={counts.anulado}
          />
          <StatCard label="Total Tickets" value={tickets.length} />
        </div>

        {/* Tabla de Tickets */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  N° Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() =>
                    navigate(`/tecnico/tickets/${ticket.id}/actualizar`)
                  }
                  className="hover:bg-gray-100 cursor-pointer transition-colors"
                  title="Ver detalles del ticket"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {ticket.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {ticket.titulo}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 line-clamp-1">
                    {ticket.descripcion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-block text-xs font-semibold rounded-full ${
                        ticket.estado === "PENDIENTE"
                          ? "bg-yellow-100 text-yellow-800"
                          : ticket.estado === "CERRADO"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ticket.estado.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-block text-xs font-semibold rounded-full ${
                        ticket.prioridad === "ALTA"
                          ? "bg-red-100 text-red-800"
                          : ticket.prioridad === "MEDIA"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {ticket.prioridad}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ticket.fechaCreacion).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-lg p-4 flex items-center gap-4 shadow">
      {icon && <div className="p-2 bg-gray-50 rounded-full">{icon}</div>}
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
