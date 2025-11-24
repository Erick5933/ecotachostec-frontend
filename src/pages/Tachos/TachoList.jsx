import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { Link } from "react-router-dom";

const TachoList = () => {
  const [tachos, setTachos] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!window.confirm("¿Seguro que quieres eliminar este tacho?")) return;

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

  if (loading) return <p>Cargando tachos...</p>;

  return (
    <div>
      <h2>Tachos</h2>

      <Link to="/dashboard/tachos/nuevo">➕ Nuevo Tacho</Link>

      <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {tachos.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.codigo}</td>
              <td>{t.nombre}</td>
              <td>
                {t.ubicacion_lat}, {t.ubicacion_lon}
              </td>
              <td>{t.descripcion}</td>
              <td>
                <Link to={`/dashboard/tachos/editar/${t.id}`}>✏️ Editar</Link>
                {" | "}
                <button onClick={() => handleDelete(t.id)}>🗑️ Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TachoList;
