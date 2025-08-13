import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  HomeIcon,
  TicketIcon,
  ChevronRightIcon,
  PencilIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";

export default function ActualizarEstado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [estado, setEstado] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ==== CHAT ====
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviandoMsg, setEnviandoMsg] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/tickets/historial`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No se pudo cargar el ticket");
        const all = await res.json();
        const t = all.find((t) => t.id === Number(id));
        if (!t) throw new Error("Ticket no encontrado");
        setTicket(t);
        setEstado(t.estado);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [id, token]);

  // Cargar hilo de mensajes
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await fetch(`${API}/tickets/${id}/respuestas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.ok) {
          const data = await r.json(); // [{id, autorNombre, autorRol, mensaje, fecha}]
          setMensajes(data);
        }
      } catch (e) {
        console.error("Error cargando respuestas:", e);
      }
    })();
  }, [id, token]);

  const recargarMensajes = async () => {
    try {
      const r = await fetch(`${API}/tickets/${id}/respuestas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setMensajes(await r.json());
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const res = await fetch(`${API}/tickets/${id}/estado?estado=${estado}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.text()) || "Error actualizando");
      setSuccess("¡Estado guardado!");
      setTimeout(() => navigate(-1), 800);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Enviar mensaje (pedir más detalles, conversar)
  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;
    setError("");
    setEnviandoMsg(true);
    try {
      const resp = await fetch(`${API}/tickets/responder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticketId: Number(id),
          mensaje: nuevoMensaje.trim(),
        }),
      });
      if (!resp.ok) throw new Error("No se pudo enviar el mensaje");
      setNuevoMensaje("");
      await recargarMensajes(); // refresca el hilo
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviandoMsg(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center space-x-4">
          <TicketIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-800">
            Actualizar Estado de Ticket #{id}
          </h1>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6 py-3 text-sm text-gray-600 flex items-center space-x-2">
          <Link to="/tecnico" className="flex items-center hover:text-gray-800">
            <HomeIcon className="h-5 w-5 mr-1" /> Inicio
          </Link>
          <ChevronRightIcon className="h-4 w-4" />
          <Link to="/tecnico/tickets-asignados" className="hover:text-gray-800">
            Mis Tickets
          </Link>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-gray-800 font-medium">Actualizar</span>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Detalles del ticket */}
        <section className="lg:col-span-7 bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
              <XCircleIcon className="h-5 w-5 mr-2" /> {error}
            </div>
          )}
          {!ticket ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center">
                <PencilIcon className="h-6 w-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">
                  Detalles del Ticket
                </h2>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-gray-700">
                <div>
                  <dt className="text-sm font-medium text-gray-500 uppercase">
                    Título
                  </dt>
                  <dd className="mt-1">{ticket.titulo}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 uppercase">
                    Prioridad
                  </dt>
                  <dd className="mt-1">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      {ticket.prioridad}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 uppercase">
                    Descripción
                  </dt>
                  <dd className="mt-1 text-gray-600">{ticket.descripcion}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 uppercase">
                    Estado Actual
                  </dt>
                  <dd className="mt-1">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 uppercase">
                      {ticket.estado.replace("_", " ")}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 uppercase">
                    Fecha Creación
                  </dt>
                  <dd className="mt-1">
                    {new Date(ticket.fechaCreacion).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </section>

        {/* Panel derecho: actualizar estado + chat */}
        <aside className="lg:col-span-5 bg-white rounded-lg shadow p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Cambiar Estado
          </h2>

          <div className="relative mb-6">
            <label
              htmlFor="estado"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Selecciona Estado
            </label>
            <select
              id="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              disabled={isSaving}
              className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[
                "PENDIENTE",
                "ASIGNADO",
                "EN_PROCESO",
                "CERRADO",
                "ANULADO",
              ].map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-9 h-5 w-5 text-gray-400" />
          </div>

          <div className="mt-auto flex space-x-4">
            <button
              onClick={() => navigate(-1)}
              disabled={isSaving}
              className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition disabled:opacity-50"
            >
              {isSaving && (
                <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
              )}
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>

          {success && (
            <div className="mt-4 flex items-center text-green-700">
              <CheckCircleIcon className="h-6 w-6 mr-2" />
              {success}
            </div>
          )}

          {/* ==== CHAT (simple) ==== */}
          <div className="mt-8">
            <div className="flex items-center mb-3">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Mensajes</h3>
            </div>

            {/* Lista */}
            <div className="max-h-72 overflow-y-auto border rounded-lg p-3 space-y-3">
              {mensajes.length === 0 ? (
                <p className="text-sm text-gray-500">Aún no hay mensajes.</p>
              ) : (
                mensajes.map((m) => (
                  <div key={m.id} className="bg-gray-50 rounded p-2">
                    <div className="text-xs text-gray-500">
                      {m.autorNombre} · {m.autorRol} ·{" "}
                      {new Date(m.fecha).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap mt-1">
                      {m.mensaje}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="mt-3">
              <label className="block text-sm text-gray-700 mb-1">
                Escribe un mensaje para solicitar más detalles
              </label>
              <textarea
                rows={3}
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: ¿Puedes adjuntar una captura del error y los pasos para reproducirlo?"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleEnviarMensaje}
                  disabled={enviandoMsg || !nuevoMensaje.trim()}
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  {enviandoMsg ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
