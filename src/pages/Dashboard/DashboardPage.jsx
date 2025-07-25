import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  ChartBarIcon,
  TicketIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import TicketStatusBadge from "../../components/shared/TicketStatusBadge";

export default function DashboardPage() {
  const { user } = useAuth();

  const ticketStats = {
    pending: 5,
    cancelled: 2,
    completed: 8,
    total: 15,
  };

  const recentTickets = [
    {
      id: "TKT-1001",
      title: "Problema con el correo",
      description: "No puedo acceder a mi cuenta de correo electrónico",
      status: "Pendiente",
      priority: "Alta",
      createdAt: "2023-05-15",
    },
    {
      id: "TKT-1002",
      title: "Software no funciona",
      description: "El programa XYZ no se inicia correctamente",
      status: "En proceso",
      priority: "Media",
      createdAt: "2023-05-14",
    },
    {
      id: "TKT-1003",
      title: "Solicitud de acceso",
      description: "Necesito acceso a la carpeta compartida",
      status: "Completado",
      priority: "Baja",
      createdAt: "2023-05-10",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          ¡Bienvenido, {user?.name}!
        </h1>
        <Link
          to="/tickets/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg shadow flex items-center"
        >
          <TicketIcon className="h-5 w-5 mr-2" />
          Nuevo Ticket
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<ClockIcon className="h-8 w-8 text-blue-500" />}
          title="Pendientes"
          value={ticketStats.pending}
          color="bg-blue-100 text-blue-800"
        />
        <StatCard
          icon={<XCircleIcon className="h-8 w-8 text-red-500" />}
          title="Anulados"
          value={ticketStats.cancelled}
          color="bg-red-100 text-red-800"
        />
        <StatCard
          icon={<CheckCircleIcon className="h-8 w-8 text-green-500" />}
          title="Completados"
          value={ticketStats.completed}
          color="bg-green-100 text-green-800"
        />
        <StatCard
          icon={<TicketIcon className="h-8 w-8 text-purple-500" />}
          title="Total Tickets"
          value={ticketStats.total}
          color="bg-purple-100 text-purple-800"
        />
      </div>

      {/* Tabla de tickets recientes */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">
            Mis Tickets Recientes
          </h2>
          <Link
            to="/tickets"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Ver todos →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    <Link to={`/tickets/${ticket.id}`}>{ticket.id}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ticket.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {ticket.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TicketStatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.priority}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para las tarjetas de estadísticas
function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );
}
