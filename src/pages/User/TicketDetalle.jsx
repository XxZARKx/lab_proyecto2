// src/pages/User/TicketDetalle.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  ArrowDownCircleIcon,
  UserPlusIcon,
  TagIcon,
  LockClosedIcon, // <--- 1. IMPORTAMOS EL CANDADO
} from "@heroicons/react/24/solid";
import TicketStatusBadge from "../../components/shared/TicketStatusBadge";
import { PriorityBadge } from "../../components/shared/PriorityBadge";
import { toLocalFromApi } from "../../utils/dates";

export default function TicketDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Estados para Admin (Gestión)
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedTecnico, setSelectedTecnico] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [processing, setProcessing] = useState(false);

  // --- LÓGICA DE CHAT INTELIGENTE ---
  const listRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Roles y Estado
  const isAdmin = user?.rol === "ADMINISTRADOR";
  // 2. Variable para saber si está cerrado
  const isClosed = ticket?.estado === "CERRADO" || ticket?.estado === "ANULADO";

  // 1. Función para bajar al final
  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
      setShowScrollBtn(false);
    }
  };

  // 2. Detectar scroll
  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollBtn(distanceToBottom > 100);
    }
  };

  // 3. Efecto inteligente scroll
  useEffect(() => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      const isNearBottom = distanceToBottom < 150;

      if (isNearBottom || mensajes.length <= 1) {
        scrollToBottom();
      } else {
        setShowScrollBtn(true);
      }
    }
  }, [mensajes]);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API}/tickets/historial`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No se pudo cargar el ticket");
        const all = await res.json();
        const t = all.find((x) => x.id === Number(id));
        if (!t) throw new Error("Ticket no encontrado o sin acceso");

        setTicket(t);
        if (t.tecnico) setSelectedTecnico(t.tecnico.id);
        setNewStatus(t.estado);

        const r2 = await fetch(`${API}/tickets/${id}/respuestas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r2.ok) setMensajes(await r2.json());

        if (isAdmin) {
          const r3 = await fetch(`${API}/usuarios/tecnicos`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (r3.ok) setTecnicos(await r3.json());
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token, isAdmin]);

  // Polling
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
    const intervalo = setInterval(recargarMensajes, 4000);
    return () => clearInterval(intervalo);
  }, [id, token]);

  // Enviar mensaje
  const enviar = async () => {
    if (!nuevoMensaje.trim()) return;
    setSending(true);
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
      if (!resp.ok) throw new Error("Error al enviar");
      setNuevoMensaje("");
      await recargarMensajes();
    } catch (e) {
      toast.error("No se pudo enviar el mensaje");
    } finally {
      setSending(false);
    }
  };

  // --- FUNCIONES ADMIN ---
  const handleAsignar = async () => {
    if (!selectedTecnico) return toast.error("Selecciona un técnico");
    setProcessing(true);
    const toastId = toast.loading("Asignando...");
    try {
      const res = await fetch(
        `${API}/tickets/${id}/asignar?tecnicoId=${selectedTecnico}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Error");
      toast.success("Asignado correctamente", { id: toastId });
      const tec = tecnicos.find((t) => t.id == selectedTecnico);
      setTicket((prev) => ({
        ...prev,
        tecnico: tec,
        estado: prev.estado === "PENDIENTE" ? "ASIGNADO" : prev.estado,
      }));
      setNewStatus((prev) => (prev === "PENDIENTE" ? "ASIGNADO" : prev));
    } catch (error) {
      toast.error("Error al asignar técnico", { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  const handleChangeStatus = async () => {
    if (newStatus === ticket.estado) return;
    setProcessing(true);
    const toastId = toast.loading("Actualizando estado...");
    try {
      const res = await fetch(
        `${API}/tickets/${id}/estado?estado=${newStatus}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Error");
      toast.success("Estado actualizado", { id: toastId });
      setTicket((prev) => ({ ...prev, estado: newStatus }));
    } catch (error) {
      toast.error("Error al cambiar estado", { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Volver
          </button>
        </div>
      </div>
    );

  const tecnicoNombre =
    ticket?.tecnico?.nombres || ticket?.tecnicoNombre || null;
  const tecnicoCorreo =
    ticket?.tecnico?.correo || ticket?.tecnicoCorreo || null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded hover:bg-gray-100 transition"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 truncate max-w-md">
              Ticket #{ticket.id}{" "}
              <span className="text-gray-400 font-normal mx-2">|</span>{" "}
              {ticket.titulo}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* 3. Badge CERRADO */}
            {isClosed && (
              <span className="hidden sm:flex bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full items-center border border-red-200 mr-2">
                <LockClosedIcon className="w-3 h-3 mr-1" /> CERRADO
              </span>
            )}
            <TicketStatusBadge status={ticket.estado} />
            <PriorityBadge priority={ticket.prioridad} />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA IZQUIERDA */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Detalles
            </h2>
            <div className="text-sm text-gray-700 space-y-4">
              <div>
                <div className="text-gray-500 uppercase text-xs font-bold mb-1">
                  Descripción
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-gray-600">
                  {ticket.descripcion}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 uppercase text-xs font-bold block mb-1">
                    Categoría
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">
                    {ticket.categoria || "General"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 uppercase text-xs font-bold block mb-1">
                    Fecha
                  </span>
                  <span className="flex items-center gap-1 text-gray-700">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                    {toLocalFromApi(ticket.fechaCreacion)}
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-4 mt-4 border-t">
              <Link
                to="/usuario/historial"
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Ver historial completo
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center gap-2 mb-4 border-b pb-2">
              <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                {isAdmin ? "Gestión" : "Técnico"}
              </h2>
            </div>

            {isAdmin ? (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Asignar Técnico
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={selectedTecnico}
                      onChange={(e) => setSelectedTecnico(e.target.value)}
                      disabled={processing}
                    >
                      <option value="">-- Seleccionar --</option>
                      {tecnicos.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nombres}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAsignar}
                      disabled={processing || !selectedTecnico}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition disabled:opacity-50 shadow-sm"
                    >
                      <UserPlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {tecnicoNombre && (
                    <p className="text-xs text-green-600 mt-2 bg-green-50 p-2 rounded border border-green-100">
                      Actual: <strong>{tecnicoNombre}</strong>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                    Forzar Estado
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      disabled={processing}
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
                    <button
                      onClick={handleChangeStatus}
                      disabled={processing || newStatus === ticket.estado}
                      className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition disabled:opacity-50 shadow-sm"
                    >
                      <TagIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-full flex-shrink-0">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {tecnicoNombre || "Sin asignar"}
                  </p>
                  {tecnicoCorreo && (
                    <p className="text-xs text-gray-500">{tecnicoCorreo}</p>
                  )}
                  {!tecnicoNombre && (
                    <p className="text-xs text-yellow-600 mt-1 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100 inline-block">
                      Esperando asignación...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* COLUMNA DERECHA: Chat */}
        <section className="lg:col-span-2 bg-white rounded-lg shadow p-5 flex flex-col h-[600px] relative">
          <div className="flex items-center mb-4 border-b pb-2">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Mensajes</h2>
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg border border-gray-200 scroll-smooth"
          >
            {mensajes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
                <p>No hay mensajes aún.</p>
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
                        {toLocalFromApi(m.fecha)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-24 right-8 bg-white p-2 rounded-full shadow-lg border border-gray-200 text-blue-600 hover:bg-gray-100 animate-bounce z-10"
            >
              <ArrowDownCircleIcon className="h-8 w-8" />
            </button>
          )}

          {/* 4. BLOQUEO DE INPUT SI ESTÁ CERRADO */}
          <div className="mt-4 pt-2 border-t relative">
            {isClosed && (
              <div className="absolute inset-0 bg-white bg-opacity-60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                <span className="text-xs font-bold text-gray-500 uppercase flex items-center bg-white px-3 py-1 rounded-full shadow-sm border">
                  <LockClosedIcon className="h-3 w-3 mr-1" /> Ticket cerrado
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
                    ? "No puedes enviar mensajes"
                    : "Escribe un mensaje..."
                }
                disabled={isClosed} // Bloqueado
              />
              <button
                onClick={enviar}
                disabled={sending || !nuevoMensaje.trim() || isClosed} // Bloqueado
                className="mb-1 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white h-10 w-10 rounded-full shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
