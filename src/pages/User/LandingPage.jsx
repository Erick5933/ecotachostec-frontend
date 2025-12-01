import { useContext, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import {
  Leaf, Target, Lightbulb, Globe, Radio, Thermometer,
  MapPin, Battery, Settings, Palette, Brain, Cloud,
  TrendingDown, Zap, CheckCircle, ArrowRight,
  ArrowDown, BarChart3, Recycle, Trash2, Scan
} from "lucide-react";
import "./landingPage.css";

export default function LandingPage() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    tachos: 0,
    detecciones: 0,
    ubicaciones: 0,
  });

  // Refs para intersection observer
  const heroRef = useRef(null);
  const proyectoRef = useRef(null);
  const tachosRef = useRef(null);
  const tecnologiaRef = useRef(null);
  const impactoRef = useRef(null);

  const [visibleSections, setVisibleSections] = useState({
    proyecto: false,
    tachos: false,
    tecnologia: false,
    impacto: false,
  });

  useEffect(() => {
    loadPublicStats();
    setupIntersectionObserver();
    setupParallaxEffect();
  }, []);

  const loadPublicStats = async () => {
    try {
      const [tachosRes, deteccionesRes, ubicacionesRes] = await Promise.all([
        api.get("/tachos/"),
        api.get("/detecciones/"),
        api.get("/ubicacion/cantones/"),
      ]);

      animateCount('tachos', 0, tachosRes.data.length || 0, 2000);
      animateCount('detecciones', 0, deteccionesRes.data.length || 0, 2000);
      animateCount('ubicaciones', 0, ubicacionesRes.data.length || 0, 2000);
    } catch (error) {
      console.error("Error cargando estadísticas públicas", error);
    }
  };

  const animateCount = (key, start, end, duration) => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);

      setStats(prev => ({ ...prev, [key]: current }));

      if (progress === 1) clearInterval(timer);
    }, 16);
  };

  const setupIntersectionObserver = () => {
    const options = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          setVisibleSections(prev => ({ ...prev, [sectionId]: true }));
        }
      });
    }, options);

    [proyectoRef, tachosRef, tecnologiaRef, impactoRef].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  };

  const setupParallaxEffect = () => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-element');

      parallaxElements.forEach((el, index) => {
        const speed = 0.5 + index * 0.1;
        const yPos = -(scrolled * speed);
        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  };

  return (
    <div className="landing-page">

      {/* HERO */}
      <section ref={heroRef} id="inicio" className="hero-section">

        <div className="hero-background">
          <div className="hero-circle hero-circle-1 parallax-element"></div>
          <div className="hero-circle hero-circle-2 parallax-element"></div>
          <div className="hero-circle hero-circle-3 parallax-element"></div>

          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}></div>
            ))}
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-badge fade-in">
            <Leaf size={16} />
            <span>Tecnología Verde del Futuro</span>
          </div>

          <h1 className="hero-title slide-up">
            Gestión Inteligente de
            <span className="hero-highlight"> Residuos</span>
          </h1>

          <p className="hero-description slide-up" style={{ animationDelay: "0.2s" }}>
            Revolucionando el manejo de desechos con IoT, Inteligencia Artificial
            y tecnología de punta.
          </p>

          <div className="hero-actions slide-up" style={{ animationDelay: "0.4s" }}>
            {user ? (
              <Link to="/portal" className="btn-hero btn-hero-primary">
                <BarChart3 size={20} />
                <span>Acceder al Portal</span>
                <ArrowRight size={20} className="btn-arrow" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-hero btn-hero-primary">
                  <span>Comenzar Ahora</span>
                  <ArrowRight size={20} className="btn-arrow" />
                </Link>

                <Link to="/login" className="btn-hero btn-hero-secondary">
                  <span>Iniciar Sesión</span>
                </Link>
              </>
            )}
          </div>

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
          <ArrowDown size={24} className="scroll-arrow" />
        </div>
      </section>

      {/* PROYECTO */}
      <section
        ref={proyectoRef}
        id="proyecto"
        className={`section section-light ${visibleSections.proyecto ? "section-visible" : ""}`}
      >
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <Leaf size={16} />
              <span>Nuestra Misión</span>
            </span>

            <h2 className="section-title">El Proyecto EcoTachosTec</h2>

            <p className="section-description">
              Solución integral basada en IoT, análisis de datos e IA para transformar la gestión de residuos.
            </p>
          </div>

          <div className="features-grid">
            {/* OBJETIVO */}
            <div className="feature-card" data-index="0">
              <div className="feature-icon" style={{ background: "linear-gradient(135deg, #95D5B2 0%, #74C69D 100%)" }}>
                <Target size={40} />
              </div>
              <h3 className="feature-title">Objetivo</h3>
              <p className="feature-description">
                Optimizar la recolección con monitoreo inteligente y rutas basadas en datos reales.
              </p>
            </div>

            {/* INNOVACIÓN */}
            <div className="feature-card" data-index="1">
              <div className="feature-icon" style={{ background: "linear-gradient(135deg, #A2D2FF 0%, #BDE0FE 100%)" }}>
                <Lightbulb size={40} />
              </div>
              <h3 className="feature-title">Innovación</h3>
              <p className="feature-description">
                Sensores IoT y machine learning para clasificación y predicción avanzada.
              </p>
            </div>

            {/* SOSTENIBILIDAD */}
            <div className="feature-card" data-index="2">
              <div className="feature-icon" style={{ background: "linear-gradient(135deg, #CAFFBF 0%, #9BF6FF 100%)" }}>
                <Globe size={40} />
              </div>
              <h3 className="feature-title">Sostenibilidad</h3>
              <p className="feature-description">
                Reducción de CO₂ y uso eficiente de recursos alineado con los ODS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TACHOS */}
      <section
        ref={tachosRef}
        id="tachos"
        className={`section section-dark ${visibleSections.tachos ? "section-visible" : ""}`}
      >
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge light">
              <Trash2 size={16} />
              <span>Tecnología IoT</span>
            </span>

            <h2 className="section-title light">Nuestros Tachos Inteligentes</h2>

            <p className="section-description light">
              Equipados con sensores avanzados que monitorean llenado, tipo de residuo y ambiente.
            </p>
          </div>

          <div className="tachos-showcase">
            {/* ULTRASONICOS */}
            <div className="tacho-feature">
              <div className="tacho-feature-icon">
                <Radio size={48} />
              </div>
              <h3 className="tacho-feature-title">Sensores Ultrasónicos</h3>
              <p className="tacho-feature-text">Medición precisa del nivel de llenado</p>
            </div>

            {/* AMBIENTE */}
            <div className="tacho-feature">
              <div className="tacho-feature-icon">
                <Thermometer size={48} />
              </div>
              <h3 className="tacho-feature-title">Monitoreo Ambiental</h3>
              <p className="tacho-feature-text">Control de temperatura y humedad</p>
            </div>

            {/* GPS */}
            <div className="tacho-feature">
              <div className="tacho-feature-icon">
                <MapPin size={48} />
              </div>
              <h3 className="tacho-feature-title">Geolocalización GPS</h3>
              <p className="tacho-feature-text">Ubicación exacta para optimizar rutas</p>
            </div>

            {/* SOLAR */}
            <div className="tacho-feature">
              <div className="tacho-feature-icon">
                <Scan size={48} />
              </div>
              <h3 className="tacho-feature-title">Clasificación IA</h3>
              <p className="tacho-feature-text">Detecta y clasifica residuos automáticamente</p>
            </div>
          </div>

          {!user && (
            <div className="cta-box">
              <h3 className="cta-title">¿Quieres ver datos en tiempo real?</h3>
              <p className="cta-description">
                Regístrate para acceder al panel completo.
              </p>

              <Link to="/register" className="btn-hero btn-hero-primary">
                <span>Crear Cuenta Gratis</span>
                <ArrowRight size={20} className="btn-arrow" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* TECNOLOGÍA */}
      <section
        ref={tecnologiaRef}
        id="tecnologia"
        className={`section section-light ${visibleSections.tecnologia ? "section-visible" : ""}`}
      >
        <div className="section-container">

          <div className="section-header">
            <span className="section-badge">
              <Brain size={16} />
              <span>Inteligencia Artificial</span>
            </span>

            <h2 className="section-title">Tecnología de Vanguardia</h2>

            <p className="section-description">
              Combinamos IoT, Machine Learning y Cloud Computing en una plataforma escalable.
            </p>
          </div>

          <div className="tech-grid">

            {/* BACKEND */}
            <div className="tech-card">
              <div className="tech-card-header">
                <Settings size={32} className="tech-icon" />
                <h3 className="tech-title">Backend Robusto</h3>
              </div>

              <ul className="tech-list">
                <li><CheckCircle size={16} /> Django REST Framework</li>
                <li><CheckCircle size={16} /> PostgreSQL + PostGIS</li>
                <li><CheckCircle size={16} /> Redis</li>
                <li><CheckCircle size={16} /> Celery</li>
              </ul>
            </div>

            {/* FRONTEND */}
            <div className="tech-card">
              <div className="tech-card-header">
                <Palette size={32} className="tech-icon" />
                <h3 className="tech-title">Frontend Moderno</h3>
              </div>

              <ul className="tech-list">
                <li><CheckCircle size={16} /> React + Vite</li>
                <li><CheckCircle size={16} /> Diseño responsive</li>
                <li><CheckCircle size={16} /> Animaciones fluidas</li>
                <li><CheckCircle size={16} /> PWA</li>
              </ul>
            </div>

            {/* ML */}
            <div className="tech-card">
              <div className="tech-card-header">
                <Brain size={32} className="tech-icon" />
                <h3 className="tech-title">Machine Learning</h3>
              </div>

              <ul className="tech-list">
                <li><CheckCircle size={16} /> TensorFlow / PyTorch</li>
                <li><CheckCircle size={16} /> Clasificación IA</li>
                <li><CheckCircle size={16} /> Predicción de llenado</li>
                <li><CheckCircle size={16} /> Optimización de rutas</li>
              </ul>
            </div>

            {/* CLOUD */}
            <div className="tech-card">
              <div className="tech-card-header">
                <Cloud size={32} className="tech-icon" />
                <h3 className="tech-title">Infraestructura</h3>
              </div>

              <ul className="tech-list">
                <li><CheckCircle size={16} /> Azure / AWS</li>
                <li><CheckCircle size={16} /> Docker + Kubernetes</li>
                <li><CheckCircle size={16} /> CI/CD</li>
                <li><CheckCircle size={16} /> Monitoreo 24/7</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* IMPACTO */}
      <section
        ref={impactoRef}
        id="impacto"
        className={`section section-gradient ${visibleSections.impacto ? "section-visible" : ""}`}
      >
        <div className="section-container">

          <div className="section-header">
            <span className="section-badge light">
              <Recycle size={16} />
              <span>Nuestro Impacto</span>
            </span>

            <h2 className="section-title light">Cambiando el Mundo</h2>

            <p className="section-description light">
              Cada tacho inteligente aporta a un futuro más limpio.
            </p>
          </div>

          <div className="impact-grid">

            <div className="impact-card">
              <TrendingDown size={48} className="impact-icon" />
              <div className="impact-number">85%</div>
              <div className="impact-label">Reducción de costos</div>
            </div>

            <div className="impact-card">
              <Leaf size={48} className="impact-icon" />
              <div className="impact-number">60%</div>
              <div className="impact-label">Menos emisiones</div>
            </div>

            <div className="impact-card">
              <Zap size={48} className="impact-icon" />
              <div className="impact-number">95%</div>
              <div className="impact-label">Precisión IA</div>
            </div>

            <div className="impact-card">
              <BarChart3 size={48} className="impact-icon" />
              <div className="impact-number">24/7</div>
              <div className="impact-label">Monitoreo continuo</div>
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
              Únete a EcoTachosTec y construyamos ciudades más sostenibles.
            </p>

            <div className="final-cta-actions">

              <Link to="/register" className="btn-hero btn-hero-primary btn-hero-lg">
                <span>Registrarse Gratis</span>
                <ArrowRight size={24} className="btn-arrow" />
              </Link>

              <Link to="/login" className="btn-hero btn-hero-secondary btn-hero-lg">
                <span>Iniciar Sesión</span>
              </Link>

            </div>

          </div>
        </section>
      )}

    </div>
  );
}
