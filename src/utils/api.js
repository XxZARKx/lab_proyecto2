import { API } from "../api";

export async function fetchUserInfo(token) {
  if (!token) throw new Error("Token no proporcionado");

  const res = await fetch(`${API}/usuarios/perfil`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Error al obtener el perfil: ${res.status} - ${errorText} ${token}`
    );
  }

  const data = await res.json();
  return data;
}
