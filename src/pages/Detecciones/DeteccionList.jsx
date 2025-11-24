import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { Link } from "react-router-dom";

const DeteccionList = () => {
  const [detecciones, setDetecciones] = useState([]);

  const loadDetecciones = async () => {
    try {
      const res = await api.get("/detecciones/");
      setDetecciones(res.data);
    } catch (e) {
      console.error("Error cargando detecciones", e);
    }
  };

  useEffect(() => {
    loadDetecciones();
  }, []);

  return (
    <div>
      <h2>Detecciones</h2>

      <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tacho</th>
            <th>Ubicación (Lon / Lat)</th>
            <th>Descripción</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {detecciones.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.codigo}</td>
              <td>{d.nombre}</td>
              <td>{d.tacho_nombre}</td>
              <td>{d.ubicacion_lon} / {d.ubicacion_lat}</td>
              <td>{d.descripcion || "—"}</td>
              <td>{d.fecha_registro}</td>
              <td>
                <Link to={`/dashboard/detecciones/${d.id}`}>👁️ Ver</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeteccionList;
