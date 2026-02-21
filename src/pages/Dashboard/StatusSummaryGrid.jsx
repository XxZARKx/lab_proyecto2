// src/pages/Dashboard/StatusSummaryGrid.jsx
import { useMemo } from "react";
import { statusConfig, getStatusConfig } from "../../utils/ticketStatusConfig";

export default function StatusSummaryGrid({
  tickets = [],
  statusFilter = "",
  onStatusChange,
}) {
  const summaryData = useMemo(() => {
    if (tickets.length === 0) return [];

    const countsMap = tickets.reduce((acc, ticket) => {
      const status = ticket.estado;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    let summaryList = Object.entries(countsMap).map(([statusRaw, count]) => ({
      statusRaw,
      count,
      ...getStatusConfig(statusRaw),
    }));

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
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      return indexA - indexB;
    });

    summaryList.unshift({
      ...statusConfig.TOTAL,
      statusRaw: "", // Un string vacío representará "Todos los tickets"
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {summaryData.map((item) => (
        <SummaryCard
          key={item.label}
          config={item}
          isSelected={statusFilter === item.statusRaw}
          onClick={() => {
            if (onStatusChange) {
              // Si ya está seleccionado y no es el "Total", al volver a hacer clic quitamos el filtro
              if (statusFilter === item.statusRaw && item.statusRaw !== "") {
                onStatusChange("");
              } else {
                onStatusChange(item.statusRaw);
              }
            }
          }}
        />
      ))}
    </div>
  );
}

function SummaryCard({ config, isSelected, onClick }) {
  const Icon = config.icon;
  return (
    <div
      onClick={onClick}
      className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer select-none ${
        config.bgColor
      } ${config.borderColor} ${
        isSelected
          ? "ring-2 ring-offset-2 ring-gray-400 shadow-md scale-[1.02] opacity-100"
          : "shadow-sm hover:shadow-md hover:-translate-y-1 opacity-80 hover:opacity-100"
      } ${config.isTotal && !isSelected ? "border-2" : ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-sm font-bold uppercase tracking-wider ${config.textColor}`}
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
