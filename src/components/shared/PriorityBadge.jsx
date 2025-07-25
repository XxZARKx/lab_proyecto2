// Nuevo componente para prioridades
export function PriorityBadge({ priority }) {
  const priorityClasses = {
    Alta: "bg-red-100 text-red-800",
    Media: "bg-yellow-100 text-yellow-800",
    Baja: "bg-green-100 text-green-800",
    Urgente: "bg-purple-100 text-purple-800",
  };

  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
        priorityClasses[priority] || "bg-gray-100 text-gray-800"
      }`}
    >
      {priority}
    </span>
  );
}
