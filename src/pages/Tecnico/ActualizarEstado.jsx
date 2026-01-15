import { useState, useEffect, useRef } from "react";
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
  ArrowDownCircleIcon,
  LockClosedIcon, // <--- Icono para el bloqueo
} from "@heroicons/react/24/solid";

export default function ActualizarEstado() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Obtenemos 'user' para saber quién soy en el chat
  const { token, user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [estado, setEstado] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // ==== CHAT ====
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviandoMsg, setEnviandoMsg] = useState(false);

  // Referencias para el scroll
  const chatRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Lógica de bloqueo: Si el estado es CERRADO, se bloquea todo
  const isClosed = ticket?.estado === "CERRADO" || ticket?.estado === "ANULADO";

  // Cargar info del ticket
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

  // Cargar hilo de mensajes inicial
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const r = await fetch(`${API}/tickets/${id}/respuestas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.ok) {
          const data = await r.json();
          setMensajes(data);
        }
      } catch (e) {
        console.error("Error cargando respuestas:", e);
      }
    })();
  }, [id, token]);

  // --- LÓGICA DE SCROLL INTELIGENTE ---

  // 1. Función para bajar al final
  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
      setShowScrollBtn(false);
    }
  };

  // 2. Detectar si el usuario subió el scroll
  const handleScroll = () => {
    if (chatRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      // Mostrar botón si subió más de 100px
      setShowScrollBtn(distanceToBottom > 100);
    }
  };

  // 3. Efecto al recibir nuevos mensajes
  useEffect(() => {
    if (chatRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      // Bajamos si está cerca del final (< 150px) o si es el inicio
      const isNearBottom = distanceToBottom < 150;

      if (isNearBottom || mensajes.length <= 1) {
        scrollToBottom();
      } else {
        setShowScrollBtn(true);
      }
    }
  }, [mensajes]);

  // --- POLLING ---
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

  useEffect(() => {
    const intervalo = setInterval(() => {
      recargarMensajes();
    }, 4000);
    return () => clearInterval(intervalo);
  }, [id, token]);

  // --- ACCIONES ---

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

      // Actualizamos localmente el ticket para aplicar el bloqueo inmediato si se cerró
      setTicket((prev) => ({ ...prev, estado: estado }));

      if (estado === "CERRADO") {
        // Opcional: podrías redirigir al técnico o dejarlo ahí bloqueado
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

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
      await recargarMensajes();
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
        {/* COLUMNA IZQUIERDA: Detalles del ticket */}
        <section className="lg:col-span-7 bg-white rounded-lg shadow p-6 h-fit">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center">
              <XCircleIcon className="h-5 w-5 mr-2" /> {error}
            </div>
          )}
          {!ticket ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <PencilIcon className="h-6 w-6 text-blue-500 mr-2" />
                  <h2 className="text-xl font-bold text-gray-800">
                    Detalles del Ticket
                  </h2>
                </div>
                {/* Badge de Bloqueo si está cerrado */}
                {isClosed && (
                  <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full flex items-center border border-red-200">
                    <LockClosedIcon className="w-3 h-3 mr-1" /> TICKET CERRADO
                  </span>
                )}
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
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                        isClosed
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
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

        {/* COLUMNA DERECHA: Chat + Estado */}
        <aside className="lg:col-span-5 bg-white rounded-lg shadow p-6 flex flex-col relative h-[600px]">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Gestión y Chat
          </h2>

          {/* Selector de Estado */}
          <div
            className={`p-4 rounded-lg border mb-4 transition-colors ${
              isClosed
                ? "bg-gray-100 border-gray-200 opacity-75"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <label
              htmlFor="estado"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cambiar Estado {isClosed && "(Bloqueado)"}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <select
                  id="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  disabled={isSaving || isClosed} // BLOQUEO
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                {!isClosed && (
                  <ChevronDownIcon className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
                )}
              </div>

              {!isClosed && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 flex items-center"
                >
                  {isSaving && (
                    <ArrowPathIcon className="h-4 w-4 animate-spin mr-1" />
                  )}
                  Guardar
                </button>
              )}
            </div>
            {success && (
              <div className="mt-2 text-xs text-green-700 flex items-center font-medium">
                <CheckCircleIcon className="h-4 w-4 mr-1" /> {success}
              </div>
            )}
          </div>

          {/* ==== CHAT ==== */}
          <div className="flex items-center mb-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Mensajes</h3>
          </div>

          {/* Lista de Mensajes (Estilo WhatsApp) */}
          <div
            ref={chatRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-4 shadow-inner relative"
          >
            {mensajes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p className="text-sm">Aún no hay mensajes.</p>
              </div>
            ) : (
              mensajes.map((m) => {
                const isMe = user?.id === m.autorId;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm relative ${
                        isMe
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                      }`}
                    >
                      <div
                        className={`text-xs font-bold mb-1 flex items-center gap-2 ${
                          isMe ? "text-blue-100" : "text-blue-600"
                        }`}
                      >
                        <span>{isMe ? "Tú" : m.autorNombre}</span>
                        <span
                          className={`font-normal text-[10px] uppercase opacity-75 ${
                            isMe ? "text-blue-200" : "text-gray-400"
                          }`}
                        >
                          • {m.autorRol}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {m.mensaje}
                      </p>
                      <div
                        className={`text-[10px] mt-1 text-right ${
                          isMe ? "text-blue-200" : "text-gray-400"
                        }`}
                      >
                        {new Date(m.fecha).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Botón Flotante para bajar */}
          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-28 right-10 bg-white p-2 rounded-full shadow-lg border border-gray-200 text-blue-600 hover:bg-gray-100 transition-all animate-bounce z-10"
              title="Ir al final"
            >
              <ArrowDownCircleIcon className="h-8 w-8" />
            </button>
          )}

          {/* Input Chat */}
          <div className="mt-3 pt-2 border-t relative">
            {/* Overlay si está cerrado */}
            {isClosed && (
              <div className="absolute inset-0 bg-white bg-opacity-60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                <span className="text-xs font-bold text-gray-500 uppercase flex items-center bg-white px-3 py-1 rounded-full shadow-sm border">
                  <LockClosedIcon className="h-3 w-3 mr-1" /> Chat cerrado
                </span>
              </div>
            )}

            <div className="flex gap-2 items-end">
              <textarea
                rows={2}
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none text-sm disabled:bg-gray-100"
                placeholder={
                  isClosed
                    ? "No se pueden enviar mensajes"
                    : "Escribe un mensaje..."
                }
                disabled={isClosed} // BLOQUEO
              />
              <button
                onClick={handleEnviarMensaje}
                disabled={enviandoMsg || !nuevoMensaje.trim() || isClosed} // BLOQUEO
                className="mb-1 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 rounded-full shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
