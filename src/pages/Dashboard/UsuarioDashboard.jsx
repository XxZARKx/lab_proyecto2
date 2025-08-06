import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  TicketIcon,
  BellAlertIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  ClockIcon,
  DocumentCheckIcon,
  XCircleIcon,
  Cog6ToothIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/solid";

export default function UsuarioDashboard() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`${API}/tickets/historial`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error("Error al obtener tickets:", error);
      }
    };

    fetchTickets();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col items-center py-8">
        <div className="text-2xl font-bold mb-8 flex flex-col items-center">
          <Cog6ToothIcon className="h-8 w-8 text-white" />
          <div className="flex items-center gap-1">
            <HandRaisedIcon className="h-5 w-5 text-yellow-300" />
            ¡Bienvenido!
          </div>
        </div>
        <nav className="space-y-4 w-full px-4">
          <Link
            to="/usuario"
            className="flex items-center space-x-2 hover:text-yellow-400"
          >
            <TicketIcon className="h-5 w-5" />
            <span>Inicio</span>
          </Link>
          <Link
            to="/usuario/tickets"
            className="flex items-center space-x-2 hover:text-yellow-400"
          >
            <TicketIcon className="h-5 w-5" />
            <span>Ticket Pendiente</span>
          </Link>
          <Link
            to="/usuario/historial"
            className="flex items-center space-x-2 hover:text-yellow-400"
          >
            <TicketIcon className="h-5 w-5" />
            <span>Historial de Ticket</span>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-end mb-6 items-center space-x-4">
          <BellAlertIcon className="h-6 w-6 text-yellow-400" />
          <UserCircleIcon className="h-6 w-6 text-blue-600" />
          <span className="font-semibold">Usuario</span>
          <button onClick={handleLogout}>
            <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-red-500 cursor-pointer" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-200 p-4 rounded text-center">
            <ClockIcon className="h-6 w-6 mx-auto text-gray-700" />
            <div>Pendiente</div>
            <div className="text-xl font-bold">
              {tickets.filter((t) => t.estado === "PENDIENTE").length}
            </div>
          </div>
          <div className="bg-gray-200 p-4 rounded text-center">
            <DocumentCheckIcon className="h-6 w-6 mx-auto text-green-600" />
            <div>Completado</div>
            <div className="text-xl font-bold">
              {tickets.filter((t) => t.estado === "CERRADO").length}
            </div>
          </div>
          <div className="bg-gray-200 p-4 rounded text-center">
            <XCircleIcon className="h-6 w-6 mx-auto text-red-500" />
            <div>Anulado</div>
            <div className="text-xl font-bold">
              {tickets.filter((t) => t.estado === "ANULADO").length}
            </div>
          </div>
          <div className="bg-gray-300 p-4 rounded text-center">
            <div>Total de Ticket</div>
            <div className="text-3xl font-bold">{tickets.length}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mb-4 gap-4">
          <Link
            to="/usuario/tickets/nuevo"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1"
          >
            <PlusIcon className="h-4 w-4" /> Nuevo Ticket
          </Link>
          <Link
            to="/usuario/historial"
            className="border border-black px-4 py-2 rounded flex items-center gap-1"
          >
            <TicketIcon className="h-4 w-4" /> Ver Todos
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 text-white rounded">
            <thead>
              <tr>
                <th className="py-2 px-4">N_TICKET</th>
                <th className="py-2 px-4">TITULO</th>
                <th className="py-2 px-4">DESCRIPTION</th>
                <th className="py-2 px-4">ESTADO</th>
                <th className="py-2 px-4">PRIORIDAD</th>
                <th className="py-2 px-4">FECHA_CREACION</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-t border-gray-700">
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
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
