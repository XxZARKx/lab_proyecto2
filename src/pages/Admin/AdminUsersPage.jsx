// src/pages/Admin/AdminUsersPage.jsx
import React, { useEffect, useState } from "react";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [meId, setMeId] = useState(null);

  // estados globales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // búsqueda/paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // eliminar
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // editar
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editNombres, setEditNombres] = useState("");
  const [editCorreo, setEditCorreo] = useState("");
  const [editRol, setEditRol] = useState("USUARIO");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Perfil (para ocultar el propio usuario)
        const meRes = await fetch(`${API}/usuarios/perfil`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          setMeId(me.id);
        }
        // Lista de usuarios
        const res = await fetch(`${API}/usuarios`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setUsuarios(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los usuarios");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // ---------- filtro y paginación ----------
  // Solo mostrar USUARIO y TECNICO, y ocultar al propio usuario (meId)
  const base = usuarios.filter(
    (u) =>
      (meId ? u.id !== meId : true) &&
      (u.rol === "USUARIO" || u.rol === "TECNICO")
  );

  const filtered = base.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      (u.nombres || "").toLowerCase().includes(q) ||
      (u.correo || "").toLowerCase().includes(q) ||
      (u.rol || "").toLowerCase().includes(q)
    );
  });
  const total = filtered.length;
  const pages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = filtered.slice(start, end);

  useEffect(() => {
    const p = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > p) setPage(p);
  }, [filtered.length, page, pageSize]);

  // ---------- eliminar ----------
  const openDelete = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };
  const closeDelete = () => {
    if (deleting) return;
    setIsDeleteOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setError("");
    setInfo("");
    setDeleting(true);
    try {
      if (selectedUser.id === meId)
        throw new Error("No puedes eliminar tu propio usuario.");
      const res = await fetch(`${API}/usuarios/${selectedUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "No se pudo eliminar el usuario");
      }
      setUsuarios((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setInfo("Usuario eliminado.");
    } catch (err) {
      setError(err.message || "No se pudo eliminar el usuario");
    } finally {
      setDeleting(false);
      closeDelete();
    }
  };

  // ---------- editar ----------
  const openEdit = (user) => {
    setEditUserId(user.id);
    setEditNombres(user.nombres || "");
    setEditCorreo(user.correo || "");
    setEditRol(user.rol || "USUARIO");
    setIsEditOpen(true);
  };
  const closeEdit = () => {
    if (savingEdit) return;
    setIsEditOpen(false);
    setEditUserId(null);
    setEditNombres("");
    setEditCorreo("");
    setEditRol("USUARIO");
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    setError("");
    setInfo("");
    try {
      const body = {
        nombres: editNombres.trim(),
        correo: editCorreo.trim(),
        rol: editRol,
      };
      const res = await fetch(`${API}/usuarios/${editUserId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "No se pudo actualizar el usuario");
      }
      const updated = await res.json();
      setUsuarios((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u))
      );
      setInfo("Cambios guardados.");
      closeEdit();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el usuario");
    } finally {
      setSavingEdit(false);
    }
  };

  const TinySpinner = () => (
    <svg
      className="animate-spin h-4 w-4 mr-2 text-blue-600"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );

  const anyProcessing = loading || deleting || savingEdit;

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white border rounded-full hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Gestión de Usuarios
            </h1>
          </div>
          <Link
            to="/admin/register"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" /> Registrar Usuario
          </Link>
        </div>

        {anyProcessing && (
          <div className="mb-4 flex items-center text-sm text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded">
            <TinySpinner />
            {loading
              ? "Cargando usuarios..."
              : deleting
              ? "Eliminando usuario..."
              : "Guardando cambios..."}
          </div>
        )}

        <div className="mb-4">
          <div className="relative max-w-sm">
            <MagnifyingGlassIcon className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o rol..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
            {info}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Cargando usuarios...
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  {["ID", "Nombre", "Correo", "Rol", "Acciones"].map((th) => (
                    <th
                      key={th}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                    >
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginated.map((usuario, idx) => (
                  <tr
                    key={usuario.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {usuario.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {usuario.nombres}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {usuario.correo}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          usuario.rol === "ADMINISTRADOR"
                            ? "bg-purple-100 text-purple-800"
                            : usuario.rol === "TECNICO"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openEdit(usuario)}
                          className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-full disabled:opacity-50"
                          title="Editar"
                          disabled={deleting || savingEdit}
                        >
                          <PencilIcon className="h-5 w-5 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => openDelete(usuario)}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-full disabled:opacity-50"
                          title="Eliminar"
                          disabled={deleting || savingEdit}
                        >
                          <TrashIcon className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No hay resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-white border rounded disabled:opacity-50 hover:bg-gray-100"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página <span className="font-medium">{page}</span> de{" "}
                <span className="font-medium">{pages}</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pages))}
                disabled={page === pages}
                className="px-3 py-1 bg-white border rounded disabled:opacity-50 hover:bg-gray-100"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        <Dialog
          open={isDeleteOpen}
          onClose={closeDelete}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md rounded-lg bg-white shadow-lg overflow-hidden">
              <div className="px-6 py-4">
                <DialogTitle className="text-lg font-bold text-gray-900">
                  Confirmar eliminación
                </DialogTitle>
                <p className="mt-2 text-gray-700">
                  ¿Seguro que deseas eliminar al usuario{" "}
                  <span className="font-medium">{selectedUser?.nombres}</span>?
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={closeDelete}
                  className="px-4 py-2 bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
                  disabled={deleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 inline-flex items-center"
                  disabled={deleting}
                >
                  {deleting && <TinySpinner />}
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditOpen} onClose={closeEdit} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md rounded-lg bg-white shadow-lg overflow-hidden">
              <div className="px-6 py-5">
                <DialogTitle className="text-lg font-bold text-gray-900">
                  Editar usuario
                </DialogTitle>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Nombre</label>
                    <input
                      className="mt-1 w-full border rounded px-3 py-2"
                      value={editNombres}
                      onChange={(e) => setEditNombres(e.target.value)}
                      disabled={savingEdit}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Correo</label>
                    <input
                      className="mt-1 w-full border rounded px-3 py-2"
                      type="email"
                      value={editCorreo}
                      onChange={(e) => setEditCorreo(e.target.value)}
                      disabled={savingEdit}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Rol</label>
                    <select
                      className="mt-1 w-full border rounded px-3 py-2 bg-white"
                      value={editRol}
                      onChange={(e) => setEditRol(e.target.value)}
                      disabled={savingEdit}
                    >
                      <option value="USUARIO">USUARIO</option>
                      <option value="TECNICO">TECNICO</option>
                      <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                    </select>
                    {/* Si cambias a ADMINISTRADOR, el usuario dejará de aparecer en esta lista tras guardar. */}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button
                  onClick={closeEdit}
                  disabled={savingEdit}
                  className="px-4 py-2 bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 inline-flex items-center"
                >
                  {savingEdit && <TinySpinner />}
                  {savingEdit ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
