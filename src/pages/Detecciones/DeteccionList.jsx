// src/pages/Detecciones/DeteccionList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Search, Eye, MapPin, Calendar, Tag } from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";

const DeteccionList = () => {
  const [detecciones, setDetecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadDetecciones = async () => {
    try {
      const res = await api.get("/detecciones/");
      setDetecciones(res.data);
    } catch (e) {
      console.error("Error cargando detecciones", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetecciones();
  }, []);

  const filteredDetecciones = detecciones.filter((det) =>
    det.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    det.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    det.tacho_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando detecciones...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h2>
            <Brain className="icon-lg" style={{ display: "inline", marginRight: "12px" }} />
            Detecciones de Inteligencia Artificial
          </h2>
          <p className="page-header-subtitle">
            Análisis y clasificación automática de residuos mediante IA
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search className="search-icon icon-md" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre, código o tacho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      {filteredDetecciones.length === 0 ? (
        <div className="empty-state">
          <Brain className="empty-state-icon" size={64} />
          <h3>No se encontraron detecciones</h3>
          <p>
            Las detecciones de IA se registrarán automáticamente cuando los
            sensores procesen nuevos datos
          </p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tacho</th>
                <th>Ubicación</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDetecciones.map((d) => (
                <tr key={d.id}>
                  <td className="table-id">#{d.id}</td>
                  <td>
                    <span className="badge badge-info">
                      <Tag className="icon-sm" />
                      {d.codigo}
                    </span>
                  </td>
                  <td className="table-primary">{d.nombre}</td>
                  <td className="table-secondary">{d.tacho_nombre}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin className="icon-sm" style={{ color: "var(--color-primary)" }} />
                      <span className="table-coords">
                        {d.ubicacion_lon}, {d.ubicacion_lat}
                      </span>
                    </div>
                  </td>
                  <td className="table-secondary">
                    {d.descripcion || "Sin descripción"}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Calendar className="icon-sm" style={{ color: "var(--color-gray)" }} />
                      <span className="table-secondary">
                        {new Date(d.fecha_registro).toLocaleDateString("es-EC")}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/detecciones/${d.id}`}
                        className="btn-icon btn-view"
                        title="Ver detalles"
                      >
                        <Eye className="icon-md" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Card */}
      <div className="info-card">
        <div className="info-card-icon">
          <Brain className="icon-lg" />
        </div>
        <div className="info-card-content">
          <h4>Inteligencia Artificial</h4>
          <p>
            El sistema utiliza modelos de deep learning entrenados con
            TensorFlow para identificar y clasificar automáticamente diferentes
            tipos de residuos en tiempo real, logrando una precisión del 95%.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeteccionList;