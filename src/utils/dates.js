export function toLocalFromApi(dt) {
  if (!dt) return "";
  const hasTz = /[+-]\d{2}:\d{2}$|Z$/.test(dt);
  const iso = hasTz ? dt : dt + "Z";
  const d = new Date(iso);
  return d.toLocaleString();
}
