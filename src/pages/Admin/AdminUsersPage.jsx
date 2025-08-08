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
import { Dialog } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error fetching users");
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  // filtering and pagination
  const filtered = usuarios.filter(
    (u) =>
      (u.nombres || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.correo || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const total = filtered.length;
  const pages = Math.ceil(total / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/usuarios/${selectedUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error deleting user");
      fetchUsuarios();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el usuario");
    } finally {
      closeModal();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)} // <- botón Atrás
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
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <MagnifyingGlassIcon className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
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
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
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
                        <Link
                          to={`/admin/users/${usuario.id}/edit`}
                          className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-full"
                        >
                          <PencilIcon className="h-5 w-5 text-indigo-600" />
                        </Link>
                        <button
                          onClick={() => openModal(usuario)}
                          className="p-2 bg-red-50 hover:bg-red-100 rounded-full"
                        >
                          <TrashIcon className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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

        {/* Delete Confirmation Modal */}
        <Dialog
          open={isModalOpen}
          onClose={closeModal}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-md w-full z-10">
            <div className="px-6 py-4">
              <Dialog.Title className="text-lg font-bold text-gray-900">
                Confirmar eliminación
              </Dialog.Title>
              <p className="mt-2 text-gray-700">
                ¿Seguro que deseas eliminar al usuario{" "}
                <span className="font-medium">{selectedUser?.nombres}</span>?
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-white border rounded hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
