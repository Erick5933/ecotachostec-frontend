import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Trash2,
  ArrowLeft,
  Edit,
  MapPin,
  Tag,
  Calendar,
  Battery,
  Activity,
  Brain,
  Eye,
  History,
  CheckCircle,
  XCircle,
  Zap,
  Image as ImageIcon,
  BarChart3,
  Clock,
  FileText,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import api from "../../api/axiosConfig";
import "./tachoDetail.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Icono personalizado del tacho
const tachoIcon = new L.DivIcon({
  html: `
    <div style="
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 50%;
      border: 3px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 20px;
      color: white;
    ">
      🗑️
    </div>
  `,
  className: "",
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
});

const TachoDetail = () => {
  const { id } = useParams();
  const [tacho, setTacho] = useState(null);
  const [detecciones, setDetecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetecciones, setLoadingDetecciones] = useState(false);
  const [error, setError] = useState(null);

  const loadTacho = async () => {
    try {
      const res = await api.get(`/tachos/${id}/`);
      setTacho(res.data);
    } catch (e) {
      console.error("Error cargando tacho", e);
      setError("No se pudo cargar la información del tacho");
    }
  };

  const loadDeteccionesTacho = async () => {
    setLoadingDetecciones(true);
    setError(null);
    try {
      // Primero intentamos con el endpoint específico del tacho
      const res = await api.get(`/tachos/${id}/detecciones/`);
      setDetecciones(res.data);
    } catch (e) {
      console.log("Endpoint específico no disponible, usando endpoint alternativo");
      try {
        // Si falla, usamos el endpoint general con filtro por tacho_id
        const res = await api.get(`/detecciones/`, {
          params: { tacho_id: id }
        });

        // Filtrar por tacho_id (por si acaso)
        const deteccionesFiltradas = res.data.filter(det =>
          det.tacho_id == id || det.tacho == id
        );
        setDetecciones(deteccionesFiltradas);

        if (deteccionesFiltradas.length === 0 && res.data.length > 0) {
          console.warn("Algunas detecciones no tienen tacho_id asociado");
        }
      } catch (error) {
        console.error("Error cargando detecciones", error);
        setError("No se pudieron cargar las detecciones del tacho");
      }
    } finally {
      setLoadingDetecciones(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadTacho();
      await loadDeteccionesTacho();
    };
    fetchData();
  }, [id]);

  // Helper functions
  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'activo': return 'status-active';
      case 'mantenimiento': return 'status-warning';
      case 'fuera_servicio': return 'status-inactive';
      default: return 'status-active';
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'activo': return 'Activo';
      case 'mantenimiento': return 'Mantenimiento';
      case 'fuera_servicio': return 'Fuera de Servicio';
      default: return estado;
    }
  };

  const getNivelColor = (nivel) => {
    const nivelValue = nivel || 0;
    if (nivelValue >= 80) return '#ef4444';
    if (nivelValue >= 50) return '#f59e0b';
    return '#10b981';
  };

  const getClasificacionIcon = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return <CheckCircle className="icon-xs" />;
      case 'inorganico': return <XCircle className="icon-xs" />;
      case 'reciclable': return <Zap className="icon-xs" />;
      default: return <Brain className="icon-xs" />;
    }
  };

  const getClasificacionText = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return 'Orgánico';
      case 'inorganico': return 'Inorgánico';
      case 'reciclable': return 'Reciclable';
      default: return clasificacion || 'No definido';
    }
  };

  const getClasificacionBadgeClass = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return 'badge-success';
      case 'inorganico': return 'badge-info';
      case 'reciclable': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  const formatFecha = (fechaString, short = false) => {
    if (!fechaString) return 'No disponible';
    const fecha = new Date(fechaString);
    if (short) {
      return fecha.toLocaleDateString('es-EC', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return fecha.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatConfianza = (confianza) => {
    if (!confianza) return '0%';
    return `${parseFloat(confianza).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando detalle del tacho...</p>
      </div>
    );
  }

  if (!tacho && error) {
    return (
      <div className="empty-state">
        <AlertTriangle className="empty-state-icon" size={48} />
        <h3>Error al cargar el tacho</h3>
        <p>{error}</p>
        <Link to="/tachos" className="header-back">
          <ArrowLeft className="icon-sm" />
          Volver a la lista
        </Link>
      </div>
    );
  }

  if (!tacho) {
    return (
      <div className="empty-state">
        <Trash2 className="empty-state-icon" size={48} />
        <h3>Tacho no encontrado</h3>
        <p>No se pudo cargar la información del tacho</p>
        <Link to="/tachos" className="header-back">
          <ArrowLeft className="icon-sm" />
          Volver a la lista
        </Link>
      </div>
    );
  }

  const lat = Number(tacho.ubicacion_lat) || 0;
  const lon = Number(tacho.ubicacion_lon) || 0;

  // Estadísticas de detecciones
  const stats = {
    total: detecciones.length,
    altaConfianza: detecciones.filter(d => parseFloat(d.confianza_ia || 0) >= 80).length,
    confianzaPromedio: detecciones.length > 0
      ? (detecciones.reduce((acc, det) => acc + parseFloat(det.confianza_ia || 0), 0) / detecciones.length).toFixed(1)
      : 0,
    tiposUnicos: new Set(detecciones.map(d => d.clasificacion)).size,
    distribucion: {
      organico: detecciones.filter(d => d.clasificacion === 'organico').length,
      inorganico: detecciones.filter(d => d.clasificacion === 'inorganico').length,
      reciclable: detecciones.filter(d => d.clasificacion === 'reciclable').length,
      otros: detecciones.filter(d => !['organico', 'inorganico', 'reciclable'].includes(d.clasificacion)).length
    }
  };

  return (
    <div className="tacho-detail-container">
      {/* Header elegante */}
      <div className="tacho-detail-header">
        <div className="header-top">
          <Link to="/tachos" className="header-back">
            <ArrowLeft className="icon-sm" />
            Volver
          </Link>
          <div className="header-title-section">
            <h1 className="header-title">
              <Trash2 className="icon-lg" />
              {tacho.nombre}
            </h1>
            <div className="header-subtitle">
              <span><Tag className="icon-sm" /> {tacho.codigo}</span>
              <span>•</span>
              <span>ID: #{tacho.id}</span>
              <span>•</span>
              <span className={`status-badge ${getEstadoClass(tacho.estado)}`}>
                <span className="status-indicator"></span>
                {getEstadoText(tacho.estado)}
              </span>
            </div>
          </div>
          <div className="header-actions">
            <Link to={`/tachos/editar/${id}`} className="header-back">
              <Edit className="icon-sm" />
              Editar
            </Link>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="detail-grid">
        {/* Información del Tacho */}
        <div className="detail-card">
          <div className="card-header">
            <h3 className="card-title">
              <Trash2 className="card-title-icon" />
              Información del Tacho
            </h3>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">
                  <Tag className="info-label-icon" />
                  Código
                </span>
                <span className="info-value">{tacho.codigo}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <Activity className="info-label-icon" />
                  Estado
                </span>
                <span className="info-value">
                  <span className={`status-badge ${getEstadoClass(tacho.estado)}`}>
                    <span className="status-indicator"></span>
                    {getEstadoText(tacho.estado)}
                  </span>
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <Battery className="info-label-icon" />
                  Nivel de Llenado
                </span>
                <div className="info-value">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${tacho.nivel_llenado || 0}%`,
                        backgroundColor: getNivelColor(tacho.nivel_llenado)
                      }}
                    >
                      <span className="progress-text">{tacho.nivel_llenado || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <Calendar className="info-label-icon" />
                  Fecha de Registro
                </span>
                <span className="info-value">{formatFecha(tacho.created_at, true)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <MapPin className="info-label-icon" />
                  Coordenadas
                </span>
                <span className="info-value" style={{ fontFamily: "monospace" }}>
                  {lat.toFixed(6)}, {lon.toFixed(6)}
                </span>
              </div>
              {tacho.canton_nombre && (
                <div className="info-item">
                  <span className="info-label">
                    <MapPin className="info-label-icon" />
                    Cantón
                  </span>
                  <span className="info-value">{tacho.canton_nombre}</span>
                </div>
              )}
              {tacho.ultima_deteccion && (
                <div className="info-item">
                  <span className="info-label">
                    <Clock className="info-label-icon" />
                    Última Detección
                  </span>
                  <span className="info-value">{formatFecha(tacho.ultima_deteccion, true)}</span>
                </div>
              )}
            </div>

            {tacho.descripcion && (
              <div style={{ marginTop: "1.5rem" }}>
                <div className="info-item">
                  <span className="info-label">
                    <FileText className="info-label-icon" />
                    Descripción
                  </span>
                  <p className="info-value" style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
                    {tacho.descripcion}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mapa */}
        <div className="detail-card">
          <div className="card-header">
            <h3 className="card-title">
              <MapPin className="card-title-icon" />
              Ubicación en Mapa
            </h3>
          </div>
          <div className="card-body">
            <div className="map-container">
              <MapContainer
                center={[lat, lon]}
                zoom={lat && lon ? 16 : 2}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {lat && lon && (
                  <Marker position={[lat, lon]} icon={tachoIcon}>
                    <Popup>
                      <strong>{tacho.nombre}</strong> <br />
                      {lat.toFixed(6)}, {lon.toFixed(6)} <br />
                      <small>Estado: {getEstadoText(tacho.estado)}</small>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
              <div className="map-actions">
                <a
                  href={`https://www.google.com/maps?q=${lat},${lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-btn"
                >
                  <MapPin className="icon-sm" />
                  Ver en Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Detecciones */}
      <div className="detection-history">
        <div className="card-header">
          <h3 className="card-title">
            <History className="card-title-icon" />
            Historial de Detecciones IA
            <span className="badge" style={{ marginLeft: "0.75rem", background: "#3b82f6" }}>
              {detecciones.length}
            </span>
          </h3>
          {error && (
            <div className="alert alert-warning" style={{ marginTop: "0.5rem" }}>
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
        </div>
        <div className="card-body">
          {loadingDetecciones ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <div className="spinner spinner-sm"></div>
              <p className="loading-text">
                Cargando detecciones...
              </p>
            </div>
          ) : detecciones.length === 0 ? (
            <div className="empty-state">
              <Brain className="empty-state-icon" size={48} />
              <h3>No hay detecciones</h3>
              <p>Este tacho no tiene detecciones de IA registradas</p>
            </div>
          ) : (
            <>
              {/* Mini estadísticas */}
              <div className="stats-grid-sm">
                <div className="stat-item">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">Total</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.altaConfianza}</div>
                  <div className="stat-label">Alta Confianza</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.confianzaPromedio}%</div>
                  <div className="stat-label">Conf. Promedio</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.tiposUnicos}</div>
                  <div className="stat-label">Tipos Únicos</div>
                </div>
              </div>

              {/* Tabla */}
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Clasificación</th>
                      <th>Confianza IA</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detecciones.map((det) => (
                      <tr key={det.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {getClasificacionIcon(det.clasificacion)}
                            <span className={`badge ${getClasificacionBadgeClass(det.clasificacion)}`}>
                              {getClasificacionText(det.clasificacion)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="confidence-bar-sm">
                            <div
                              className="confidence-fill-sm"
                              style={{
                                width: `${det.confianza_ia || 0}%`,
                                backgroundColor: det.confianza_ia >= 80 ? '#10b981' :
                                              det.confianza_ia >= 60 ? '#f59e0b' : '#ef4444'
                              }}
                            >
                              <span className="confidence-text-sm">
                                {formatConfianza(det.confianza_ia)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>{formatFecha(det.created_at, true)}</td>
                        <td>
                          <div style={{ display: "flex", gap: "0.375rem" }}>
                            {det.imagen && (
                              <a
                                href={det.imagen}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-icon btn-view"
                                title="Ver imagen"
                                style={{ width: "28px", height: "28px" }}
                              >
                                <ImageIcon className="icon-xs" />
                              </a>
                            )}
                            <Link
                              to={`/detecciones/${det.id}`}
                              className="btn-icon btn-edit"
                              title="Ver detalle"
                              style={{ width: "28px", height: "28px" }}
                            >
                              <Eye className="icon-xs" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Distribución */}
              <div className="distribution-grid">
                {Object.entries(stats.distribucion).map(([tipo, count]) => {
                  if (count === 0) return null;
                  const porcentaje = detecciones.length > 0 ? ((count / detecciones.length) * 100).toFixed(1) : 0;
                  return (
                    <div key={tipo} className="distribution-item">
                      <div className="distribution-icon">
                        {getClasificacionIcon(tipo)}
                      </div>
                      <div className="distribution-content">
                        <div className="distribution-label">
                          {getClasificacionText(tipo)}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span className="distribution-value">{count}</span>
                          <span className="distribution-percentage">{porcentaje}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resumen IA */}
      {detecciones.length > 0 && (
        <div className="ai-summary">
          <div className="ai-summary-header">
            <div className="ai-summary-icon">
              <Brain size={18} />
            </div>
            <h4 className="ai-summary-title">Resumen de IA</h4>
          </div>
          <div className="ai-summary-content">
            <div className="ai-summary-text">
              Este tacho ha procesado <strong>{detecciones.length}</strong> detecciones mediante IA
              con una confianza promedio de <strong>{stats.confianzaPromedio}%</strong>.
              Última detección: <strong>{formatFecha(detecciones[0]?.created_at, true)}</strong>
            </div>
            <Link to="/detecciones" className="ai-summary-btn">
              <BarChart3 className="icon-sm" />
              Ver Todas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TachoDetail;