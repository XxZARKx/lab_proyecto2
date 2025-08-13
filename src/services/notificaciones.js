import { API } from "../api";

export async function getNotifications(
  token,
  { page = 0, size = 10, unread = false } = {}
) {
  const res = await fetch(
    `${API}/notificaciones?page=${page}&size=${size}&unread=${unread}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error("No se pudieron cargar las notificaciones");
  return res.json(); // Page<NotificacionResponse>
}

export async function getUnreadCount(token) {
  const res = await fetch(`${API}/notificaciones/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudo obtener el contador");
  return res.json(); // number
}

export async function markAsRead(token, id) {
  const res = await fetch(`${API}/notificaciones/${id}/leer`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudo marcar como leída");
}

export async function markAllAsRead(token) {
  const res = await fetch(`${API}/notificaciones/leer-todas`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No se pudo marcar todas como leídas");
}
