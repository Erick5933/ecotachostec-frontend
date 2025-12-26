import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2, Plus, Search, Edit, Eye, MapPin, Layers,
  Battery, Activity, AlertCircle
} from "lucide-react";
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

  // Función para obtener la clase CSS según el estado
  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'activo':
        return 'status-active';
      case 'mantenimiento':
        return 'status-warning';
      case 'fuera_servicio':
        return 'status-inactive';
      default:
        return 'status-active';
    }
  };

  // Función para obtener el texto del estado
  const getEstadoText = (estado) => {
    switch (estado) {
      case 'activo':
        return 'Activo';
      case 'mantenimiento':
        return 'Mantenimiento';
      case 'fuera_servicio':
        return 'Fuera Servicio';
      default:
        return estado;
    }
  };

  // Función para obtener el color del nivel de llenado
  const getNivelColor = (nivel) => {
    if (nivel >= 80) return '#ff3b30';
    if (nivel >= 50) return '#ff9500';
    return '#34c759';
  };

  const filteredTachos = tachos.filter((tacho) =>
    tacho.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.estado?.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Buscar por nombre, código, descripción o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-grid" style={{ marginBottom: "24px" }}>
        <div className="stat-card">
          <div className="stat-content">
            <h3>{tachos.length}</h3>
            <p>Total Tachos</p>
          </div>
          <div className="stat-icon">
            <Trash2 className="icon-lg" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{tachos.filter(t => t.estado === 'activo').length}</h3>
            <p>Activos</p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#e6f4ea' }}>
            <Activity className="icon-lg" style={{ color: '#34c759' }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{tachos.filter(t => t.estado === 'mantenimiento').length}</h3>
            <p>En Mantenimiento</p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#fff4e6' }}>
            <AlertCircle className="icon-lg" style={{ color: '#ff9500' }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{tachos.filter(t => t.nivel_llenado >= 80).length}</h3>
            <p>Con Alta Carga</p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#ffe6e6' }}>
            <Battery className="icon-lg" style={{ color: '#ff3b30' }} />
          </div>
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
                <th>Estado</th>
                <th>Nivel</th>
                <th>Ubicación</th>
                <th>Última Detección</th>
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
                    <span className={`status-badge ${getEstadoClass(t.estado)}`}>
                      <span className="status-indicator"></span>
                      {getEstadoText(t.estado)}
                    </span>
                  </td>
                  <td>
                    <div className="nivel-container-small">
                      <div className="nivel-bar-small">
                        <div
                          className="nivel-fill-small"
                          style={{
                            width: `${t.nivel_llenado || 0}%`,
                            backgroundColor: getNivelColor(t.nivel_llenado || 0)
                          }}
                        >
                          <span className="nivel-text-small">{t.nivel_llenado || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin className="icon-sm" style={{ color: "var(--color-primary)" }} />
                      <span className="table-coords">
                        {Number(t.ubicacion_lat)?.toFixed(4)}, {Number(t.ubicacion_lon)?.toFixed(4)}
                      </span>
                    </div>
                  </td>
                  <td>
                    {t.ultima_deteccion ? (
                      new Date(t.ultima_deteccion).toLocaleDateString('es-EC', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ) : (
                      'Nunca'
                    )}
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