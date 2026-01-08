import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rol: "USUARIO",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!formData.correo.includes("@")) {
        throw new Error("El correo no es válido");
      }
      if (formData.contrasena.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      }

      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const textResult = await response.text();

      if (!response.ok) {
        throw new Error(textResult || "Error al registrar usuario");
      }

      setSuccess(textResult);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message || "Error al registrar el usuario");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-login-page">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="flex relative justify-center">
          <div className="icon_login h-[100px] w-[100px] absolute top-[-80px]" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registrar Nuevo Usuario
          </h1>
          <p className="text-gray-600">Complete los datos del nuevo usuario</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <span>{success}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre Completo *
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Nombre del usuario"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="correo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo Electrónico *
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="usuario@empresa.com"
                value={formData.correo}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="contrasena"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña *
              </label>
              <input
                id="contrasena"
                name="contrasena"
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Mínimo 6 caracteres"
                value={formData.contrasena}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="rol"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Rol del Usuario *
              </label>
              <select
                id="rol"
                name="rol"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                value={formData.rol}
                onChange={handleChange}
              >
                <option value="USUARIO">Usuario Normal</option>
                <option value="TECNICO">Técnico</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center">
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Registrando...
                </span>
              ) : (
                "Registrar Usuario"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
