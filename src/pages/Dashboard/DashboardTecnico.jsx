import { useEffect, useState } from "react";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  BellAlertIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  TicketIcon,
  ClockIcon,
  DocumentCheckIcon,
  XCircleIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";

export default function DashboardTecnico() {
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({
    pendiente: 0,
    completado: 0,
    anulado: 0,
  });
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API}/tickets/historial`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        const pendiente = data.filter((t) => t.estado === "PENDIENTE").length;
        const completado = data.filter((t) => t.estado === "COMPLETADO").length;
        const anulado = data.filter((t) => t.estado === "ANULADO").length;

        setCounts({ pendiente, completado, anulado });
        setTickets(data);
      } catch (err) {
        console.error("Error al obtener tickets del técnico:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col items-center py-8">
        <div className="text-2xl font-bold mb-8 flex flex-col items-center">
          <Cog6ToothIcon className="h-8 w-8 text-white" />
          <div className="flex items-center gap-1">
            <WrenchScrewdriverIcon className="h-5 w-5 text-green-300" />
            Técnico
          </div>
        </div>
        <nav className="space-y-4 w-full px-4">
          <Link
            to="/tecnico"
            className="flex items-center space-x-2 hover:text-yellow-400"
          >
            <TicketIcon className="h-5 w-5" />
            <span>Inicio</span>
          </Link>
          <Link
            to="/tecnico/tickets-asignados"
            className="flex items-center space-x-2 hover:text-yellow-400"
          >
            <TicketIcon className="h-5 w-5" />
            <span>Mis Tickets</span>
          </Link>
          <Link
            to="/tecnico/actualizar-estado"
            className="flex items-center space-x-2 hover:text-yellow-400"
          >
            <TicketIcon className="h-5 w-5" />
            <span>Actualizar Estado</span>
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-end mb-6 items-center space-x-4">
          <BellAlertIcon className="h-6 w-6 text-yellow-400" />
          <UserCircleIcon className="h-6 w-6 text-blue-600" />
          <span className="font-semibold">Técnico</span>
          <button onClick={handleLogout}>
            <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-red-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card title="Pendiente" count={counts.pendiente}>
            <ClockIcon className="h-6 w-6 mx-auto text-gray-700" />
          </Card>
          <Card title="Completado" count={counts.completado}>
            <DocumentCheckIcon className="h-6 w-6 mx-auto text-green-600" />
          </Card>
          <Card title="Anulado" count={counts.anulado}>
            <XCircleIcon className="h-6 w-6 mx-auto text-red-500" />
          </Card>
          <Card title="Total de Ticket" count={tickets.length} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 text-white rounded">
            <thead>
              <tr>
                <th className="py-2 px-4">N_Ticket</th>
                <th className="py-2 px-4">Título</th>
                <th className="py-2 px-4">Descripción</th>
                <th className="py-2 px-4">Estado</th>
                <th className="py-2 px-4">Prioridad</th>
                <th className="py-2 px-4">Fecha_Creación</th>
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

function Card({ title, count, children }) {
  return (
    <div className="bg-gray-200 p-4 rounded text-center">
      {children}
      <div>{title}</div>
      <div className="text-xl font-bold">{count}</div>
    </div>
  );
}
