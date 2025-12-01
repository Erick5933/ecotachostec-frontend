// src/pages/Tachos/TachoList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Plus, Search, Edit, Eye, MapPin, Layers } from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";

const TachoList = () => {
  const [tachos, setTachos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadTachos = async () => {
    try {
      const res = await api.get("/tachos/");
      setTachos(res.data);
    } catch (e) {
      console.error("Error cargando tachos", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro que desea eliminar este tacho?")) return;

    try {
      await api.delete(`/tachos/${id}/`);
      setTachos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert("No se pudo eliminar el tacho");
    }
  };

  useEffect(() => {
    loadTachos();
  }, []);

  const filteredTachos = tachos.filter((tacho) =>
    tacho.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando tachos...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h2>
            <Trash2 className="icon-lg" style={{ display: "inline", marginRight: "12px" }} />
            Gestión de Tachos Inteligentes
          </h2>
          <p className="page-header-subtitle">
            Administre los contenedores IoT y monitoree su estado
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/tachos/nuevo" className="btn btn-primary">
            <Plus className="icon-md" />
            Nuevo Tacho
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search className="search-icon icon-md" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre, código o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      {filteredTachos.length === 0 ? (
        <div className="empty-state">
          <Trash2 className="empty-state-icon" size={64} />
          <h3>No se encontraron tachos</h3>
          <p>Intente ajustar la búsqueda o agregue un nuevo tacho inteligente</p>
          <Link to="/tachos/nuevo" className="btn btn-primary">
            <Plus className="icon-md" />
            Crear Primer Tacho
          </Link>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTachos.map((t) => (
                <tr key={t.id}>
                  <td className="table-id">#{t.id}</td>
                  <td>
                    <span className="badge badge-primary">
                      <Layers className="icon-sm" />
                      {t.codigo}
                    </span>
                  </td>
                  <td className="table-primary">{t.nombre}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin className="icon-sm" style={{ color: "var(--color-primary)" }} />
                      <span className="table-coords">
                        {Number(t.ubicacion_lat)?.toFixed(4)}, {Number(t.ubicacion_lon)?.toFixed(4)}
                      </span>
                    </div>
                  </td>
                  <td className="table-secondary">
                    {t.descripcion || "Sin descripción"}
                  </td>
                  <td>
                    <span className="status-badge status-active">
                      <span className="status-indicator"></span>
                      Activo
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/tachos/${t.id}`}
                        className="btn-icon btn-view"
                        title="Ver detalles"
                      >
                        <Eye className="icon-md" />
                      </Link>
                      <Link
                        to={`/tachos/editar/${t.id}`}
                        className="btn-icon btn-edit"
                        title="Editar tacho"
                      >
                        <Edit className="icon-md" />
                      </Link>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="btn-icon btn-delete"
                        title="Eliminar tacho"
                      >
                        <Trash2 className="icon-md" />
                      </button>
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
          <Trash2 className="icon-lg" />
        </div>
        <div className="info-card-content">
          <h4>Tachos Inteligentes IoT</h4>
          <p>
            Cada tacho cuenta con sensores que monitorean el nivel de llenado,
            geolocalización GPS y conectividad en tiempo real para optimizar
            las rutas de recolección.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TachoList;