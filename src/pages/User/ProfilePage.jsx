import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  UserCircleIcon,
  PencilIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";

export default function ProfilePage() {
  const { user, updateProfile, updatePassword } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Inicializar formulario con datos del usuario
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await updateProfile(profileForm);
      setSuccess("Perfil actualizado correctamente");
    } catch (err) {
      setError(err.message || "Error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setSuccess("Contraseña actualizada correctamente");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.message || "Error al cambiar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8 text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-full w-full text-gray-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === "admin"
              ? "Administrador"
              : user?.role === "tech"
              ? "Técnico"
              : "Usuario"}
          </p>
        </div>

        {/* Pestañas */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Información Personal
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`${
                activeTab === "password"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Cambiar Contraseña
            </button>
          </nav>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 flex items-start">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200 flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-green-700">{success}</div>
          </div>
        )}

        {/* Contenido de pestañas */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {activeTab === "profile" ? (
            <form
              onSubmit={handleProfileSubmit}
              className="divide-y divide-gray-200"
            >
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <UserCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
                  Información Personal
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Actualiza tus datos de contacto e información personal.
                </p>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre Completo *
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Correo Electrónico *
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Teléfono
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="department"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Departamento
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="department"
                        id="department"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                        value={profileForm.department}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4 bg-gray-50 sm:px-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
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
                      Guardando...
                    </>
                  ) : (
                    <>
                      <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handlePasswordSubmit}
              className="divide-y divide-gray-200"
            >
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                  <LockClosedIcon className="h-5 w-5 text-gray-500 mr-2" />
                  Cambiar Contraseña
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Asegúrate de usar una contraseña segura que no uses en otros
                  sitios.
                </p>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contraseña Actual *
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nueva Contraseña *
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        required
                        minLength="6"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Confirmar Nueva Contraseña *
                    </label>
                    <div className="mt-1">
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4 bg-gray-50 sm:px-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
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
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="-ml-1 mr-2 h-5 w-5" />
                      Cambiar Contraseña
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
