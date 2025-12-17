// src/pages/Detecciones/DeteccionList.jsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Brain, Search, Eye, MapPin, Calendar, Tag, Camera, Upload, Scan, CheckCircle2, X } from "lucide-react";
import api from "../../api/axiosConfig";
import CameraCapture from "../../components/CameraCapture/CameraCapture";
import AIProcessor from "../../components/AIProcessor/AIProcessor";
import "../adminPages.css";

const DeteccionList = () => {
  const [detecciones, setDetecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para IA
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showAIProcessor, setShowAIProcessor] = useState(false);
  const fileInputRef = useRef(null);
  const aiSectionRef = useRef(null);

  const loadDetecciones = async () => {
    try {
      const res = await api.get("/detecciones/");
      setDetecciones(res.data);
    } catch (e) {
      console.error("Error cargando detecciones", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetecciones();
  }, []);

  // FUNCIÓN PARA CAPTURAR IMAGEN DESDE CÁMARA
  const handleImageCapture = (imageData) => {
    setCapturedImage(imageData);
    setShowAIProcessor(true);
    setShowCameraModal(false);
    
    // Scroll automático a la sección de IA
    setTimeout(() => {
      aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // FUNCIÓN PARA ABRIR CÁMARA
  const handleOpenCamera = () => {
    setShowCameraModal(true);
  };

  // FUNCIÓN PARA SUBIR IMAGEN DESDE ARCHIVO
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
        setShowAIProcessor(true);
        
        // Scroll automático
        setTimeout(() => {
          aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  // FUNCIÓN PARA ABRIR SELECTOR DE ARCHIVOS
  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  // FUNCIÓN PARA REINICIAR
  const handleResetImage = () => {
    setCapturedImage(null);
    setShowAIProcessor(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredDetecciones = detecciones.filter((det) =>
    det.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    det.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    det.tacho_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando detecciones...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h2>
            <Brain className="icon-lg" style={{ display: "inline", marginRight: "12px" }} />
            Detecciones de Inteligencia Artificial
          </h2>
          <p className="page-header-subtitle">
            Análisis y clasificación automática de residuos mediante IA
          </p>
        </div>
      </div>

      {/* SECCIÓN DE ANÁLISIS CON IA */}
      <div className="ai-preview-card" style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%)',
        border: '2px solid #e2e8f0',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            <Brain size={16} />
            <span>Análisis con IA en Tiempo Real</span>
          </div>
          
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1a202c',
            margin: '0 0 8px 0'
          }}>
            Clasificador Inteligente de Residuos
          </h3>
          
          <p style={{ 
            fontSize: '14px', 
            color: '#666',
            margin: 0
          }}>
            Sube una foto o usa la cámara para clasificar residuos automáticamente con Roboflow
          </p>
        </div>

        {/* PREVIEW DE IMAGEN */}
        <div style={{
          background: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '20px',
          minHeight: '280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {capturedImage ? (
            <>
              <img 
                src={capturedImage} 
                alt="Preview" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  maxHeight: '400px'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(16, 185, 129, 0.9)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)'
              }}>
                <CheckCircle2 size={16} />
                <span>Imagen lista</span>
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              padding: '40px 20px',
              color: '#9ca3af'
            }}>
              <Camera size={64} style={{ opacity: 0.6 }} />
              <p style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>
                Captura o sube una imagen para analizar
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#6b7280'
              }}>
                <Scan size={16} />
                <span>La IA detectará y clasificará automáticamente</span>
              </div>
            </div>
          )}
        </div>

        {/* BOTONES DE CONTROL */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: capturedImage ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <button 
            onClick={handleOpenCamera}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Camera size={20} />
            <span>Abrir Cámara</span>
          </button>

          <button 
            onClick={handleOpenFileSelector}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Upload size={20} />
            <span>Subir Imagen</span>
          </button>

          {capturedImage && (
            <button 
              onClick={handleResetImage}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 20px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <X size={20} />
              <span>Eliminar</span>
            </button>
          )}
        </div>

        {/* Input oculto para archivos */}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        {/* INFO */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#1e40af'
        }}>
          <Scan size={16} />
          <span>
            {capturedImage 
              ? "Imagen cargada. Desplázate hacia abajo para iniciar el análisis con IA." 
              : "Utiliza la cámara o sube una imagen para clasificar residuos con Roboflow."
            }
          </span>
        </div>
      </div>

      {/* PROCESADOR IA */}
      {showAIProcessor && capturedImage && (
        <div ref={aiSectionRef} className="ai-processor-container" style={{
          background: 'white',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '2px solid #e2e8f0'
        }}>
          <AIProcessor capturedImage={capturedImage} />
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search className="search-icon icon-md" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre, código o tacho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      {filteredDetecciones.length === 0 ? (
        <div className="empty-state">
          <Brain className="empty-state-icon" size={64} />
          <h3>No se encontraron detecciones</h3>
          <p>
            Las detecciones de IA se registrarán automáticamente cuando los
            sensores procesen nuevos datos
          </p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tacho</th>
                <th>Ubicación</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDetecciones.map((d) => (
                <tr key={d.id}>
                  <td className="table-id">#{d.id}</td>
                  <td>
                    <span className="badge badge-info">
                      <Tag className="icon-sm" />
                      {d.codigo}
                    </span>
                  </td>
                  <td className="table-primary">{d.nombre}</td>
                  <td className="table-secondary">{d.tacho_nombre}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin className="icon-sm" style={{ color: "var(--color-primary)" }} />
                      <span className="table-coords">
                        {d.ubicacion_lon}, {d.ubicacion_lat}
                      </span>
                    </div>
                  </td>
                  <td className="table-secondary">
                    {d.descripcion || "Sin descripción"}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Calendar className="icon-sm" style={{ color: "var(--color-gray)" }} />
                      <span className="table-secondary">
                        {new Date(d.fecha_registro).toLocaleDateString("es-EC")}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/detecciones/${d.id}`}
                        className="btn-icon btn-view"
                        title="Ver detalles"
                      >
                        <Eye className="icon-md" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Card */}
      <div className="info-card">
        <div className="info-card-icon">
          <Brain className="icon-lg" />
        </div>
        <div className="info-card-content">
          <h4>Inteligencia Artificial con Roboflow</h4>
          <p>
            El sistema utiliza Roboflow Workflow para identificar y clasificar 
            automáticamente diferentes tipos de residuos en tiempo real, 
            logrando alta precisión en la detección de orgánicos, reciclables e inorgánicos.
          </p>
        </div>
      </div>

      {/* MODAL DE CÁMARA */}
      {showCameraModal && (
        <CameraCapture
          onCapture={handleImageCapture}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
};

export default DeteccionList;