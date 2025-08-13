// src/components/shared/TicketStatusBadge.jsx
export default function TicketStatusBadge({ status }) {
  // status llega como: PENDIENTE, ASIGNADO, EN_PROCESO, CERRADO, ANULADO
  const CLASS_MAP = {
    PENDIENTE: "bg-yellow-100 text-yellow-800",
    ASIGNADO: "bg-blue-100 text-blue-800",
    EN_PROCESO: "bg-blue-100 text-blue-800",
    CERRADO: "bg-green-100 text-green-800",
    ANULADO: "bg-red-100 text-red-800",
  };

  const LABEL_MAP = {
    PENDIENTE: "Pendiente",
    ASIGNADO: "Asignado",
    EN_PROCESO: "En proceso",
    CERRADO: "Cerrado",
    ANULADO: "Anulado",
  };

  const cls = CLASS_MAP[status] || "bg-gray-100 text-gray-800";
  const label = LABEL_MAP[status] || status;

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cls}`}
    >
      {label}
    </span>
  );
}
