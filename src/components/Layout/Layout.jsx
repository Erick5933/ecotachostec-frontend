// src/components/Layout/Layout.jsx
import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./layout.css";

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    {
      path: "/",
      icon: "📊",
      label: "Dashboard",
      description: "Panel principal"
    },
    {
      path: "/usuarios",
      icon: "👥",
      label: "Usuarios",
      description: "Gestión de usuarios"
    },
    {
      path: "/ubicaciones",
      icon: "📍",
      label: "Ubicaciones",
      description: "Provincias y cantones"
    },
    {
      path: "/tachos",
      icon: "🗑️",
      label: "Tachos",
      description: "Gestión de tachos"
    },
    {
      path: "/detecciones",
      icon: "🤖",
      label: "Detecciones IA",
      description: "Análisis inteligente"
    }
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">🌿</div>
            {sidebarOpen && (
              <div className="logo-text">
                <h2 className="logo-title">EcoTachos</h2>
                <span className="logo-subtitle">Smart IoT System</span>
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="user-info">
              <div className="user-avatar">👤</div>
              <div className="user-details">
                <span className="user-name">Admin User</span>
                <span className="user-role">Administrador</span>
              </div>
            </div>
          )}
        </div>

        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        <header className={`topbar ${scrolled ? "scrolled" : ""}`}>
          <div className="topbar-left">
            <h1 className="page-title">Panel Administrativo</h1>
          </div>

          <div className="topbar-right">
            <button className="topbar-btn" aria-label="Notificaciones">
              🔔
              <span className="notification-badge">3</span>
            </button>
            <button className="topbar-btn" aria-label="Configuración">
              ⚙️
            </button>
            <button className="topbar-btn user-btn">
              <span className="user-avatar-sm">👤</span>
            </button>
          </div>
        </header>

        <section className="content">
          <Outlet />
        </section>

        <footer className="footer">
          <p>© 2025 EcoTachosTec - Sistema de Gestión Inteligente</p>
        </footer>
      </main>
    </div>
  );
}