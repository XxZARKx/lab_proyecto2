import React, { useMemo } from "react";
import { getLimaDateString } from "../../utils/dates";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function TicketCharts({ tickets }) {
  const pieData = useMemo(() => {
    const counts = tickets.reduce((acc, ticket) => {
      acc[ticket.estado] = (acc[ticket.estado] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace("_", " "),
      value,
    }));
  }, [tickets]);

  const STATUS_COLORS = {
    PENDIENTE: "#eab308",
    ASIGNADO: "#3b82f6",
    "EN PROCESO": "#f97316",
    CERRADO: "#22c55e",
    ANULADO: "#ef4444",
  };

  const barData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const formatter = new Intl.DateTimeFormat("es-PE", {
        timeZone: "America/Lima",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const parts = formatter.formatToParts(d);
      const day = parts.find((p) => p.type === "day").value;
      const month = parts.find((p) => p.type === "month").value;
      const year = parts.find((p) => p.type === "year").value;

      return `${year}-${month}-${day}`;
    }).reverse();

    const dateCounts = tickets.reduce((acc, ticket) => {
      // Usamos nuestra función en lugar del .split("T")
      const dateEnPeru = getLimaDateString(ticket.fechaCreacion);

      if (last7Days.includes(dateEnPeru)) {
        acc[dateEnPeru] = (acc[dateEnPeru] || 0) + 1;
      }
      return acc;
    }, {});

    return last7Days.map((date) => {
      const [year, month, day] = date.split("-");
      const shortDate = `${day}/${month}`;

      return {
        fecha: shortDate,
        cantidad: dateCounts[date] || 0,
      };
    });
  }, [tickets]);

  if (!tickets || tickets.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Tarjeta del Gráfico de Pastel */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">
          Distribución por Estados
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.name] || "#9ca3af"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} Tickets`, "Cantidad"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tarjeta del Gráfico de Barras */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">
          Tickets Creados (Últimos 7 días)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="fecha"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#f3f4f6" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar
                dataKey="cantidad"
                name="Tickets"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
