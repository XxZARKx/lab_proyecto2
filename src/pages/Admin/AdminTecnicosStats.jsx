// src/pages/Admin/AdminTecnicosStats.jsx
import React, { useEffect, useState } from "react";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  UserIcon,
  TicketIcon,
  UsersIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/solid";

export default function AdminTecnicosStats() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resTecnicos = await fetch(`${API}/usuarios/tecnicos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tecnicosData = await resTecnicos.json();

        const resTickets = await fetch(`${API}/tickets/historial`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ticketsData = await resTickets.json();

        const tecnicosStats = tecnicosData.map((tecnico) => {
          const assignedTickets = ticketsData.filter(
            (t) => t.tecnico && t.tecnico.id === tecnico.id,
          );

          const counts = {
            ASIGNADO: 0,
            EN_PROCESO: 0,
            CERRADO: 0,
            ANULADO: 0,
          };

          assignedTickets.forEach((t) => {
            if (counts[t.estado] !== undefined) {
              counts[t.estado]++;
            }
          });

          return {
            ...tecnico,
            totalTickets: assignedTickets.length,
            counts,
          };
        });

        tecnicosStats.sort((a, b) => b.totalTickets - a.totalTickets);
        setStats(tecnicosStats);
      } catch (error) {
        console.error("Error al cargar las estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Función para exportar los datos a CSV
  const exportCSV = () => {
    const rows = [
      [
        "ID_Tecnico",
        "Nombres",
        "Correo",
        "Total_Asignados",
        "Asignados_Nuevos",
        "En_Proceso",
        "Cerrados",
        "Anulados",
      ],
      ...stats.map((t) => [
        t.id,
        sanitizeCSV(t.nombres),
        sanitizeCSV(t.correo),
        t.totalTickets,
        t.counts.ASIGNADO,
        t.counts.EN_PROCESO,
        t.counts.CERRADO,
        t.counts.ANULADO,
      ]),
    ];
    const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const now = new Date();
    link.download = `rendimiento_tecnicos_${now.toISOString().slice(0, 19)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          <p className="text-gray-500 font-medium animate-pulse">
            Cargando métricas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:shadow-sm transition-all duration-200 mr-5 group"
              title="Volver"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-500 group-hover:text-gray-800" />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Rendimiento de Técnicos
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitorea la carga de trabajo y resoluciones del equipo de
                soporte.
              </p>
            </div>
          </div>

          {/* Botón de Exportar */}
          {stats.length > 0 && (
            <button
              onClick={exportCSV}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:text-blue-700 text-gray-700 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-gray-500" />
              Exportar CSV
            </button>
          )}
        </div>

        {/* Grid de Tarjetas de Técnicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((tecnico) => (
            <div
              key={tecnico.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden"
            >
              {/* Top Accent Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>

              <div className="p-6 flex flex-col flex-1">
                {/* Info del Técnico */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3.5 rounded-xl border border-blue-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <UserIcon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="truncate flex-1">
                    <h3
                      className="text-xl font-bold text-gray-800 truncate"
                      title={tecnico.nombres}
                    >
                      {tecnico.nombres}
                    </h3>
                    <p
                      className="text-sm text-gray-500 truncate"
                      title={tecnico.correo}
                    >
                      {tecnico.correo}
                    </p>
                  </div>
                </div>

                {/* Total de Tickets (Highlight Box) */}
                <div className="mb-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TicketIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Total Asignados
                    </span>
                  </div>
                  <span className="text-3xl font-black text-gray-800">
                    {tecnico.totalTickets}
                  </span>
                </div>

                {/* Desglose por Estados */}
                <div className="flex-1">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">
                    Desglose de Trabajo
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Asignados */}
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                      <span className="text-xs font-semibold text-gray-600">
                        Asignados
                      </span>
                      <span className="font-bold text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-md">
                        {tecnico.counts.ASIGNADO}
                      </span>
                    </div>
                    {/* En Proceso */}
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                      <span className="text-xs font-semibold text-gray-600">
                        En Proceso
                      </span>
                      <span className="font-bold text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2 py-1 rounded-md">
                        {tecnico.counts.EN_PROCESO}
                      </span>
                    </div>
                    {/* Cerrados */}
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                      <span className="text-xs font-semibold text-gray-600">
                        Cerrados
                      </span>
                      <span className="font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-md">
                        {tecnico.counts.CERRADO}
                      </span>
                    </div>
                    {/* Anulados */}
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                      <span className="text-xs font-semibold text-gray-600">
                        Anulados
                      </span>
                      <span className="font-bold text-xs bg-rose-50 text-rose-700 border border-rose-100 px-2 py-1 rounded-md">
                        {tecnico.counts.ANULADO}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {stats.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <UsersIcon className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                Sin técnicos registrados
              </h3>
              <p className="text-gray-500 mt-1">
                Actualmente no hay usuarios con el rol de TÉCNICO en el sistema.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Helpers CSV */
function sanitizeCSV(str) {
  if (!str) return "";
  return String(str)
    .replace(/\r?\n|\r/g, " ")
    .trim();
}
function csvCell(v) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
