// src/pages/Auth/Login.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { login } from "../../api/authApi";
import "./auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await login(formData);
      const { token, user } = response.data;
      
      loginUser(user, token);
      
      // Redirigir según el rol
      if (user.rol === "admin") {
        navigate("/");
      } else {
        navigate("/portal");
      }
    } catch (err) {
      console.error("Error al iniciar sesión", err);
      setError(
        err.response?.data?.message || 
        "Credenciales incorrectas. Por favor, intenta nuevamente."
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
            <h2 className="auth-title">Iniciar Sesión</h2>
            <p className="auth-subtitle">
              Accede a tu cuenta para gestionar el sistema
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

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
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Recordarme</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm"></span>
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>o</span>
          </div>

          <div className="auth-footer">
            <p className="auth-footer-text">
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className="auth-link">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-features">
          <div className="auth-feature-item">
            <span className="auth-feature-icon">🔒</span>
            <span className="auth-feature-text">Conexión segura</span>
          </div>
          <div className="auth-feature-item">
            <span className="auth-feature-icon">🌍</span>
            <span className="auth-feature-text">Acceso global</span>
          </div>
          <div className="auth-feature-item">
            <span className="auth-feature-icon">⚡</span>
            <span className="auth-feature-text">Rápido y eficiente</span>
          </div>
        </div>
      </div>
    </div>
  );
}