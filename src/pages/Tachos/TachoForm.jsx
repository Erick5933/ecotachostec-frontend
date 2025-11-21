import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosConfig";

const TachoForm = () => {
  const { id } = useParams(); // si existe -> editar
  const navigate = useNavigate();

  const [tacho, setTacho] = useState({
    nombre: "",
    tipo: "",
    ubicacion: null,
  });

  const [ubicaciones, setUbicaciones] = useState([]);

  const loadTacho = async () => {
    try {
      const response = await api.get(`/tacho/${id}/`);
      setTacho(response.data);
    } catch (error) {
      console.error("Error cargando tacho", error);
    }
  };

  const loadUbicaciones = async () => {
    try {
      const res = await api.get("/ubicacion/");
      setUbicaciones(res.data);
    } catch (e) {
      console.error("Error cargando ubicaciones");
    }
  };

  useEffect(() => {
    loadUbicaciones();
    if (id) loadTacho();
  }, [id]);

  const handleChange = (e) => {
    setTacho({ ...tacho, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {
        await api.put(`/tacho/${id}/`, tacho);
      } else {
        await api.post("/tacho/", tacho);
      }

      navigate("/tachos");
    } catch (err) {
      console.error("Error guardando tacho", err);
      alert("No se pudo guardar");
    }
  };

  return (
    <div>
      <h2>{id ? "Editar Tacho" : "Crear Tacho"}</h2>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <label>Nombre:</label>
        <input
          type="text"
          name="nombre"
          value={tacho.nombre}
          onChange={handleChange}
        />

        <br /><br />

        <label>Tipo:</label>
        <select name="tipo" value={tacho.tipo} onChange={handleChange}>
          <option value="">Seleccione</option>
          <option value="organico">Orgánico</option>
          <option value="plastico">Plástico</option>
          <option value="papel">Papel</option>
          <option value="vidrio">Vidrio</option>
        </select>

        <br /><br />

        <label>Ubicación:</label>
        <select
          name="ubicacion"
          value={tacho.ubicacion}
          onChange={handleChange}
        >
          <option value="">Sin ubicación</option>
          {ubicaciones.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>

        <br /><br />

        <button type="submit">💾 Guardar</button>
      </form>
    </div>
  );
};

export default TachoForm;
