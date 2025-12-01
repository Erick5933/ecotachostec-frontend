// src/pages/Tachos/TachoDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Trash2,
  ArrowLeft,
  Edit,
  MapPin,
  Layers,
  Tag,
  FileText,
  Calendar,
} from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// ------------------ ICONO IDENTICO AL FORM ------------------
const tachoIcon = new L.DivIcon({
  html: `
    <div style="
      width: 48px;
      height: 48px;
      background: #34c759;
      border-radius: 50%;
      border: 3px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px rgba(0,0,0,0.35);
      font-size: 24px;
      color: white;
    ">
      🗑️
    </div>
  `,
  className: "",
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -45],
});

const TachoDetail = () => {
  const { id } = useParams();
  const [tacho, setTacho] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadTacho();
  }, [id]);

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
        <Trash2 className="empty-state-icon" size={64} />
        <h3>Tacho no encontrado</h3>
        <p>No se pudo cargar la información del tacho</p>
        <Link to="/tachos" className="btn btn-primary">
          <ArrowLeft className="icon-md" />
          Volver a la lista
        </Link>
      </div>
    );
  }

  const lat = Number(tacho.ubicacion_lat);
  const lon = Number(tacho.ubicacion_lon);

  return (
    <div className="admin-page detail-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <Link to="/tachos" className="btn btn-secondary" style={{ marginBottom: "16px" }}>
            <ArrowLeft className="icon-md" />
            Volver
          </Link>
          <h2>
            <Trash2 className="icon-lg" style={{ display: "inline", marginRight: "12px" }} />
            Detalle del Tacho
          </h2>
        </div>

        <div className="page-header-actions">
          <Link to={`/tachos/editar/${id}`} className="btn btn-primary">
            <Edit className="icon-md" />
            Editar Tacho
          </Link>
        </div>
      </div>

      {/* Detail Card */}
      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-title-section">
            <h2>{tacho.nombre}</h2>
            <p className="detail-subtitle">
              <Tag className="icon-sm" style={{ marginRight: "8px" }} />
              Código: <strong>{tacho.codigo}</strong>
            </p>
          </div>

          <div>
            <span className="status-badge status-active">
              <span className="status-indicator"></span>
              Activo
            </span>
          </div>
        </div>

        {/* Grid de info */}
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">
              <Layers className="icon-sm" style={{ marginRight: "8px" }} />
              ID del Tacho
            </span>
            <span className="detail-value">#{tacho.id}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              <Tag className="icon-sm" style={{ marginRight: "8px" }} />
              Código
            </span>
            <span className="detail-value">{tacho.codigo}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              <MapPin className="icon-sm" style={{ marginRight: "8px" }} />
              Latitud
            </span>
            <span className="detail-value" style={{ fontFamily: "monospace" }}>
              {!isNaN(lat) ? lat.toFixed(6) : "No especificada"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              <MapPin className="icon-sm" style={{ marginRight: "8px" }} />
              Longitud
            </span>
            <span className="detail-value" style={{ fontFamily: "monospace" }}>
              {!isNaN(lon) ? lon.toFixed(6) : "No especificada"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              <MapPin className="icon-sm" style={{ marginRight: "8px" }} />
              Cantón
            </span>
            <span className="detail-value">
              {tacho.canton_nombre || "No asignado"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              <Calendar className="icon-sm" style={{ marginRight: "8px" }} />
              Fecha Registro
            </span>
            <span className="detail-value">
              {tacho.fecha_registro
                ? new Date(tacho.fecha_registro).toLocaleDateString("es-EC", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "No disponible"}
            </span>
          </div>
        </div>

        {/* Descripción */}
        {tacho.descripcion && (
          <div style={{ marginTop: "32px" }}>
            <div className="detail-item">
              <span className="detail-label">
                <FileText className="icon-sm" style={{ marginRight: "8px" }} />
                Descripción
              </span>
              <p className="detail-value" style={{ marginTop: "8px", lineHeight: "1.6" }}>
                {tacho.descripcion}
              </p>
            </div>
          </div>
        )}

        {/* MAPA REAL */}
        {!isNaN(lat) && !isNaN(lon) && (
          <div className="detail-image-section">
            <h4>
              <MapPin className="icon-md" style={{ marginRight: "8px" }} />
              Ubicación en el Mapa
            </h4>

            <div style={{ width: "100%", height: "400px", borderRadius: "12px", overflow: "hidden" }}>
              <MapContainer
                center={[lat, lon]}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <Marker position={[lat, lon]} icon={tachoIcon}>
                  <Popup>
                    <strong>{tacho.nombre}</strong> <br />
                    {lat.toFixed(6)}, {lon.toFixed(6)}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

            <a
              href={`https://www.google.com/maps?q=${lat},${lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ marginTop: "16px" }}
            >
              <MapPin className="icon-md" />
              Ver en Google Maps
            </a>
          </div>
        )}
      </div>

      {/* Info IoT */}
      <div className="info-card">
        <div className="info-card-icon">
          <Trash2 className="icon-lg" />
        </div>
        <div className="info-card-content">
          <h4>Sensores IoT</h4>
          <p>
            Este tacho está equipado con sensores de nivel, GPS y conectividad en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TachoDetail;
