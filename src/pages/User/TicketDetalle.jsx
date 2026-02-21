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
  LockClosedIcon,
  UserIcon,
  InformationCircleIcon,
  ClipboardDocumentListIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
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

  const [tecnicos, setTecnicos] = useState([]);
  const [selectedTecnico, setSelectedTecnico] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [processing, setProcessing] = useState(false);

  // --- ESTADOS PARA MODAL DE ANULACIÓN ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const listRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const isAdmin = user?.rol === "ADMINISTRADOR";
  const isClosed = ticket?.estado === "CERRADO" || ticket?.estado === "ANULADO";

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
      setShowScrollBtn(false);
    }
  };

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      setShowScrollBtn(distanceToBottom > 100);
    }
  };

  useEffect(() => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      if (distanceToBottom < 150 || mensajes.length <= 1) {
        scrollToBottom();
      } else {
        setShowScrollBtn(true);
      }
    }
  }, [mensajes]);

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

  const recargarMensajes = async () => {
    try {
      const r = await fetch(`${API}/tickets/${id}/respuestas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setMensajes(await r.json());
    } catch {}
  };

  useEffect(() => {
    const intervalo = setInterval(recargarMensajes, 4000);
    return () => clearInterval(intervalo);
  }, [id, token]);

  const enviar = async () => {
    if (!nuevoMensaje.trim() || isClosed) return;
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

  const handleAsignar = async () => {
    if (!selectedTecnico) return toast.error("Selecciona un técnico");
    setProcessing(true);
    const toastId = toast.loading("Asignando...");
    try {
      const res = await fetch(
        `${API}/tickets/${id}/asignar?tecnicoId=${selectedTecnico}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
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
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
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

  const handleAnularTicket = async () => {
    setDeleting(true);
    const toastId = toast.loading("Anulando ticket...");
    try {
      const res = await fetch(`${API}/tickets/${id}/estado?estado=ANULADO`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al anular el ticket");

      toast.success("Ticket anulado con éxito", { id: toastId });
      setTicket((prev) => ({ ...prev, estado: "ANULADO" }));
      setNewStatus("ANULADO");
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Hubo un problema al anular el ticket", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="text-gray-500 font-medium animate-pulse">
            Cargando ticket...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <p className="text-red-600 mb-4 font-medium">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );

  const tecnicoNombre =
    ticket?.tecnico?.nombres || ticket?.tecnicoNombre || null;
  const tecnicoCorreo =
    ticket?.tecnico?.correo || ticket?.tecnicoCorreo || null;

  return (
    <>
      <div className="h-screen bg-gray-50/50 flex flex-col overflow-hidden relative">
        {/* HEADER FIJO */}
        <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-10">
          <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition"
                title="Volver"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    #{ticket.id}
                  </span>
                  <h1 className="text-xl font-bold text-gray-900 truncate max-w-[150px] sm:max-w-md lg:max-w-2xl">
                    {ticket.titulo}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {isClosed && (
                <span className="hidden sm:flex bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full items-center border border-red-200">
                  <LockClosedIcon className="w-3.5 h-3.5 mr-1.5" /> CERRADO
                </span>
              )}
              <TicketStatusBadge status={ticket.estado} />
              <PriorityBadge priority={ticket.prioridad} />

              {/* BOTÓN DE ANULAR (SOLO ADMIN) AHORA MÁS VISIBLE */}
              {isAdmin && ticket.estado !== "ANULADO" && (
                <>
                  <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg transition-all shadow-md active:scale-95 border border-red-700"
                    title="Anular Ticket"
                  >
                    <NoSymbolIcon className="w-5 h-5" />
                    <span className="hidden sm:inline tracking-wide">
                      Anular Ticket
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL: 3 COLUMNAS */}
        <main className="flex-1 max-w-[100rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto lg:overflow-hidden">
          {/* COLUMNA 1: Detalles del Ticket */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col lg:h-full min-h-[500px]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50 flex-shrink-0">
              <InformationCircleIcon className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold text-gray-800">
                Detalles del Ticket
              </h2>
            </div>

            <div className="p-5 space-y-6 flex-1 overflow-y-auto">
              <div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Solicitante
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 text-blue-600 font-bold flex-shrink-0">
                    {ticket.usuario?.nombres ? (
                      ticket.usuario.nombres.charAt(0).toUpperCase()
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-gray-900 truncate">
                      {ticket.usuario?.nombres || "Desconocido"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {ticket.usuario?.correo || "Sin correo"}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Categoría
                  </h3>
                  <span className="inline-flex items-center bg-gray-100 px-2.5 py-1 rounded-md text-sm font-medium text-gray-700 border border-gray-200">
                    {ticket.categoria || "General"}
                  </span>
                </div>
                <div>
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Fecha
                  </h3>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                    {toLocalFromApi(ticket.fechaCreacion)}
                  </span>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <ClipboardDocumentListIcon className="w-4 h-4" /> Descripción
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 leading-relaxed border border-gray-100 whitespace-pre-wrap">
                  {ticket.descripcion}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl flex-shrink-0">
              <Link
                to="/usuario/historial"
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition"
              >
                ← Volver al historial
              </Link>
            </div>
          </section>

          {/* COLUMNA 2: Gestión y Asignación */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col lg:h-full min-h-[500px]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50 flex-shrink-0">
              <WrenchScrewdriverIcon className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-gray-800">
                {isAdmin ? "Gestión y Asignación" : "Información del Técnico"}
              </h2>
            </div>

            <div className="p-5 space-y-6 flex-1 overflow-y-auto">
              {isAdmin ? (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      Técnico Asignado
                    </label>

                    {tecnicoNombre ? (
                      <div className="mb-3 flex items-center gap-3 p-3 rounded-lg border border-indigo-100 bg-indigo-50/30">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 text-indigo-600 font-bold flex-shrink-0">
                          {tecnicoNombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {tecnicoNombre}
                          </p>
                          {tecnicoCorreo && (
                            <p className="text-xs text-gray-500 truncate">
                              {tecnicoCorreo}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 p-3 rounded-lg border border-yellow-200 bg-yellow-50 text-sm text-yellow-700 font-medium flex items-center gap-2">
                        <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
                        Aún no asignado
                      </div>
                    )}

                    <div className="flex gap-2">
                      <select
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-gray-700 min-w-0"
                        value={selectedTecnico}
                        onChange={(e) => setSelectedTecnico(e.target.value)}
                        disabled={processing}
                      >
                        <option value="">-- Cambiar --</option>
                        {tecnicos.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombres}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAsignar}
                        disabled={processing || !selectedTecnico}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg transition disabled:opacity-50 shadow-sm flex-shrink-0"
                        title="Guardar asignación"
                      >
                        <UserPlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      Actualizar Estado
                    </label>
                    <div className="flex gap-2">
                      <select
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-gray-700 min-w-0"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        disabled={processing}
                      >
                        {/* 👇 AQUI SE ELIMINÓ 'ANULADO' DE LA LISTA 👇 */}
                        {["PENDIENTE", "ASIGNADO", "EN_PROCESO", "CERRADO"].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ),
                        )}
                      </select>
                      <button
                        onClick={handleChangeStatus}
                        disabled={processing || newStatus === ticket.estado}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition disabled:opacity-50 shadow-sm flex-shrink-0"
                        title="Guardar estado"
                      >
                        <TagIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  {tecnicoNombre ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 text-indigo-600 font-bold flex-shrink-0">
                        {tecnicoNombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-gray-900 truncate">
                          {tecnicoNombre}
                        </p>
                        {tecnicoCorreo && (
                          <p className="text-sm text-gray-500 truncate">
                            {tecnicoCorreo}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50 text-sm text-yellow-700 font-medium flex items-center gap-2">
                      <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
                      Esperando asignación...
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* COLUMNA 3: Chat */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col lg:h-full min-h-[500px] relative overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500" />
                <h2 className="text-base font-bold text-gray-800">
                  Hilo de Mensajes
                </h2>
              </div>
              <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full">
                {mensajes.length}{" "}
                {mensajes.length === 1 ? "mensaje" : "mensajes"}
              </span>
            </div>

            <div
              ref={listRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#f8fafc] scroll-smooth relative"
            >
              {mensajes.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="text-sm font-medium">
                    Aún no hay mensajes en este ticket.
                  </p>
                  {!isClosed && (
                    <p className="text-xs mt-1">
                      Escribe abajo para comenzar la conversación.
                    </p>
                  )}
                </div>
              ) : (
                mensajes.map((m) => {
                  const isMe = user?.id === m.autorId;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-end gap-2 max-w-[95%] sm:max-w-[85%] md:max-w-[80%]">
                        {!isMe && (
                          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 text-xs font-bold mb-5 shadow-sm">
                            {m.autorNombre.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="flex flex-col">
                          <div
                            className={`flex items-baseline gap-2 mb-1 px-1 ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            <span className="text-xs font-bold text-gray-700">
                              {isMe ? "Tú" : m.autorNombre}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                              {m.autorRol}
                            </span>
                          </div>
                          <div
                            className={`px-4 py-3 shadow-sm text-[14px] leading-relaxed ${
                              isMe
                                ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                                : "bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{m.mensaje}</p>
                          </div>
                          <span
                            className={`text-[10px] font-medium text-gray-400 mt-1.5 px-1 ${isMe ? "text-right" : "text-left"}`}
                          >
                            {toLocalFromApi(m.fecha)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {showScrollBtn && (
                <button
                  onClick={scrollToBottom}
                  className="sticky bottom-4 float-right right-4 bg-white p-2 rounded-full shadow-md border border-gray-200 text-blue-600 hover:bg-gray-50 transition z-10"
                  title="Ir al último mensaje"
                >
                  <ArrowDownCircleIcon className="h-6 w-6" />
                </button>
              )}
            </div>

            <div className="p-4 sm:p-5 bg-white border-t border-gray-100 flex-shrink-0 relative">
              {isClosed && (
                <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="text-xs font-bold text-gray-600 uppercase flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                    <LockClosedIcon className="h-4 w-4 mr-2 text-red-500" />{" "}
                    Ticket Cerrado
                  </span>
                </div>
              )}
              <div className="flex gap-3 items-end">
                <textarea
                  rows={2}
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-xl p-3 sm:p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none text-sm transition-shadow shadow-inner"
                  placeholder={
                    isClosed
                      ? "Conversación finalizada."
                      : "Escribe tu respuesta aquí..."
                  }
                  disabled={isClosed}
                />
                <button
                  onClick={enviar}
                  disabled={sending || !nuevoMensaje.trim() || isClosed}
                  className="mb-1 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white h-[52px] w-[52px] rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
                  title="Enviar mensaje"
                >
                  {sending ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <PaperAirplaneIcon className="h-5 w-5 -ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* --- MODAL DE CONFIRMACIÓN PARA ANULAR TICKET --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-fade-in-up">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>

            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
              ¿Anular este ticket?
            </h3>

            <p className="text-sm text-gray-500 text-center mb-6">
              Esta acción forzará el cierre del ticket bajo el estado{" "}
              <span className="font-bold text-red-600">ANULADO</span>. El
              usuario y los técnicos ya no podrán enviar mensajes.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAnularTicket}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center shadow-sm disabled:opacity-50"
              >
                {deleting ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  "Sí, anular"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
