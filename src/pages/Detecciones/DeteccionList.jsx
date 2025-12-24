import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Brain, Camera, Upload, Calendar, MapPin, Trash2, Scan } from "lucide-react";
import api from "../../api/axiosConfig";
import CameraCapture from "../../components/CameraCapture/CameraCapture";
import AIProcessor from "../../components/AIProcessor/AIProcessor";
import "../adminPages.css";

export default function DeteccionList() {
  const [detecciones, setDetecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para IA
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showAIProcessor, setShowAIProcessor] = useState(false);
  const fileInputRef = useRef(null);
  const aiSectionRef = useRef(null);

  useEffect(() => {
    loadDetecciones();
  }, []);

  const loadDetecciones = () => {
    setLoading(true);
    api.get("/detecciones/")
      .then(res => setDetecciones(res.data))
      .catch(err => console.error("Error cargando detecciones:", err))
      .finally(() => setLoading(false));
  };

  // Funciones para IA
  const handleImageCapture = (imageData) => {
    setCapturedImage(imageData);
    setShowAIProcessor(true);
    setShowCameraModal(false);

    setTimeout(() => {
      aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleOpenCamera = () => {
    setShowCameraModal(true);
  };

  const handleResetImage = () => {
    setCapturedImage(null);
    setShowAIProcessor(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        setShowAIProcessor(true);

        setTimeout(() => {
          aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando detecciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Sección de Análisis con IA */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '2px solid #e5e7eb'
      }}>
        <div style={{
          marginBottom: '24px'
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '20px',
            fontWeight: '700',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Scan size={24} color="#10b981" />
            Análisis con IA
          </h3>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Captura o sube una imagen para clasificar residuos automáticamente
          </p>
        </div>

        {/* Área de Preview o Imagen Capturada */}
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          minHeight: '400px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          border: '3px solid #334155'
        }}>
          {/* Patrón de fondo decorativo */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(45deg, transparent 0%, transparent 49%, rgba(16, 185, 129, 0.02) 50%, transparent 51%, transparent 100%),
              linear-gradient(-45deg, transparent 0%, transparent 49%, rgba(16, 185, 129, 0.02) 50%, transparent 51%, transparent 100%)
            `,
            backgroundSize: '40px 40px',
            opacity: 0.5,
            pointerEvents: 'none'
          }}></div>

          {capturedImage ? (
            <>
              <img
                src={capturedImage}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 1,
                  borderRadius: '8px'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(16, 185, 129, 0.95)',
                color: 'white',
                padding: '10px 18px',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                zIndex: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}>
                <Scan size={16} />
                <span>Imagen lista</span>
              </div>
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 40px',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{
                width: '100px',
                height: '100px',
                margin: '0 auto 28px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px dashed rgba(16, 185, 129, 0.3)',
                animation: 'pulse-border 2s ease-in-out infinite'
              }}>
                <Camera size={48} color="rgba(16, 185, 129, 0.7)" />
              </div>

              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 12px 0',
                letterSpacing: '-0.5px'
              }}>
                Captura una foto o sube una imagen para analizar con IA
              </h3>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                background: 'rgba(16, 185, 129, 0.15)',
                borderRadius: '24px',
                fontSize: '14px',
                color: 'rgba(16, 185, 129, 0.9)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                marginTop: '12px',
                backdropFilter: 'blur(5px)'
              }}>
                <Scan size={18} />
                <span style={{ fontWeight: '500' }}>La IA detectará y clasificará automáticamente</span>
              </div>
            </div>
          )}
        </div>

        {/* Botones de Control */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: capturedImage ? '1fr 1fr auto' : '1fr 1fr',
          gap: '14px',
          marginBottom: '20px'
        }}>
          <button
            onClick={handleOpenCamera}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '18px 28px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
            }}
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
              gap: '10px',
              padding: '18px 28px',
              background: 'white',
              color: '#10b981',
              border: '2px solid #10b981',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#f0fdf4';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
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
                padding: '18px 24px',
                background: '#fee2e2',
                color: '#dc2626',
                border: '2px solid #fecaca',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                letterSpacing: '0.3px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#fecaca';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ✕ Eliminar
            </button>
          )}
        </div>

        {/* Input oculto */}
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
          gap: '14px',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2px solid #86efac',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#166534',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
        }}>
          <Scan size={20} style={{ flexShrink: 0, color: '#10b981' }} />
          <span style={{ fontWeight: '500', lineHeight: '1.5' }}>
            {capturedImage
              ? "✅ Imagen cargada. Desplázate hacia abajo para iniciar el análisis con Roboflow."
              : "💡 Utiliza cámara en vivo o sube una imagen existente para clasificar residuos automáticamente."
            }
          </span>
        </div>

        {/* Procesador IA */}
        {showAIProcessor && capturedImage && (
          <div ref={aiSectionRef} style={{ marginTop: '32px' }}>
            <AIProcessor capturedImage={capturedImage} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-border {
          0%, 100% {
            border-color: rgba(16, 185, 129, 0.3);
            transform: scale(1);
          }
          50% {
            border-color: rgba(16, 185, 129, 0.6);
            transform: scale(1.05);
          }
        }
      `}</style>

      {/* Tabla de Detecciones */}
      <div className="data-card">
        <div className="card-header">
          <h3>Historial de Detecciones</h3>
        </div>

        <div className="table-container">
          {detecciones.length === 0 ? (
            <div className="empty-state">
              <Brain size={64} />
              <h3>No hay detecciones registradas</h3>
              <p>Comienza creando una nueva detección con IA</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Tacho</th>
                  <th>
                    <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Ubicación
                  </th>
                  <th>
                    <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Fecha
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {detecciones.map((det) => (
                  <tr key={det.id}>
                    <td>#{det.id}</td>
                    <td>
                      <span className="badge badge-info">{det.codigo}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Brain size={16} />
                        <span>{det.nombre}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Trash2 size={14} />
                        <span>{det.tacho_nombre || "—"}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                      {det.ubicacion_lon}, {det.ubicacion_lat}
                    </td>
                    <td>
                      {new Date(det.fecha_registro).toLocaleDateString("es-EC")}
                    </td>
                    <td>
                      <Link 
                        to={`/detecciones/${det.id}`} 
                        className="btn btn-sm btn-secondary"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Cámara */}
      {showCameraModal && (
        <CameraCapture
          onCapture={handleImageCapture}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
}