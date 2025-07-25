import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createTicket, getCategories } from "../../services/tickets";
import {
  TicketIcon,
  ArrowLeftIcon,
  PaperClipIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/16/solid";

export default function NewTicketPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "media",
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setFormData((prev) => ({ ...prev, category: cats[0].id }));
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("El título y la descripción son obligatorios");
      setLoading(false);
      return;
    }

    try {
      const newTicket = await createTicket({
        ...formData,
        userId: user.id,
        userName: user.name,
        attachments: files.map((file) => file.name),
      });

      setSuccess("Ticket creado exitosamente! Redirigiendo...");
      setTimeout(() => navigate(`/tickets/${newTicket.id}`), 1500);
    } catch (err) {
      setError(err.message || "Error al crear el ticket");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="cursor-pointer flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Volver al dashboard
          </button>

          <div className="flex items-start">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
              <TicketIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Crear Nuevo Ticket
              </h1>
              <p className="text-gray-600">
                Completa todos los campos para registrar tu solicitud
              </p>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
            <div className="text-sm text-green-700">{success}</div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Sección 1: Información básica */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Información del Ticket
              </h2>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Título del Ticket <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Problema con el correo electrónico"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Descripción detallada{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    required
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe el problema con todos los detalles necesarios..."
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Sección 2: Categoría y Prioridad */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Clasificación
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Prioridad <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    required
                    className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 3: Archivos adjuntos */}
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Archivos Adjuntos
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PaperClipIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">
                          Haz clic para subir
                        </span>{" "}
                        o arrastra y suelta
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, PDF hasta 10MB
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <PaperClipIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sección 4: Acciones */}
            <div className="p-6 bg-gray-50 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="cursor-pointer px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`cursor-pointer px-5 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creando...
                  </span>
                ) : (
                  "Crear Ticket"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
