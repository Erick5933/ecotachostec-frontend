// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Brain,
  Users,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  User,
  FileText,
  Activity,
  Clock
} from 'lucide-react';
import api from "../../api/axiosConfig";
import "./dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

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

  // =======================
  // 🔹 Cargar datos
  // =======================
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
        totalUsuarios:
          usuariosRes.data.results?.length || usuariosRes.data.length || 0,
        totalUbicaciones: ubicacionesRes.data.length || 0,
      });

      const recent = deteccionesRes.data.slice(0, 5).map((d) => ({
        id: d.id,
        type: "detection",
        message: `Detección "${d.nombre}" en ${d.tacho_nombre}`,
        time: new Date(d.fecha_registro).toLocaleString("es-EC"),
        icon: Brain,
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

  // ======================
  // 🔹 Tarjetas de estadísticas
  // ======================
  const statsData = [
    {
      icon: Trash2,
      value: stats.totalTachos,
      label: "Tachos Activos",
      trend: { value: 12, type: "positive" },
      color: "emerald"
    },
    {
      icon: Brain,
      value: stats.totalDetecciones,
      label: "Detecciones IA",
      trend: { value: 28, type: "positive" },
      color: "blue"
    },
    {
      icon: Users,
      value: stats.totalUsuarios,
      label: "Usuarios Registrados",
      trend: { value: 0, type: "neutral" },
      color: "purple"
    },
    {
      icon: MapPin,
      value: stats.totalUbicaciones,
      label: "Ubicaciones",
      trend: { value: 5, type: "positive" },
      color: "orange"
    }
  ];

  // ======================
  // 🔹 Acciones rápidas (con redirección)
  // ======================
  const quickActions = [
    { icon: Plus, label: "Nuevo Tacho", color: "emerald", to: "/tachos/nuevo" },
    { icon: User, label: "Nuevo Usuario", color: "blue", to: "/usuarios/nuevo" },
    { icon: MapPin, label: "Nueva Ubicación", color: "purple", to: "/ubicaciones/nuevo" },
    { icon: FileText, label: "Ver Reportes", color: "orange", to: "/detecciones" }
  ];

  // ======================
  // 🔹 Estado del sistema
  // ======================
  const systemStatus = [
    { label: "API Backend", value: "Conectado", status: "online" },
    { label: "Base de Datos", value: "Operativa", status: "online" },
    { label: "Servicios IoT", value: "Activos", status: "online" },
    { label: "IA/ML Engine", value: "Funcionando", status: "online" }
  ];

  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="dashboard-header fade-in">
        <div>
          <h1 className="dashboard-title">Bienvenido a EcoTachosTec</h1>
          <p className="dashboard-subtitle">Panel de control y gestión inteligente de tachos IoT</p>
        </div>

        <button className="btn btn-primary btn-report" onClick={() => navigate("/detecciones")}>
          <FileText className="btn-icon" />
          Generar Reporte
        </button>
      </div>

      {/* STATS GRID */}
      <div className="stats-grid slide-up">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          const TrendIcon =
            stat.trend.type === "positive"
              ? TrendingUp
              : stat.trend.type === "negative"
              ? TrendingDown
              : Minus;

          return (
            <div
              key={index}
              className="stat-card"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="stat-card-header">
                <div className={`stat-card-icon stat-icon-${stat.color}`}>
                  <IconComponent className="stat-icon-svg" />
                </div>

                <span className={`stat-card-trend-badge trend-${stat.trend.type}`}>
                  <TrendIcon className="trend-icon" />
                  {stat.trend.value}%
                </span>
              </div>

              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-label">{stat.label}</div>
              <div className={`stat-card-trend trend-${stat.trend.type}`}>
                vs mes anterior
              </div>
            </div>
          );
        })}
      </div>

      {/* GRID PRINCIPAL */}
      <div className="dashboard-grid slide-up" style={{ animationDelay: "0.5s" }}>

        {/* ACTIVIDAD RECIENTE */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Actividad Reciente</h3>
            <span className="badge badge-info">
              <Activity className="badge-icon" /> En Vivo
            </span>
          </div>

          <div className="card-body">
            {recentActivity.length === 0 ? (
              <p className="text-muted">No hay actividad reciente</p>
            ) : (
              <div className="activity-list">
                {recentActivity.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="activity-item"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <div className="activity-icon">
                        <IconComponent className="activity-icon-svg" />
                      </div>

                      <div className="activity-content">
                        <p className="activity-message">{activity.message}</p>
                        <span className="activity-time">
                          <Clock className="time-icon" />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ACCIONES RÁPIDAS */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Acciones Rápidas</h3>
          </div>

          <div className="card-body">
            <div className="quick-actions">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;

                return (
                  <button
                    key={index}
                    onClick={() => navigate(action.to)}
                    className="quick-action-btn"
                  >
                    <div className={`quick-action-icon quick-action-${action.color}`}>
                      <IconComponent className="quick-action-icon-svg" />
                    </div>

                    <span className="quick-action-label">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ESTADO DEL SISTEMA */}
      <div className="card slide-up" style={{ animationDelay: "0.6s" }}>
        <div className="card-header">
          <h3 className="card-title">Estado del Sistema</h3>
          <span className="badge badge-success">
            <Activity className="badge-icon" />
            Operativo
          </span>
        </div>

        <div className="card-body">
          <div className="system-status-grid">
              {systemStatus.map((item, index) => (
              <div key={index} className="status-item">
                <div className={`status-indicator ${item.status}`}></div>

                <div className="status-info">
                  <span className="status-label">{item.label}</span>
                  <span className="status-value">{item.value}</span>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
