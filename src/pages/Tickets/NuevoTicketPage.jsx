import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PaperClipIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

export default function NuevoTicketPage() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("MEDIA");
  const [categoria, setCategoria] = useState("Hardware");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo,
          descripcion,
          prioridad,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al crear el ticket");
      }

      navigate("/usuario"); // redirige al dashboard
    } catch (err) {
      console.error(err);
      setError("Hubo un problema al registrar el ticket");
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <PlusCircleIcon className="h-6 w-6 text-blue-600" /> Crear Nuevo
          Ticket
        </h1>
        <p className="text-gray-600 mb-6">
          Completa todos los campos para registrar tu solicitud
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1">
              Título del Ticket *
            </label>
            <input
              type="text"
              className="w-full border rounded p-2"
              placeholder="Ej: Problema con el correo electrónico"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Descripción Detallada *
            </label>
            <textarea
              className="w-full border rounded p-2"
              rows={5}
              placeholder="Describe el problema con todos los detalles necesarios..."
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Categoría *</label>
              <select
                className="w-full border rounded p-2"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Redes">Redes</option>
                <option value="Correo">Correo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Prioridad *</label>
              <select
                className="w-full border rounded p-2"
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Archivos Adjuntos
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center text-sm text-gray-500 flex flex-col items-center gap-1">
              <PaperClipIcon className="h-6 w-6" />
              <p>Haz clic para subir o arrastra y suelta</p>
              <p>PNG, JPG, PDF hasta 10 MB</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              className="px-4 py-2 border rounded text-gray-700"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Crear Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
