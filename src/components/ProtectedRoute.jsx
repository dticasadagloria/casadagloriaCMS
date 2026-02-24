import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const { user, loading } = useAuth();

  // 1- Sem token → vai para login imediatamente (comportamento original)
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2️ Tem token mas ainda está a carregar o user → mostra nada (ou spinner)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#1e3a5f] animate-spin" />
          <span className="text-sm text-slate-400">A carregar...</span>
        </div>
      </div>
    );
  }

  // 3️ allowedRoles definido → verifica permissão por role_id
  //    Ex: <ProtectedRoute allowedRoles={[1, 2]}> apenas Admin e Pastor
  if (allowedRoles && user && !allowedRoles.includes(user.role_id)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}