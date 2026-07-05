import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Evita pedidos pendurados indefinidamente em redes lentas / cold start do backend.
  // Uploads (CSV) e cold starts do Render podem demorar, por isso 60s.
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});


// Envia o token automaticamente em todos os pedidos
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se 401 (sessão expirada/inválida), limpa tudo e volta ao login.
// Limpa também a aba activa para o próximo utilizador não herdar a página anterior.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("activeTab");
      sessionStorage.clear();
      // Evita loop de redirect se já estivermos na página de login.
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;