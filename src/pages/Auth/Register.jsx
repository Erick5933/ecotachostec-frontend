// src/pages/Auth/Register.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { register } from "../../api/authApi";
import "./auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
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
      const { confirmPassword, ...registerData } = formData;
      const response = await register(registerData);
      const { token, user } = response.data;

      loginUser(user, token);
      navigate("/portal");
    } catch (err) {
      console.error("Error al registrarse", err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.email?.[0] ||
        "Error al crear la cuenta. Por favor, intenta nuevamente."
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
            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="nombre" className="form-label">
                👤 Nombre Completo
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="form-input"
                placeholder="Juan Pérez"
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                📧 Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                🔒 Contraseña
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                🔒 Confirmar Contraseña
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Repite tu contraseña"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>
                  Acepto los{" "}
                  <Link to="/terms" className="inline-link">
                    términos y condiciones
                  </Link>
                </span>
              </label>
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

        <div className="auth-benefits">
          <h3 className="auth-benefits-title">Al registrarte obtienes:</h3>
          <ul className="auth-benefits-list">
            <li>
              <span className="benefit-icon">✓</span>
              Acceso completo al dashboard de datos
            </li>
            <li>
              <span className="benefit-icon">✓</span>
              Visualización de tachos en tiempo real
            </li>
            <li>
              <span className="benefit-icon">✓</span>
              Reportes y estadísticas detalladas
            </li>
            <li>
              <span className="benefit-icon">✓</span>
              Notificaciones de eventos importantes
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}