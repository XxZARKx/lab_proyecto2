import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("authToken", authToken);
  };

  const register = async (userData) => {
    // Aquí iría la llamada a la API de registro
    // Retornamos datos simulados por ahora
    return {
      id: "new-user-id",
      ...userData,
    };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  const updateProfile = async (userData) => {
    // Simulamos actualización
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser((prev) => ({ ...prev, ...userData }));
        resolve();
      }, 1000);
    });
  };

  const updatePassword = async (currentPassword, newPassword) => {
    // Simulamos cambio de contraseña
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        updateProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
