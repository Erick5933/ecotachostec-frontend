// src/pages/User/LandingPage.jsx
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import "./landingPage.css";

export default function LandingPage() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    tachos: 0,
    detecciones: 0,
    ubicaciones: 0,
  });

  useEffect(() => {
    loadPublicStats();
  }, []);

  const loadPublicStats = async () => {
    try {
      const [tachosRes, deteccionesRes, ubicacionesRes] = await Promise.all([
        api.get("/tachos/"),
        api.get("/detecciones/"),
        api.get("/ubicacion/cantones/"),
      ]);

      setStats({
        tachos: tachosRes.data.length || 0,
        detecciones: deteccionesRes.data.length || 0,
        ubicaciones: ubicacionesRes.data.length || 0,
      });
    } catch (error) {
      console.error("Error cargando estadísticas públicas", error);
    }
  };

  return (
    <div className="landing-page">
      {/* HERO SECTION */}
      <section id="inicio" className="hero-section">
        <div className="hero-background">
          <div className="hero-circle hero-circle-1"></div>
          <div className="hero-circle hero-circle-2"></div>
          <div className="hero-circle hero-circle-3"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge fade-in">
            🌱 Tecnología Verde del Futuro
          </div>

          <h1 className="hero-title slide-up">
            Gestión Inteligente de
            <span className="hero-highlight"> Residuos</span>
          </h1>

          <p className="hero-description slide-up" style={{ animationDelay: "0.2s" }}>
            Revolucionando el manejo de desechos con IoT, Inteligencia Artificial
            y tecnología de punta para construir ciudades más sostenibles.
          </p>

          <div className="hero-actions slide-up" style={{ animationDelay: "0.4s" }}>
            {user ? (
              <Link to="/portal" className="btn-hero btn-hero-primary">
                📊 Acceder al Portal
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-hero btn-hero-primary">
                  Comenzar Ahora
                </Link>
                <Link to="/login" className="btn-hero btn-hero-secondary">
                  Iniciar Sesión
                </Link>
              </>
            )}
          </div>

          {/* Stats Preview */}
          <div className="hero-stats slide-up" style={{ animationDelay: "0.6s" }}>
            <div className="hero-stat-item">
              <div className="hero-stat-value">{stats.tachos}+</div>
              <div className="hero-stat-label">Tachos Activos</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <div className="hero-stat-value">{stats.detecciones}+</div>
              <div className="hero-stat-label">Detecciones IA</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat-item">
              <div className="hero-stat-value">{stats.ubicaciones}+</div>
              <div className="hero-stat-label">Ubicaciones</div>
            </div>
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <span>Descubre más</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </section>

      {/* PROYECTO SECTION */}
      <section id="proyecto" className="section section-light">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">🌿 Nuestra Misión</span>
            <h2 className="section-title">El Proyecto EcoTachosTec</h2>
            <p className="section-description">
              Una solución integral que combina hardware IoT, análisis de datos
              en tiempo real e inteligencia artificial para transformar la
              gestión de residuos urbanos.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ background: "linear-gradient(135deg, #95D5B2 0%, #74C69D 100%)" }}>
                🎯
              </div>
              <h3 className="feature-title">Objetivo</h3>
              <p className="feature-description">
                Optimizar la recolección de residuos mediante monitoreo
                inteligente y rutas eficientes basadas en datos reales.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: "linear-gradient(135deg, #A2D2FF 0%, #BDE0FE 100%)" }}>
                💡
              </div>
              <h3 className="feature-title">Innovación</h3>
              <p className="feature-description">
                Sensores IoT de última generación combinados con algoritmos de
                machine learning para predicción y clasificación automática.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" style={{ background: "linear-gradient(135deg, #CAFFBF 0%, #9BF6FF 100%)" }}>
                🌍
              </div>
              <h3 className="feature-title">Sostenibilidad</h3>
              <p className="feature-description">
                Reducción de emisiones de CO₂, optimización de recursos y
                contribución directa a los Objetivos de Desarrollo Sostenible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TACHOS SECTION */}
      <section id="tachos" className="section section-dark">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge light">🗑️ Tecnología IoT</span>
            <h2 className="section-title light">Nuestros Tachos Inteligentes</h2>
            <p className="section-description light">
              Contenedores equipados con sensores avanzados que monitorean el
              nivel de llenado, tipo de residuos y condiciones ambientales en
              tiempo real.
            </p>
          </div>

          <div className="tachos-showcase">
            <div className="tacho-feature">
              <div className="tacho-feature-icon">📡</div>
              <h3 className="tacho-feature-title">Sensores Ultrasónicos</h3>
              <p className="tacho-feature-text">
                Medición precisa del nivel de llenado con actualización cada 5 minutos
              </p>
            </div>

            <div className="tacho-feature">
              <div className="tacho-feature-icon">🌡️</div>
              <h3 className="tacho-feature-title">Monitoreo Ambiental</h3>
              <p className="tacho-feature-text">
                Control de temperatura y humedad para prevenir malos olores
              </p>
            </div>

            <div className="tacho-feature">
              <div className="tacho-feature-icon">📍</div>
              <h3 className="tacho-feature-title">Geolocalización GPS</h3>
              <p className="tacho-feature-text">
                Ubicación exacta de cada contenedor para optimizar rutas
              </p>
            </div>

            <div className="tacho-feature">
              <div className="tacho-feature-icon">🔋</div>
              <h3 className="tacho-feature-title">Energía Solar</h3>
              <p className="tacho-feature-text">
                Alimentación sostenible con paneles solares integrados
              </p>
            </div>
          </div>

          {!user && (
            <div className="cta-box">
              <h3 className="cta-title">¿Quieres ver datos en tiempo real?</h3>
              <p className="cta-description">
                Regístrate para acceder al panel completo con estadísticas,
                mapas interactivos y análisis detallados.
              </p>
              <Link to="/register" className="btn-hero btn-hero-primary">
                Crear Cuenta Gratis
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* TECNOLOGIA SECTION */}
      <section id="tecnologia" className="section section-light">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">🤖 Inteligencia Artificial</span>
            <h2 className="section-title">Tecnología de Vanguardia</h2>
            <p className="section-description">
              Utilizamos las últimas tecnologías en IoT, Cloud Computing y
              Machine Learning para ofrecer una solución escalable y eficiente.
            </p>
          </div>

          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-card-header">
                <span className="tech-icon">⚙️</span>
                <h3 className="tech-title">Backend Robusto</h3>
              </div>
              <ul className="tech-list">
                <li>Django REST Framework</li>
                <li>PostgreSQL + PostGIS</li>
                <li>Redis para caché</li>
                <li>Celery para tareas asíncronas</li>
              </ul>
            </div>

            <div className="tech-card">
              <div className="tech-card-header">
                <span className="tech-icon">🎨</span>
                <h3 className="tech-title">Frontend Moderno</h3>
              </div>
              <ul className="tech-list">
                <li>React 18 + Vite</li>
                <li>Diseño responsive</li>
                <li>Animaciones fluidas</li>
                <li>PWA compatible</li>
              </ul>
            </div>

            <div className="tech-card">
              <div className="tech-card-header">
                <span className="tech-icon">🧠</span>
                <h3 className="tech-title">Machine Learning</h3>
              </div>
              <ul className="tech-list">
                <li>TensorFlow / PyTorch</li>
                <li>Clasificación de imágenes</li>
                <li>Predicción de llenado</li>
                <li>Optimización de rutas</li>
              </ul>
            </div>

            <div className="tech-card">
              <div className="tech-card-header">
                <span className="tech-icon">☁️</span>
                <h3 className="tech-title">Infraestructura</h3>
              </div>
              <ul className="tech-list">
                <li>AWS / Azure Cloud</li>
                <li>Docker + Kubernetes</li>
                <li>CI/CD automatizado</li>
                <li>Monitoreo 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACTO SECTION */}
      <section id="impacto" className="section section-gradient">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge light">🌍 Nuestro Impacto</span>
            <h2 className="section-title light">Cambiando el Mundo</h2>
            <p className="section-description light">
              Cada tacho inteligente contribuye a un futuro más limpio y
              sostenible. Juntos podemos hacer la diferencia.
            </p>
          </div>

          <div className="impact-grid">
            <div className="impact-card">
              <div className="impact-number">85%</div>
              <div className="impact-label">Reducción de costos operativos</div>
            </div>

            <div className="impact-card">
              <div className="impact-number">60%</div>
              <div className="impact-label">Menos emisiones de CO₂</div>
            </div>

            <div className="impact-card">
              <div className="impact-number">95%</div>
              <div className="impact-label">Precisión en clasificación IA</div>
            </div>

            <div className="impact-card">
              <div className="impact-number">24/7</div>
              <div className="impact-label">Monitoreo en tiempo real</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      {!user && (
        <section className="final-cta">
          <div className="final-cta-content">
            <h2 className="final-cta-title">¿Listo para ser parte del cambio?</h2>
            <p className="final-cta-description">
              Únete a EcoTachosTec y ayúdanos a construir ciudades más inteligentes y sostenibles
            </p>
            <div className="final-cta-actions">
              <Link to="/register" className="btn-hero btn-hero-primary btn-hero-lg">
                Registrarse Gratis
              </Link>
              <Link to="/login" className="btn-hero btn-hero-secondary btn-hero-lg">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}