// src/pages/User/UserPortal.jsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import "./userPortal.css";

export default function UserPortal() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalTachos: 0,
    totalDetecciones: 0,
    totalUbicaciones: 0,
  });
  const [tachos, setTachos] = useState([]);
  const [detecciones, setDetecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("overview");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadPortalData();
  }, [user, navigate]);

  const loadPortalData = async () => {
    try {
      const [tachosRes, deteccionesRes, ubicacionesRes] = await Promise.all([
        api.get("/tachos/"),
        api.get("/detecciones/"),
        api.get("/ubicacion/cantones/"),
      ]);

      setStats({
        totalTachos: tachosRes.data.length || 0,
        totalDetecciones: deteccionesRes.data.length || 0,
        totalUbicaciones: ubicacionesRes.data.length || 0,
      });

      setTachos(tachosRes.data);
      setDetecciones(deteccionesRes.data);
    } catch (error) {
      console.error("Error cargando datos del portal", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="portal-loading">
        <div className="spinner"></div>
        <p>Cargando tu portal...</p>
      </div>
    );
  }

  return (
    <div className="user-portal">
      {/* Header */}
      <div className="portal-header">
        <div className="portal-welcome">
          <h1 className="portal-title">
            ¡Hola, {user?.nombre || "Usuario"}! 👋
          </h1>
          <p className="portal-subtitle">
            Bienvenido a tu panel de visualización de datos en tiempo real
          </p>
        </div>

        <div className="portal-user-card">
          <div className="portal-user-avatar">👤</div>
          <div className="portal-user-info">
            <span className="portal-user-name">{user?.nombre}</span>
            <span className="portal-user-role">
              {user?.rol === "admin" ? "Administrador" : "Usuario"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="portal-tabs">
        <button
          className={`portal-tab ${activeView === "overview" ? "active" : ""}`}
          onClick={() => setActiveView("overview")}
        >
          📊 Vista General
        </button>
        <button
          className={`portal-tab ${activeView === "tachos" ? "active" : ""}`}
          onClick={() => setActiveView("tachos")}
        >
          🗑️ Tachos
        </button>
        <button
          className={`portal-tab ${activeView === "detecciones" ? "active" : ""}`}
          onClick={() => setActiveView("detecciones")}
        >
          🤖 Detecciones IA
        </button>
      </div>

      {/* Vista General */}
      {activeView === "overview" && (
        <div className="portal-view fade-in">
          {/* Stats Cards */}
          <div className="portal-stats-grid">
            <div className="portal-stat-card">
              <div className="portal-stat-icon" style={{ background: "linear-gradient(135deg, #95D5B2 0%, #74C69D 100%)" }}>
                🗑️
              </div>
              <div className="portal-stat-content">
                <div className="portal-stat-value">{stats.totalTachos}</div>
                <div className="portal-stat-label">Tachos Activos</div>
              </div>
            </div>

            <div className="portal-stat-card">
              <div className="portal-stat-icon" style={{ background: "linear-gradient(135deg, #BDE0FE 0%, #A2D2FF 100%)" }}>
                🤖
              </div>
              <div className="portal-stat-content">
                <div className="portal-stat-value">{stats.totalDetecciones}</div>
                <div className="portal-stat-label">Detecciones Totales</div>
              </div>
            </div>

            <div className="portal-stat-card">
              <div className="portal-stat-icon" style={{ background: "linear-gradient(135deg, #CAFFBF 0%, #9BF6FF 100%)" }}>
                📍
              </div>
              <div className="portal-stat-content">
                <div className="portal-stat-value">{stats.totalUbicaciones}</div>
                <div className="portal-stat-label">Ubicaciones</div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="portal-card">
            <div className="portal-card-header">
              <h3 className="portal-card-title">Actividad Reciente</h3>
              <span className="badge badge-info">En Vivo</span>
            </div>
            <div className="portal-card-body">
              {detecciones.slice(0, 5).map((det) => (
                <div key={det.id} className="portal-activity-item">
                  <div className="portal-activity-icon">🤖</div>
                  <div className="portal-activity-content">
                    <p className="portal-activity-text">
                      Detección <strong>{det.nombre}</strong> en {det.tacho_nombre}
                    </p>
                    <span className="portal-activity-time">
                      {new Date(det.fecha_registro).toLocaleString("es-EC")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vista de Tachos */}
      {activeView === "tachos" && (
        <div className="portal-view fade-in">
          <div className="portal-card">
            <div className="portal-card-header">
              <h3 className="portal-card-title">Tachos Inteligentes</h3>
              <span className="badge badge-primary">{stats.totalTachos} Total</span>
            </div>
            <div className="portal-card-body">
              <div className="portal-table-container">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Ubicación</th>
                      <th>Descripción</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tachos.map((tacho) => (
                      <tr key={tacho.id}>
                        <td>
                          <span className="portal-table-badge">{tacho.codigo}</span>
                        </td>
                        <td className="portal-table-primary">{tacho.nombre}</td>
                        <td>
                          <span className="portal-table-coords">
                            📍 {tacho.ubicacion_lat?.toFixed(4)}, {tacho.ubicacion_lon?.toFixed(4)}
                          </span>
                        </td>
                        <td className="portal-table-description">{tacho.descripcion || "—"}</td>
                        <td>
                          <span className="badge badge-success">✓ Activo</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista de Detecciones */}
      {activeView === "detecciones" && (
        <div className="portal-view fade-in">
          <div className="portal-card">
            <div className="portal-card-header">
              <h3 className="portal-card-title">Detecciones de Inteligencia Artificial</h3>
              <span className="badge badge-info">{stats.totalDetecciones} Total</span>
            </div>
            <div className="portal-card-body">
              <div className="portal-table-container">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre</th>
                      <th>Tacho</th>
                      <th>Ubicación</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detecciones.map((det) => (
                      <tr key={det.id}>
                        <td>
                          <span className="portal-table-badge">{det.codigo}</span>
                        </td>
                        <td className="portal-table-primary">{det.nombre}</td>
                        <td>{det.tacho_nombre}</td>
                        <td>
                          <span className="portal-table-coords">
                            📍 {det.ubicacion_lon}, {det.ubicacion_lat}
                          </span>
                        </td>
                        <td className="portal-table-date">
                          {new Date(det.fecha_registro).toLocaleDateString("es-EC")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="portal-info-card">
        <div className="portal-info-icon">ℹ️</div>
        <div className="portal-info-content">
          <h4 className="portal-info-title">Vista de Solo Lectura</h4>
          <p className="portal-info-text">
            Estás visualizando los datos en modo solo lectura. Si necesitas
            permisos de administración, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}