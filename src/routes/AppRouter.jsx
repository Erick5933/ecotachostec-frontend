// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Layouts
import Layout from "../components/Layout/Layout";
import UserLayout from "../components/Layout/UserLayout";

// Public/User Pages
import LandingPage from "../pages/User/LandingPage";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import UserPortal from "../pages/User/UserPortal";

// Admin Pages  (NOTA: revisar mayúsculas/minúsculas EXACTAS)
import Dashboard from "../pages/Dashboard/Dashboard";
import UsuarioList from "../pages/usuarios/UsuarioList";      // <-- corregido
import UbicacionList from "../pages/ubicaciones/UbicacionList";
import TachoList from "../pages/tachos/TachoList";
import DeteccionList from "../pages/detecciones/DeteccionList";


// Protected Admin/User Route
function ProtectedRoute({ children, requireAdmin = false }) {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  if (requireAdmin && user.rol !== "admin") {
    return <Navigate to="/portal" replace />;
  }

  return children;
}


// Redirect if already logged in
function PublicRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (user) {
    return <Navigate to={user.rol === "admin" ? "/" : "/portal"} replace />;
  }

  return children;
}


export default function AppRouter() {
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;

  return (
    <BrowserRouter>
      <Routes>

        {/** =====================
            PUBLIC / USER AREA
        ======================== */}
        <Route element={<UserLayout />}>
          <Route path="/home" element={<LandingPage />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <UserPortal />
              </ProtectedRoute>
            }
          />
        </Route>


        {/** =====================
            ADMIN AREA (PROTECTED)
        ======================== */}
        <Route
          element={
            <ProtectedRoute requireAdmin>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard igual que antes (ruta index) */}
          <Route index element={<Dashboard />} />

          <Route path="usuarios" element={<UsuarioList />} />
          <Route path="ubicaciones" element={<UbicacionList />} />
          <Route path="tachos" element={<TachoList />} />
          <Route path="detecciones" element={<DeteccionList />} />
        </Route>


        {/** =====================
            CATCH-ALL
        ======================== */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate to={user.rol === "admin" ? "/" : "/portal"} replace />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
