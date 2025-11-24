import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { Link } from "react-router-dom";

const UbicacionList = () => {
  const [ubicaciones, setUbicaciones] = useState([]);

  const loadUbicaciones = async () => {
    try {
      const provinciasRes = await api.get("/ubicacion/provincias/");
      const ciudadesRes = await api.get("/ubicacion/ciudades/");
      const cantonesRes = await api.get("/ubicacion/cantones/");

      const provincias = provinciasRes.data;
      const ciudades = ciudadesRes.data;
      const cantones = cantonesRes.data;

      const comb = cantones.map((c) => {
        const ciudad = ciudades.find((ci) => ci.id === c.ciudad);
        const provincia = provincias.find((p) => p.id === ciudad?.provincia);

        return {
          id: c.id,
          provincia_nombre: provincia?.nombre || "—",
          ciudad_nombre: ciudad?.nombre || "—",
          canton_nombre: c.nombre,
        };
      });

      // Ordenar por provincia -> ciudad -> cantón
      comb.sort((a, b) => {
        if (a.provincia_nombre !== b.provincia_nombre) {
          return a.provincia_nombre.localeCompare(b.provincia_nombre);
        }
        if (a.ciudad_nombre !== b.ciudad_nombre) {
          return a.ciudad_nombre.localeCompare(b.ciudad_nombre);
        }
        return a.canton_nombre.localeCompare(b.canton_nombre);
      });

      setUbicaciones(comb);
    } catch (e) {
      console.error("Error cargando ubicaciones", e);
    }
  };

  useEffect(() => {
    loadUbicaciones();
  }, []);

  return (
    <div>
      <h2>Ubicaciones</h2>

      <Link to="/dashboard/ubicaciones/nuevo" style={{ display: "inline-block", marginBottom: "10px" }}>
        ➕ Nueva Ubicación
      </Link>

      <table border="1" cellPadding="8" style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Provincia</th>
            <th>Ciudad</th>
            <th>Cantón</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {ubicaciones.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.provincia_nombre}</td>
              <td>{u.ciudad_nombre}</td>
              <td>{u.canton_nombre}</td>
              <td>
                <Link to={`/dashboard/ubicaciones/editar/${u.id}`}>✏️ Editar</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UbicacionList;
