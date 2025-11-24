// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import "./dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalTachos: 0,
    totalDetecciones: 0,
    totalUsuarios: 0,
    totalUbicaciones: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tachosRes, deteccionesRes, usuariosRes, ubicacionesRes] =
        await Promise.all([
          api.get("/tachos/"),
          api.get("/detecciones/"),
          api.get("/usuarios/"),
          api.get("/ubicacion/cantones/"),
        ]);

      setStats({
        totalTachos: tachosRes.data.length || 0,
        totalDetecciones: deteccionesRes.data.length || 0,
        totalUsuarios: usuariosRes.data.results?.length || usuariosRes.data.length || 0,
        totalUbicaciones: ubicacionesRes.data.length || 0,
      });

      // Simular actividad reciente (últimas 5 detecciones)
      const recent = deteccionesRes.data
        .slice(0, 5)
        .map((d) => ({
          id: d.id,
          type: "detection",
          message: `Detección "${d.nombre}" en ${d.tacho_nombre}`,
          time: new Date(d.fecha_registro).toLocaleString("es-EC"),
          icon: "🤖",
        }));

      setRecentActivity(recent);
    } catch (error) {
      console.error("Error cargando datos del dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header fade-in">
        <div>
          <h1 className="dashboard-title">
            Bienvenido a EcoTachosTec 🌿
          </h1>
          <p className="dashboard-subtitle">
            Panel de control y gestión inteligente de tachos IoT
          </p>
        </div>
        <button className="btn btn-primary">
          📊 Generar Reporte
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid slide-up">
        <div className="stat-card" style={{ animationDelay: "0.1s" }}>
          <div className="stat-card-icon" style={{ background: "linear-gradient(135deg, #95D5B2 0%, #74C69D 100%)" }}>
            🗑️
          </div>
          <div className="stat-card-value">{stats.totalTachos}</div>
          <div className="stat-card-label">Tachos Activos</div>
          <div className="stat-card-trend positive">
            <span>↑ 12%</span> vs mes anterior
          </div>
        </div>

        <div className="stat-card" style={{ animationDelay: "0.2s" }}>
          <div className="stat-card-icon" style={{ background: "linear-gradient(135deg, #BDE0FE 0%, #A2D2FF 100%)" }}>
            🤖
          </div>
          <div className="stat-card-value">{stats.totalDetecciones}</div>
          <div className="stat-card-label">Detecciones IA</div>
          <div className="stat-card-trend positive">
            <span>↑ 28%</span> vs mes anterior
          </div>
        </div>

        <div className="stat-card" style={{ animationDelay: "0.3s" }}>
          <div className="stat-card-icon" style={{ background: "linear-gradient(135deg, #FFD6A5 0%, #FFADAD 100%)" }}>
            👥
          </div>
          <div className="stat-card-value">{stats.totalUsuarios}</div>
          <div className="stat-card-label">Usuarios Registrados</div>
          <div className="stat-card-trend neutral">
            <span>→ 0%</span> Sin cambios
          </div>
        </div>

        <div className="stat-card" style={{ animationDelay: "0.4s" }}>
          <div className="stat-card-icon" style={{ background: "linear-gradient(135deg, #CAFFBF 0%, #9BF6FF 100%)" }}>
            📍
          </div>
          <div className="stat-card-value">{stats.totalUbicaciones}</div>
          <div className="stat-card-label">Ubicaciones</div>
          <div className="stat-card-trend positive">
            <span>↑ 5%</span> vs mes anterior
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid slide-up" style={{ animationDelay: "0.5s" }}>
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Actividad Reciente</h3>
            <span className="badge badge-info">En Vivo</span>
          </div>
          <div className="card-body">
            {recentActivity.length === 0 ? (
              <p className="text-muted">No hay actividad reciente</p>
            ) : (
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="activity-item"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-content">
                      <p className="activity-message">{activity.message}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Acciones Rápidas</h3>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <button className="quick-action-btn">
                <span className="quick-action-icon">➕</span>
                <span className="quick-action-label">Nuevo Tacho</span>
              </button>
              <button className="quick-action-btn">
                <span className="quick-action-icon">👤</span>
                <span className="quick-action-label">Nuevo Usuario</span>
              </button>
              <button className="quick-action-btn">
                <span className="quick-action-icon">📍</span>
                <span className="quick-action-label">Nueva Ubicación</span>
              </button>
              <button className="quick-action-btn">
                <span className="quick-action-icon">📊</span>
                <span className="quick-action-label">Ver Reportes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card slide-up" style={{ animationDelay: "0.6s" }}>
        <div className="card-header">
          <h3 className="card-title">Estado del Sistema</h3>
          <span className="badge badge-success">✓ Operativo</span>
        </div>
        <div className="card-body">
          <div className="system-status-grid">
            <div className="status-item">
              <div className="status-indicator online"></div>
              <div className="status-info">
                <span className="status-label">API Backend</span>
                <span className="status-value">Conectado</span>
              </div>
            </div>
            <div className="status-item">
              <div className="status-indicator online"></div>
              <div className="status-info">
                <span className="status-label">Base de Datos</span>
                <span className="status-value">Operativa</span>
              </div>
            </div>
            <div className="status-item">
              <div className="status-indicator online"></div>
              <div className="status-info">
                <span className="status-label">Servicios IoT</span>
                <span className="status-value">Activos</span>
              </div>
            </div>
            <div className="status-item">
              <div className="status-indicator online"></div>
              <div className="status-info">
                <span className="status-label">IA/ML Engine</span>
                <span className="status-value">Funcionando</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}