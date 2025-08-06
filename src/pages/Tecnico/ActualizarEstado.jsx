import React, { useState } from "react";
import { Pencil, CheckCircle } from "lucide-react";

const ticketMock = {
  id: 101,
  titulo: "Problema con impresora",
  descripcion: "La impresora no responde al enviar documentos.",
  estadoActual: "Pendiente",
  prioridad: "Alta",
  fecha: "2025-07-20",
};

const estadosDisponibles = ["Pendiente", "En proceso", "Cerrado", "Anulado"];

const ActualizarEstado = () => {
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(
    ticketMock.estadoActual
  );
  const [mensaje, setMensaje] = useState("");

  const handleActualizar = () => {
    setMensaje(`Estado actualizado a: ${estadoSeleccionado}`);
  };

  return (
    <div className="bg-[#eeeeee] min-h-screen p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <Pencil className="text-blue-600" />
        Actualizar Estado del Ticket
      </h2>

      <div className="max-w-3xl bg-white p-6 rounded-xl shadow-lg space-y-4 border border-gray-200">
        {/* Información del ticket */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <p>
            <span className="font-semibold">N° Ticket:</span> {ticketMock.id}
          </p>
          <p>
            <span className="font-semibold">Fecha:</span> {ticketMock.fecha}
          </p>
          <p>
            <span className="font-semibold">Título:</span> {ticketMock.titulo}
          </p>
          <p>
            <span className="font-semibold">Prioridad:</span>{" "}
            {ticketMock.prioridad}
          </p>
          <div className="col-span-2">
            <p className="font-semibold mb-1">Descripción:</p>
            <div className="bg-gray-100 p-3 rounded text-gray-800">
              {ticketMock.descripcion}
            </div>
          </div>
        </div>

        {/* Estado actual y cambio */}
        <div className="mt-4">
          <p className="font-semibold text-gray-700 mb-2">
            Estado actual:
            <span className="ml-2 px-3 py-1 rounded bg-yellow-100 text-yellow-800 text-sm">
              {ticketMock.estadoActual}
            </span>
          </p>

          <label className="block text-sm font-medium mb-1 text-gray-700">
            Cambiar a nuevo estado:
          </label>
          <select
            value={estadoSeleccionado}
            onChange={(e) => setEstadoSeleccionado(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {estadosDisponibles.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>

          <button
            onClick={handleActualizar}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition duration-200"
          >
            Actualizar Estado
          </button>

          {mensaje && (
            <div className="mt-4 flex items-center gap-2 text-green-600 font-semibold">
              <CheckCircle size={20} />
              {mensaje}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActualizarEstado;
