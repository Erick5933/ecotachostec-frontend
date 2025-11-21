// src/components/Layout/Layout.jsx
import { Link, Outlet } from "react-router-dom";
import "./layout.css";

export default function Layout() {
  return (
    <div className="layout-container">
      <aside className="sidebar">
        <h2 className="logo">EcoTachosTec</h2>

        <nav>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/usuarios">Usuarios</Link></li>
            <li><Link to="/ubicaciones">Ubicaciones</Link></li>
            <li><Link to="/tachos">Tachos</Link></li>
            <li><Link to="/detecciones">Detecciones</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>Panel Administrativo</span>
        </header>

        <section className="conte nt">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
