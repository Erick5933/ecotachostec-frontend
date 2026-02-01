import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2, Plus, Search, Edit, Eye, MapPin, Layers,
  Battery, Activity, AlertCircle, Clock, Check, XCircle
} from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";

const TachoList = () => {
  const [tachos, setTachos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTachoId, setSelectedTachoId] = useState(null);

  // Función para obtener ubicación aproximada desde coordenadas
  const getUbicacionFromCoords = (lat, lon) => {
    if (!lat || !lon) return "Ubicación desconocida";

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

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

    for (const location of locations) {
      if (
        latNum >= location.latRange[0] && latNum <= location.latRange[1] &&
        lonNum >= location.lonRange[0] && lonNum <= location.lonRange[1]
      ) {
        return `${location.ciudad}`;
      }
    }

    //prueba de cambio

    // Si no encuentra coincidencia exacta
    if (latNum > 0) return "Norte";
    if (latNum < -2) return "Sur";
    if (lonNum < -80) return "Costa";
    return "Sierra";
  };

  const loadTachos = async () => {
    try {
      const res = await api.get("/tachos/");
      // Filtrar solo tachos activos (activo = true)
      const tachosActivos = res.data.filter(tacho => tacho.activo === true);
      setTachos(tachosActivos);
    } catch (e) {
      console.error("Error cargando tachos", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("¿Está seguro que desea eliminar este tacho?")) return;

    try {
      // Enviar solicitud para marcar como inactivo
      await api.patch(`/tachos/${id}/`, { activo: false });

      // Actualizar lista local
      setTachos(prev => prev.filter((t) => t.id !== id));

      // Mostrar mensaje de éxito
      alert("Tacho eliminado correctamente");
    } catch (e) {
      console.error("Error eliminando tacho", e);
      alert("No se pudo eliminar el tacho. Intente nuevamente.");
    }
  };

  useEffect(() => {
    loadTachos();
  }, []);

  // Función para obtener el color del nivel de llenado
  const getNivelColor = (nivel) => {
    const nivelValue = nivel || 0;
    if (nivelValue >= 80) return '#ef4444';
    if (nivelValue >= 50) return '#f59e0b';
    return '#10b981';
  };

  // Función para formatear fecha corta
  const formatFechaCorta = (fechaString) => {
    if (!fechaString) return 'N/D';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const filteredTachos = tachos.filter((tacho) =>
    tacho.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.empresa_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.estado?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas mejoradas
  const stats = {
    total: tachos.length,
    activos: tachos.filter(t => t.estado === 'activo').length,
    mantenimiento: tachos.filter(t => t.estado === 'mantenimiento').length,
    altaCarga: tachos.filter(t => (t.nivel_llenado || 0) >= 80).length,
    publicos: tachos.filter(t => t.tipo === 'publico').length,
    personales: tachos.filter(t => t.tipo === 'personal').length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando tachos...</p>
      </div>
    );
  }

  // SI ESTÁ SELECCIONADO UN TACHO, MOSTRAR SOLO EL DETALLE
  if (selectedTachoId) {
    return (
      <div className="admin-page">
        {/* Botón Volver */}
        <div style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => setSelectedTachoId(null)}
            style={{
              background: "none",
              border: "none",
              color: "#10b981",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: 0
            }}
          >
            ← Volver a la lista de Tachos
          </button>
        </div>
        <TachoDetailView tachoId={selectedTachoId} />
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h2>
            <Trash2 className="icon-lg" />
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
            placeholder="Buscar por código, nombre o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ fontSize: "0.875rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Check className="icon-sm" style={{ color: "#10b981" }} />
          Mostrando {tachos.length} tachos activos
        </div>
      </div>

      {/* Stats Summary - COMPACTO */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Activos</p>
          </div>
          <div className="stat-icon">
            <Trash2 className="icon-lg" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.activos}</h3>
            <p>En Operación</p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <Check className="icon-lg" style={{ color: '#10b981' }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.mantenimiento}</h3>
            <p>Mantenimiento</p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <AlertCircle className="icon-lg" style={{ color: '#f59e0b' }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.altaCarga}</h3>
            <p>Alta Carga</p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <Battery className="icon-lg" style={{ color: '#ef4444' }} />
          </div>
        </div>
      </div>

      {/* Tipo de Tachos */}
      <div style={{
        display: "flex",
        gap: "0.75rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 1rem",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderRadius: "8px",
          fontSize: "0.875rem"
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#10b981"
          }}></div>
          <span style={{ fontWeight: "500", color: "#065f46" }}>
            Públicos: {stats.publicos}
          </span>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 1rem",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderRadius: "8px",
          fontSize: "0.875rem"
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#3b82f6"
          }}></div>
          <span style={{ fontWeight: "500", color: "#1e40af" }}>
            Personales: {stats.personales}
          </span>
        </div>
      </div>

      {/* Data Table - TABLA MÁS COMPACTA */}
      {filteredTachos.length === 0 ? (
        <div className="empty-state">
          <Trash2 className="empty-state-icon" size={64} />
          <h3>No se encontraron tachos activos</h3>
          <p>{searchTerm ? "Intente ajustar la búsqueda" : "Agregue un nuevo tacho inteligente"}</p>
          <Link to="/tachos/nuevo" className="btn btn-primary">
            <Plus className="icon-md" />
            Crear Nuevo Tacho
          </Link>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table" style={{ minWidth: "800px" }}>
            <thead>
              <tr>
                <th style={{ width: "100px" }}>Código</th>
                <th style={{ minWidth: "180px" }}>Nombre / Empresa</th>
                <th style={{ width: "100px" }}>Estado</th>
                <th style={{ width: "120px" }}>Nivel</th>
                <th style={{ width: "140px" }}>Ubicación</th>
                <th style={{ width: "100px" }}>Tipo</th>
                <th style={{ width: "100px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTachos.map((t) => {
                // Obtener ubicación aproximada
                const ubicacionAprox = getUbicacionFromCoords(t.ubicacion_lat, t.ubicacion_lon);

                // Obtener clase de estado
                const estadoClass = t.estado === 'activo' ? 'status-active' :
                                  t.estado === 'mantenimiento' ? 'status-warning' :
                                  'status-inactive';

                // Texto de estado
                const estadoText = t.estado === 'activo' ? 'Activo' :
                                 t.estado === 'mantenimiento' ? 'Mantenimiento' :
                                 'Fuera Servicio';

                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Layers className="icon-sm" style={{ color: "#10b981" }} />
                        <span style={{
                          fontWeight: "700",
                          fontSize: "0.875rem",
                          color: "#1f2937"
                        }}>
                          {t.codigo || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="table-primary" style={{ fontWeight: "600", marginBottom: "4px" }}>
                          {t.nombre || 'Sin nombre'}
                        </div>
                        {t.empresa_nombre && (
                          <div style={{
                            fontSize: "0.75rem",
                            color: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <BuildingIcon />
                            {t.empresa_nombre}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${estadoClass}`}>
                        <span className="status-indicator"></span>
                        {estadoText}
                      </span>
                    </td>
                    <td>
                      <div className="nivel-container-small">
                        <div className="nivel-bar-small">
                          <div
                            className="nivel-fill-small"
                            style={{
                              width: `${t.nivel_llenado || 0}%`,
                              backgroundColor: getNivelColor(t.nivel_llenado)
                            }}
                          >
                            <span className="nivel-text-small">
                              {t.nivel_llenado || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin className="icon-sm" style={{ color: "#ef4444", flexShrink: 0 }} />
                        <div>
                          <div style={{
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "#1f2937"
                          }}>
                            {ubicacionAprox}
                          </div>
                          <div style={{
                            fontSize: "0.7rem",
                            color: "#9ca3af",
                            fontFamily: "monospace",
                            marginTop: "2px"
                          }}>
                            {t.ubicacion_lat ? Number(t.ubicacion_lat).toFixed(4) : '0.0000'},
                            {t.ubicacion_lon ? Number(t.ubicacion_lon).toFixed(4) : '0.0000'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 8px",
                        backgroundColor: t.tipo === "personal" ? "rgba(59, 130, 246, 0.1)" : "rgba(16, 185, 129, 0.1)",
                        color: t.tipo === "personal" ? "#1e40af" : "#065f46",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        textTransform: "uppercase"
                      }}>
                        {t.tipo === "personal" ? "Personal" : "Público"}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => setSelectedTachoId(t.id)}
                          className="btn-icon btn-view"
                          title="Ver detalles"
                        >
                          <Eye className="icon-md" />
                        </button>
                        <Link
                          to={`/tachos/editar/${t.id}`}
                          className="btn-icon btn-edit"
                          title="Editar tacho"
                        >
                          <Edit className="icon-md" />
                        </Link>
                        <button
                          onClick={() => handleSoftDelete(t.id)}
                          className="btn-icon btn-delete"
                          title="Eliminar tacho (borrado lógico)"
                        >
                          <Trash2 className="icon-md" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Card sobre eliminación lógica */}
      <div className="info-card" style={{ marginTop: "1.5rem" }}>
        <div className="info-card-icon">
          <Trash2 className="icon-lg" />
        </div>
        <div className="info-card-content">
          <h4>Eliminación Lógica</h4>
          <p>
            Los tachos eliminados se marcan como inactivos pero no se borran permanentemente.
            Esto permite mantener el historial y reactivarlos si es necesario.
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente para icono de edificio
const BuildingIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
  </svg>
);

// Componente para visualizar detalle del tacho
const TachoDetailView = ({ tachoId }) => {
  const [tacho, setTacho] = useState(null);
  const [detecciones, setDetecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetecciones, setLoadingDetecciones] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTacho = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Cargando tacho con ID:", tachoId);
        const res = await api.get(`/tachos/${tachoId}/`);
        console.log("Tacho cargado:", res.data);
        setTacho(res.data);
        
        // Cargar detecciones
        await loadDetecciones(tachoId);
      } catch (e) {
        console.error("Error cargando tacho:", e);
        setError("Error al cargar el tacho");
      } finally {
        setLoading(false);
      }
    };
    loadTacho();
  }, [tachoId]);

  const loadDetecciones = async (id) => {
    setLoadingDetecciones(true);
    try {
      const res = await api.get(`/detecciones/`);
      let todas = res.data || [];
      
      // Si es un objeto con 'results', extraer ese array
      if (todas.results) {
        todas = todas.results;
      }
      
      // Filtrar por tacho - el campo tacho contiene el ID del tacho
      const deteccionesFiltradas = todas.filter(det => {
        let tachoId = det.tacho;
        // Si tacho es un objeto, obtener el id
        if (typeof tachoId === 'object' && tachoId !== null) {
          tachoId = tachoId.id;
        }
        return tachoId == id;
      });
      
      console.log("Detecciones filtradas para tacho", id, ":", deteccionesFiltradas.length);
      setDetecciones(deteccionesFiltradas || []);
    } catch (e) {
      console.error("Error cargando detecciones:", e);
      setDetecciones([]);
    } finally {
      setLoadingDetecciones(false);
    }
  };

  const getNivelColor = (nivel) => {
    const nivelValue = nivel || 0;
    if (nivelValue >= 80) return '#ef4444';
    if (nivelValue >= 50) return '#f59e0b';
    return '#10b981';
  };

  const formatFecha = (fechaString) => {
    if (!fechaString) return 'N/D';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    console.log("Estado: Cargando...");
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando detalles...</p>
      </div>
    );
  }

  if (error) {
    console.log("Error:", error);
    return <div style={{ color: "red", padding: "1rem" }}>Error: {error}</div>;
  }

  if (!tacho) {
    console.log("No hay tacho");
    return <p>No se encontró la información del tacho</p>;
  }

  return (
    <div className="admin-page">
      {/* Header Principal */}
      <div style={{
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        padding: "2rem",
        borderRadius: "0.75rem",
        marginBottom: "2rem",
        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
        color: "white"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.2)",
            padding: "1rem",
            borderRadius: "0.5rem",
            fontSize: "2rem"
          }}>
            🗑️
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: "700" }}>
              {tacho.nombre}
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.95rem", opacity: 0.9 }}>
              Código: <strong>{tacho.codigo}</strong> • {tacho.tipo === 'personal' ? 'Personal' : 'Público'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem"
      }}>
        <div style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          borderLeft: "4px solid #10b981"
        }}>
          <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Estado</p>
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "1.25rem", fontWeight: "700", color: "#111827" }}>
            {tacho.estado === 'activo' ? '✓ Activo' : tacho.estado === 'mantenimiento' ? '⚠ Mantenimiento' : '✗ Fuera Servicio'}
          </p>
        </div>
        
        <div style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          borderLeft: "4px solid #f59e0b"
        }}>
          <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Nivel Llenado</p>
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "1.25rem", fontWeight: "700", color: getNivelColor(tacho.nivel_llenado) }}>
            {tacho.nivel_llenado || 0}%
          </p>
        </div>

        <div style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          borderLeft: "4px solid #3b82f6"
        }}>
          <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Detecciones</p>
          <p style={{ margin: "0.5rem 0 0 0", fontSize: "1.25rem", fontWeight: "700", color: "#111827" }}>
            {detecciones.length}
          </p>
        </div>
      </div>

      {/* Grid de contenido */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Información General */}
        <div style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#111827", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            📋 Información General
          </h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Código</p>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "#111827" }}>{tacho.codigo}</p>
            </div>
            <div>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Nombre</p>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "#111827" }}>{tacho.nombre}</p>
            </div>
            <div>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Empresa</p>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "#111827" }}>{tacho.empresa_nombre || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Tipo</p>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: tacho.tipo === 'personal' ? '#3b82f6' : '#10b981' }}>
                {tacho.tipo === 'personal' ? 'Personal' : 'Público'}
              </p>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#111827", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            📍 Ubicación
          </h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            <div>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Coordenadas</p>
              <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: "600", color: "#111827", fontFamily: "monospace", background: "#f3f4f6", padding: "0.5rem", borderRadius: "0.375rem" }}>
                {tacho.ubicacion_lat}, {tacho.ubicacion_lon}
              </p>
            </div>
            <div>
              <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Cantón</p>
              <p style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "#111827" }}>{tacho.canton || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nivel de Llenado - Barra grande */}
      <div style={{
        background: "white",
        padding: "1.5rem",
        borderRadius: "0.75rem",
        marginBottom: "2rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#111827", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          📊 Nivel de Llenado
        </h3>
        <div style={{
          width: "100%",
          height: "40px",
          backgroundColor: "#e5e7eb",
          borderRadius: "0.5rem",
          overflow: "hidden"
        }}>
          <div
            style={{
              width: `${tacho.nivel_llenado || 0}%`,
              height: "100%",
              backgroundColor: getNivelColor(tacho.nivel_llenado),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "700",
              fontSize: "0.95rem",
              transition: "width 0.3s ease"
            }}
          >
            {tacho.nivel_llenado || 0}%
          </div>
        </div>
      </div>

      {/* Descripción */}
      {tacho.descripcion && (
        <div style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "0.75rem",
          marginBottom: "2rem",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#111827", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            📝 Descripción
          </h3>
          <p style={{ margin: 0, lineHeight: "1.6", color: "#4b5563", fontSize: "0.95rem" }}>
            {tacho.descripcion}
          </p>
        </div>
      )}

      {/* Detecciones IA */}
      <div style={{
        background: "white",
        padding: "1.5rem",
        borderRadius: "0.75rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem", color: "#111827", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          🤖 Detecciones IA
          <span style={{
            background: "#3b82f6",
            color: "white",
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: "700"
          }}>
            {detecciones.length}
          </span>
        </h3>

        {loadingDetecciones ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div className="spinner" style={{ marginBottom: "1rem" }}></div>
            <p>Cargando detecciones...</p>
          </div>
        ) : detecciones.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "2rem",
            background: "#f3f4f6",
            borderRadius: "0.5rem",
            color: "#6b7280"
          }}>
            <p>No hay detecciones registradas para este tacho</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gap: "1rem",
            maxHeight: "400px",
            overflowY: "auto"
          }}>
            {detecciones.map((det, idx) => (
              <div key={idx} style={{
                background: "#f9fafb",
                padding: "1rem",
                borderRadius: "0.5rem",
                borderLeft: "4px solid #3b82f6",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "1rem"
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Clasificación</p>
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.95rem", fontWeight: "600", color: "#111827" }}>
                    {det.clasificacion || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Confianza IA</p>
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.95rem", fontWeight: "600", color: "#3b82f6" }}>
                    {det.confianza_ia ? `${det.confianza_ia}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" }}>Fecha</p>
                  <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem", fontWeight: "600", color: "#111827" }}>
                    {formatFecha(det.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


export default TachoList;