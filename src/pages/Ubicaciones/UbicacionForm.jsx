// src/pages/Ubicaciones/UbicacionForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { MapPin, Save, X, Map, Building } from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";

const UbicacionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ubicacion, setUbicacion] = useState({
    provincia: "",
    ciudad: "",
    canton: "",
  });

  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);

  const loadUbicacion = async () => {
    try {
      const res = await api.get(`/ubicacion/cantones/${id}/`);
      setUbicacion({
        provincia: res.data.provincia || "",
        ciudad: res.data.ciudad || "",
        canton: res.data.nombre || "",
      });
    } catch (e) {
      console.error("Error cargando ubicación", e);
      setError("No se pudo cargar la ubicación");
    }
  };

  const loadProvinciasCantones = async () => {
    try {
      const resProv = await api.get("/ubicacion/provincias/");
      const resCiud = await api.get("/ubicacion/ciudades/");
      const resCant = await api.get("/ubicacion/cantones/");
      
      setProvincias(resProv.data);
      setCiudades(resCiud.data);
      setCantones(resCant.data);
    } catch (e) {
      console.error("Error cargando datos", e);
    }
  };

  useEffect(() => {
    loadProvinciasCantones();
    if (id) loadUbicacion();
  }, [id]);

  useEffect(() => {
    if (ubicacion.provincia) {
      const filtered = ciudades.filter(
        (c) => c.provincia === parseInt(ubicacion.provincia)
      );
      setCiudadesFiltradas(filtered);
    } else {
      setCiudadesFiltradas([]);
    }
  }, [ubicacion.provincia, ciudades]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "provincia") {
      setUbicacion({ ...ubicacion, provincia: value, ciudad: "" });
    } else {
      setUbicacion({ ...ubicacion, [name]: value });
    }
    setError("");
  };

  const validateForm = () => {
    if (!ubicacion.provincia || !ubicacion.ciudad || !ubicacion.canton) {
      setError("Todos los campos son obligatorios");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const dataToSend = {
        nombre: ubicacion.canton,
        ciudad: parseInt(ubicacion.ciudad),
      };

      if (id) {
        await api.put(`/ubicacion/cantones/${id}/`, dataToSend);
      } else {
        await api.post("/ubicacion/cantones/", dataToSend);
      }

      navigate("/ubicaciones");
    } catch (err) {
      console.error("Error guardando ubicación", err);
      setError(
        err.response?.data?.message ||
        "No se pudo guardar la ubicación"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h2>
            <MapPin className="icon-lg" style={{ display: "inline", marginRight: "12px" }} />
            {id ? "Editar Ubicación" : "Nueva Ubicación"}
          </h2>
          <p className="page-header-subtitle">
            {id
              ? "Actualice la información geográfica"
              : "Complete el formulario para registrar una nueva ubicación"}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <X className="icon-md" />
              {error}
            </div>
          )}

          <div className="form-grid">
            {/* Provincia */}
            <div className="form-group form-grid-full">
              <label htmlFor="provincia" className="form-label">
                <Map className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
                Provincia
              </label>
              <select
                id="provincia"
                name="provincia"
                value={ubicacion.provincia}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Seleccione una provincia</option>
                {provincias.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Ciudad */}
            <div className="form-group form-grid-full">
              <label htmlFor="ciudad" className="form-label">
                <Building className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
                Ciudad
              </label>
              <select
                id="ciudad"
                name="ciudad"
                value={ubicacion.ciudad}
                onChange={handleChange}
                className="form-select"
                required
                disabled={!ubicacion.provincia}
              >
                <option value="">
                  {ubicacion.provincia
                    ? "Seleccione una ciudad"
                    : "Primero seleccione una provincia"}
                </option>
                {ciudadesFiltradas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Cantón */}
            <div className="form-group form-grid-full">
              <label htmlFor="canton" className="form-label">
                <MapPin className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
                Cantón
              </label>
              <input
                type="text"
                id="canton"
                name="canton"
                value={ubicacion.canton}
                onChange={handleChange}
                className="form-input"
                placeholder="Ingrese el nombre del cantón"
                required
              />
              <small style={{ color: "var(--color-gray)", marginTop: "8px", display: "block" }}>
                Nombre completo del cantón o parroquia
              </small>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Link to="/ubicaciones" className="btn btn-secondary">
              <X className="icon-md" />
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner spinner-sm"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="icon-md" />
                  {id ? "Actualizar Ubicación" : "Crear Ubicación"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="info-card">
        <div className="info-card-icon">
          <MapPin className="icon-lg" />
        </div>
        <div className="info-card-content">
          <h4>Jerarquía Administrativa</h4>
          <p>
            El sistema utiliza la división política administrativa del Ecuador:
            Provincias → Ciudades → Cantones. Asegúrese de seleccionar la
            provincia correcta antes de elegir la ciudad.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UbicacionForm;