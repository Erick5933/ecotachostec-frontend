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
  FileText
} from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const tachoIcon = new L.DivIcon({
  html: `
    <div style="
      width: 36px;
      height: 36px;
      background: #34c759;
      border-radius: 50%;
      border: 2px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      font-size: 18px;
      color: white;
    ">
      🗑️
    </div>
  `,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const TachoDetail = () => {
  const { id } = useParams();
  const [tacho, setTacho] = useState(null);
  const [detecciones, setDetecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetecciones, setLoadingDetecciones] = useState(false);

  const loadTacho = async () => {
    try {
      const res = await api.get(`/tachos/${id}/`);
      setTacho(res.data);
    } catch (e) {
      console.error("Error cargando tacho", e);
    } finally {
      setLoading(false);
    }
  };

  const loadDeteccionesTacho = async () => {
    setLoadingDetecciones(true);
    try {
      // ENDPOINT CORRECTO: Cargar solo detecciones de este tacho específico
      // Asumiendo que tu API tiene un endpoint como: /tachos/{id}/detecciones/
      // O: /detecciones/?tacho_id={id}
      const res = await api.get(`/tachos/${id}/detecciones/`);
      setDetecciones(res.data);
    } catch (e) {
      console.error("Error cargando detecciones del tacho", e);
      // Si falla, intenta con endpoint alternativo
      try {
        const res = await api.get(`/detecciones/?tacho_id=${id}`);
        setDetecciones(res.data);
      } catch (error) {
        console.error("Error con endpoint alternativo", error);
        // Si aún falla, intenta filtrar del endpoint general
        try {
          const res = await api.get("/detecciones/");
          const filtered = res.data.filter(det =>
            det.tacho == id ||
            det.tacho_id == id ||
            (det.tacho && det.tacho.id == id)
          );
          setDetecciones(filtered);
        } catch (finalError) {
          console.error("No se pudieron cargar las detecciones", finalError);
        }
      }
    } finally {
      setLoadingDetecciones(false);
    }
  };

  useEffect(() => {
    loadTacho();
    loadDeteccionesTacho();
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
    if (nivel >= 80) return '#ff3b30';
    if (nivel >= 50) return '#ff9500';
    return '#34c759';
  };

  const getClasificacionIcon = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return <CheckCircle className="icon-xs" style={{ color: '#34c759' }} />;
      case 'inorganico': return <XCircle className="icon-xs" style={{ color: '#007AFF' }} />;
      case 'reciclable': return <Zap className="icon-xs" style={{ color: '#FFD700' }} />;
      default: return <Brain className="icon-xs" style={{ color: '#8B5CF6' }} />;
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

  if (!tacho) {
    return (
      <div className="empty-state">
        <Trash2 className="empty-state-icon" size={48} />
        <h3>Tacho no encontrado</h3>
        <p>No se pudo cargar la información del tacho</p>
        <Link to="/tachos" className="btn btn-primary btn-sm">
          <ArrowLeft className="icon-sm" />
          Volver a la lista
        </Link>
      </div>
    );
  }

  const lat = Number(tacho.ubicacion_lat);
  const lon = Number(tacho.ubicacion_lon);

  // Estadísticas de detecciones
  const stats = {
    total: detecciones.length,
    altaConfianza: detecciones.filter(d => d.confianza_ia >= 80).length,
    confianzaPromedio: detecciones.length > 0
      ? (detecciones.reduce((acc, det) => acc + parseFloat(det.confianza_ia || 0), 0) / detecciones.length).toFixed(1)
      : 0,
    tiposUnicos: new Set(detecciones.map(d => d.clasificacion)).size,
    distribucion: {
      organico: detecciones.filter(d => d.clasificacion === 'organico').length,
      inorganico: detecciones.filter(d => d.clasificacion === 'inorganico').length,
      reciclable: detecciones.filter(d => d.clasificacion === 'reciclable').length,
    }
  };

  return (
    <div className="admin-page detail-container">
      {/* Header compacto */}
      <div className="page-header page-header-sm">
        <div className="page-header-content">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <Link to="/tachos" className="btn btn-secondary btn-sm">
              <ArrowLeft className="icon-sm" />
              Volver
            </Link>
            <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
              <Trash2 className="icon-md" style={{ marginRight: "8px", verticalAlign: "middle" }} />
              {tacho.nombre}
            </h2>
          </div>
          <p className="page-header-subtitle" style={{ fontSize: "0.875rem" }}>
            Código: <strong>{tacho.codigo}</strong> • ID: #{tacho.id} •
            Estado: <span className={`status-badge ${getEstadoClass(tacho.estado)}`}>
              {getEstadoText(tacho.estado)}
            </span>
          </p>
        </div>
        <div className="page-header-actions">
          <Link to={`/tachos/editar/${id}`} className="btn btn-primary btn-sm">
            <Edit className="icon-sm" />
            Editar
          </Link>
        </div>
      </div>

      {/* Grid de información principal */}
      <div className="grid-container">
        {/* Información del Tacho */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Trash2 className="icon-sm" style={{ marginRight: "8px" }} />
              Información del Tacho
            </h3>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">
                  <Tag className="icon-xs" />
                  Código
                </span>
                <span className="info-value">{tacho.codigo}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <Activity className="icon-xs" />
                  Estado
                </span>
                <span className="info-value">
                  <span className={`status-badge ${getEstadoClass(tacho.estado)}`}>
                    {getEstadoText(tacho.estado)}
                  </span>
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <Battery className="icon-xs" />
                  Nivel
                </span>
                <div className="info-value">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${tacho.nivel_llenado || 0}%`,
                        backgroundColor: getNivelColor(tacho.nivel_llenado || 0)
                      }}
                    >
                      <span className="progress-text">{tacho.nivel_llenado || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <Calendar className="icon-xs" />
                  Registro
                </span>
                <span className="info-value">{formatFecha(tacho.created_at, true)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">
                  <MapPin className="icon-xs" />
                  Coordenadas
                </span>
                <span className="info-value" style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {lat.toFixed(6)}, {lon.toFixed(6)}
                </span>
              </div>
              {tacho.canton_nombre && (
                <div className="info-item">
                  <span className="info-label">
                    <MapPin className="icon-xs" />
                    Cantón
                  </span>
                  <span className="info-value">{tacho.canton_nombre}</span>
                </div>
              )}
              {tacho.ultima_deteccion && (
                <div className="info-item">
                  <span className="info-label">
                    <Clock className="icon-xs" />
                    Últ. Detección
                  </span>
                  <span className="info-value">{formatFecha(tacho.ultima_deteccion, true)}</span>
                </div>
              )}
            </div>

            {tacho.descripcion && (
              <div style={{ marginTop: "16px" }}>
                <div className="info-item">
                  <span className="info-label">
                    <FileText className="icon-xs" />
                    Descripción
                  </span>
                  <p className="info-value" style={{ marginTop: "4px", fontSize: "0.875rem" }}>
                    {tacho.descripcion}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mapa */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <MapPin className="icon-sm" style={{ marginRight: "8px" }} />
              Ubicación
            </h3>
          </div>
          <div className="card-body">
            <div style={{ height: "250px", borderRadius: "8px", overflow: "hidden" }}>
              <MapContainer
                center={[lat, lon]}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lon]} icon={tachoIcon}>
                  <Popup>
                    <strong>{tacho.nombre}</strong> <br />
                    {lat.toFixed(6)}, {lon.toFixed(6)} <br />
                    <small>Estado: {getEstadoText(tacho.estado)}</small>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
            <a
              href={`https://www.google.com/maps?q=${lat},${lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{ marginTop: "12px", width: "100%" }}
            >
              <MapPin className="icon-sm" />
              Ver en Google Maps
            </a>
          </div>
        </div>
      </div>

      {/* Historial de Detecciones */}
      <div className="card" style={{ marginTop: "16px" }}>
        <div className="card-header">
          <h3 className="card-title">
            <History className="icon-sm" style={{ marginRight: "8px" }} />
            Historial de Detecciones IA
            <span className="badge" style={{ marginLeft: "8px", backgroundColor: "#e0e7ff", color: "#4338ca" }}>
              {detecciones.length}
            </span>
          </h3>
        </div>
        <div className="card-body">
          {loadingDetecciones ? (
            <div style={{ padding: "24px", textAlign: "center" }}>
              <div className="spinner spinner-sm"></div>
              <p style={{ marginTop: "12px", color: "#6b7280", fontSize: "0.875rem" }}>
                Cargando detecciones...
              </p>
            </div>
          ) : detecciones.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center" }}>
              <Brain className="icon-lg" style={{ opacity: 0.3, marginBottom: "12px" }} />
              <h4 style={{ fontSize: "1rem", marginBottom: "8px" }}>No hay detecciones</h4>
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                Este tacho no tiene detecciones de IA registradas
              </p>
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
                  <div className="stat-label">Tipos</div>
                </div>
              </div>

              {/* Tabla compacta */}
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Clasificación</th>
                      <th>Confianza</th>
                      <th>Fecha</th>
                      <th style={{ width: "60px" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detecciones.map((det, index) => (
                      <tr key={det.id}>
                        <td className="text-muted" style={{ fontSize: "0.75rem" }}>#{det.id}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
                                backgroundColor: det.confianza_ia >= 80 ? '#34c759' :
                                              det.confianza_ia >= 60 ? '#ff9500' : '#ff3b30'
                              }}
                            >
                              <span className="confidence-text-sm">
                                {formatConfianza(det.confianza_ia)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: "0.75rem" }}>
                          {formatFecha(det.created_at, true)}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {det.imagen && (
                              <a
                                href={det.imagen}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-icon btn-icon-sm btn-view"
                                title="Ver imagen"
                              >
                                <ImageIcon className="icon-xs" />
                              </a>
                            )}
                            <Link
                              to={`/detecciones/${det.id}`}
                              className="btn-icon btn-icon-sm btn-edit"
                              title="Ver detalle"
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
              <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                <h5 style={{ fontSize: "0.875rem", marginBottom: "8px", color: "#4b5563" }}>
                  Distribución por Tipo
                </h5>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {Object.entries(stats.distribucion).map(([tipo, count]) => (
                    <div key={tipo} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 8px",
                      backgroundColor: "white",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.75rem"
                    }}>
                      {getClasificacionIcon(tipo)}
                      <span style={{ fontWeight: "600", color: "#374151" }}>
                        {getClasificacionText(tipo)}:
                      </span>
                      <span style={{ fontWeight: "700", color: "#111827" }}>
                        {count} ({detecciones.length > 0 ? ((count / detecciones.length) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resumen IA */}
      {detecciones.length > 0 && (
        <div className="card" style={{ marginTop: "16px" }}>
          <div className="card-header">
            <h3 className="card-title">
              <Brain className="icon-sm" style={{ marginRight: "8px" }} />
              Resumen de IA
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
                  Este tacho ha procesado <strong>{detecciones.length}</strong> detecciones mediante IA
                  con una confianza promedio de <strong>{stats.confianzaPromedio}%</strong>.
                  Última detección: <strong>{formatFecha(detecciones[0]?.created_at, true)}</strong>
                </p>
              </div>
              <Link to="/detecciones" className="btn btn-outline-primary btn-sm">
                <BarChart3 className="icon-sm" />
                Ver todas
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TachoDetail;