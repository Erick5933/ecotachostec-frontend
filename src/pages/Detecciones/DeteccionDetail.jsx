// src/pages/Detecciones/DeteccionDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Brain, ArrowLeft, MapPin, Tag, FileText, Calendar, Trash2, Image as ImageIcon, Percent } from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";

const DeteccionDetail = () => {
  const { id } = useParams();
  const [deteccion, setDeteccion] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDeteccion = async () => {
    try {
      const res = await api.get(`/detecciones/${id}/`);
      setDeteccion(res.data);
    } catch (e) {
      console.error("Error cargando detección", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeteccion();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando detalle de la detección...</p>
      </div>
    );
  }

  if (!deteccion) {
    return (
      <div className="empty-state">
        <Brain className="empty-state-icon" size={64} />
        <h3>Detección no encontrada</h3>
        <p>No se pudo cargar la información de la detección</p>
        <Link to="/detecciones" className="btn btn-primary">
          <ArrowLeft className="icon-md" />
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-page detail-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <Link to="/detecciones" className="btn btn-secondary" style={{ marginBottom: "16px" }}>
            <ArrowLeft className="icon-md" />
            Volver
          </Link>
          <h2>
            <Brain className="icon-lg" style={{ display: "inline", marginRight: "12px" }} />
            Detalle de la Detección IA
          </h2>
          <p className="page-header-subtitle">
            Análisis completo de la detección por inteligencia artificial
          </p>
        </div>
      </div>

      {/* Detail Card */}
      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-title-section">
            <h2>{deteccion.nombre}</h2>
            <p className="detail-subtitle">
              <Tag className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
              Código: <strong>{deteccion.codigo}</strong>
            </p>
          </div>
          <div>
            <span className="badge badge-success">
              <Brain className="icon-sm" />
              Procesado
            </span>
          </div>
        </div>

        {/* Detail Grid */}
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">
              <Tag className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
              ID de Detección
            </span>
            <span className="detail-value">#{deteccion.id}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              <Tag className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
              Código
            </span>
            <span className="detail-value">{deteccion.codigo}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              <Trash2 className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
              Tacho Asociado
            </span>
            <span className="detail-value">{deteccion.tacho_nombre || "No especificado"}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              <Calendar className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
              Fecha de Registro
            </span>
            <span className="detail-value">
              {new Date(deteccion.fecha_registro).toLocaleString("es-EC", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              <MapPin className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
              Ubicación (Longitud)
            </span>
            <span className="detail-value" style={{ fontFamily: "monospace" }}>
              {deteccion.ubicacion_lon || "No disponible"}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              <MapPin className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
              Ubicación (Latitud)
            </span>
            <span className="detail-value" style={{ fontFamily: "monospace" }}>
              {deteccion.ubicacion_lat || "No disponible"}
            </span>
          </div>

          {/* Additional fields if available */}
          {deteccion.tipo_residuo && (
            <div className="detail-item">
              <span className="detail-label">
                <Tag className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
                Tipo de Residuo
              </span>
              <span className="detail-value">{deteccion.tipo_residuo}</span>
            </div>
          )}

          {deteccion.confianza && (
            <div className="detail-item">
              <span className="detail-label">
                <Percent className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
                Nivel de Confianza
              </span>
              <span className="detail-value">{deteccion.confianza}%</span>
            </div>
          )}
        </div>

        {/* Description Section */}
        {deteccion.descripcion && (
          <div style={{ marginTop: "32px" }}>
            <div className="detail-item">
              <span className="detail-label">
                <FileText className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
                Descripción
              </span>
              <p className="detail-value" style={{ marginTop: "8px", lineHeight: "1.6" }}>
                {deteccion.descripcion}
              </p>
            </div>
          </div>
        )}

        {/* Image Section */}
        {deteccion.imagen && (
          <div className="detail-image-section">
            <h4>
              <ImageIcon className="icon-md" style={{ display: "inline", marginRight: "8px" }} />
              Imagen de la Detección
            </h4>
            <img
              src={deteccion.imagen}
              alt={`Detección ${deteccion.nombre}`}
              className="detail-image"
            />
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="info-card">
        <div className="info-card-icon">
          <Brain className="icon-lg" />
        </div>
        <div className="info-card-content">
          <h4>Procesamiento con IA</h4>
          <p>
            Esta detección fue procesada automáticamente por nuestro sistema de
            inteligencia artificial, que analiza imágenes en tiempo real para
            clasificar residuos y optimizar la gestión de recolección.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeteccionDetail;