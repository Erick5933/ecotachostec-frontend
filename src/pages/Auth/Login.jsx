// src/pages/Auth/Login.jsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { login, googleLogin } from "../../api/authApi";
import "./auth.css";

// Firebase imports
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "../../firebaseConfig";

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
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

  // --- LÓGICA DE GOOGLE ---
  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      // 1. Abrir popup de Google
      const result = await signInWithPopup(auth, googleProvider);

      // 2. Obtener credenciales de Google (access_token) e ID token de Firebase
      const credential = GoogleAuthProvider.credentialFromResult(result);
      let idToken = await result.user.getIdToken(); // ID token de Firebase

      // 3. Enviar al backend ambos tokens (prioridad al id_token)
      const response = await googleLogin({
        token: idToken,
      });

      // 4. Loguear en el contexto
      const { token, user } = response.data;
      loginUser(user, token);

      // 5. Redirigir
      if (user.rol === "admin") {
        navigate("/");
      } else {
        navigate("/portal");
      }

    } catch (err) {
      console.error("Error en inicio con Google:", err);
      if (err.response) {
        console.error("Detalle backend (status, data):", err.response.status, err.response.data);
      }

      // Intento de recuperación si el backend reporta desfase de reloj
      const backendErrorMsg = err.response?.data?.error || err.response?.data?.message || "";
      if (typeof backendErrorMsg === 'string' && backendErrorMsg.includes('Token used too early')) {
        try {
          // Espera breve para compensar desfase de reloj (p.ej. 7-10s)
          await new Promise((resolve) => setTimeout(resolve, 8000));
          // Opcional: refrescar el ID token
          idToken = await auth.currentUser.getIdToken(true);
          const retryResp = await googleLogin({ token: idToken });
          const { token, user } = retryResp.data;
          loginUser(user, token);
          if (user.rol === "admin") {
            navigate("/");
          } else {
            navigate("/portal");
          }
          return; // Salimos tras éxito en reintento
        } catch (retryErr) {
          console.error("Reintento tras desfase de reloj falló:", retryErr);
          setError("Hubo un desfase de reloj entre cliente y servidor. Intenta nuevamente en unos segundos o sincroniza la hora del servidor.");
          return;
        }
      }

      if (err.code === 'auth/popup-closed-by-user') {
        setError("El inicio de sesión fue cancelado.");
      } else if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ||
          "El inicio de sesión con Google no está disponible en este momento. Por favor, usa tu email y contraseña."
        );
      } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError("No se pudo conectar con el servidor. Verifica que el backend esté funcionando.");
      } else {
        setError("Error al conectar con Google. Intenta con email y contraseña.");
      }
    } finally {
      setGoogleLoading(false);
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
              <div className="auth-logo-icon" style={{ overflow: 'hidden' }}>
                <img src="/logo.svg" alt="EcoTachosTec" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
              </div>
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
                 Correo Electrónico
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
                 Contraseña
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
              disabled={loading || googleLoading}
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

            {/* --- BOTÓN DE GOOGLE MEJORADO --- */}
            <button
              type="button"
              className="btn btn-google btn-block"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              style={{ marginTop: '15px' }} // El resto del estilo está en .btn-google (auth.css)
            >
              {googleLoading ? (
                 <>
                   <span className="spinner spinner-sm" style={{borderTopColor: '#757575', borderRightColor: '#757575'}}></span>
                   Conectando...
                 </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fillRule="evenodd" fillOpacity="1" fill="#4285f4" stroke="none"></path>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fillRule="evenodd" fillOpacity="1" fill="#34a853" stroke="none"></path>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fillRule="evenodd" fillOpacity="1" fill="#fbbc05" stroke="none"></path>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fillRule="evenodd" fillOpacity="1" fill="#ea4335" stroke="none"></path>
                  </svg>
                  Iniciar sesión con Google
                </>
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
      </div>
    </div>
  );
}