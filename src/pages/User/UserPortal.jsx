// src/pages/User/UserPortal.jsx
import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import CameraCapture from "../../components/CameraCapture/CameraCapture";
import AIProcessor from "../../components/AIProcessor/AIProcessor";
import {
  User, Activity, TrendingUp, Trash2, Brain, MapPin,
  Clock, CheckCircle, AlertCircle, BarChart3,
  Package, Zap, Eye, Calendar, Filter,
  ArrowRight, RefreshCw, Download, Search,
  Target, Award, Sparkles, Radio, Camera, Upload, X, Scan, CheckCircle2
} from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [animatedStats, setAnimatedStats] = useState({
    totalTachos: 0,
    totalDetecciones: 0,
    totalUbicaciones: 0,
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

  const filteredTachos = tachos.filter(tacho =>
    tacho.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDetecciones = detecciones.filter(det =>
    det.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    det.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <span>Panel de Control</span>
          </div>
          <h1 className="portal-title">
            ¡Hola, {user?.nombre || "Usuario"}!
          </h1>
          <p className="portal-subtitle">
            Bienvenido a tu panel de visualización de datos en tiempo real
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

      {/* Stats Overview */}
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
              <div className="stat-label">Tachos Activos</div>
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
                <span className="stat-number">{animatedStats.totalDetecciones}</span>
                <Zap size={20} className="stat-trend" />
              </div>
              <div className="stat-label">Detecciones Totales</div>
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
              <MapPin size={28} />
              <div className="stat-icon-glow"></div>
            </div>
            <div className="stat-details">
              <div className="stat-value">
                <span className="stat-number">{animatedStats.totalUbicaciones}</span>
                <Target size={20} className="stat-trend" />
              </div>
              <div className="stat-label">Ubicaciones</div>
              <div className="stat-progress">
                <div className="stat-progress-bar purple" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
          <div className="stat-card-shine"></div>
        </div>
      </div>

      {/* Navigation Tabs */}
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
          className={`portal-tab ${activeView === "tachos" ? "active" : ""}`}
          onClick={() => setActiveView("tachos")}
        >
          <Package size={20} />
          <span>Tachos</span>
          {activeView === "tachos" && <div className="tab-indicator"></div>}
        </button>
        <button
          className={`portal-tab ${activeView === "detecciones" ? "active" : ""}`}
          onClick={() => setActiveView("detecciones")}
        >
          <Radio size={20} />
          <span>Detecciones IA</span>
          {activeView === "detecciones" && <div className="tab-indicator"></div>}
        </button>
      </div>

      {/* Vista General */}
      {activeView === "overview" && (
        <div className="portal-view">
          {/* Activity Timeline */}
          <div className="portal-card activity-card">
            <div className="portal-card-header">
              <div className="card-header-left">
                <Activity size={24} className="header-icon" />
                <h3 className="portal-card-title">Actividad Reciente</h3>
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
                {detecciones.slice(0, 6).map((det, index) => (
                  <div key={det.id} className="activity-item" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="activity-line"></div>
                    <div className="activity-dot">
                      <Brain size={16} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-header">
                        <span className="activity-title">
                          Detección <strong>{det.nombre}</strong>
                        </span>
                        <span className="activity-badge">{det.tacho_nombre}</span>
                      </div>
                      <div className="activity-meta">
                        <Clock size={14} />
                        <span>{new Date(det.fecha_registro).toLocaleString("es-EC")}</span>
                      </div>
                    </div>
                    <div className="activity-hover-effect"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-grid">
            <div className="quick-action-card" onClick={() => setActiveView("tachos")}>
              <div className="quick-action-icon green-gradient">
                <Trash2 size={24} />
              </div>
              <div className="quick-action-content">
                <h4>Ver Tachos</h4>
                <p>Explora todos los tachos inteligentes</p>
              </div>
              <ArrowRight size={20} className="quick-action-arrow" />
            </div>

            <div className="quick-action-card" onClick={() => setActiveView("detecciones")}>
              <div className="quick-action-icon blue-gradient">
                <Brain size={24} />
              </div>
              <div className="quick-action-content">
                <h4>Ver Detecciones</h4>
                <p>Revisa las detecciones de IA</p>
              </div>
              <ArrowRight size={20} className="quick-action-arrow" />
            </div>
          </div>
        </div>
      )}

      {/* Vista de Tachos */}
      {activeView === "tachos" && (
        <div className="portal-view">
          <div className="portal-card">
            <div className="portal-card-header">
              <div className="card-header-left">
                <Package size={24} className="header-icon" />
                <h3 className="portal-card-title">Tachos Inteligentes</h3>
              </div>
              <div className="card-header-actions">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Buscar tachos..."
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
              <div className="portal-table-container">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>
                        <div className="th-content">
                          <span>Código</span>
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <span>Nombre</span>
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <MapPin size={14} />
                          <span>Ubicación</span>
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <span>Descripción</span>
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <span>Estado</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTachos.map((tacho, index) => (
                      <tr key={tacho.id} style={{ animationDelay: `${index * 0.05}s` }}>
                        <td>
                          <span className="table-badge green">{tacho.codigo}</span>
                        </td>
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
                              {tacho.ubicacion_lat?.toFixed(4)}, {tacho.ubicacion_lon?.toFixed(4)}
                            </span>
                          </div>
                        </td>
                        <td className="table-description">{tacho.descripcion || "—"}</td>
                        <td>
                          <span className="status-badge active">
                            <CheckCircle size={14} />
                            <span>Activo</span>
                          </span>
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

      {/* Vista de Detecciones CON IA */}
      {activeView === "detecciones" && (
        <div className="portal-view">
          {/* SECCIÓN DE ANÁLISIS CON IA */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            color: 'white'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <Brain size={16} />
                <span>Análisis con IA en Tiempo Real</span>
              </div>
              
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700',
                margin: '0 0 8px 0'
              }}>
                Clasificador Inteligente de Residuos
              </h3>
              
              <p style={{ 
                fontSize: '14px',
                margin: 0,
                opacity: 0.9
              }}>
                Sube una foto o usa la cámara para clasificar residuos con Roboflow
              </p>
            </div>

            {/* PREVIEW DE IMAGEN */}
            <div style={{
              background: '#000',
              borderRadius: '12px',
              overflow: 'hidden',
              marginBottom: '20px',
              minHeight: '280px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              border: '2px solid rgba(255, 255, 255, 0.1)'
            }}>
              {capturedImage ? (
                <>
                  <img 
                    src={capturedImage} 
                    alt="Preview" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      maxHeight: '400px'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(16, 185, 129, 0.9)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <CheckCircle2 size={16} />
                    <span>Imagen lista</span>
                  </div>
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '40px 20px',
                  color: '#9ca3af'
                }}>
                  <Camera size={64} style={{ opacity: 0.6 }} />
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: 'white' }}>
                    Captura o sube una imagen para analizar
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>
                    <Scan size={16} />
                    <span>La IA detectará y clasificará automáticamente</span>
                  </div>
                </div>
              )}
            </div>

            {/* BOTONES DE CONTROL */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: capturedImage ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <button 
                onClick={handleOpenCamera}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
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
                  gap: '8px',
                  padding: '14px 20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#10b981',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
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
                    padding: '14px 20px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
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
              gap: '10px',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              fontSize: '13px',
              backdropFilter: 'blur(10px)'
            }}>
              <Scan size={16} />
              <span>
                {capturedImage 
                  ? "Imagen cargada. Desplázate hacia abajo para iniciar el análisis." 
                  : "Utiliza la cámara o sube una imagen para clasificar residuos."
                }
              </span>
            </div>
          </div>

          {/* PROCESADOR IA */}
          {showAIProcessor && capturedImage && (
            <div ref={aiSectionRef} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '28px',
              marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '2px solid #e2e8f0'
            }}>
              <AIProcessor capturedImage={capturedImage} />
            </div>
          )}

          {/* TABLA DE DETECCIONES */}
          <div className="portal-card">
            <div className="portal-card-header">
              <div className="card-header-left">
                <Brain size={24} className="header-icon" />
                <h3 className="portal-card-title">Historial de Detecciones</h3>
              </div>
              <div className="card-header-actions">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Buscar detecciones..."
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
              <div className="portal-table-container">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>
                        <div className="th-content">
                          <span>Código</span>
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <span>Nombre</span>
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <span>Tacho</span>
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <MapPin size={14} />
                          <span>Ubicación</span>
                        </div>
                      </th>
                      <th>
                        <div className="th-content">
                          <Calendar size={14} />
                          <span>Fecha</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDetecciones.map((det, index) => (
                      <tr key={det.id} style={{ animationDelay: `${index * 0.05}s` }}>
                        <td>
                          <span className="table-badge blue">{det.codigo}</span>
                        </td>
                        <td>
                          <div className="table-primary">
                            <Brain size={16} />
                            <span>{det.nombre}</span>
                          </div>
                        </td>
                        <td>{det.tacho_nombre}</td>
                        <td>
                          <div className="table-coords">
                            <MapPin size={14} />
                            <span>
                              {det.ubicacion_lon}, {det.ubicacion_lat}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="table-date">
                            <Calendar size={14} />
                            <span>{new Date(det.fecha_registro).toLocaleDateString("es-EC")}</span>
                          </div>
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
        <div className="info-icon-wrapper">
          <AlertCircle size={24} />
        </div>
        <div className="info-content">
          <h4 className="info-title">Vista de Solo Lectura</h4>
          <p className="info-text">
            Estás visualizando los datos en modo solo lectura. Si necesitas
            permisos de administración, contacta al administrador del sistema.
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