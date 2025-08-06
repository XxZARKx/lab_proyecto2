import React, { useEffect, useState } from "react";
import { Clock, FileText, Ban } from "lucide-react";

const mockTicketsAsignados = [
  {
    id: 101,
    titulo: "Problema con impresora",
    descripcion: "La impresora no responde al enviar documentos.",
    estado: "Pendiente",
    prioridad: "Alta",
    fecha_creacion: "2025-07-20",
  },
  {
    id: 102,
    titulo: "Correo no carga",
    descripcion: "Outlook se queda cargando indefinidamente.",
    estado: "Completado",
    prioridad: "Media",
    fecha_creacion: "2025-07-18",
  },
  {
    id: 103,
    titulo: "Fallo de sistema",
    descripcion: "No puedo acceder al sistema contable.",
    estado: "Anulado",
    prioridad: "Alta",
    fecha_creacion: "2025-07-15",
  },
];

const TicketsAsignados = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    setTickets(mockTicketsAsignados);
  }, []);

  const totalTickets = tickets.length;
  const pendientes = tickets.filter((t) => t.estado === "Pendiente").length;
  const completados = tickets.filter((t) => t.estado === "Completado").length;
  const anulados = tickets.filter((t) => t.estado === "Anulado").length;

  return (
    <div className="bg-[#eeeeee] min-h-screen p-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-4 shadow">
          <Clock className="text-yellow-500" />
          <div>
            <p className="text-sm font-medium">Pendiente</p>
            <p className="text-lg font-bold">{pendientes}</p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-4 shadow">
          <FileText className="text-green-500" />
          <div>
            <p className="text-sm font-medium">Completado</p>
            <p className="text-lg font-bold">{completados}</p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-4 shadow">
          <Ban className="text-red-500" />
          <div>
            <p className="text-sm font-medium">Anulado</p>
            <p className="text-lg font-bold">{anulados}</p>
          </div>
        </div>

        <div className="bg-gray-200 rounded-lg p-4 text-center shadow">
          <p className="text-sm font-medium">Total de Ticket</p>
          <p className="text-4xl font-bold">{totalTickets}</p>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="min-w-full text-left text-sm text-white">
          <thead className="bg-gray-700 uppercase text-xs font-bold">
            <tr>
              <th className="px-4 py-3">N° Ticket</th>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Prioridad</th>
              <th className="px-4 py-3">Fecha Creación</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-700">
                <td className="px-4 py-3 border-t border-gray-700">
                  {ticket.id}
                </td>
                <td className="px-4 py-3 border-t border-gray-700">
                  {ticket.titulo}
                </td>
                <td className="px-4 py-3 border-t border-gray-700">
                  {ticket.descripcion}
                </td>
                <td className="px-4 py-3 border-t border-gray-700">
                  {ticket.estado}
                </td>
                <td className="px-4 py-3 border-t border-gray-700">
                  {ticket.prioridad}
                </td>
                <td className="px-4 py-3 border-t border-gray-700">
                  {ticket.fecha_creacion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketsAsignados;
