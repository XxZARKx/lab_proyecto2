// src/pages/Usuario/NuevoTicketPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  PaperClipIcon,
  PlusCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function NuevoTicketPage() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("MEDIA"); // ALTA | MEDIA | BAJA
  const [categoria, setCategoria] = useState("HARDWARE"); // HARDWARE | SOFTWARE | REDES | CORREO | OTRO
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        titulo,
        descripcion,
        prioridad, // enum Prioridad (ALTA/MEDIA/BAJA)
        categoria: String(categoria).toUpperCase(), // enum TipoCategoria (HARDWARE/...)
      };

      const resp = await fetch(`${API}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error("Error al crear el ticket");
      navigate("/usuario");
    } catch (e) {
      console.error(e);
      setError("Hubo un problema al registrar el ticket");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center bg-blue-600 p-6">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-gray-200 mr-4"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
            <PlusCircleIcon className="h-6 w-6" /> Crear Nuevo Ticket
          </h1>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-gray-600">
            Completa los campos para registrar tu solicitud.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del Ticket <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                placeholder="Ej: Problema con el correo electrónico"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción Detallada <span className="text-red-500">*</span>
              </label>
              <textarea
                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                rows={5}
                placeholder="Describe el problema con todos los detalles..."
                required
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            {/* Categoría & Prioridad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Categoría (ENUM) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  required
                >
                  <option value="HARDWARE">Hardware</option>
                  <option value="SOFTWARE">Software</option>
                  <option value="REDES">Redes</option>
                  <option value="CORREO">Correo</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              {/* Prioridad (ENUM) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad <span className="text-red-500">*</span>
                </label>
                <select
                  className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value)}
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
              >
                Crear Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
