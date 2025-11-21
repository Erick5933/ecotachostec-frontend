import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosConfig";

const UbicacionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ubicacion, setUbicacion] = useState({
    provincia: "",
    canton: "",
  });

  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);

  const loadUbicacion = async () => {
    try {
      const res = await api.get(`/ubicacion/${id}/`);
      setUbicacion(res.data);
    } catch (e) {
      console.error("Error cargando ubicación", e);
    }
  };

  const loadProvinciasCantones = async () => {
    const resProv = await api.get("/ubicacion/provincias/");
    const resCant = await api.get("/ubicacion/cantones/");
    setProvincias(resProv.data);
    setCantones(resCant.data);
  };

  useEffect(() => {
    loadProvinciasCantones();
    if (id) loadUbicacion();
  }, [id]);

  const handleChange = (e) => {
    setUbicacion({ ...ubicacion, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {
        await api.put(`/ubicacion/${id}/`, ubicacion);
      } else {
        await api.post("/ubicacion/", ubicacion);
      }
      navigate("/dashboard/ubicaciones");
    } catch (e) {
      console.error("Error guardando ubicación", e);
    }
  };

  return (
    <div>
      <h2>{id ? "Editar Ubicación" : "Nueva Ubicación"}</h2>

      <form onSubmit={handleSubmit}>
        <label>Provincia:</label>
        <select
          name="provincia"
          value={ubicacion.provincia}
          onChange={handleChange}
        >
          <option value="">Seleccione</option>
          {provincias.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <br /><br />

        <label>Cantón:</label>
        <select
          name="canton"
          value={ubicacion.canton}
          onChange={handleChange}
        >
          <option value="">Seleccione</option>
          {cantones.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <br /><br />

        <button type="submit">💾 Guardar</button>
      </form>
    </div>
  );
};

export default UbicacionForm;
