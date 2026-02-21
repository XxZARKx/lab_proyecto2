// src/utils/dates.js

// Convierte la fecha de la API (UTC) a un string legible en hora de Perú
export function toLocalFromApi(dt) {
  if (!dt) return "";

  // Si la fecha no tiene 'Z', se la agregamos para que JavaScript sepa que es UTC
  const hasTz = /[+-]\d{2}:\d{2}$|Z$/.test(dt);
  const iso = hasTz ? dt : dt + "Z";
  const d = new Date(iso);

  // Formateamos forzando la zona horaria de Lima
  return d.toLocaleString("es-PE", { timeZone: "America/Lima" });
}

// Extrae solo la parte YYYY-MM-DD en hora de Perú (Ideal para los Gráficos)
export function getLimaDateString(dt) {
  if (!dt) return "";

  const hasTz = /[+-]\d{2}:\d{2}$|Z$/.test(dt);
  const iso = hasTz ? dt : dt + "Z";
  const d = new Date(iso);

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
}
