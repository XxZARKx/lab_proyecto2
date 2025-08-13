// src/utils/tickets.js
export const ESTADO = {
  PENDIENTE: "PENDIENTE",
  ASIGNADO: "ASIGNADO",
  EN_PROCESO: "EN_PROCESO",
  CERRADO: "CERRADO",
  ANULADO: "ANULADO",
};

export const PRIORIDAD = {
  ALTA: "ALTA",
  MEDIA: "MEDIA",
  BAJA: "BAJA",
};

export const estadoLabel = {
  PENDIENTE: "PENDIENTE",
  ASIGNADO: "ASIGNADO",
  EN_PROCESO: "EN PROCESO",
  CERRADO: "CERRADO",
  ANULADO: "ANULADO",
};

export const badgeClasses = {
  // Estados
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  ASIGNADO: "bg-blue-100 text-blue-800",
  EN_PROCESO: "bg-orange-100 text-orange-800",
  CERRADO: "bg-green-100 text-green-800",
  ANULADO: "bg-red-100 text-red-800",
  // Prioridades
  ALTA: "bg-red-100 text-red-800",
  MEDIA: "bg-yellow-100 text-yellow-800",
  BAJA: "bg-green-100 text-green-800",
};
