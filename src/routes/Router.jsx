import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "@/App"
import Dashboard from "@/pages/Dashboard/Dashboard";
import Register from "@/pages/Dashboard/Register";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import ProfilePage from "@/pages/Dashboard/Configuracoes/ProfilePage";
import EditarMembro from "@/pages/Dashboard/Membros/EditarMembro";
import MembroDetalhes from "@/pages/Dashboard/Membros/MembroDetalhes";
import NovoMembro from "@/pages/Dashboard/Membros/NovoMembro";
import LoginMembro from "../pages/LoginMembro"
import UserDashboard from "@/pages/Dashboard/users/UserDashboard";


const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthProvider>
            <App />
        </AuthProvider>
    },
    {
        path: "/dashboard",
        element: <AuthProvider>
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        </AuthProvider>
    },
    {
        path: "/perfil",
        element: <AuthProvider>
            <ProtectedRoute>
                <ProfilePage />
            </ProtectedRoute>
        </AuthProvider>
    },
     // Rotas de membros em especifico
    {
        path: "/dashboard/membros/:id",
        element: <AuthProvider>
            <ProtectedRoute>
                <MembroDetalhes />
            </ProtectedRoute>
        </AuthProvider>
    },
    {
        path: "/dashboard/membros/:id/editar",
        element: <AuthProvider>
            <ProtectedRoute>
                <EditarMembro />
            </ProtectedRoute>
        </AuthProvider>
    },
    {
        path: "/dashboard/membros/novo",
        element: <AuthProvider>
            <ProtectedRoute>
                <NovoMembro />
            </ProtectedRoute>
        </AuthProvider>
    },
    {
        path: "/register",
        element: <Register />
    },
    //Rotas para membros
    {
        path: "/member-login",
        element: <LoginMembro />
    },
    //Rotas para usuarios
    {
        path: "/dashboard/users",
        element: <AuthProvider>
            <ProtectedRoute>
                <UserDashboard />
            </ProtectedRoute>
        </AuthProvider>
    }
]);


export default router;