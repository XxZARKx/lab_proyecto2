import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  TicketIcon,
  PlusCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  UserCircleIcon,
} from "@heroicons/react/16/solid";
import TicketStatusBadge from "../../components/shared/TicketStatusBadge";
import { PriorityBadge } from "../../components/shared/PriorityBadge";

export default function DashboardPage() {
  const { user } = useAuth();

  // Datos simulados
  const ticketStats = {
    pending: 5,
    cancelled: 2,
    completed: 8,
    total: 15,
  };

  const recentTickets = [
    {
      id: "TKT-1001",
      title: "Problema con el correo electrónico",
      description: "No puedo acceder a mi cuenta de correo desde esta mañana",
      status: "Pendiente",
      priority: "Alta",
      createdAt: "15/05/2023",
    },
    {
      id: "TKT-1002",
      title: "Software no funciona",
      description: "El programa de contabilidad no inicia correctamente",
      status: "En proceso",
      priority: "Media",
      createdAt: "14/05/2023",
    },
    {
      id: "TKT-1003",
      title: "Solicitud de acceso",
      description: "Necesito acceso a la carpeta compartida de recursos",
      status: "Completado",
      priority: "Baja",
      createdAt: "10/05/2023",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header con bienvenida */}
      <div className="mb-8 flex justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          ¡Hola, {user?.name}!
          <p className="text-gray-600 mt-2 text-sm">
            Aquí puedes gestionar tus tickets de soporte
          </p>
        </h1>
        <Link
          to="/profile"
          className="flex items-center px-4 py-2 text-2xl text-gray-700 hover:bg-gray-100 "
        >
          <UserCircleIcon className="h-8 w-8 mr-3 text-gray-500" />
          Mi Perfil
        </Link>
      </div>

      {/* Estadísticas en cards modernas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<ClockIcon className="h-6 w-6" />}
          title="Pendientes"
          value={ticketStats.pending}
          color="border-l-blue-500"
          link="/tickets?status=pending"
        />
        <StatCard
          icon={<XCircleIcon className="h-6 w-6" />}
          title="Anulados"
          value={ticketStats.cancelled}
          color="border-l-red-500"
          link="/tickets?status=cancelled"
        />
        <StatCard
          icon={<CheckCircleIcon className="h-6 w-6" />}
          title="Completados"
          value={ticketStats.completed}
          color="border-l-green-500"
          link="/tickets?status=completed"
        />
        <StatCard
          icon={<TicketIcon className="h-6 w-6" />}
          title="Total Tickets"
          value={ticketStats.total}
          color="border-l-purple-500"
          link="/tickets"
        />
      </div>

      {/* Sección de acciones rápidas */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Acciones rápidas
            </h2>
            <p className="text-gray-600">Gestiona tus solicitudes de soporte</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/tickets/new"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Nuevo Ticket
            </Link>
            <Link
              to="/tickets"
              className="flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <TicketIcon className="h-5 w-5" />
              Ver todos
            </Link>
          </div>
        </div>
      </div>

      {/* Tabla de tickets recientes mejorada */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Tickets Recientes
            </h2>
            <p className="text-gray-600">Tus solicitudes más recientes</p>
          </div>
          <Link
            to="/tickets"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            Ver todos <ArrowRightIcon className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asunto
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
                <tr
                  key={ticket.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      to={`/tickets/${ticket.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {ticket.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.title}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {ticket.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TicketStatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={ticket.priority} />
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

// Componente StatCard mejorado
function StatCard({ icon, title, value, color, link }) {
  return (
    <Link
      to={link}
      className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-100 hover:shadow-md transition-shadow"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div
          className={`p-3 rounded-full bg-opacity-10 ${color.replace(
            "border-l-",
            "bg-"
          )}`}
        >
          {icon}
        </div>
      </div>
    </Link>
  );
}
