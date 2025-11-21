import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import Layout from "../components/Layout/Layout";

import UsuarioList from "../pages/Usuarios/UsuarioList";
import UsuarioForm from "../pages/Usuarios/UsuarioForm";

import UbicacionList from "../pages/Ubicaciones/UbicacionList";
import UbicacionForm from "../pages/Ubicaciones/UbicacionForm";

import DeteccionList from "../pages/Detecciones/DeteccionList";

import TachoList from "../pages/Tachos/TachoList";
import TachoForm from "../pages/Tachos/TachoForm";

// Deja todo pasar porque no tienes login aún
const PrivateRoute = ({ children }) => children;

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* PRIVATE (dashboard + layout) */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* CRUD Usuarios */}
        <Route path="usuarios" element={<UsuarioList />} />
        <Route path="usuarios/nuevo" element={<UsuarioForm />} />
        <Route path="usuarios/editar/:id" element={<UsuarioForm />} />

        {/* CRUD Ubicaciones */}
        <Route path="ubicaciones" element={<UbicacionList />} />
        <Route path="ubicaciones/nuevo" element={<UbicacionForm />} />
        <Route path="ubicaciones/editar/:id" element={<UbicacionForm />} />

        {/* CRUD Tachos */}
        <Route path="tachos" element={<TachoList />} />
        <Route path="tachos/nuevo" element={<TachoForm />} />
        <Route path="tachos/editar/:id" element={<TachoForm />} />

        {/* Detecciones */}
        <Route path="detecciones" element={<DeteccionList />} />
      </Route>

      {/* DEFAULT */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
