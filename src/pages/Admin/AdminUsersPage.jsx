import { useEffect, useState } from "react";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PencilIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [usuarios, setUsuarios] = useState([]);

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Gestión de Usuarios</h1>
        <Link
          to="/admin/register"
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <UserPlusIcon className="h-5 w-5 mr-1" /> Registrar Usuario
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Correo</th>
              <th className="px-4 py-2 text-left">Rol</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-t">
                <td className="px-4 py-2">{usuario.id}</td>
                <td className="px-4 py-2">{usuario.nombre}</td>
                <td className="px-4 py-2">{usuario.correo}</td>
                <td className="px-4 py-2">{usuario.rol}</td>
                <td className="px-4 py-2 space-x-2">
                  <button className="text-blue-600 hover:underline">
                    <PencilIcon className="h-5 w-5 inline" />
                  </button>
                  <button className="text-red-600 hover:underline">
                    <TrashIcon className="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
