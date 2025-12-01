// src/pages/Auth/Register.jsx
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { register } from "../../api/authApi";

import {
  getProvincias,
  getCiudades,
  getCantones,
} from "../../api/ubicacionApi";

import "./auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    provincia: "",
    ciudad: "",
    canton: "",
    password: "",
    confirmPassword: "",
  });

  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [cantones, setCantones] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Carga inicial
  useEffect(() => {
    loadProvincias();
  }, []);

  const loadProvincias = async () => {
    try {
      const res = await getProvincias();
      setProvincias(res.data);
    } catch (err) {
      console.error("Error cargando provincias", err);
    }
  };

  const handleProvinciaChange = async (e) => {
    const provinciaId = e.target.value;

    setFormData({
      ...formData,
      provincia: provinciaId,
      ciudad: "",
      canton: "",
    });

    try {
      const resCiudades = await getCiudades();
      const filtradas = resCiudades.data.filter(
        (c) => c.provincia === Number(provinciaId)
      );
      setCiudades(filtradas);
      setCantones([]);
    } catch (err) {
      console.error("Error cargando ciudades", err);
    }
  };

  const handleCiudadChange = async (e) => {
    const ciudadId = e.target.value;

    setFormData({
      ...formData,
      ciudad: ciudadId,
      canton: "",
    });

    try {
      const resCantones = await getCantones();
      const filtradas = resCantones.data.filter(
        (c) => c.ciudad === Number(ciudadId)
      );
      setCantones(filtradas);
    } catch (err) {
      console.error("Error cargando cantones", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // Validaciones
  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (!formData.canton) {
      setError("Selecciona tu provincia, ciudad y cantón");
      return false;
    }

    return true;
  };

  // SUBMIT (Aquí agregamos el rol = "user")
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const { confirmPassword, ...dataToSend } = formData;

      // 👇 AGREGAMOS EL ROL AUTOMÁTICAMENTE
      dataToSend.rol = "user";

      const response = await register(dataToSend);
      const { token, user } = response.data;

      loginUser(user, token);
      navigate("/portal");
    } catch (err) {
      console.error("Error registrando usuario:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.email?.[0] ||
          "Error al crear la cuenta. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-circle auth-circle-1"></div>
        <div className="auth-circle auth-circle-2"></div>
        <div className="auth-circle auth-circle-3"></div>
      </div>

      <div className="auth-container">
        <Link to="/home" className="auth-back-link">
          ← Volver al inicio
        </Link>

        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-logo">
              <div className="auth-logo-icon">🌿</div>
              <h1 className="auth-logo-title">EcoTachosTec</h1>
            </div>
            <h2 className="auth-title">Crear Cuenta</h2>
            <p className="auth-subtitle">
              Únete a la revolución de gestión inteligente de residuos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="alert alert-error">⚠️ {error}</div>}

            {/* Nombre */}
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Teléfono */}
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Provincia */}
            <div className="form-group">
              <label className="form-label">Provincia</label>
              <select
                name="provincia"
                value={formData.provincia}
                onChange={handleProvinciaChange}
                className="form-input"
                required
              >
                <option value="">Selecciona provincia</option>
                {provincias.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Ciudad */}
            <div className="form-group">
              <label className="form-label">Ciudad</label>
              <select
                name="ciudad"
                value={formData.ciudad}
                onChange={handleCiudadChange}
                className="form-input"
                required
              >
                <option value="">Selecciona ciudad</option>
                {ciudades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Cantón */}
            <div className="form-group">
              <label className="form-label">Cantón</label>
              <select
                name="canton"
                value={formData.canton}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Selecciona cantón</option>
                {cantones.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirmar Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm"></span>
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>o</span>
          </div>

          <div className="auth-footer">
            <p className="auth-footer-text">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="auth-link">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
