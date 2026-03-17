import { Navigate } from "react-router-dom";

const ProtectedMemberRoute = ({ children }) => {
  const token = sessionStorage.getItem("membro_token");
  if (!token) return <Navigate to="/member-login" replace />;
  return children;
};

export default ProtectedMemberRoute;