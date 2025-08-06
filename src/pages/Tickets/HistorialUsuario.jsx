import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API } from "../../api";

export default function HistorialUsuario() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await fetch(`${API}/tickets/historial`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Error al obtener el historial");

        const data = await res.json();
        setTickets(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el historial");
      }
    };

    fetchHistorial();
  }, [token]);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Historial de Tickets</h1>

      {error && (
        <div className="bg-red-200 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-black rounded shadow">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="py-2 px-4">N_TICKET</th>
              <th className="py-2 px-4">TÍTULO</th>
              <th className="py-2 px-4">DESCRIPCIÓN</th>
              <th className="py-2 px-4">ESTADO</th>
              <th className="py-2 px-4">PRIORIDAD</th>
              <th className="py-2 px-4">FECHA</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="border-t border-gray-300 hover:bg-gray-50"
              >
                <td className="py-2 px-4">{ticket.id}</td>
                <td className="py-2 px-4">{ticket.titulo}</td>
                <td className="py-2 px-4">{ticket.descripcion}</td>
                <td className="py-2 px-4">{ticket.estado}</td>
                <td className="py-2 px-4">{ticket.prioridad}</td>
                <td className="py-2 px-4">
                  {new Date(ticket.fechaCreacion).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-4">
                  No tienes tickets en tu historial.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
