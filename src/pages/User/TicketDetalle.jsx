// src/pages/Usuario/TicketDetalle.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon, // <- NUEVO
} from "@heroicons/react/24/solid";
import TicketStatusBadge from "../../components/shared/TicketStatusBadge";
import { PriorityBadge } from "../../components/shared/PriorityBadge";
import { toLocalFromApi } from "../../utils/dates";

export default function TicketDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Contenedor scrolleable del chat
  const listRef = useRef(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });
  };

  // Carga el ticket (desde historial del usuario) y el hilo
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const r1 = await fetch(`${API}/tickets/historial`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r1.ok) throw new Error("No se pudo cargar el ticket");
        const all = await r1.json();
        const t = all.find((x) => x.id === Number(id));
        if (!t) throw new Error("Ticket no encontrado o sin acceso");
        setTicket(t);

        const r2 = await fetch(`${API}/tickets/${id}/respuestas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r2.ok) throw new Error("No se pudo cargar el hilo de mensajes");
        const msgs = await r2.json();
        setMensajes(msgs);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  // Baja automáticamente al último mensaje cuando se actualiza la lista
  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  // Refetch hilo
  // 1. La función se queda sola, limpia
  const recargarMensajes = async () => {
    try {
      const r = await fetch(`${API}/tickets/${id}/respuestas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) {
        setMensajes(await r.json());
      }
    } catch {}
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      recargarMensajes();
    }, 4000);

    return () => clearInterval(intervalo);
  }, [id, token]);

  const enviar = async () => {
    if (!nuevoMensaje.trim()) return;
    setSending(true);
    setError("");
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
      setError(e.message || "Error al enviar");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" /> Volver
          </button>
        </div>
      </div>
    );
  }

  const tecnicoNombre =
    ticket?.tecnico?.nombres || ticket?.tecnicoNombre || null;
  const tecnicoCorreo =
    ticket?.tecnico?.correo || ticket?.tecnicoCorreo || null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              Ticket #{ticket.id} — {ticket.titulo}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <TicketStatusBadge status={ticket.estado} />
            <PriorityBadge priority={ticket.prioridad} />
          </div>
        </div>
      </div>

      {/* Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detalle */}
        <section className="lg:col-span-1 bg-white rounded-lg shadow p-5 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Resumen</h2>
          <div className="text-sm text-gray-700">
            <div className="mb-3">
              <div className="text-gray-500 uppercase text-xs">Descripción</div>
              <div className="mt-1 whitespace-pre-wrap">
                {ticket.descripcion}
              </div>
            </div>

            {/* Técnico asignado */}
            <div className="mt-2 flex items-center gap-2 text-gray-600">
              <WrenchScrewdriverIcon className="h-5 w-5" />
              <span className="text-gray-500 uppercase text-xs">
                Técnico asignado:
              </span>
              <span className="font-medium">
                {tecnicoNombre || "— No asignado —"}
              </span>
            </div>
            {tecnicoCorreo && (
              <div className="ml-7 text-xs text-gray-500">{tecnicoCorreo}</div>
            )}

            <div className="flex items-center gap-2 text-gray-600 mt-3">
              <CalendarDaysIcon className="h-5 w-5" />
              Creado el {toLocalFromApi(ticket.fechaCreacion)}
            </div>

            {ticket.categoria && (
              <div className="mt-2 text-gray-600">
                <span className="text-gray-500 uppercase text-xs">
                  Categoría:{" "}
                </span>
                <span className="font-medium">{ticket.categoria}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <Link
              to="/usuario/historial"
              className="inline-block text-blue-600 hover:underline text-sm"
            >
              Ver mi historial completo
            </Link>
          </div>
        </section>

        {/* Chat */}
        <section className="lg:col-span-2 bg-white rounded-lg shadow p-5 flex flex-col">
          <div className="flex items-center mb-3">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Mensajes</h2>
          </div>

          {/* Caja scrolleable */}
          <div
            ref={listRef}
            className="border rounded-lg p-3 space-y-3 overflow-y-auto max-h-[60vh] min-h-[40vh]"
          >
            {mensajes.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aún no hay mensajes en este ticket.
              </p>
            ) : (
              mensajes.map((m) => (
                <div key={m.id} className="max-w-[85%]">
                  <div className="text-[11px] text-gray-500">
                    {m.autorNombre} · {m.autorRol} · {toLocalFromApi(m.fecha)}
                  </div>
                  <div className="mt-1 bg-gray-50 rounded-lg p-2 text-sm whitespace-pre-wrap">
                    {m.mensaje}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3">
            <label className="block text-sm text-gray-700 mb-1">
              Escribe tu respuesta o más detalles para ayudar al técnico
            </label>
            <div className="flex gap-2">
              <textarea
                rows={3}
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: el error aparece cuando abro el programa y presiono 'Iniciar'…"
              />
              <button
                onClick={enviar}
                disabled={sending || !nuevoMensaje.trim()}
                className="self-end inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white h-[42px] px-4 rounded-lg disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                {sending ? "Enviando…" : "Enviar"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
