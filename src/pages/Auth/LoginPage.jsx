import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API } from "../../api";
import { fetchUserInfo } from "../../utils/api";
import toast from "react-hot-toast";

import bgImage from "../../assets/bg_login.png";
import iconLogin from "../../assets/icon_login.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Iniciando sesión...");

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: email,
          contrasena: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const bearerToken = await response.text();
      const token = bearerToken.replace("Bearer ", "");

      localStorage.setItem("token", token);

      const userData = await fetchUserInfo(token);
      localStorage.setItem("authToken", token);
      localStorage.setItem("userInfo", JSON.stringify(userData));

      login(userData, token);

      toast.success("¡Bienvenido!", { id: toastId });

      switch (userData.rol) {
        case "ADMINISTRADOR":
          navigate("/admin");
          break;
        case "TECNICO":
          navigate("/tecnico");
          break;
        case "USUARIO":
          navigate("/usuario");
          break;
        default:
          navigate("/no-autorizado");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al iniciar sesión", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md relative z-10">
        <div className="flex relative justify-center">
          <img
            src={iconLogin}
            alt="Login Icon"
            className="h-[100px] w-[100px] absolute top-[-80px]"
          />
        </div>
        <div className="text-center mt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Mesa de Ayuda
          </h1>
          <p className="text-gray-600">Ingresa tus credenciales para acceder</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition duration-300 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Entrando..." : "Iniciar sesión"}
            </button>
          </div>
        </form>
      </div>
      {/* Overlay oscuro para mejorar legibilidad sobre la imagen de fondo */}
      <div className="absolute inset-0 bg-black opacity-40 z-0"></div>
    </div>
  );
}
