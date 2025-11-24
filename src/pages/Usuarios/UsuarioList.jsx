// src/pages/usuarios/UsuarioList.jsx
import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { Link } from "react-router-dom";

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadUsuarios();
  }, []);

  if (loading) return <p>Cargando usuarios...</p>;

  return (
    <div>
      <h2>Usuarios</h2>

      <Link to="/usuarios/nuevo">➕ Nuevo Usuario</Link>

      <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td>{u.rol}</td>
              <td>
                <Link to={`/usuarios/editar/${u.id}`}>✏️ Editar</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsuarioList;
