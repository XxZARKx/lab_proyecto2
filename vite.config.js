import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
    },
  },
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb", // azul principal
          dark: "#1d4ed8", // azul oscuro
          light: "#3b82f6", // azul claro
        },
        secondary: {
          DEFAULT: "#10b981", // verde esmeralda
          dark: "#059669",
        },
        danger: "#ef4444", // rojo para errores
        warning: "#f59e0b", // amarillo para advertencias
      },
    },
  },
});
