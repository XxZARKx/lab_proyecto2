// src/utils/ticketStatusConfig.js
import {
  ClockIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  InboxStackIcon,
  PauseCircleIcon, // Ejemplo para un estado futuro
} from "@heroicons/react/24/solid";

// Mapeo de estados del backend a configuración visual del frontend
export const statusConfig = {
  // Estados Estándar
  PENDIENTE: {
    label: "Pendientes",
    icon: ClockIcon,
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    iconColor: "text-yellow-500",
    borderColor: "border-yellow-200",
  },
  ASIGNADO: {
    label: "Asignados",
    icon: UserIcon,
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    iconColor: "text-blue-500",
    borderColor: "border-blue-200",
  },
  EN_PROCESO: {
    label: "En Proceso",
    icon: WrenchScrewdriverIcon,
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    iconColor: "text-indigo-500",
    borderColor: "border-indigo-200",
  },
  CERRADO: {
    label: "Cerrados",
    icon: CheckCircleIcon,
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
  ANULADO: {
    label: "Anulados",
    icon: XCircleIcon,
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    iconColor: "text-red-500",
    borderColor: "border-red-200",
  },

  // Ejemplo de cómo se vería un estado futuro sin romper nada:
  ESPERANDO_RESPUESTA: {
    label: "Esperando Respuesta",
    icon: PauseCircleIcon,
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    iconColor: "text-purple-500",
    borderColor: "border-purple-200",
  },

  // Configuración por defecto para estados desconocidos
  DEFAULT: {
    label: "Otros",
    icon: QuestionMarkCircleIcon,
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    iconColor: "text-gray-400",
    borderColor: "border-gray-200",
  },
  // Configuración especial para el total
  TOTAL: {
    label: "Total Tickets",
    icon: InboxStackIcon,
    bgColor: "bg-white",
    textColor: "text-gray-800",
    iconColor: "text-blue-600",
    borderColor: "border-gray-100",
    isTotal: true, // Marcador especial
  },
};

// Función helper para obtener la config de un estado de forma segura
export const getStatusConfig = (statusRaw) => {
  // Si el estado no existe en el mapa, usa el DEFAULT
  const config = statusConfig[statusRaw] || {
    ...statusConfig.DEFAULT,
    label: statusRaw.replace(/_/g, " ").toLowerCase(), // Intenta hacerlo legible si no lo conocemos
  };
  return config;
};
