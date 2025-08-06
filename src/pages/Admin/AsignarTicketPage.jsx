import { useEffect, useState } from "react";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AsignarTicketPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [asignacion, setAsignacion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resTickets = await fetch(`${API}/tickets/pendientes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resTecnicos = await fetch(`${API}/usuarios/tecnicos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const dataTickets = await resTickets.json();
        const dataTecnicos = await resTecnicos.json();

        setTickets(dataTickets);
        setTecnicos(dataTecnicos);
      } catch (error) {
        toast.error("Error al cargar tickets o técnicos");
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [token]);

  const abrirModal = (ticket) => {
    setSelectedTicket(ticket);
    setAsignacion("");
  };

  const cerrarModal = () => {
    setSelectedTicket(null);
    setAsignacion("");
  };

  const handleAsignar = async () => {
    if (!asignacion) {
      toast.warn("Selecciona un técnico");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${API}/tickets/${selectedTicket.id}/asignar?tecnicoId=${asignacion}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        toast.success("Ticket asignado correctamente");
        setTickets((prev) => prev.filter((t) => t.id !== selectedTicket.id));
        cerrarModal();
      } else {
        throw new Error("Fallo en la asignación");
      }
    } catch (err) {
      toast.error("Error al asignar el ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Botón para volver */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded shadow transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <h2 className="text-2xl font-bold mb-6 text-center">
        Asignar Tickets Pendientes
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            onClick={() => abrirModal(ticket)}
            className="bg-white rounded-lg shadow hover:shadow-lg p-4 cursor-pointer transition"
          >
            <h3 className="text-lg font-semibold text-blue-700">
              {ticket.titulo}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{ticket.descripcion}</p>
            <p className="mt-2 text-sm">
              <span className="font-medium">Prioridad:</span> {ticket.prioridad}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Fecha: {new Date(ticket.fechaCreacion).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4 text-center text-blue-800">
              Asignar Técnico
            </h3>
            <p className="mb-2 text-sm text-gray-700">
              <strong>Ticket:</strong> {selectedTicket.titulo}
            </p>
            <select
              className="w-full p-2 border rounded mb-4"
              value={asignacion}
              onChange={(e) => setAsignacion(e.target.value)}
            >
              <option value="">Selecciona un técnico</option>
              {tecnicos.map((tec) => (
                <option key={tec.id} value={tec.id}>
                  {tec.nombres}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                onClick={cerrarModal}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded min-w-[100px] flex justify-center items-center"
                onClick={handleAsignar}
                disabled={loading}
              >
                {loading ? (
                  <span className="loader border-white border-t-transparent border-2 w-4 h-4 rounded-full animate-spin"></span>
                ) : (
                  "Asignar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
