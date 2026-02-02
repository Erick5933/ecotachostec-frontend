// src/pages/User/UserPortal.jsx
import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import { pickDeteccionImage, resolveMediaUrl } from "../../utils/helpers";
import CameraCapture from "../../components/CameraCapture/CameraCapture";
import TachosMap from "../../pages/User/TachosMap.jsx";
import EstadisticasDetecciones from "../../pages/User/EstadisticasDetecciones.jsx";
import NuevaDeteccionIA from "../../pages/User/NuevaDeteccionIA"; // Nuevo componente
import {
  User, Activity, TrendingUp, Trash2, Brain, MapPin,
  Clock, CheckCircle, AlertCircle, BarChart3,
  Package, Zap, Eye, Calendar, Filter,
  ArrowRight, RefreshCw, Download, Search,
  Target, Award, Sparkles, Radio, Camera, Upload, X, Scan, CheckCircle2,
  Image as ImageIcon, Building, Users, Globe, Target as TargetIcon,
  Navigation, Bell, Mail, Phone, Map, Leaf, Recycle, Ban, Hash, FileText,
  XCircle
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "./userPortal.css";

export default function UserPortal() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalTachos: 0,
    totalDetecciones: 0,
    misDetecciones: 0,
    deteccionesEmpresa: 0,
    tachosEmpresa: 0,
    tachosPublicosCerca: 0,
  });
  const [tachos, setTachos] = useState([]);
  const [tachosEmpresa, setTachosEmpresa] = useState([]);
  const [tachosPublicos, setTachosPublicos] = useState([]);
  const [tachosCerca, setTachosCerca] = useState([]);
  const [detecciones, setDetecciones] = useState([]);
  const [deteccionesEmpresa, setDeteccionesEmpresa] = useState([]);
  const [misTachos, setMisTachos] = useState([]);
  const [misDetecciones, setMisDetecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("overview");
  const [selectedDeteccionId, setSelectedDeteccionId] = useState(null);
  const [selectedDeteccion, setSelectedDeteccion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermTachos, setSearchTermTachos] = useState("");
  const [animatedStats, setAnimatedStats] = useState({
    totalTachos: 0,
    totalDetecciones: 0,
    misDetecciones: 0,
    deteccionesEmpresa: 0,
    tachosEmpresa: 0,
    tachosPublicosCerca: 0,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [empresaAsociada, setEmpresaAsociada] = useState(null);
  const [geoDenied, setGeoDenied] = useState(false);

  // Estados para IA (reducidos)
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Refs para animaciones
  const statsRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadPortalData();
    getUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  // CORRECCIÓN 1: useEffect para calcular tachos cercanos cuando cambia la ubicación
  useEffect(() => {
    if (userLocation && tachosPublicos.length > 0) {
      console.log("Recalculando tachos cercanos con ubicación:", userLocation);

      const cercanos = tachosPublicos.filter(tacho => {
        try {
          const latTacho = parseFloat(tacho.ubicacion_lat);
          const lonTacho = parseFloat(tacho.ubicacion_lon);

          if (isNaN(latTacho) || isNaN(lonTacho)) return false;

          const distancia = calcularDistancia(
            userLocation.lat,
            userLocation.lon,
            latTacho,
            lonTacho
          );
          return distancia <= 10; // 10km radio
        } catch (error) {
          console.error("Error calculando distancia:", error);
          return false;
        }
      });

      setTachosCerca(cercanos);

      // Actualizamos las stats solo referentes a cercanía
      setStats(prev => ({
        ...prev,
        tachosPublicosCerca: cercanos.length
      }));
    }
  }, [userLocation, tachosPublicos]);

  // CORRECCIÓN 2: Animar contadores
  useEffect(() => {
    const duration = 2000;
    const animationFrame = (startTime) => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);

      setAnimatedStats(prev => ({
        ...prev,
        totalTachos: Math.floor(progress * (stats.totalTachos - prev.totalTachos) + prev.totalTachos),
        totalDetecciones: Math.floor(progress * (stats.totalDetecciones - prev.totalDetecciones) + prev.totalDetecciones),
        misDetecciones: Math.floor(progress * (stats.misDetecciones - prev.misDetecciones) + prev.misDetecciones),
        deteccionesEmpresa: Math.floor(progress * (stats.deteccionesEmpresa - prev.deteccionesEmpresa) + prev.deteccionesEmpresa),
        tachosEmpresa: Math.floor(progress * (stats.tachosEmpresa - prev.tachosEmpresa) + prev.tachosEmpresa),
        tachosPublicosCerca: Math.floor(progress * (stats.tachosPublicosCerca - prev.tachosPublicosCerca) + prev.tachosPublicosCerca),
      }));

      if (progress < 1) {
        requestAnimationFrame(() => animationFrame(startTime));
      }
    };

    if (stats.totalTachos > 0 || stats.tachosEmpresa > 0 || stats.tachosPublicosCerca > 0) {
      const startTime = Date.now();
      requestAnimationFrame(() => animationFrame(startTime));
    }
  }, [stats]);

  const getUserLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setLocationLoading(false);
          setGeoDenied(false);
        },
        (error) => {
          if (error?.code === 1) {
            setGeoDenied(true);
            if (!window.__geoDeniedLogged) {
              console.warn("Permiso de ubicación denegado por el usuario.");
              window.__geoDeniedLogged = true;
            }
          } else {
            console.error("Error obteniendo ubicación:", error);
          }
          // Ubicación por defecto (Cuenca, Ecuador)
          setUserLocation({ lat: -2.90055, lon: -79.00453 });
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setUserLocation({ lat: -2.90055, lon: -79.00453 });
      setLocationLoading(false);
    }
  };

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

    // CORREGIR en la función loadPortalData() - reemplazar esta sección:
    const loadPortalData = async () => {
      try {
        const [tachosRes, deteccionesRes] = await Promise.all([
          api.get("/tachos/"),
          api.get("/detecciones/"),
        ]);

        const tachosData = tachosRes.data.results || tachosRes.data || [];
        const deteccionesData = deteccionesRes.data.results || deteccionesRes.data || [];

        // Filtrar mis tachos (donde el usuario es propietario/encargado)
        const userTachos = tachosData.filter(tacho => tacho.propietario === user?.id);

        // Filtrar tachos personales (tipo "personal") del usuario
        const tachosPersonales = userTachos.filter(tacho => tacho.tipo === "personal");

        // Filtrar tachos de empresas donde el usuario es encargado (tipo "publico")
        const tachosConUsuarioEncargado = userTachos.filter(tacho => tacho.tipo === "publico");

        // Log para debug
        console.log("User ID:", user?.id);
        console.log("Total tachos:", tachosData.length);
        console.log("Mis tachos (propietario):", userTachos.length);
        console.log("Tachos personales:", tachosPersonales.length);
        console.log("Tachos empresa:", tachosConUsuarioEncargado.length);
        console.log("Datos tachos empresa:", tachosConUsuarioEncargado);

        // Obtener empresas únicas donde el usuario es encargado
        const empresas = [...new Set(tachosConUsuarioEncargado.map(t => t.empresa_nombre).filter(Boolean))];
        // Siempre mostrar la sección de empresa si hay tachos asignados, aunque no tenga nombre
        if (tachosConUsuarioEncargado.length > 0) {
          setEmpresaAsociada(empresas[0] || "Mi Empresa");
        } else {
          setEmpresaAsociada(null);
        }

        // Filtrar tachos públicos activos
        const tachosPublicosData = tachosData.filter(tacho =>
          tacho.tipo === "publico" && tacho.estado === "activo"
        );

        // Filtrar detecciones de la empresa (detecciones en tachos públicos donde el usuario es encargado)
        const empresaTachoIds = tachosConUsuarioEncargado.map(t => t.id);
        const deteccionesEmpresaData = deteccionesData.filter(det =>
          empresaTachoIds.includes(det.tacho) || (det.tacho_id && empresaTachoIds.includes(det.tacho_id))
        );

        // CORRECCIÓN: Filtrar mis detecciones (solo de tachos personales del usuario)
        const tachoPersonalIds = tachosPersonales.map(tacho => tacho.id);
        const userDetecciones = deteccionesData.filter(det =>
          tachoPersonalIds.includes(det.tacho) || (det.tacho_id && tachoPersonalIds.includes(det.tacho_id))
        );

        // Calcular tachos públicos cercanos inicialmente (se actualizará en useEffect)
        let tachosCercaData = [];
        if (userLocation) {
          tachosCercaData = tachosPublicosData.filter(tacho => {
            if (!tacho.ubicacion_lat || !tacho.ubicacion_lon) return false;
            const distancia = calcularDistancia(
              userLocation.lat, userLocation.lon,
              parseFloat(tacho.ubicacion_lat), parseFloat(tacho.ubicacion_lon)
            );
            return distancia <= 10; // 10km de radio
          });
        }

        // Actualizar estadísticas - CORREGIDO
        const newStats = {
          totalTachos: tachosPersonales.length, // Solo tachos personales
          totalDetecciones: deteccionesData.length,
          misDetecciones: userDetecciones.length, // Detecciones de tachos personales
          deteccionesEmpresa: deteccionesEmpresaData.length,
          tachosEmpresa: tachosConUsuarioEncargado.length,
          tachosPublicosCerca: tachosCercaData.length,
        };
        setStats(newStats);
        // Actualizar animatedStats inmediatamente para que se vea el cambio de stats
        setAnimatedStats(newStats);

        // Actualizar estados - CORREGIDO
        setTachos(tachosData);
        setTachosEmpresa(tachosConUsuarioEncargado);
        setTachosPublicos(tachosPublicosData);
        setTachosCerca(tachosCercaData);
        setDetecciones(deteccionesData);
        setDeteccionesEmpresa(deteccionesEmpresaData);
        setMisTachos(tachosPersonales); // Solo tachos personales
        setMisDetecciones(userDetecciones); // Solo detecciones de tachos personales

      } catch (error) {
        console.error("Error cargando datos del portal:", error);
      } finally {
        setLoading(false);
      }
    };

  const handleRefresh = () => {
    setLoading(true);
    loadPortalData();
    getUserLocation();
  };

  // FUNCIONES PARA IA (simplificadas)
  const handleImageCapture = (imageData) => {
    setCapturedImage(imageData);
    setShowCameraModal(false);
  };

  const handleOpenCamera = () => {
    setShowCameraModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  const handleResetImage = () => {
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNewDetection = async (createdDetection) => {
    try {
      // La creación ya se realizó en NuevaDeteccionIA con FormData (incluye imagen)
      // Aquí refrescamos datos y cambiamos la vista a "misDetecciones"
      if (!createdDetection?.id) {
        console.warn("onNewDetection sin id; se omite creación adicional.");
      }
      // Refrescar datos del portal y ubicación
      await loadPortalData();
      // Actualizar ubicación para recalcular tachos cercanos
      getUserLocation();
      // Cambiar a la vista de detecciones después de que loadPortalData termine
      setActiveView("mydetecciones");
      return createdDetection;
    } catch (error) {
      console.error("Error al refrescar datos tras nueva detección:", error);
      throw error;
    }
  };

  // CORRECCIÓN 3: Función para navegar al detalle del tacho
  const handleNavigateToTacho = (tacho) => {
    console.log("Navegando a tacho:", tacho.id);
    navigate(`/tachos/${tacho.id}`);
  };

  // Función para abrir detalle de una detección
  const handleOpenDeteccionDetail = async (deteccionId) => {
    try {
      const res = await api.get(`/detecciones/${deteccionId}/`);
      setSelectedDeteccion(res.data);
      setSelectedDeteccionId(deteccionId);
      setActiveView("detalle");
    } catch (error) {
      console.error("Error cargando detección:", error);
    }
  };

  // Función para cerrar detalle
  const handleCloseDeteccionDetail = () => {
    setSelectedDeteccionId(null);
    setSelectedDeteccion(null);
    setActiveView("overview");
  };

  const filteredTachos = misTachos.filter(tacho =>
    tacho.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDetecciones = misDetecciones.filter(det =>
    det.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    det.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTachosCerca = tachosCerca.filter(tacho =>
    tacho.nombre?.toLowerCase().includes(searchTermTachos.toLowerCase()) ||
    tacho.codigo?.toLowerCase().includes(searchTermTachos.toLowerCase()) ||
    tacho.empresa_nombre?.toLowerCase().includes(searchTermTachos.toLowerCase())
  );

  // Función para formatear fecha
  const formatFechaLegible = (fechaString) => {
    if (!fechaString) return 'Fecha no disponible';

    const fecha = new Date(fechaString);
    const ahora = new Date();
    const diferenciaMs = ahora - fecha;
    const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

    if (diferenciaDias === 0) {
      const diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));
      if (diferenciaHoras < 1) {
        const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
        if (diferenciaMinutos < 1) return 'Hace unos momentos';
        return `Hace ${diferenciaMinutos} min${diferenciaMinutos !== 1 ? 's' : ''}`;
      }
      return `Hace ${diferenciaHoras} hora${diferenciaHoras !== 1 ? 's' : ''}`;
    }

    if (diferenciaDias === 1) {
      return `Ayer ${fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`;
    }

    if (diferenciaDias < 7) {
      return `${fecha.toLocaleDateString('es-EC', { weekday: 'long' })} ${fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return fecha.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener ubicación
  const getUbicacionFromCoords = (lat, lon) => {
    if (!lat || !lon) return "Ubicación desconocida";

    // Coordenadas aproximadas para provincias de Ecuador
    const locations = [
      { provincia: "Pichincha", ciudad: "Quito", latRange: [-0.3, 0.1], lonRange: [-78.6, -78.4] },
      { provincia: "Guayas", ciudad: "Guayaquil", latRange: [-2.3, -2.1], lonRange: [-79.95, -79.85] },
      { provincia: "Azuay", ciudad: "Cuenca", latRange: [-2.92, -2.88], lonRange: [-79.02, -78.98] },
      { provincia: "Manabí", ciudad: "Manta", latRange: [-1.06, -0.98], lonRange: [-80.75, -80.65] },
      { provincia: "El Oro", ciudad: "Machala", latRange: [-3.28, -3.24], lonRange: [-79.97, -79.93] },
      { provincia: "Loja", ciudad: "Loja", latRange: [-4.02, -3.98], lonRange: [-79.22, -79.18] },
      { provincia: "Tungurahua", ciudad: "Ambato", latRange: [-1.28, -1.22], lonRange: [-78.65, -78.59] },
      { provincia: "Imbabura", ciudad: "Ibarra", latRange: [0.35, 0.39], lonRange: [-78.15, -78.11] },
      { provincia: "Cotopaxi", ciudad: "Latacunga", latRange: [-0.95, -0.91], lonRange: [-78.62, -78.58] },
      { provincia: "Chimborazo", ciudad: "Riobamba", latRange: [-1.68, -1.64], lonRange: [-78.67, -78.63] },
    ];

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    for (const location of locations) {
      if (
        latNum >= location.latRange[0] && latNum <= location.latRange[1] &&
        lonNum >= location.lonRange[0] && lonNum <= location.lonRange[1]
      ) {
        return `${location.ciudad}, ${location.provincia}`;
      }
    }

    if (latNum > 0) return "Región Norte";
    if (latNum < -2) return "Región Sur";
    if (lonNum < -80) return "Región Costa";
    return "Región Sierra";
  };

  // Función para obtener clase de clasificación
  const getClasificacionBadgeClass = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return 'organico';
      case 'inorganico': return 'inorganico';
      case 'reciclable': return 'reciclable';
      default: return 'organico';
    }
  };

  const getClasificacionText = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return 'Orgánico';
      case 'inorganico': return 'Inorgánico';
      case 'reciclable': return 'Reciclable';
      default: return clasificacion || 'No clasificado';
    }
  };

  const getClasificacionIcon = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return '';
      case 'inorganico': return '';
      case 'reciclable': return '';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="portal-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-text">Cargando tu portal...</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  return (
    <div className="user-portal">
      {/* Animated Background */}
      <div className="portal-background">
        <div className="portal-bg-circle portal-bg-circle-1"></div>
        <div className="portal-bg-circle portal-bg-circle-2"></div>
        <div className="portal-bg-circle portal-bg-circle-3"></div>
      </div>

      {/* Header */}
      <div className="portal-header">
        <div className="portal-welcome">
          <div className="welcome-badge">
            <Sparkles size={16} />
            <span>Panel Personal</span>
          </div>
          <h1 className="portal-title">
            ¡Hola, {user?.nombre || "Usuario"}!
          </h1>
          <p className="portal-subtitle">
            {empresaAsociada
              ? `Encargado de: ${empresaAsociada}`
              : "Gestiona tus tachos y detecciones personales"}
          </p>
        </div>

        <div className="portal-header-actions">
          <button className="portal-action-btn" onClick={handleRefresh} title="Actualizar datos">
            <RefreshCw size={20} />
          </button>
          <button
            className="portal-action-btn"
            onClick={getUserLocation}
            title="Actualizar mi ubicación"
            disabled={locationLoading}
          >
            <Navigation size={20} />
          </button>
          <div className="portal-user-card">
            <div className="portal-user-avatar">
              <User size={24} />
            </div>
            <div className="portal-user-info">
              <span className="portal-user-name">{user?.nombre}</span>
              <span className="portal-user-role">
                {user?.rol === "admin" ? (
                  <>
                    <Award size={14} />
                    <span>Administrador</span>
                  </>
                ) : (
                  <>
                    <Eye size={14} />
                    <span>Usuario</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

          {/* Geolocalización: aviso si está denegado */}
          {geoDenied && (
            <div style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B', borderRadius: 8, padding: '10px 12px', margin: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} />
                <span>Para ver tachos cercanos, permite acceso a tu ubicación.</span>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="portal-action-btn" onClick={getUserLocation} title="Intentar obtener ubicación">
                  <Navigation size={16} />
                  <span style={{ marginLeft: 6 }}>Intentar de nuevo</span>
                </button>
                <span style={{ fontSize: 12 }}>Si el navegador lo bloqueó, habilítalo en “Ajustes del sitio”.</span>
              </div>
            </div>
          )}

      {/* Stats Overview */}
      <div ref={statsRef} className="portal-stats-grid">
        <div className="portal-stat-card">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper green-gradient">
              <Trash2 size={28} />
              <div className="stat-icon-glow"></div>
            </div>
            <div className="stat-details">
              <div className="stat-value">
                <span className="stat-number">{animatedStats.totalTachos}</span>
                <TrendingUp size={20} className="stat-trend" />
              </div>
              <div className="stat-label">Mis Tachos Personales</div>
              <div className="stat-progress">
                <div className="stat-progress-bar green" style={{ width: `${(animatedStats.totalTachos/10)*100}%` }}></div>
              </div>
            </div>
          </div>
          <div className="stat-card-shine"></div>
        </div>

        <div className="portal-stat-card">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper blue-gradient">
              <Brain size={28} />
              <div className="stat-icon-glow"></div>
            </div>
            <div className="stat-details">
              <div className="stat-value">
                <span className="stat-number">{animatedStats.misDetecciones}</span>
                <Zap size={20} className="stat-trend" />
              </div>
              <div className="stat-label">Mis Detecciones</div>
              <div className="stat-progress">
                <div className="stat-progress-bar blue" style={{ width: `${(animatedStats.misDetecciones/50)*100}%` }}></div>
              </div>
            </div>
          </div>
          <div className="stat-card-shine"></div>
        </div>

        {empresaAsociada && (
          <div className="portal-stat-card">
            <div className="stat-card-content">
              <div className="stat-icon-wrapper purple-gradient">
                <Building size={28} />
                <div className="stat-icon-glow"></div>
              </div>
              <div className="stat-details">
                <div className="stat-value">
                  <span className="stat-number">{animatedStats.tachosEmpresa}</span>
                  <Users size={20} className="stat-trend" />
                </div>
                <div className="stat-label">Tachos de Empresa</div>
                <div className="stat-progress">
                  <div className="stat-progress-bar purple" style={{ width: `${(animatedStats.tachosEmpresa/20)*100}%` }}></div>
                </div>
              </div>
            </div>
            <div className="stat-card-shine"></div>
          </div>
        )}

        <div className="portal-stat-card">
          <div className="stat-card-content">
            <div className="stat-icon-wrapper orange-gradient">
              <MapPin size={28} />
              <div className="stat-icon-glow"></div>
            </div>
            <div className="stat-details">
              <div className="stat-value">
                <span className="stat-number">{animatedStats.tachosPublicosCerca}</span>
                <TargetIcon size={20} className="stat-trend" />
              </div>
              <div className="stat-label">Tachos Públicos Cerca</div>
              <div className="stat-progress">
                <div className="stat-progress-bar orange" style={{ width: `${(animatedStats.tachosPublicosCerca/20)*100}%` }}></div>
              </div>
            </div>
          </div>
          <div className="stat-card-shine"></div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="portal-tabs">
        <button
          className={`portal-tab ${activeView === "overview" ? "active" : ""}`}
          onClick={() => setActiveView("overview")}
        >
          <BarChart3 size={20} />
          <span>Vista General</span>
          {activeView === "overview" && <div className="tab-indicator"></div>}
        </button>
        <button
          className={`portal-tab ${activeView === "mytachos" ? "active" : ""}`}
          onClick={() => setActiveView("mytachos")}
        >
          <Package size={20} />
          <span>Mis Tachos</span>
          {activeView === "mytachos" && <div className="tab-indicator"></div>}
        </button>
        {empresaAsociada && (
          <button
            className={`portal-tab ${activeView === "empresa" ? "active" : ""}`}
            onClick={() => setActiveView("empresa")}
          >
            <Building size={20} />
            <span>Mi Empresa</span>
            {activeView === "empresa" && <div className="tab-indicator"></div>}
          </button>
        )}
        <button
          className={`portal-tab ${activeView === "mydetecciones" ? "active" : ""}`}
          onClick={() => setActiveView("mydetecciones")}
        >
          <Brain size={20} />
          <span>Mis Detecciones</span>
          {activeView === "mydetecciones" && <div className="tab-indicator"></div>}
        </button>
        <button
          className={`portal-tab ${activeView === "mapa" ? "active" : ""}`}
          onClick={() => setActiveView("mapa")}
        >
          <Map size={20} />
          <span>Mapa</span>
          {activeView === "mapa" && <div className="tab-indicator"></div>}
        </button>
        <button
          className={`portal-tab ${activeView === "estadisticas" ? "active" : ""}`}
          onClick={() => setActiveView("estadisticas")}
        >
          <TrendingUp size={20} />
          <span>Estadísticas</span>
          {activeView === "estadisticas" && <div className="tab-indicator"></div>}
        </button>

      </div>

      {/* Vista General */}
      {activeView === "overview" && (
        <div className="portal-view">
          {/* Activity Timeline */}
          <div className="portal-card activity-card">
            <div className="portal-card-header">
              <div className="card-header-left">
                <Activity size={24} className="header-icon" />
                <h3 className="portal-card-title">Mis Actividades Recientes</h3>
              </div>
              <div className="card-header-actions">
                <span className="live-badge">
                  <span className="live-dot"></span>
                  <span>En Vivo</span>
                </span>
              </div>
            </div>
            <div className="portal-card-body">
              <div className="activity-timeline">
                {[...misDetecciones, ...deteccionesEmpresa]
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .slice(0, 6)
                  .map((det, index) => {
                    const ubicacion = getUbicacionFromCoords(det.ubicacion_lat, det.ubicacion_lon);
                    const fechaRegistro = formatFechaLegible(det.fecha_registro || det.created_at);
                    const esDeEmpresa = deteccionesEmpresa.some(d => d.id === det.id);

                    return (
                      <div key={det.id} className="activity-item">
                        <div className="activity-line"></div>
                        <div className="activity-dot">
                          <Brain size={16} />
                        </div>
                        <div className="activity-content">
                          <div className="activity-header">
                            <span className="activity-title">
                              <strong>{det.nombre}</strong> - {getClasificacionText(det.clasificacion)}
                              {esDeEmpresa && (
                                <span className="activity-empresa-tag">
                                  <Building size={12} /> Empresa
                                </span>
                              )}
                            </span>
                            <span className={`activity-badge ${getClasificacionBadgeClass(det.clasificacion)}`}>
                              {getClasificacionIcon(det.clasificacion)} {det.confianza_ia || 0}%
                            </span>
                          </div>
                          <div className="activity-meta">
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <MapPin size={14} />
                                {ubicacion}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Clock size={14} />
                                {fechaRegistro}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="activity-hover-effect"></div>
                        <button
                          onClick={() => handleOpenDeteccionDetail(det.id)}
                          className="activity-detail-link"
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-grid">
            <div className="quick-action-card" onClick={() => setActiveView("mytachos")}>
              <div className="quick-action-icon green-gradient">
                <Trash2 size={24} />
              </div>
              <div className="quick-action-content">
                <h4>Mis Tachos Personales</h4>
                <p>Gestiona tus tachos personales</p>
              </div>
              <ArrowRight size={20} className="quick-action-arrow" />
            </div>

            {empresaAsociada && (
              <div className="quick-action-card" onClick={() => setActiveView("empresa")}>
                <div className="quick-action-icon purple-gradient">
                  <Building size={24} />
                </div>
                <div className="quick-action-content">
                  <h4>Mi Empresa</h4>
                  <p>Gestiona tachos de {empresaAsociada}</p>
                </div>
                <ArrowRight size={20} className="quick-action-arrow" />
              </div>
            )}

            <div className="quick-action-card" onClick={() => setActiveView("mapa")}>
              <div className="quick-action-icon orange-gradient">
                <Map size={24} />
              </div>
              <div className="quick-action-content">
                <h4>Tachos Cerca de Mí</h4>
                <p>{stats.tachosPublicosCerca || 0} tachos en un radio de 10km</p>
              </div>
              <ArrowRight size={20} className="quick-action-arrow" />
            </div>

            <div className="quick-action-card" onClick={() => setActiveView("nuevaDeteccion")}>
              <div className="quick-action-icon blue-gradient">
                <Camera size={24} />
              </div>
              <div className="quick-action-content">
                <h4>Nueva Detección</h4>
                <p>Clasifica residuos con IA</p>
              </div>
              <ArrowRight size={20} className="quick-action-arrow" />
            </div>
          </div>
        </div>
      )}

      {/* Vista de MIS Tachos */}
      {activeView === "mytachos" && (
        <div className="portal-view">
          <div className="portal-card">
            <div className="portal-card-header">
              <div className="card-header-left">
                <Package size={24} className="header-icon" />
                <h3 className="portal-card-title">Mis Tachos Personales</h3>
              </div>
              <div className="card-header-actions">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Buscar mis tachos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="portal-card-body">
              {misTachos.length === 0 ? (
                <div className="empty-state">
                  <Trash2 size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#4b5563' }}>
                    No tienes tachos personales
                  </h4>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    Los tachos personales se asignan por el administrador
                  </p>
                </div>
              ) : (
                <div className="portal-table-container">
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th><div className="th-content"><span>Código</span></div></th>
                        <th><div className="th-content"><span>Nombre</span></div></th>
                        <th><div className="th-content"><MapPin size={14} /><span>Ubicación</span></div></th>
                        <th><div className="th-content"><span>Estado</span></div></th>
                        <th><div className="th-content"><span>Llenado</span></div></th>
                        <th><div className="th-content"><span>Acciones</span></div></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTachos.map((tacho, index) => (
                        <tr key={tacho.id}>
                          <td><span className="table-badge green">{tacho.codigo}</span></td>
                          <td>
                            <div className="table-primary">
                              <Trash2 size={16} />
                              <span>{tacho.nombre}</span>
                            </div>
                          </td>
                          <td>
                            <div className="table-coords">
                              <MapPin size={14} />
                              <span>
                                {getUbicacionFromCoords(tacho.ubicacion_lat, tacho.ubicacion_lon)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${tacho.estado === 'activo' ? 'active' : 'warning'}`}>
                              {tacho.estado === 'activo' ? 'Activo' : tacho.estado}
                            </span>
                          </td>
                          <td>
                            <div className="fill-progress">
                              <div
                                className="fill-progress-bar"
                                style={{ width: `${tacho.nivel_llenado || 0}%` }}
                              ></div>
                              <span>{tacho.nivel_llenado || 0}%</span>
                            </div>
                          </td>
                          <td>
                            <Link
                              to={`/tachos/${tacho.id}`}
                              className="detail-btn"
                            >
                              <Eye size={14} />
                              <span>Ver</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vista de EMPRESA */}
      {activeView === "empresa" && empresaAsociada && (
        <div className="portal-view">
          {/* Debug logs */}
          {console.log("renderizando empresa view:", { empresaAsociada, tachosEmpresa: tachosEmpresa.length, deteccionesEmpresa: deteccionesEmpresa.length })}
          <div className="portal-card">
            <div className="portal-card-header">
              <div className="card-header-left">
                <Building size={24} className="header-icon" />
                <h3 className="portal-card-title">Empresa: {empresaAsociada}</h3>
              </div>
            </div>
            <div className="portal-card-body">
              <div className="empresa-info">
                <div className="empresa-header">
                  <div className="empresa-icon">
                    <Building size={32} />
                  </div>
                  <div className="empresa-details">
                    <h4>Información de la Empresa</h4>
                    <p>Eres el encargado de los siguientes tachos:</p>
                  </div>
                </div>

                {tachosEmpresa.length === 0 ? (
                  <div className="empty-state">
                    <Building size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#4b5563' }}>
                      No tienes tachos asignados en esta empresa
                    </h4>
                  </div>
                ) : (
                  <div className="portal-table-container">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th><div className="th-content"><span>Código</span></div></th>
                          <th><div className="th-content"><span>Nombre</span></div></th>
                          <th><div className="th-content"><MapPin size={14} /><span>Ubicación</span></div></th>
                          <th><div className="th-content"><span>Estado</span></div></th>
                          <th><div className="th-content"><span>Llenado</span></div></th>
                        </tr>
                      </thead>
                      <tbody>
                        {tachosEmpresa.map((tacho, index) => (
                          <tr key={tacho.id}>
                            <td><span className="table-badge purple">{tacho.codigo}</span></td>
                            <td>
                              <div className="table-primary">
                                <Trash2 size={16} />
                                <span>{tacho.nombre}</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-coords">
                                <MapPin size={14} />
                                <span>
                                  {getUbicacionFromCoords(tacho.ubicacion_lat, tacho.ubicacion_lon)}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${tacho.estado === 'activo' ? 'active' : 'warning'}`}>
                                {tacho.estado === 'activo' ? 'Activo' : tacho.estado}
                              </span>
                            </td>
                            <td>
                              <div className="fill-progress">
                                <div
                                  className="fill-progress-bar"
                                  style={{ width: `${tacho.nivel_llenado || 0}%` }}
                                ></div>
                                <span>{tacho.nivel_llenado || 0}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Detecciones de la Empresa */}
                <div style={{ marginTop: '2rem' }}>
                  <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Detecciones de la Empresa</h4>
                  {deteccionesEmpresa.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      <Brain size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                      <p>No hay detecciones registradas en los tachos de la empresa</p>
                    </div>
                  ) : (
                    <div className="portal-table-container">
                      <table className="portal-table">
                        <thead>
                          <tr>
                            <th><div className="th-content"><span>Clasificación</span></div></th>
                            <th><div className="th-content"><Calendar size={14} /><span>Fecha</span></div></th>
                            <th><div className="th-content"><span>Confianza</span></div></th>
                            <th><div className="th-content"><span>Tacho</span></div></th>
                            <th><div className="th-content"><span>Acciones</span></div></th>
                          </tr>
                        </thead>
                        <tbody>
                          {deteccionesEmpresa.slice(0, 10).map((det, index) => (
                            <tr key={det.id}>
                              <td>
                                <span className={`clasification-badge ${getClasificacionBadgeClass(det.clasificacion)}`}>
                                  {getClasificacionIcon(det.clasificacion)} {getClasificacionText(det.clasificacion)}
                                </span>
                              </td>
                              <td>{formatFechaLegible(det.created_at)}</td>
                              <td>
                                <span className={`confianza-badge ${parseFloat(det.confianza_ia || 0) >= 80 ? 'high' :
                                  parseFloat(det.confianza_ia || 0) >= 60 ? 'medium' : 'low'}`}>
                                  {det.confianza_ia || 0}%
                                </span>
                              </td>
                              <td>
                                {det.tacho_nombre || `Tacho ${det.tacho}`}
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button
                                    onClick={() => handleOpenDeteccionDetail(det.id)}
                                    className="detail-btn"
                                    title="Ver detalles"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                  >
                                    <Eye size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

{/* Vista de MIS Detecciones */}
{activeView === "mydetecciones" && (
  <div className="portal-view">
    <div className="portal-card">
      <div className="portal-card-header">
        <div className="card-header-left">
          <Brain size={24} className="header-icon" />
          <div>
            <h3 className="portal-card-title">Mis Detecciones Personales</h3>
            <span className="card-subtitle">
              {misDetecciones.length} detecciones en mis tachos personales
            </span>
          </div>
        </div>
        <div className="card-header-actions">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por material, categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.target.value)}
            />
          </div>
          <button
            onClick={() => setActiveView("nuevaDeteccion")}
            className="nueva-deteccion-btn"
          >
            <Camera size={18} />
            <span>Nueva Detección</span>
          </button>
        </div>
      </div>
      <div className="portal-card-body">
        {misDetecciones.length === 0 ? (
          <div className="empty-state">
            <Brain size={48} />
            <h4>No tienes detecciones en tus tachos personales</h4>
            <p>Crea tu primera detección en la sección "Nueva Detección"</p>
            <button
              onClick={() => setActiveView("nuevaDeteccion")}
              className="primary-btn"
            >
              <Camera size={16} />
              <span>Ir a Nueva Detección</span>
            </button>
          </div>
        ) : (
          <>
            {/* Resumen de estadísticas MEJORADO */}
            <div className="stats-summary">
              <div className="stat-card total">
                <div className="stat-header">
                  <div className="stat-icon total">
                    <Hash size={20} />
                  </div>
                  <span className="stat-label">Total</span>
                </div>
                <div className="stat-value">{misDetecciones.length}</div>
              </div>

              <div className="stat-card organico">
                <div className="stat-header">
                  <div className="stat-icon organico">
                    <Leaf size={20} />
                  </div>
                  <span className="stat-label">Orgánicos</span>
                </div>
                <div className="stat-value">
                  {misDetecciones.filter(d => d.clasificacion === 'organico').length}
                </div>
              </div>

              <div className="stat-card reciclable">
                <div className="stat-header">
                  <div className="stat-icon reciclable">
                    <Recycle size={20} />
                  </div>
                  <span className="stat-label">Reciclables</span>
                </div>
                <div className="stat-value">
                  {misDetecciones.filter(d => d.clasificacion === 'reciclable').length}
                </div>
              </div>

              <div className="stat-card inorganico">
                <div className="stat-header">
                  <div className="stat-icon inorganico">
                    <Ban size={20} />
                  </div>
                  <span className="stat-label">Inorgánicos</span>
                </div>
                <div className="stat-value">
                  {misDetecciones.filter(d => d.clasificacion === 'inorganico').length}
                </div>
              </div>
            </div>

            <div className="portal-table-container">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th><div className="th-content"><span>Tacho</span></div></th>
                    <th><div className="th-content"><span>Clasificación</span></div></th>
                    <th><div className="th-content"><Calendar size={14} /><span>Fecha</span></div></th>
                    <th><div className="th-content"><span>Confianza IA</span></div></th>
                    <th><div className="th-content"><MapPin size={14} /><span>Ubicación</span></div></th>
                    <th><div className="th-content"><span>Acciones</span></div></th>
                  </tr>
                </thead>
                <tbody>
                  {misDetecciones
                    .filter(det => {
                      const searchLower = searchTerm.toLowerCase();
                      return (
                        det.tacho_nombre?.toLowerCase().includes(searchLower) ||
                        det.clasificacion?.toLowerCase().includes(searchLower) ||
                        (det.descripcion && det.descripcion.toLowerCase().includes(searchLower))
                      );
                    })
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map((det, index) => {
                      const ubicacion = getUbicacionFromCoords(det.ubicacion_lat, det.ubicacion_lon);
                      const fechaRegistro = formatFechaLegible(det.created_at);

                      return (
                        <tr key={det.id}>
                          <td data-label="Tacho">
                            <div className="table-primary">
                              <Trash2 size={16} />
                              <span>{det.tacho_nombre || `Tacho ${det.tacho}`}</span>
                            </div>
                          </td>
                          <td data-label="Clasificación">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '1rem' }}>
                                {getClasificacionIcon(det.clasificacion)}
                              </span>
                              <span className={`clasification-badge ${getClasificacionBadgeClass(det.clasificacion)}`}>
                                {getClasificacionText(det.clasificacion)}
                              </span>
                            </div>
                          </td>
                          <td data-label="Fecha">
                            <div className="table-date">
                              <Clock size={14} />
                              <span>{fechaRegistro}</span>
                            </div>
                          </td>
                          <td data-label="Confianza IA">
                            <div className="confidence-cell">
                              <span className={`confianza-badge ${parseFloat(det.confianza_ia || 0) >= 80 ? 'high' :
                                parseFloat(det.confianza_ia || 0) >= 60 ? 'medium' : 'low'}`}>
                                {det.confianza_ia || 0}%
                              </span>
                              <div className="confidence-bar">
                                <div
                                  className="confidence-fill"
                                  style={{ width: `${det.confianza_ia || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td data-label="Ubicación">
                            <div className="table-coords">
                              <MapPin size={14} />
                              <span>{ubicacion}</span>
                            </div>
                          </td>
                          <td data-label="Acciones">
                            <div className="action-buttons">
                              <button
                                onClick={() => handleOpenDeteccionDetail(det.id)}
                                className="detail-btn"
                                title="Ver detalles"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                              >
                                <Eye size={14} />
                              </button>
                              <Link
                                to={`/tachos/${det.tacho}`}
                                className="detail-btn secondary"
                                title="Ir al tacho"
                              >
                                <Trash2 size={14} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)}
      {/* Vista de MAPA interactivo */}
      {activeView === "mapa" && (
        <div className="portal-view">
          <div className="portal-card">
            <div className="portal-card-header">
              <div className="card-header-left">
                <Map size={24} className="header-icon" />
                <h3 className="portal-card-title">Tachos Públicos Cerca de Mí</h3>
              </div>
              <div className="card-header-actions">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Buscar tachos..."
                    value={searchTermTachos}
                    onChange={(e) => setSearchTermTachos(e.target.value)}
                  />
                </div>
                <button
                  className="filter-btn"
                  onClick={getUserLocation}
                  disabled={locationLoading}
                >
                  <Navigation size={18} />
                  <span>{locationLoading ? "Cargando..." : "Actualizar ubicación"}</span>
                </button>
              </div>
            </div>
            <div className="portal-card-body">
              {userLocation ? (
                <>
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                      <MapPin size={18} />
                      <span>
                        <strong>Tu ubicación:</strong> {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  {/* Componente de Mapa */}
                  <div style={{ height: '500px', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '2rem' }}>
                    <TachosMap
                      tachos={filteredTachosCerca}
                      userLocation={userLocation}
                      onTachoClick={handleNavigateToTacho}
                    />
                  </div>

                  {/* Lista de tachos */}
                  {filteredTachosCerca.length === 0 ? (
                    <div className="empty-state">
                      <MapPin size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#4b5563' }}>
                        No hay tachos públicos cercanos
                      </h4>
                      <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                        Intenta ampliar el radio de búsqueda o actualiza tu ubicación
                      </p>
                    </div>
                  ) : (
                    <div style={{ marginTop: '2rem' }}>
                      <h4 style={{ marginBottom: '1rem', color: '#374151' }}>
                        {filteredTachosCerca.length} tachos encontrados en un radio de 10km
                      </h4>
                      <div className="portal-table-container">
                        <table className="portal-table">
                          <thead>
                            <tr>
                              <th><div className="th-content"><span>Distancia</span></div></th>
                              <th><div className="th-content"><span>Código</span></div></th>
                              <th><div className="th-content"><span>Nombre</span></div></th>
                              <th><div className="th-content"><span>Empresa</span></div></th>
                              <th><div className="th-content"><span>Estado</span></div></th>
                              <th><div className="th-content"><span>Acciones</span></div></th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTachosCerca.map((tacho) => {
                              const distancia = calcularDistancia(
                                userLocation.lat, userLocation.lon,
                                parseFloat(tacho.ubicacion_lat), parseFloat(tacho.ubicacion_lon)
                              );

                              return (
                                <tr key={tacho.id}>
                                  <td>
                                    <span className="distance-badge">
                                      {distancia.toFixed(1)} km
                                    </span>
                                  </td>
                                  <td><span className="table-badge blue">{tacho.codigo}</span></td>
                                  <td>
                                    <div className="table-primary">
                                      <Trash2 size={16} />
                                      <span>{tacho.nombre}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="table-coords">
                                      <Building size={14} />
                                      <span>{tacho.empresa_nombre || "Público"}</span>
                                    </div>
                                  </td>
                                  <td>
                                    <span className={`status-badge ${tacho.estado === 'activo' ? 'active' : 'warning'}`}>
                                      {tacho.estado === 'activo' ? 'Activo' : tacho.estado}
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      onClick={() => navigate(`/tachos/${tacho.id}`)}
                                      className="detail-btn"
                                    >
                                      <Eye size={14} />
                                      <span>Ver</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <MapPin size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#4b5563' }}>
                    Esperando ubicación...
                  </h4>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    Permite el acceso a la ubicación para ver tachos cercanos
                  </p>
                  <button
                    className="filter-btn"
                    onClick={getUserLocation}
                    style={{ marginTop: '1rem' }}
                  >
                    <Navigation size={18} />
                    <span>Obtener ubicación</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vista de DETALLE DE DETECCIÓN */}
      {activeView === "detalle" && selectedDeteccion && (
        <div className="portal-view" style={{ background: '#dcfce7' }}>
          {/* Header con cierre */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', padding: '1.5rem', borderRadius: '12px', marginLeft: '-1.5rem', marginRight: '-1.5rem', marginTop: '-1.5rem', paddingLeft: '2rem', paddingRight: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Brain size={24} color="#8b5cf6" />
                Detalle de Detección
              </h2>
            </div>
            <button
              onClick={handleCloseDeteccionDetail}
              className="portal-action-btn"
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#ffffff' }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Panel Izquierdo - Información */}
            <div className="portal-card" style={{ background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div className="portal-card-header" style={{ background: '#f0fdf4', borderBottom: '2px solid #86efac' }}>
                <h3 className="portal-card-title" style={{ color: '#065f46', margin: 0 }}>Información de la Detección</h3>
              </div>
              <div className="portal-card-body">
                {/* Stats principales */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600, marginBottom: '0.25rem' }}>CONFIANZA IA</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{selectedDeteccion.confianza_ia || 0}%</div>
                  </div>
                  <div style={{ background: '#dcfce7', border: '1px solid #86efac', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600, marginBottom: '0.25rem' }}>CLASIFICACIÓN</div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#10b981', textTransform: 'capitalize', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      {selectedDeteccion.clasificacion === 'organico' && <CheckCircle size={16} />}
                      {selectedDeteccion.clasificacion === 'reciclable' && <Zap size={16} />}
                      {selectedDeteccion.clasificacion === 'inorganico' && <XCircle size={16} />}
                      {selectedDeteccion.clasificacion || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Barra de confianza mejorada */}
                <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>Nivel de Confianza</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: selectedDeteccion.confianza_ia >= 80 ? '#10b981' : selectedDeteccion.confianza_ia >= 60 ? '#f59e0b' : '#ef4444' }}>
                      {selectedDeteccion.confianza_ia || 0}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${selectedDeteccion.confianza_ia || 0}%`,
                        height: '100%',
                        backgroundColor: selectedDeteccion.confianza_ia >= 80 ? '#10b981' : selectedDeteccion.confianza_ia >= 60 ? '#f59e0b' : '#ef4444',
                        transition: 'width 0.5s ease'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Información detallada */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <Trash2 size={18} color="#10b981" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Tacho Asociado</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}>
                        {selectedDeteccion.tacho_nombre || `Tacho ${selectedDeteccion.tacho}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <Calendar size={18} color="#6b7280" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Fecha de Registro</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}>
                        {formatFechaLegible(selectedDeteccion.created_at)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <MapPin size={18} color="#3b82f6" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Ubicación</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}>
                        {getUbicacionFromCoords(selectedDeteccion.ubicacion_lat, selectedDeteccion.ubicacion_lon)}
                      </div>
                    </div>
                  </div>

                  {selectedDeteccion.descripcion && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                      <FileText size={18} color="#8b5cf6" style={{ marginTop: '0.25rem', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.25rem' }}>Descripción</div>
                        <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.5 }}>
                          {selectedDeteccion.descripcion}
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <Target size={18} color="#ec4899" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Coordenadas</div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1f2937', fontFamily: 'monospace' }}>
                        {selectedDeteccion.ubicacion_lat && selectedDeteccion.ubicacion_lon
                          ? `${parseFloat(selectedDeteccion.ubicacion_lat).toFixed(6)}, ${parseFloat(selectedDeteccion.ubicacion_lon).toFixed(6)}`
                          : 'No disponibles'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel Derecho - Imagen y Mapa */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Imagen */}
              {resolveMediaUrl(pickDeteccionImage(selectedDeteccion)) && (
                <div className="portal-card" style={{ background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div className="portal-card-header" style={{ background: '#f0fdf4', borderBottom: '2px solid #86efac' }}>
                    <h3 className="portal-card-title" style={{ color: '#065f46', margin: 0 }}>Imagen Analizada</h3>
                  </div>
                  <div className="portal-card-body" style={{ padding: 0, overflow: 'hidden' }}>
                    <img
                      src={resolveMediaUrl(pickDeteccionImage(selectedDeteccion))}
                      alt="Detección"
                      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '0 0 8px 8px' }}
                    />
                  </div>
                </div>
              )}

              {/* Mapa */}
              {selectedDeteccion.ubicacion_lat && selectedDeteccion.ubicacion_lon && (
                <div className="portal-card" style={{ background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <div className="portal-card-header" style={{ background: '#f0fdf4', borderBottom: '2px solid #86efac' }}>
                    <h3 className="portal-card-title" style={{ color: '#065f46', margin: 0 }}>Ubicación en Mapa</h3>
                  </div>
                  <div className="portal-card-body" style={{ padding: 0, height: '350px', overflow: 'hidden' }}>
                    <MapContainer
                      center={[parseFloat(selectedDeteccion.ubicacion_lat), parseFloat(selectedDeteccion.ubicacion_lon)]}
                      zoom={16}
                      style={{ height: '100%', width: '100%', borderRadius: '0 0 8px 8px' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                      <Marker position={[parseFloat(selectedDeteccion.ubicacion_lat), parseFloat(selectedDeteccion.ubicacion_lon)]}>
                        <Popup>
                          <strong>{selectedDeteccion.tacho_nombre || 'Detección'}</strong><br />
                          {selectedDeteccion.clasificacion && `Tipo: ${selectedDeteccion.clasificacion}`}<br />
                          Confianza: {selectedDeteccion.confianza_ia || 0}%
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vista de ESTADÍSTICAS */}
      {activeView === "estadisticas" && (
        <div className="portal-view">
          <div className="portal-card">
            <div className="portal-card-header">
              <div className="card-header-left">
                <TrendingUp size={24} className="header-icon" />
                <h3 className="portal-card-title">Estadísticas de Detecciones</h3>
              </div>
            </div>
            <div className="portal-card-body">
              <EstadisticasDetecciones
                misDetecciones={misDetecciones}
                deteccionesEmpresa={deteccionesEmpresa}
                deteccionesPublicas={detecciones.filter(det => {
                  const tacho = tachos.find(t => t.id === det.tacho);
                  return tacho?.tipo === 'publico';
                })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Vista de Nueva Detección con IA - USANDO COMPONENTE SEPARADO */}
      {activeView === "nuevaDeteccion" && (
        <div className="portal-view">
          <NuevaDeteccionIA
            capturedImage={capturedImage}
            fileInputRef={fileInputRef}
            userLocation={userLocation}
            onImageCapture={handleImageCapture}
            onOpenCamera={handleOpenCamera}
            onImageUpload={handleImageUpload}
            onOpenFileSelector={handleOpenFileSelector}
            onResetImage={handleResetImage}
            onNewDetection={handleNewDetection}
          />
        </div>
      )}

      {/* MODAL DE CÁMARA */}
      {showCameraModal && (
        <CameraCapture
          onCapture={handleImageCapture}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
}