import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Busca /auth/me com o token que já existe no localStorage ──────────────
  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://iicgp-backend-cms.onrender.com/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Token expirado ou inválido — limpa tudo
        localStorage.removeItem("token");
        setUser(null);
        return;
      }

      // Retorna: { id, username, role_id, role_nome, ativo, data_criacao }
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("fetchMe error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Roda ao montar — carrega o user se já há token
  useEffect(() => { fetchMe(); }, [fetchMe]);

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const login = async (username, password) => {
    try {
      const res = await fetch("https://iicgp-backend-cms.onrender.com/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: data.message || "Credenciais inválidas" };
      }

      // Guarda token (compatível com o teu ProtectedRoute)
      localStorage.setItem("token", data.token);

      // Carrega o user completo com role_nome
      await fetchMe();

      return { success: true };
    } catch {
      return { success: false, message: "Erro ao conectar com o servidor" };
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export default AuthContext;