// src/pages/User/TachoDetailUser.jsx
import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  Trash2,
  ArrowLeft,
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
  AlertTriangle,
  User,
  Building,
  Navigation,
  Target,
  Shield,
  Globe,
  Layers,
  Thermometer,
  Database,
  Hash
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import api from "../../api/axiosConfig";
import "././TachoDetailUser.css";

const TachoDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tacho, setTacho] = useState(null);
  const [detecciones, setDetecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetecciones, setLoadingDetecciones] = useState(false);
  const [error, setError] = useState(null);
  const [distancia, setDistancia] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
        }
      );
    }
  }, []);

  // Calcular distancia entre usuario y tacho
  useEffect(() => {
    if (userLocation && tacho && tacho.ubicacion_lat && tacho.ubicacion_lon) {
      const distanciaKm = calcularDistancia(
        userLocation.lat,
        userLocation.lon,
        parseFloat(tacho.ubicacion_lat),
        parseFloat(tacho.ubicacion_lon)
      );
      setDistancia(distanciaKm);
    }
  }, [userLocation, tacho]);

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const loadTacho = async () => {
    try {
      const res = await api.get(`/tachos/${id}/`);
      const tachoData = res.data;
      setTacho(tachoData);

      // Verificar permisos - usuarios normales solo pueden ver sus tachos o tachos públicos
      if (user?.rol !== 'admin') {
        const esMiTacho = tachoData.propietario === user?.id;
        const esTachoPublico = tachoData.tipo === 'publico';

        if (!esMiTacho && !esTachoPublico) {
          setError("No tienes permiso para ver este tacho");
          setTacho(null);
        }
      }
    } catch (e) {
      console.error("Error cargando tacho", e);
      setError("No se pudo cargar la información del tacho");
    }
  };

  const loadDeteccionesTacho = async () => {
    setLoadingDetecciones(true);
    setError(null);
    try {
      // Usar endpoint alternativo para usuarios normales
      const res = await api.get(`/detecciones/`, {
        params: { tacho: id }
      });

      // Filtrar detecciones por tacho_id
      const deteccionesFiltradas = res.data.filter(det =>
        det.tacho == id || det.tacho_id == id
      );
      setDetecciones(deteccionesFiltradas);

    } catch (error) {
      console.error("Error cargando detecciones", error);
      setError("No se pudieron cargar las detecciones del tacho");
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

  const getUbicacionFromCoords = (lat, lon) => {
    if (!lat || !lon) return "Ubicación desconocida";

    const locations = [
      { provincia: "Pichincha", ciudad: "Quito", latRange: [-0.3, 0.1], lonRange: [-78.6, -78.4] },
      { provincia: "Guayas", ciudad: "Guayaquil", latRange: [-2.3, -2.1], lonRange: [-79.95, -79.85] },
      { provincia: "Azuay", ciudad: "Cuenca", latRange: [-2.92, -2.88], lonRange: [-79.02, -78.98] },
      { provincia: "Manabí", ciudad: "Manta", latRange: [-1.06, -0.98], lonRange: [-80.75, -80.65] },
      { provincia: "El Oro", ciudad: "Machala", latRange: [-3.28, -3.24], lonRange: [-79.97, -79.93] },
      { provincia: "Loja", ciudad: "Loja", latRange: [-4.02, -3.98], lonRange: [-79.22, -79.18] },
      { provincia: "Tungurahua", ciudad: "Ambato", latRange: [-1.28, -1.22], lonRange: [-78.65, -78.59] },
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando detalle del tacho...</p>
      </div>
    );
  }

  if (error && !tacho) {
    return (
      <div className="empty-state">
        <AlertTriangle className="empty-state-icon" size={48} />
        <h3>{error}</h3>
        <Link to="/user" className="header-back">
          <ArrowLeft className="icon-sm" />
          Volver al panel
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
        <Link to="/user" className="header-back">
          <ArrowLeft className="icon-sm" />
          Volver al panel
        </Link>
      </div>
    );
  }

  const lat = Number(tacho.ubicacion_lat) || 0;
  const lon = Number(tacho.ubicacion_lon) || 0;
  const ubicacionTexto = getUbicacionFromCoords(lat, lon);

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

  // Determinar tipo de visualización según el rol
  const esMiTacho = tacho.propietario === user?.id;
  const esTachoPublico = tacho.tipo === 'publico';
  const esTachoEmpresa = tacho.empresa_nombre && esMiTacho;

  return (
    <div className="tacho-detail-container">
      {/* Header elegante */}
      <div className="tacho-detail-header">
        <div className="header-top">
          <Link to="/user" className="header-back">
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
              {distancia !== null && (
                <>
                  <span>•</span>
                  <span className="distance-indicator">
                    <Navigation size={14} />
                    {distancia.toFixed(1)} km
                  </span>
                </>
              )}
            </div>
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

              {/* Tipo de Tacho */}
              <div className="info-item">
                <span className="info-label">
                  <Activity className="info-label-icon" />
                  Tipo
                </span>
                <span className="info-value">
                  <span className={`badge ${tacho.tipo === 'personal' ? 'badge-info' : 'badge-warning'}`}>
                    {tacho.tipo === 'personal' ? 'Personal' : 'Público / Empresa'}
                  </span>
                </span>
              </div>

              {/* Información de Empresa (solo para tachos públicos) */}
              {tacho.tipo === 'publico' && tacho.empresa_nombre && (
                <div className="info-item">
                  <span className="info-label">
                    <Building className="info-label-icon" />
                    Empresa
                  </span>
                  <span className="info-value">{tacho.empresa_nombre}</span>
                </div>
              )}

              {distancia !== null && (
                <div className="info-item">
                  <span className="info-label">
                    <Navigation className="info-label-icon" />
                    Distancia desde tu ubicación
                  </span>
                  <span className="info-value">{distancia.toFixed(1)} km</span>
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
                  <Marker position={[lat, lon]}>
                    <Popup>
                      <strong>{tacho.nombre}</strong> <br />
                      {tacho.tipo === 'publico' && tacho.empresa_nombre && (
                        <>Empresa: {tacho.empresa_nombre}<br /></>
                      )}
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
          </div>
        </div>
      )}


    </div>
  );
};

export default TachoDetail;