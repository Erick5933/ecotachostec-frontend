import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Trash2, Save, X, MapPin, Layers, FileText, Tag,
  Battery, Activity, Calendar, AlertCircle
} from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";

// Leaflet
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

const TachoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ------------------ FORM DATA -------------------------
  const [tacho, setTacho] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    ubicacion_lat: "",
    ubicacion_lon: "",
    canton: "",
    estado: "activo",
    nivel_llenado: 0,
  });

  const [cantones, setCantones] = useState([]);

  // ------------------ ICONO ESTILIZADO ----------------
  const markerIcon = new L.DivIcon({
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background: #34c759;
        border-radius: 50%;
        border: 3px solid #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 10px rgba(0,0,0,0.35);
        font-size: 24px;
        color: white;
      ">
        🗑️
      </div>
    `,
    className: "",
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });

  // ------------------ CAPTURAR CLIC EN EL MAPA ----------
  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        setTacho((prev) => ({
          ...prev,
          ubicacion_lat: e.latlng.lat.toFixed(6),
          ubicacion_lon: e.latlng.lng.toFixed(6),
        }));
      },
    });
    return null;
  };

  // ------------------ RE-CENTRAR MAPA CUANDO LAS COORDS CAMBIEN ----------
  const RecenterMap = ({ lat, lon }) => {
    const map = useMap();

    useEffect(() => {
      if (lat && lon) {
        map.setView([lat, lon], 16);
      }
    }, [lat, lon]);

    return null;
  };

  // ------------------ USAR UBICACIÓN ACTUAL SOLO EN "CREAR" ----------
  useEffect(() => {
    if (id) return; // Editando → usar coords existentes

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTacho((prev) => ({
          ...prev,
          ubicacion_lat: pos.coords.latitude.toFixed(6),
          ubicacion_lon: pos.coords.longitude.toFixed(6),
        }));
      },
      () => {
        // Fallback: Cuenca
        setTacho((prev) => ({
          ...prev,
          ubicacion_lat: "-2.90055",
          ubicacion_lon: "-79.00453",
        }));
      }
    );
  }, []);

  // ------------------ LOAD DATA EDIT --------------------------
  const loadTacho = async () => {
    try {
      const res = await api.get(`/tachos/${id}/`);
      const tachoData = res.data;

      // Asegurar que nivel_llenado tenga valor por defecto
      setTacho({
        ...tachoData,
        nivel_llenado: tachoData.nivel_llenado || 0,
        estado: tachoData.estado || "activo"
      });
    } catch (e) {
      setError("No se pudo cargar el tacho");
    }
  };

  const loadCantones = async () => {
    try {
      const res = await api.get("/ubicacion/cantones/");
      setCantones(res.data);
    } catch {}
  };

  useEffect(() => {
    loadCantones();
    if (id) loadTacho();
  }, [id]);

  // ------------------ FORM --------------------------
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setTacho(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
    setError("");
  };

  const validateForm = () => {
    if (!tacho.codigo || !tacho.nombre) {
      setError("Código y nombre son obligatorios");
      return false;
    }

    // Validar nivel de llenado entre 0 y 100
    if (tacho.nivel_llenado < 0 || tacho.nivel_llenado > 100) {
      setError("El nivel de llenado debe estar entre 0 y 100");
      return false;
    }

    return true;
  };

  // ------------------ GUARDAR ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const dataToSend = {
        ...tacho,
        ubicacion_lat: tacho.ubicacion_lat ? parseFloat(tacho.ubicacion_lat) : null,
        ubicacion_lon: tacho.ubicacion_lon ? parseFloat(tacho.ubicacion_lon) : null,
        canton: tacho.canton || null,
        nivel_llenado: parseInt(tacho.nivel_llenado) || 0,
      };

      if (id) await api.put(`/tachos/${id}/`, dataToSend);
      else await api.post("/tachos/", dataToSend);

      navigate("/tachos");
    } catch {
      setError("No se pudo guardar el tacho");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ POSICIÓN INICIAL ----------------------
  const defaultCuenca = [-2.90055, -79.00453];

  const lat = tacho.ubicacion_lat ? parseFloat(tacho.ubicacion_lat) : null;
  const lon = tacho.ubicacion_lon ? parseFloat(tacho.ubicacion_lon) : null;

  const initialPosition = lat && lon ? [lat, lon] : defaultCuenca;

  // ------------------ OPCIONES DE ESTADO --------------------
  const estados = [
    { value: "activo", label: "Activo", color: "#34c759" },
    { value: "mantenimiento", label: "Mantenimiento", color: "#ff9500" },
    { value: "fuera_servicio", label: "Fuera de servicio", color: "#ff3b30" }
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="page-header-content">
          <h2>
            <Trash2 className="icon-lg" style={{ marginRight: "12px" }} />
            {id ? "Editar Tacho" : "Nuevo Tacho"}
          </h2>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle className="icon-md" />
              {error}
            </div>
          )}

          <div className="form-grid">
            {/* Código */}
            <div className="form-group">
              <label className="form-label">
                <Tag className="icon-sm" /> Código
              </label>
              <input
                type="text"
                name="codigo"
                value={tacho.codigo}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Nombre */}
            <div className="form-group">
              <label className="form-label">
                <Layers className="icon-sm" /> Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={tacho.nombre}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Estado */}
            <div className="form-group">
              <label className="form-label">
                <Activity className="icon-sm" /> Estado
              </label>
              <select
                name="estado"
                value={tacho.estado}
                onChange={handleChange}
                className="form-input"
              >
                {estados.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nivel de Llenado */}
            <div className="form-group">
              <label className="form-label">
                <Battery className="icon-sm" /> Nivel de Llenado (%)
              </label>
              <div className="input-with-slider">
                <input
                  type="range"
                  name="nivel_llenado"
                  min="0"
                  max="100"
                  value={tacho.nivel_llenado || 0}
                  onChange={handleChange}
                  className="form-range"
                />
                <div className="range-value">
                  <input
                    type="number"
                    name="nivel_llenado"
                    min="0"
                    max="100"
                    value={tacho.nivel_llenado || 0}
                    onChange={handleChange}
                    className="form-input small"
                    style={{ width: "80px" }}
                  />
                  <span style={{ marginLeft: "8px" }}>%</span>
                </div>
              </div>

              {/* Indicador visual */}
              <div className="fill-level-indicator">
                <div
                  className="fill-level-bar"
                  style={{ width: `${tacho.nivel_llenado || 0}%` }}
                >
                  <span className="fill-level-text">
                    {tacho.nivel_llenado || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="form-group form-grid-full">
              <label className="form-label">
                <FileText className="icon-sm" /> Descripción
              </label>
              <textarea
                name="descripcion"
                value={tacho.descripcion || ""}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Descripción o referencia del lugar..."
              />
            </div>

            {/* Lat/Lon */}
            <div className="form-group">
              <label className="form-label">
                <MapPin className="icon-sm" /> Latitud
              </label>
              <input
                type="text"
                value={tacho.ubicacion_lat}
                readOnly
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin className="icon-sm" /> Longitud
              </label>
              <input
                type="text"
                value={tacho.ubicacion_lon}
                readOnly
                className="form-input"
              />
            </div>
          </div>

          {/* MAPA */}
          <div className="form-group form-grid-full" style={{ height: "420px", marginTop: "20px" }}>
            <MapContainer
              center={initialPosition}
              zoom={15}
              style={{
                height: "100%",
                borderRadius: "12px",
                filter: "brightness(1.03)",
              }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <LocationSelector />

              {/* Recargar mapa cuando cambian coordenadas */}
              <RecenterMap lat={lat} lon={lon} />

              {lat && lon && (
                <Marker position={[lat, lon]} icon={markerIcon}>
                  <Popup>
                    <strong>{tacho.nombre || "Tacho seleccionado"}</strong>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {/* BOTONES */}
          <div className="form-actions">
            <Link to="/tachos" className="btn btn-secondary">
              <X className="icon-md" /> Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save className="icon-md" /> {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TachoForm;