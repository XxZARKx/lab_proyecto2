// src/components/Dashboard/StatusSummaryGrid.jsx
import { useMemo } from "react";
import { statusConfig, getStatusConfig } from "../../utils/ticketStatusConfig";

export default function StatusSummaryGrid({ tickets = [] }) {
  // Usamos useMemo para calcular los conteos solo cuando los tickets cambian
  const summaryData = useMemo(() => {
    if (tickets.length === 0) return [];

    // 1. Contar dinámicamente las ocurrencias de cada estado
    const countsMap = tickets.reduce((acc, ticket) => {
      const status = ticket.estado;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // 2. Convertir el mapa en un array de objetos con la config visual
    let summaryList = Object.entries(countsMap).map(([statusRaw, count]) => ({
      statusRaw,
      count,
      ...getStatusConfig(statusRaw),
    }));

    // 3. Ordenar: podemos definir un orden de prioridad si queremos que aparezcan siempre igual
    const sortOrder = [
      "PENDIENTE",
      "ASIGNADO",
      "EN_PROCESO",
      "CERRADO",
      "ANULADO",
    ];
    summaryList.sort((a, b) => {
      let indexA = sortOrder.indexOf(a.statusRaw);
      let indexB = sortOrder.indexOf(b.statusRaw);
      // Si no está en la lista de orden, va al final
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      return indexA - indexB;
    });

    // 4. Agregar la tarjeta de TOTAL al principio
    summaryList.unshift({
      ...statusConfig.TOTAL,
      count: tickets.length,
    });

    return summaryList;
  }, [tickets]);

  if (tickets.length === 0) {
    return (
      <div className="p-6 bg-white border rounded-xl shadow-sm text-center text-gray-500">
        No hay datos para mostrar el resumen.
      </div>
    );
  }

  return (
    // Grid responsivo: se adapta de 2 a 5 columnas según el ancho
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {summaryData.map((item) => (
        <SummaryCard key={item.label} config={item} />
      ))}
    </div>
  );
}

// Sub-componente para cada tarjeta individual
function SummaryCard({ config }) {
  const Icon = config.icon;
  return (
    <div
      className={`flex flex-col p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${
        config.bgColor
      } ${config.borderColor} ${config.isTotal ? "border-2" : ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-sm font-bold uppercase tracking-wider ${config.textColor} opacity-80`}
        >
          {config.label}
        </span>
        <div
          className={`p-2 rounded-lg bg-white bg-opacity-60 ${config.iconColor}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="flex items-baseline">
        <span className={`text-3xl font-extrabold ${config.textColor}`}>
          {config.count}
        </span>
        {config.isTotal && (
          <span className="ml-1 text-sm text-gray-500 font-medium">
            en total
          </span>
        )}
      </div>
    </div>
  );
}
