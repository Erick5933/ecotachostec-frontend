import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { Link } from "react-router-dom";

const UbicacionList = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUbicaciones = async () => {
    try {
      const res = await api.get("/ubicacion/");
      setUbicaciones(res.data);
    } catch (e) {
      console.error("Error cargando ubicaciones", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUbicaciones();
  }, []);

  if (loading) return <p>Cargando ubicaciones...</p>;

  return (
    <div>
      <h2>Ubicaciones</h2>

      <Link to="/dashboard/ubicaciones/nuevo">
        ➕ Nueva Ubicación
      </Link>

      <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Provincia</th>
            <th>Cantón</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {ubicaciones.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.provincia_nombre}</td>
              <td>{u.canton_nombre}</td>
              <td>
                <Link to={`/dashboard/ubicaciones/editar/${u.id}`}>
                  ✏️ Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UbicacionList;
