import { useState, useRef, useEffect } from "react";
import { X, Camera, RotateCcw, Loader2 } from "lucide-react";
import "./CameraCapture.css";

const API_URL = 'http://127.0.0.1:8001';

const CATEGORY_INFO = {
  organico: {
    label: "ORGÁNICO", icon: "🌱", color: "#10b981", bgColor: "#d1fae5",
    description: "Residuo orgánico - Depositar en contenedor verde",
    examples: "Restos de comida, cáscaras, residuos vegetales"
  },
  reciclable: {
    label: "RECICLABLE", icon: "♻️", color: "#3b82f6", bgColor: "#dbeafe",
    description: "Material reciclable - Depositar en contenedor azul",
    examples: "Plástico, papel, cartón, vidrio, metal"
  },
  inorganico: {
    label: "INORGÁNICO", icon: "🗑️", color: "#6b7280", bgColor: "#f3f4f6",
    description: "Residuo no reciclable - Depositar en contenedor gris",
    examples: "Residuos no reciclables, desechos diversos"
  }
};

export default function CameraCapture({ onCapture, onClose }) {
  const [mode, setMode] = useState("preview");
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [shouldStartCamera, setShouldStartCamera] = useState(false);

  // Limpiar stream al desmontar
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Iniciar cámara cuando el video esté montado
  useEffect(() => {
    if (shouldStartCamera && mode === "camera" && videoRef.current) {
      const initCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
            setShouldStartCamera(false);
          }
        } catch (error) {
          console.error("Error al acceder a la cámara:", error);
          setError("No se pudo acceder a la cámara. Verifica permisos o conexión.");
          setMode("preview");
          setShouldStartCamera(false);
        }
      };
      
      initCamera();
    }
  }, [shouldStartCamera, mode]);

  const checkCameras = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    if (videoDevices.length === 0) {
      setError("No se detecta ninguna cámara conectada.");
      return false;
    }
    return true;
  };

  const startCamera = async () => {
    if (!(await checkCameras())) return;
    
    setError(null);
    setMode("camera");
    setShouldStartCamera(true);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      canvas.width = width;
      canvas.height = height;
      
      const context = canvas.getContext("2d");
      
      if (video.srcObject) {
        const settings = video.srcObject.getVideoTracks()[0].getSettings();
        if (settings.facingMode === 'user') {
          context.translate(width, 0);
          context.scale(-1, 1);
        }
      }
      
      context.drawImage(video, 0, 0, width, height);
      
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(imageData);
      
      stopCamera();
      setMode("image");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("La imagen es demasiado grande (máximo 10MB)");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
        setMode("image");
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendImage = async () => {
    if (!capturedImage) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("📤 Enviando imagen a Roboflow...");
      
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const file = new File([blob], "captura.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("imagen", file);

      const response = await fetch(`${API_URL}/api/ia/detect/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log("📥 Respuesta del servidor:", data);

      // ⚠️ Caso 1: No se detectó nada
      if (!data.success && data.no_detection) {
        console.warn("⚠️ No se detectaron objetos en la imagen");
        setError(data.message || "No se detectaron objetos en la imagen");
        setResult({
          no_detection: true,
          message: data.message,
          suggestions: data.suggestions || []
        });
        setLoading(false);
        return;
      }

      // ❌ Caso 2: Error general
      if (!data.success) {
        throw new Error(data.error || "Error desconocido del backend");
      }

      // ✅ Caso 3: Detección exitosa
      const categoria = data.clasificacion_principal.categoria.toLowerCase();
      const categoryInfo = data.category_info || CATEGORY_INFO[categoria] || CATEGORY_INFO.inorganico;

      setResult({
        success: true,
        categoria: categoria,
        categoriaLabel: categoryInfo.label,
        confianza: data.clasificacion_principal.confianza,
        icon: categoryInfo.icon,
        color: categoryInfo.color,
        bgColor: categoryInfo.bgColor,
        descripcion: categoryInfo.description,
        ejemplos: categoryInfo.examples,
        topPredicciones: data.top_predicciones || [],
        capturedImage: capturedImage
      });

    } catch (err) {
      console.error("❌ Error analizando imagen:", err);
      setError(`Error al procesar la imagen: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetCamera = () => {
    stopCamera();
    setCapturedImage(null);
    setResult(null);
    setError(null);
    setMode("preview");
    setShouldStartCamera(false);
  };

  const handleClose = () => {
    resetCamera();
    onClose?.();
  };

  return (
    <div className="camera-capture-modal-overlay">
      <div className="camera-capture-modal">
        <div className="camera-capture-header">
          <h3 className="camera-capture-title">
            {result?.success ? "Resultados del Análisis Roboflow" : "Capturar Imagen para Análisis IA"}
          </h3>
          <button
            className="camera-capture-close-btn"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="camera-capture-body">
          {error && !result?.no_detection && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* RESULTADOS DE DETECCIÓN EXITOSA */}
          {result?.success && (
            <div className="result-container">
              <div className="result-image-section">
                <h4>📸 Imagen Analizada</h4>
                <img 
                  src={result.capturedImage}
                  alt="Resultado análisis"
                  className="result-image"
                />
              </div>

              <div className="main-classification">
                <div 
                  className="category-badge"
                  style={{ backgroundColor: result.color }}
                >
                  <span className="category-icon">{result.icon}</span>
                  <span className="category-name">{result.categoriaLabel}</span>
                  <span className="category-confidence">
                    {Math.round(result.confianza)}% confianza
                  </span>
                </div>
                <p className="category-description">{result.descripcion}</p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
                  <strong>💡 Ejemplos:</strong> {result.ejemplos}
                </p>

                {result.topPredicciones && result.topPredicciones.length > 0 && (
                  <div className="detected-items" style={{ marginTop: '20px' }}>
                    <h5>📊 Top Predicciones:</h5>
                    <div className="items-grid">
                      {result.topPredicciones.slice(0, 3).map((pred, index) => {
                        const catInfo = CATEGORY_INFO[pred.categoria] || CATEGORY_INFO.inorganico;
                        return (
                          <div key={index} className="item-card">
                            <div className="item-header">
                              <span className="item-icon">{catInfo.icon}</span>
                              <span className="item-name">{catInfo.label}</span>
                            </div>
                            <div className="item-confidence">
                              <div className="confidence-bar">
                                <div 
                                  className="confidence-fill"
                                  style={{ 
                                    width: `${pred.confianza}%`,
                                    backgroundColor: catInfo.color
                                  }}
                                ></div>
                              </div>
                              <span className="confidence-value">{Math.round(pred.confianza)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="result-actions">
                <button
                  className="btn-action btn-action-primary"
                  onClick={resetCamera}
                >
                  <Camera size={18} />
                  Nuevo Análisis
                </button>
                <button
                  className="btn-action btn-action-secondary"
                  onClick={handleClose}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* MENSAJE DE NO DETECCIÓN */}
          {result?.no_detection && (
            <div className="result-container">
              <div className="result-image-section">
                <h4>📸 Imagen Analizada</h4>
                <img 
                  src={capturedImage}
                  alt="Sin detección"
                  className="result-image"
                />
              </div>

              <div style={{ 
                padding: '20px', borderRadius: '12px', marginBottom: '20px',
                backgroundColor: '#fef3c7', border: '2px solid #fbbf24'
              }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#92400e' }}>
                      No se detectaron objetos
                    </h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>
                      {result.message}
                    </p>
                    
                    {result.suggestions && result.suggestions.length > 0 && (
                      <div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                          💡 Sugerencias:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#6b7280' }}>
                          {result.suggestions.map((suggestion, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="result-actions">
                <button
                  className="btn-action btn-action-primary"
                  onClick={resetCamera}
                >
                  <RotateCcw size={18} />
                  Intentar de nuevo
                </button>
                <button
                  className="btn-action btn-action-secondary"
                  onClick={handleClose}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* MODO PREVIEW */}
          {!result && mode === "preview" && (
            <div className="camera-preview-options">
              <div className="preview-placeholder">
                <div className="placeholder-icon">🤖</div>
                <p className="placeholder-title">Analizador de Residuos IA</p>
                <p className="placeholder-text">
                  Detecta automáticamente residuos con Roboflow Workflow
                </p>
              </div>

              <div className="preview-buttons">
                <button
                  className="btn-preview btn-preview-camera"
                  onClick={startCamera}
                  disabled={loading}
                >
                  <Camera size={24} />
                  <span>Abrir Cámara</span>
                </button>

                <button
                  className="btn-preview btn-preview-upload"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <span style={{ fontSize: "24px" }}>📁</span>
                  <span>Subir Imagen</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          )}

          {/* CÁMARA ACTIVA */}
          {!result && mode === "camera" && (
            <div className="camera-active-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />

              {cameraActive && (
                <>
                  <div className="camera-controls-overlay">
                    <button
                      className="btn-capture"
                      onClick={capturePhoto}
                      title="Tomar foto"
                      disabled={loading}
                    >
                      <span className="capture-dot"></span>
                    </button>
                  </div>

                  <button
                    className="btn-cancel"
                    onClick={resetCamera}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          )}

          {/* IMAGEN CAPTURADA - LISTA PARA ANÁLISIS */}
          {!result && mode === "image" && capturedImage && (
            <div className="image-review-container">
              <div className="image-preview-wrapper">
                <img
                  src={capturedImage}
                  alt="Captura"
                  className="captured-image-preview"
                />
              </div>

              <div className="image-review-info">
                <p className="info-text">✓ Imagen lista para análisis</p>
                <p className="info-subtext">
                  Se analizará con Roboflow Workflow para clasificar el residuo
                </p>
              </div>

              <div className="image-review-buttons">
                <button
                  className="btn-image-action btn-image-send"
                  onClick={handleSendImage}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Analizando con Roboflow...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "18px" }}>🤖</span>
                      Analizar con Roboflow
                    </>
                  )}
                </button>

                <button
                  className="btn-image-action btn-image-retake"
                  onClick={resetCamera}
                  disabled={loading}
                >
                  <RotateCcw size={18} />
                  Tomar otra foto
                </button>
              </div>

              {loading && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                  <p>Procesando imagen con Roboflow...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}