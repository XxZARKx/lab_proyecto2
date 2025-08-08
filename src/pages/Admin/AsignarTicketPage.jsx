import React, { useEffect, useState, Fragment } from "react";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { Dialog, Transition } from "@headlessui/react";

const priorityClasses = {
  ALTA: "border-l-red-500",
  MEDIA: "border-l-yellow-500",
  BAJA: "border-l-green-500",
};

const CATEGORY_OPTIONS = ["Hardware", "Software", "Redes", "Correo", "Otro"];

export default function AsignarTicketPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [asignacion, setAsignacion] = useState("");
  const [loading, setLoading] = useState(false);

  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [resT, resTec] = await Promise.all([
          fetch(`${API}/tickets/pendientes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/usuarios/tecnicos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (!resT.ok || !resTec.ok) throw new Error();
        setTickets(await resT.json());
        setTecnicos(await resTec.json());
      } catch {
        toast.error("Error al cargar tickets o técnicos");
      }
    })();
  }, [token]);

  const abrirModal = (ticket) => {
    setSelectedTicket(ticket);
    setAsignacion("");
  };
  const cerrarModal = () => setSelectedTicket(null);

  const handleAsignar = async () => {
    if (!asignacion) return toast.warn("Selecciona un técnico");
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/tickets/${selectedTicket.id}/asignar?tecnicoId=${asignacion}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      toast.success("Ticket asignado correctamente");
      setTickets((t) => t.filter((x) => x.id !== selectedTicket.id));
      cerrarModal();
    } catch {
      toast.error("Error al asignar el ticket");
    } finally {
      setLoading(false);
    }
  };

  // Aplica filtros
  const filtered = tickets.filter((t) => {
    return (
      (!priorityFilter || t.prioridad === priorityFilter) &&
      (!categoryFilter || t.categoria === categoryFilter)
    );
  });

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="ml-4 text-3xl font-bold text-gray-900">
            Asignar Tickets Pendientes
          </h1>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-8">
          <select
            className="border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">Todas las prioridades</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>

          <select
            className="border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Grid de tickets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => abrirModal(ticket)}
              className={`
                bg-white rounded-lg shadow hover:shadow-lg p-6 cursor-pointer transition
                ${
                  priorityClasses[ticket.prioridad] || "border-l-gray-300"
                } border-l-4
              `}
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {ticket.titulo}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                <strong>Categoría:</strong> {ticket.categoria || "—"}
              </p>
              <p className="mt-2 text-gray-600 line-clamp-3">
                {ticket.descripcion}
              </p>
              <div className="mt-4 flex justify-between text-sm text-gray-500">
                <span>Prioridad: {ticket.prioridad}</span>
                <span>
                  {new Date(ticket.fechaCreacion).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              No hay tickets que coincidan con los filtros.
            </p>
          )}
        </div>
      </div>

      {/* Modal de asignación */}
      <Transition appear show={!!selectedTicket} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cerrarModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-30"
            leave="ease-in duration-150"
            leaveFrom="opacity-30"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black opacity-35" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6 shadow-lg">
                  <Dialog.Title className="text-xl font-bold text-gray-900 mb-4 text-center">
                    🚀 Asignar Técnico
                  </Dialog.Title>
                  <p className="text-gray-700 mb-2">
                    <strong>Título:</strong> {selectedTicket?.titulo}
                  </p>
                  <p className="text-gray-700 mb-4">
                    <strong>Descripción:</strong> {selectedTicket?.descripcion}
                  </p>
                  <select
                    className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring focus:border-blue-300"
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
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={cerrarModal}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAsignar}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center transition disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Asignar"
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
