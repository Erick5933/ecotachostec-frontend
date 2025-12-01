// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Layouts
import Layout from "../components/Layout/Layout";
import UserLayout from "../components/Layout/UserLayout";

// Admin Pages
import Dashboard from "../pages/Dashboard/Dashboard";
import UsuarioList from "../pages/Usuarios/UsuarioList";
import UsuarioForm from "../pages/Usuarios/UsuarioForm";
import UbicacionList from "../pages/Ubicaciones/UbicacionList";
import UbicacionForm from "../pages/Ubicaciones/UbicacionForm";
import TachoList from "../pages/Tachos/TachoList";
import TachoForm from "../pages/Tachos/TachoForm";
import TachoDetail from "../pages/Tachos/TachoDetail";
import DeteccionList from "../pages/Detecciones/DeteccionList";
import DeteccionDetail from "../pages/Detecciones/DeteccionDetail";

// NEW: Perfil
import Profile from "../pages/Auth/Profile";

// User Pages
import LandingPage from "../pages/User/LandingPage";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import UserPortal from "../pages/User/UserPortal";

// ========================
// PROTECTED ROUTES
// ========================
function ProtectedRoute({ children, requireAdmin = false }) {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  if (requireAdmin && user.rol !== "admin") {
    return <Navigate to="/portal" replace />;
  }

  return children;
}

// ========================
// PUBLIC ROUTES
// ========================
function PublicRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (user) {
    return <Navigate to={user.rol === "admin" ? "/" : "/portal"} replace />;
  }

  return children;
}

// ========================
// APP ROUTER PRINCIPAL
// ========================
export default function AppRouter() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>

        {/* ======================== */}
        {/* PUBLIC ROUTES (UserLayout) */}
        {/* ======================== */}
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

        {/* ======================== */}
        {/* ADMIN ROUTES (Layout) */}
        {/* ======================== */}
        <Route
          element={
            <ProtectedRoute requireAdmin>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* PERFIL (Nueva ruta) */}
          <Route path="/perfil" element={<Profile />} />

          {/* Usuarios */}
          <Route path="/usuarios" element={<UsuarioList />} />
          <Route path="/usuarios/nuevo" element={<UsuarioForm />} />
          <Route path="/usuarios/editar/:id" element={<UsuarioForm />} />

          {/* Ubicaciones */}
          <Route path="/ubicaciones" element={<UbicacionList />} />
          <Route path="/ubicaciones/nuevo" element={<UbicacionForm />} />
          <Route path="/ubicaciones/editar/:id" element={<UbicacionForm />} />

          {/* Tachos */}
          <Route path="/tachos" element={<TachoList />} />
          <Route path="/tachos/nuevo" element={<TachoForm />} />
          <Route path="/tachos/editar/:id" element={<TachoForm />} />
          <Route path="/tachos/:id" element={<TachoDetail />} />

          {/* Detecciones */}
          <Route path="/detecciones" element={<DeteccionList />} />
          <Route path="/detecciones/:id" element={<DeteccionDetail />} />
        </Route>

        {/* ======================== */}
        {/* FALLBACK */}
        {/* ======================== */}
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
