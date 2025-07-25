export default function TicketStatusBadge({ status }) {
  const statusClasses = {
    Pendiente: "bg-yellow-100 text-yellow-800",
    "En proceso": "bg-blue-100 text-blue-800",
    Completado: "bg-green-100 text-green-800",
    Anulado: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        statusClasses[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}
