// src/components/CameraCapture.jsx
import { useState, useRef, useEffect } from "react";
import { X, Camera, RotateCcw, Loader2, CheckCircle2 } from "lucide-react";
import "./CameraCapture.css";
import { 
  detectWasteWithAI,
  isValidImageFormat,
  CATEGORY_INFO, // ✅ Importar desde la API
} from "../../api/deteccionApi";

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

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      if (videoDevices.length === 0) {
        setError("No se detecta ninguna cámara conectada.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error verificando cámaras:", error);
      setError("Error al verificar dispositivos de cámara.");
      return false;
    }
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
    if (!file) return;

    if (!isValidImageFormat(file)) {
      setError("Formato de archivo no válido. Usa JPG, PNG o WebP.");
      return;
    }
    
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
    reader.onerror = () => {
      setError("Error al leer el archivo de imagen");
    };
    reader.readAsDataURL(file);
  };

  const handleSendImage = async () => {
    if (!capturedImage) {
      setError("No hay imagen para analizar");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Enviando imagen para análisis...");
      
      const analysisResult = await detectWasteWithAI(capturedImage);

      // Caso: No se detectó nada
      if (!analysisResult.success && analysisResult.noDetection) {
        console.warn("No se detectaron objetos en la imagen");
        setError(analysisResult.message || "No se detectaron objetos en la imagen");
        setResult({
          no_detection: true,
          message: analysisResult.message,
          suggestions: analysisResult.suggestions || []
        });
        return;
      }

      // Caso: Error
      if (!analysisResult.success) {
        throw new Error(analysisResult.error || "Error desconocido al analizar la imagen");
      }

      // Caso: Éxito
      console.log("Análisis completado exitosamente:", analysisResult.result);
      setResult({
        success: true,
        ...analysisResult.result,
        capturedImage: capturedImage
      });

    } catch (err) {
      console.error("Error analizando imagen:", err);
      setError(`Error al procesar la imagen: ${err.message}`);
      setResult(null);
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

  const handleUseResult = () => {
    if (result?.success && result.capturedImage) {
      onCapture?.(result.capturedImage);
      handleClose();
    }
  };

  return (
    <div className="camera-capture-modal-overlay">
      <div className="camera-capture-modal">
        <div className="camera-capture-header">
          <h3 className="camera-capture-title">
            {result?.success ? "Análisis Completado" : "Sistema de Clasificación IA"}
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
              <span className="error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          {/* RESULTADOS DE DETECCIÓN EXITOSA */}
          {result?.success && (
            <div className="result-container">
              <div className="result-image-section">
                <h4>
                  <CheckCircle2 size={20} />
                  Imagen Analizada
                </h4>
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
                    {Math.round(result.confianza)}% Confianza
                  </span>
                </div>
                <p className="category-description">{result.descripcion}</p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
                  <strong>Ejemplos:</strong> {result.ejemplos}
                </p>

                {result.topPredicciones && result.topPredicciones.length > 0 && (
                  <div className="detected-items">
                    <h5>Predicciones Principales</h5>
                    <div className="items-grid">
                      {result.topPredicciones.slice(0, 3).map((pred, index) => {
                        // ✅ FIX: Convertir a lowercase para coincidir con las keys de CATEGORY_INFO
                        const catInfo = CATEGORY_INFO[pred.categoria.toLowerCase()] || CATEGORY_INFO.inorganico;
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
                  onClick={handleUseResult}
                >
                  <CheckCircle2 size={18} />
                  Usar este Resultado
                </button>
                <button
                  className="btn-action btn-action-secondary"
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
                <h4>
                  <CheckCircle2 size={20} />
                  Imagen Analizada
                </h4>
                <img 
                  src={capturedImage}
                  alt="Sin detección"
                  className="result-image"
                />
              </div>

              <div style={{ 
                padding: '24px', borderRadius: '12px', marginBottom: '24px',
                backgroundColor: '#fef3c7', border: '2px solid #fbbf24'
              }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '16px' }}>
                  <span style={{ 
                    fontSize: '32px', 
                    fontWeight: '700',
                    color: '#f59e0b',
                    lineHeight: '1'
                  }}>!</span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '17px', 
                      fontWeight: '700', 
                      color: '#92400e',
                      letterSpacing: '0.3px'
                    }}>
                      No se detectaron objetos
                    </h4>
                    <p style={{ 
                      margin: '0 0 16px 0', 
                      fontSize: '14px', 
                      color: '#6b7280',
                      lineHeight: '1.6'
                    }}>
                      {result.message}
                    </p>
                    
                    {result.suggestions && result.suggestions.length > 0 && (
                      <div>
                        <p style={{ 
                          margin: '0 0 10px 0', 
                          fontSize: '13px', 
                          fontWeight: '700', 
                          color: '#374151',
                          letterSpacing: '0.3px'
                        }}>
                          Sugerencias:
                        </p>
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: '20px', 
                          fontSize: '13px', 
                          color: '#6b7280',
                          lineHeight: '1.8'
                        }}>
                          {result.suggestions.map((suggestion, idx) => (
                            <li key={idx} style={{ marginBottom: '6px' }}>{suggestion}</li>
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
                <div className="placeholder-icon">IA</div>
                <p className="placeholder-title">Sistema de Clasificación</p>
                <p className="placeholder-text">
                  Clasificación automática de residuos mediante inteligencia artificial
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
                  <span style={{ fontSize: "24px" }}>↑</span>
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
                      title="Capturar"
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
                <p className="info-text">Imagen lista para análisis</p>
                <p className="info-subtext">
                  El sistema analizará la imagen mediante inteligencia artificial
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
                      Analizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Analizar Imagen
                    </>
                  )}
                </button>

                <button
                  className="btn-image-action btn-image-retake"
                  onClick={resetCamera}
                  disabled={loading}
                >
                  <RotateCcw size={18} />
                  Capturar otra
                </button>
              </div>

              {loading && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                  <p>Procesando imagen con IA...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}