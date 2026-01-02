// src/pages/User/UserPortal.jsx
import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import CameraCapture from "../../components/CameraCapture/CameraCapture";
import AIProcessor from "../../components/AIProcessor/AIProcessor";
import {
  User, Activity, TrendingUp, Trash2, Brain, MapPin,
  Clock, CheckCircle, AlertCircle, BarChart3,
  Package, Zap, Eye, Calendar, Filter,
  ArrowRight, RefreshCw, Download, Search,
  Target, Award, Sparkles, Radio, Camera, Upload, X, Scan, CheckCircle2,
  Image as ImageIcon
} from "lucide-react";
import "./userPortal.css";

export default function UserPortal() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalTachos: 0,
    totalDetecciones: 0,
    misDetecciones: 0,
  });
  const [tachos, setTachos] = useState([]);
  const [detecciones, setDetecciones] = useState([]);
  const [misTachos, setMisTachos] = useState([]);
  const [misDetecciones, setMisDetecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [animatedStats, setAnimatedStats] = useState({
    totalTachos: 0,
    totalDetecciones: 0,
    misDetecciones: 0,
  });

  // Estados para IA
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showAIProcessor, setShowAIProcessor] = useState(false);
  const fileInputRef = useRef(null);
  const aiSectionRef = useRef(null);

  // Refs para animaciones
  const statsRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadPortalData();
  }, [user, navigate]);

  useEffect(() => {
    // Animar contadores cuando cambien las stats
    Object.keys(stats).forEach(key => {
      animateCounter(key, animatedStats[key], stats[key]);
    });
  }, [stats]);

  const animateCounter = (key, start, end) => {
    const duration = 2000;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);

      setAnimatedStats(prev => ({ ...prev, [key]: current }));

      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16);
  };

  const loadPortalData = async () => {
    try {
      const [tachosRes, deteccionesRes] = await Promise.all([
        api.get("/tachos/"),
        api.get("/detecciones/"),
      ]);

      // Filtrar mis tachos (donde el usuario es propietario)
      const userTachos = tachosRes.data.filter(tacho =>
        tacho.propietario === user?.id
      );

      // Filtrar mis detecciones (donde el usuario es el creador)
      const userDetecciones = deteccionesRes.data.filter(det =>
        det.usuario === user?.id
      );

      setStats({
        totalTachos: userTachos.length,
        totalDetecciones: deteccionesRes.data.length,
        misDetecciones: userDetecciones.length,
      });

      setTachos(tachosRes.data);
      setDetecciones(deteccionesRes.data);
      setMisTachos(userTachos);
      setMisDetecciones(userDetecciones);
    } catch (error) {
      console.error("Error cargando datos del portal", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadPortalData();
  };

  // FUNCIONES PARA IA
  const handleImageCapture = (imageData) => {
    setCapturedImage(imageData);
    setShowAIProcessor(true);
    setShowCameraModal(false);

    setTimeout(() => {
      aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleOpenCamera = () => {
    setShowCameraModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
        setShowAIProcessor(true);

        setTimeout(() => {
          aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  const handleResetImage = () => {
    setCapturedImage(null);
    setShowAIProcessor(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNewDetection = async (detectionData) => {
    try {
      // Crear detección solo para el usuario actual
      const detectionPayload = {
        ...detectionData,
        usuario: user.id,  // Asignar al usuario actual
        tacho: null,       // No asignar a ningún tacho
        ubicacion_lat: user.canton?.latitud || -0.2295,  // Usar ubicación del usuario o default
        ubicacion_lon: user.canton?.longitud || -78.5249,
      };

      const response = await api.post("/detecciones/", detectionPayload);

      // Recargar datos
      loadPortalData();

      return response.data;
    } catch (error) {
      console.error("Error creando detección:", error);
      throw error;
    }
  };

  const filteredTachos = misTachos.filter(tacho =>
    tacho.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDetecciones = misDetecciones.filter(det =>
    det.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    det.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para formatear fecha
  const formatFechaLegible = (fechaString) => {
    if (!fechaString) return 'Fecha no disponible';

    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diferenciaMs = ahora - fecha;
    const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

    if (diferenciaDias === 0) {
      const diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));
      if (diferenciaHoras < 1) {
        const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
        if (diferenciaMinutos < 1) return 'Hace unos momentos';
        return `Hace ${diferenciaMinutos} min${diferenciaMinutos !== 1 ? 's' : ''}`;
      }
      return `Hace ${diferenciaHoras} hora${diferenciaHoras !== 1 ? 's' : ''}`;
    }

    if (diferenciaDias === 1) {
      return `Ayer ${fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`;
    }

    if (diferenciaDias < 7) {
      return `${fecha.toLocaleDateString('es-EC', { weekday: 'long' })} ${fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return fecha.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener ubicación
  const getUbicacionFromCoords = (lat, lon) => {
    if (!lat || !lon) return "Ubicación desconocida";

    // Coordenadas aproximadas para provincias de Ecuador
    const locations = [
      { provincia: "Pichincha", ciudad: "Quito", latRange: [-0.3, 0.1], lonRange: [-78.6, -78.4] },
      { provincia: "Guayas", ciudad: "Guayaquil", latRange: [-2.3, -2.1], lonRange: [-79.95, -79.85] },
      { provincia: "Azuay", ciudad: "Cuenca", latRange: [-2.92, -2.88], lonRange: [-79.02, -78.98] },
      { provincia: "Manabí", ciudad: "Manta", latRange: [-1.06, -0.98], lonRange: [-80.75, -80.65] },
      { provincia: "El Oro", ciudad: "Machala", latRange: [-3.28, -3.24], lonRange: [-79.97, -79.93] },
      { provincia: "Loja", ciudad: "Loja", latRange: [-4.02, -3.98], lonRange: [-79.22, -79.18] },
      { provincia: "Tungurahua", ciudad: "Ambato", latRange: [-1.28, -1.22], lonRange: [-78.65, -78.59] },
      { provincia: "Imbabura", ciudad: "Ibarra", latRange: [0.35, 0.39], lonRange: [-78.15, -78.11] },
      { provincia: "Cotopaxi", ciudad: "Latacunga", latRange: [-0.95, -0.91], lonRange: [-78.62, -78.58] },
      { provincia: "Chimborazo", ciudad: "Riobamba", latRange: [-1.68, -1.64], lonRange: [-78.67, -78.63] },
    ];

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    for (const location of locations) {
      if (
        latNum >= location.latRange[0] && latNum <= location.latRange[1] &&
        lonNum >= location.lonRange[0] && lonNum <= location.lonRange[1]
      ) {
        return `${location.ciudad}, ${location.provincia}`;
      }
    }

    if (latNum > 0) return "Región Norte";
    if (latNum < -2) return "Región Sur";
    if (lonNum < -80) return "Región Costa";
    return "Región Sierra";
  };

  // Función para obtener clase de clasificación
  const getClasificacionBadgeClass = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return 'organico';
      case 'inorganico': return 'inorganico';
      case 'reciclable': return 'reciclable';
      default: return 'organico';
    }
  };

  const getClasificacionText = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return 'Orgánico';
      case 'inorganico': return 'Inorgánico';
      case 'reciclable': return 'Reciclable';
      default: return clasificacion || 'No clasificado';
    }
  };

  const getClasificacionIcon = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return '🌱';
      case 'inorganico': return '🏭';
      case 'reciclable': return '♻️';
      default: return '📦';
    }
  };

  if (loading) {
    return (
      <div className="portal-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-text">Cargando tu portal...</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  return (
    <div className="user-portal">
      {/* Animated Background */}
      <div className="portal-background">
        <div className="portal-bg-circle portal-bg-circle-1"></div>
        <div className="portal-bg-circle portal-bg-circle-2"></div>
        <div className="portal-bg-circle portal-bg-circle-3"></div>
      </div>

      {/* Header */}
      <div className="portal-header">
        <div className="portal-welcome">
          <div className="welcome-badge">
            <Sparkles size={16} />
            <span>Panel Personal</span>
          </div>
          <h1 className="portal-title">
            ¡Hola, {user?.nombre || "Usuario"}!
          </h1>
          <p className="portal-subtitle">
            Gestiona tus tachos y detecciones personales
          </p>
        </div>

        <div className="portal-header-actions">
          <button className="portal-action-btn" onClick={handleRefresh}>
            <RefreshCw size={20} />
          </button>
          <div className="portal-user-card">
            <div className="portal-user-avatar">
              <User size={24} />
            </div>
            <div className="portal-user-info">
              <span className="portal-user-name">{user?.nombre}</span>
              <span className="portal-user-role">
                {user?.rol === "admin" ? (
                  <>
                    <Award size={14} />
                    <span>Administrador</span>
                  </>
                ) : (
                  <>
                    <Eye size={14} />
                    <span>Usuario</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview - MODIFICADO */}
      <div ref={statsRef} className="portal-stats-grid">
        <div className="portal-stat-card">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper green-gradient">
              <Trash2 size={28} />
              <div className="stat-icon-glow"></div>
            </div>
            <div className="stat-details">
              <div className="stat-value">
                <span className="stat-number">{animatedStats.totalTachos}</span>
                <TrendingUp size={20} className="stat-trend" />
              </div>
              <div className="stat-label">Mis Tachos</div>
              <div className="stat-progress">
                <div className="stat-progress-bar green" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
          <div className="stat-card-shine"></div>
        </div>

        <div className="portal-stat-card">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper blue-gradient">
              <Brain size={28} />
              <div className="stat-icon-glow"></div>
            </div>
            <div className="stat-details">
              <div className="stat-value">
                <span className="stat-number">{animatedStats.misDetecciones}</span>
                <Zap size={20} className="stat-trend" />
              </div>
              <div className="stat-label">Mis Detecciones</div>
              <div className="stat-progress">
                <div className="stat-progress-bar blue" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
          <div className="stat-card-shine"></div>
        </div>

        <div className="portal-stat-card">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper purple-gradient">
              <Target size={28} />
              <div className="stat-icon-glow"></div>
            </div>
            <div className="stat-details">
              <div className="stat-value">
                <span className="stat-number">{animatedStats.totalDetecciones}</span>
                <Target size={20} className="stat-trend" />
              </div>
              <div className="stat-label">Total Detecciones</div>
              <div className="stat-progress">
                <div className="stat-progress-bar purple" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
          <div className="stat-card-shine"></div>
        </div>
      </div>

      {/* Navigation Tabs - MODIFICADO */}
      <div className="portal-tabs">
        <button
          className={`portal-tab ${activeView === "overview" ? "active" : ""}`}
          onClick={() => setActiveView("overview")}
        >
          <BarChart3 size={20} />
          <span>Vista General</span>
          {activeView === "overview" && <div className="tab-indicator"></div>}
        </button>
        <button
          className={`portal-tab ${activeView === "mytachos" ? "active" : ""}`}
          onClick={() => setActiveView("mytachos")}
        >
          <Package size={20} />
          <span>Mis Tachos</span>
          {activeView === "mytachos" && <div className="tab-indicator"></div>}
        </button>
        <button
          className={`portal-tab ${activeView === "mydetecciones" ? "active" : ""}`}
          onClick={() => setActiveView("mydetecciones")}
        >
          <Brain size={20} />
          <span>Mis Detecciones</span>
          {activeView === "mydetecciones" && <div className="tab-indicator"></div>}
        </button>
        <button
          className={`portal-tab ${activeView === "detecciones" ? "active" : ""}`}
          onClick={() => setActiveView("detecciones")}
        >
          <Radio size={20} />
          <span>Nueva Detección</span>
          {activeView === "detecciones" && <div className="tab-indicator"></div>}
        </button>
      </div>

      {/* Vista General - MODIFICADA */}
      {activeView === "overview" && (
        <div className="portal-view">
          {/* Activity Timeline - MEJORADA */}
          <div className="portal-card activity-card">
            <div className="portal-card-header">
              <div className="card-header-left">
                <Activity size={24} className="header-icon" />
                <h3 className="portal-card-title">Mis Detecciones Recientes</h3>
              </div>
              <div className="card-header-actions">
                <span className="live-badge">
                  <span className="live-dot"></span>
                  <span>En Vivo</span>
                </span>
              </div>
            </div>
            <div className="portal-card-body">
              <div className="activity-timeline">
                {misDetecciones.slice(0, 6).map((det, index) => {
                  const ubicacion = getUbicacionFromCoords(det.ubicacion_lat, det.ubicacion_lon);
                  const fechaRegistro = formatFechaLegible(det.fecha_registro || det.created_at);

                  return (
                    <div key={det.id} className="activity-item" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="activity-line"></div>
                      <div className="activity-dot">
                        <Brain size={16} />
                      </div>
                      <div className="activity-content">
                        <div className="activity-header">
                          <span className="activity-title">
                            <strong>{det.nombre}</strong> - {getClasificacionText(det.clasificacion)}
                          </span>
                          <span className={`activity-badge ${getClasificacionBadgeClass(det.clasificacion)}`}>
                            {getClasificacionIcon(det.clasificacion)} {det.confianza_ia || 0}%
                          </span>
                        </div>
                        <div className="activity-meta">
                          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <MapPin size={14} />
                              {ubicacion}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Clock size={14} />
                              {fechaRegistro}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="activity-hover-effect"></div>
                      <Link
                        to={`/detecciones/${det.id}`}
                        className="activity-detail-link"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions - MODIFICADO */}
          <div className="quick-actions-grid">
            <div className="quick-action-card" onClick={() => setActiveView("mytachos")}>
              <div className="quick-action-icon green-gradient">
                <Trash2 size={24} />
              </div>
              <div className="quick-action-content">
                <h4>Mis Tachos</h4>
                <p>Gestiona tus tachos personales</p>
              </div>
              <ArrowRight size={20} className="quick-action-arrow" />
            </div>

            <div className="quick-action-card" onClick={() => setActiveView("detecciones")}>
              <div className="quick-action-icon blue-gradient">
                <Camera size={24} />
              </div>
              <div className="quick-action-content">
                <h4>Nueva Detección</h4>
                <p>Clasifica residuos con IA</p>
              </div>
              <ArrowRight size={20} className="quick-action-arrow" />
            </div>
          </div>
        </div>
      )}

      {/* Vista de MIS Tachos */}
      {activeView === "mytachos" && (
        <div className="portal-view">
          <div className="portal-card">
            <div className="portal-card-header">
              <div className="card-header-left">
                <Package size={24} className="header-icon" />
                <h3 className="portal-card-title">Mis Tachos Personales</h3>
              </div>
              <div className="card-header-actions">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Buscar mis tachos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="export-btn">
                  <Download size={18} />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
            <div className="portal-card-body">
              {misTachos.length === 0 ? (
                <div className="empty-state">
                  <Trash2 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#4b5563' }}>
                    No tienes tachos personales
                  </h4>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    Contacta al administrador para crear tachos personales
                  </p>
                </div>
              ) : (
                <div className="portal-table-container">
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th><div className="th-content"><span>Código</span></div></th>
                        <th><div className="th-content"><span>Nombre</span></div></th>
                        <th><div className="th-content"><MapPin size={14} /><span>Ubicación</span></div></th>
                        <th><div className="th-content"><span>Tipo</span></div></th>
                        <th><div className="th-content"><span>Estado</span></div></th>
                        <th><div className="th-content"><span>Llenado</span></div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTachos.map((tacho, index) => (
                        <tr key={tacho.id} style={{ animationDelay: `${index * 0.05}s` }}>
                          <td><span className="table-badge green">{tacho.codigo}</span></td>
                          <td>
                            <div className="table-primary">
                              <Trash2 size={16} />
                              <span>{tacho.nombre}</span>
                            </div>
                          </td>
                          <td>
                            <div className="table-coords">
                              <MapPin size={14} />
                              <span>
                                {getUbicacionFromCoords(tacho.ubicacion_lat, tacho.ubicacion_lon)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${tacho.tipo === 'personal' ? 'active' : 'warning'}`}>
                              {tacho.tipo === 'personal' ? 'Personal' : 'Público'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${tacho.estado === 'activo' ? 'active' : 'danger'}`}>
                              {tacho.estado === 'activo' ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>
                            <div className="fill-progress">
                              <div
                                className="fill-progress-bar"
                                style={{ width: `${tacho.nivel_llenado || 0}%` }}
                              ></div>
                              <span>{tacho.nivel_llenado || 0}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vista de MIS Detecciones */}
      {activeView === "mydetecciones" && (
        <div className="portal-view">
          <div className="portal-card">
            <div className="portal-card-header">
              <div className="card-header-left">
                <Brain size={24} className="header-icon" />
                <h3 className="portal-card-title">Mis Detecciones</h3>
              </div>
              <div className="card-header-actions">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Buscar mis detecciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="filter-btn">
                  <Filter size={18} />
                </button>
                <button className="export-btn">
                  <Download size={18} />
                  <span>Exportar</span>
                </button>
              </div>
            </div>
            <div className="portal-card-body">
              {misDetecciones.length === 0 ? (
                <div className="empty-state">
                  <Brain size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#4b5563' }}>
                    No tienes detecciones personales
                  </h4>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    Crea tu primera detección en la sección "Nueva Detección"
                  </p>
                </div>
              ) : (
                <div className="portal-table-container">
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th><div className="th-content"><span>Nombre</span></div></th>
                        <th><div className="th-content"><span>Clasificación</span></div></th>
                        <th><div className="th-content"><MapPin size={14} /><span>Ubicación</span></div></th>
                        <th><div className="th-content"><Calendar size={14} /><span>Fecha</span></div></th>
                        <th><div className="th-content"><span>Confianza IA</span></div></th>
                        <th><div className="th-content"><span>Acciones</span></div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDetecciones.map((det, index) => {
                        const ubicacion = getUbicacionFromCoords(det.ubicacion_lat, det.ubicacion_lon);
                        const fechaRegistro = formatFechaLegible(det.fecha_registro || det.created_at);

                        return (
                          <tr key={det.id} style={{ animationDelay: `${index * 0.05}s` }}>
                            <td>
                              <div className="table-primary">
                                <Brain size={16} />
                                <span>{det.nombre}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1rem' }}>
                                  {getClasificacionIcon(det.clasificacion)}
                                </span>
                                <span className={`clasification-badge ${getClasificacionBadgeClass(det.clasificacion)}`}>
                                  {getClasificacionText(det.clasificacion)}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="table-coords">
                                <MapPin size={14} />
                                <span>{ubicacion}</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-date">
                                <Clock size={14} />
                                <span>{fechaRegistro}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`confianza-badge ${parseFloat(det.confianza_ia || 0) >= 80 ? 'high' :
                                parseFloat(det.confianza_ia || 0) >= 60 ? 'medium' : 'low'}`}>
                                {det.confianza_ia || 0}%
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <Link
                                  to={`/detecciones/${det.id}`}
                                  className="detail-btn"
                                >
                                  <ImageIcon size={16} />
                                  <span>Detalle</span>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vista de Nueva Detección con IA */}
      {activeView === "detecciones" && (
        <div className="portal-view">
          {/* SECCIÓN DE ANÁLISIS CON IA */}
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto 40px',
            padding: '0 20px'
          }}>
            {/* HEADER */}
            <div style={{
              textAlign: 'center',
              marginBottom: '48px'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '2px solid #10b981',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#10b981',
                marginBottom: '24px'
              }}>
                <Scan size={16} />
                <span>Probá Nuestra IA</span>
              </div>

              <h2 style={{
                fontSize: '40px',
                fontWeight: '800',
                color: '#1f2937',
                margin: '0 0 16px 0',
                letterSpacing: '-1px',
                lineHeight: '1.2'
              }}>
                Clasificación Inteligente de Residuos
              </h2>

              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.6',
                maxWidth: '700px',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                Captura o sube una foto para que nuestra IA analice y clasifique automáticamente
                el tipo de residuo. La detección se guardará solo en tu cuenta personal.
              </p>
            </div>

            {/* CONTENEDOR PRINCIPAL */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e5e7eb'
            }}>
              {/* ÁREA DE PREVIEW */}
              <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: '16px',
                minHeight: '400px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: '3px solid #334155'
              }}>
                {/* Patrón de fondo decorativo */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `
                    linear-gradient(45deg, transparent 0%, transparent 49%, rgba(16, 185, 129, 0.02) 50%, transparent 51%, transparent 100%),
                    linear-gradient(-45deg, transparent 0%, transparent 49%, rgba(16, 185, 129, 0.02) 50%, transparent 51%, transparent 100%)
                  `,
                  backgroundSize: '40px 40px',
                  opacity: 0.5,
                  pointerEvents: 'none'
                }}></div>

                {capturedImage ? (
                  <>
                    <img
                      src={capturedImage}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        position: 'relative',
                        zIndex: 1,
                        borderRadius: '8px'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: '20px',
                      background: 'rgba(16, 185, 129, 0.95)',
                      color: 'white',
                      padding: '10px 18px',
                      borderRadius: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      zIndex: 2,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}>
                      <CheckCircle2 size={16} />
                      <span>Imagen lista</span>
                    </div>
                  </>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 40px',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      margin: '0 auto 28px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px dashed rgba(16, 185, 129, 0.3)',
                      animation: 'pulse-border 2s ease-in-out infinite'
                    }}>
                      <Camera size={48} color="rgba(16, 185, 129, 0.7)" />
                    </div>

                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: 'white',
                      margin: '0 0 12px 0',
                      letterSpacing: '-0.5px'
                    }}>
                      Captura una foto o sube una imagen para analizar con IA
                    </h3>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 20px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      borderRadius: '24px',
                      fontSize: '14px',
                      color: 'rgba(16, 185, 129, 0.9)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      marginTop: '12px',
                      backdropFilter: 'blur(5px)'
                    }}>
                      <Scan size={18} />
                      <span style={{ fontWeight: '500' }}>La detección se guardará solo en tu cuenta</span>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTONES DE CONTROL */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: capturedImage ? '1fr 1fr auto' : '1fr 1fr',
                gap: '14px',
                marginBottom: '20px'
              }}>
                <button
                  onClick={handleOpenCamera}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '18px 28px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                    letterSpacing: '0.3px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  <Camera size={20} />
                  <span>Abrir Cámara</span>
                </button>

                <button
                  onClick={handleOpenFileSelector}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '18px 28px',
                    background: 'white',
                    color: '#10b981',
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    letterSpacing: '0.3px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = '#f0fdf4';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Upload size={20} />
                  <span>Subir Imagen</span>
                </button>

                {capturedImage && (
                  <button
                    onClick={handleResetImage}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '18px 24px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: '2px solid #fecaca',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      letterSpacing: '0.3px'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#fecaca';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.15)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#fee2e2';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <X size={20} />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>

              {/* Input oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />

              {/* INFO */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '2px solid #86efac',
                borderRadius: '12px',
                fontSize: '14px',
                color: '#166534',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
              }}>
                <Scan size={20} style={{ flexShrink: 0, color: '#10b981' }} />
                <span style={{ fontWeight: '500', lineHeight: '1.5' }}>
                  {capturedImage
                    ? "✅ Imagen cargada. La detección se guardará solo en tu cuenta personal sin asociar a tacho."
                    : "💡 Utiliza cámara en vivo o sube una imagen existente. La detección será personal y no se asociará a ningún tacho."
                  }
                </span>
              </div>
            </div>
          </div>

          {/* PROCESADOR IA MODIFICADO */}
          {showAIProcessor && capturedImage && (
            <div ref={aiSectionRef} style={{
              maxWidth: '1200px',
              margin: '0 auto 40px',
              padding: '0 20px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                border: '2px solid #e5e7eb'
              }}>
                <AIProcessor
                  capturedImage={capturedImage}
                  onNewDetection={handleNewDetection}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      <div className="portal-info-card">
        <div className="info-icon-wrapper">
          <AlertCircle size={24} />
        </div>
        <div className="info-content">
          <h4 className="info-title">Panel Personal</h4>
          <p className="info-text">
            Aquí puedes ver y gestionar solo tus tachos personales y detecciones.
            Las nuevas detecciones se guardarán únicamente en tu cuenta sin asociarse a tachos.
          </p>
        </div>
      </div>

      {/* MODAL DE CÁMARA */}
      {showCameraModal && (
        <CameraCapture
          onCapture={handleImageCapture}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
}