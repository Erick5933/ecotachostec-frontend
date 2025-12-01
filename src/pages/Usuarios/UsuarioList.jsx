// src/pages/Usuarios/UsuarioList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, Search, Edit, Trash2, Mail, Shield } from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRol, setFilterRol] = useState("");

  const loadUsuarios = async () => {
    try {
      const res = await api.get("/usuarios/");
      setUsuarios(res.data.results || res.data);
    } catch (e) {
      console.error("Error cargando usuarios", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro que desea eliminar este usuario?")) return;

    try {
      await api.delete(`/usuarios/${id}/`);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      alert("No se pudo eliminar el usuario");
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRol = filterRol === "" || usuario.rol === filterRol;
    return matchesSearch && matchesRol;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h2>
            <Users className="icon-lg" style={{ display: "inline", marginRight: "12px" }} />
            Gestión de Usuarios
          </h2>
          <p className="page-header-subtitle">
            Administre los usuarios del sistema y sus permisos
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/usuarios/nuevo" className="btn btn-primary">
            <Plus className="icon-md" />
            Nuevo Usuario
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
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="form-select filter-select"
          value={filterRol}
          onChange={(e) => setFilterRol(e.target.value)}
        >
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="user">Usuario</option>
        </select>
      </div>

      {/* Data Table */}
      {filteredUsuarios.length === 0 ? (
        <div className="empty-state">
          <Users className="empty-state-icon" size={64} />
          <h3>No se encontraron usuarios</h3>
          <p>Intente ajustar los filtros de búsqueda o agregue un nuevo usuario</p>
          <Link to="/usuarios/nuevo" className="btn btn-primary">
            <Plus className="icon-md" />
            Crear Primer Usuario
          </Link>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((u) => (
                <tr key={u.id}>
                  <td className="table-id">#{u.id}</td>
                  <td className="table-primary">{u.nombre}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail className="icon-sm" style={{ color: "var(--color-gray)" }} />
                      <span className="table-secondary">{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-badge-cell">
                      {u.rol === "admin" ? (
                        <span className="badge badge-primary">
                          <Shield className="icon-sm" />
                          Administrador
                        </span>
                      ) : (
                        <span className="badge badge-info">
                          <Users className="icon-sm" />
                          Usuario
                        </span>
                      )}
                    </div>
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
                        to={`/usuarios/editar/${u.id}`}
                        className="btn-icon btn-edit"
                        title="Editar usuario"
                      >
                        <Edit className="icon-md" />
                      </Link>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="btn-icon btn-delete"
                        title="Eliminar usuario"
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
          <Shield className="icon-lg" />
        </div>
        <div className="info-card-content">
          <h4>Gestión de Permisos</h4>
          <p>
            Los administradores tienen acceso completo al sistema. Los usuarios
            regulares solo pueden visualizar datos sin capacidad de edición.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsuarioList;