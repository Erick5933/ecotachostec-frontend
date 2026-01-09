// src/components/NuevaDeteccionIA/NuevaDeteccionIA.jsx
import { useRef, useState, useEffect } from "react";
import AIProcessor from "../../components/AIProcessor/AIProcessor";
import Webcam from "react-webcam";
import {
  Camera, Upload, X, Scan, CheckCircle2,
  Brain, Sparkles, Target, Maximize2, Video,
  FlipHorizontal, Power, AlertCircle
} from "lucide-react";
import "./NuevaDeteccionIA.css";

const NuevaDeteccionIA = ({
  capturedImage,
  fileInputRef,
  userLocation,
  onImageCapture,
  onImageUpload,
  onResetImage,
  onNewDetection,
}) => {
  const aiSectionRef = useRef(null);
  const webcamRef = useRef(null);

  // Nuevos estados para la cámara
  const [usingCamera, setUsingCamera] = useState(false);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [cameraError, setCameraError] = useState(null);

  // Detectar dispositivos de cámara disponibles
  useEffect(() => {
    const getCameraDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length > 0) {
          setCameraDevices(videoDevices);
          // Detectar si hay cámara trasera (environment)
          const rearCamera = videoDevices.find(device =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
          );
          setSelectedCamera(rearCamera?.deviceId || videoDevices[0].deviceId);
        } else {
          setCameraError("No se detectaron cámaras disponibles");
        }
      } catch (error) {
        console.error("Error al detectar cámaras:", error);
        setCameraError("Error al acceder a los dispositivos de cámara");
      }
    };

    getCameraDevices();
  }, []);

  const handleOpenCamera = () => {
    setUsingCamera(true);
    setCapturedImage(null);
    setCameraError(null);
  };

  const handleCapture = () => {
    if (webcamRef.current) {
      try {
        const imageSrc = webcamRef.current.getScreenshot({
          width: 1920,
          height: 1080,
          screenshotQuality: 0.9
        });

        if (imageSrc) {
          onImageCapture(imageSrc);
          setUsingCamera(false);
          scrollToAISection();
        } else {
          setCameraError("Error al capturar la imagen");
        }
      } catch (error) {
        console.error("Error al capturar:", error);
        setCameraError("Error al capturar la imagen");
      }
    }
  };

  const handleCloseCamera = () => {
    setUsingCamera(false);
    setCameraError(null);
  };

  const handleImageUpload = (e) => {
    onImageUpload(e);
    scrollToAISection();
  };

  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  const scrollToAISection = () => {
    setTimeout(() => {
      aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = document.querySelector('.camera-container');
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Detectar cambios en fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="nueva-deteccion-container">
      {/* SECCIÓN DE ANÁLISIS CON IA */}
      <div className="detection-header">
        <div className="detection-badge">
          <Scan size={16} />
          <span>Probá Nuestra IA</span>
        </div>

        <h2 className="detection-title">
          Clasificación Inteligente de Residuos
        </h2>

        <p className="detection-subtitle">
          Captura o sube una foto para que nuestra IA analice y clasifique automáticamente
          el tipo de residuo. La detección se guardará solo en tu cuenta personal.
        </p>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="detection-main-card">
        {/* ÁREA DE PREVIEW - CÁMARA O IMAGEN */}
        <div className="detection-preview">
          {usingCamera ? (
            <div className="camera-container">
              {cameraError ? (
                <div className="camera-error">
                  <Video size={48} />
                  <h4>Error de Cámara</h4>
                  <p>{cameraError}</p>
                  <button
                    onClick={handleCloseCamera}
                    className="camera-error-btn"
                  >
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
                      facingMode: facingMode,
                      width: { ideal: 1920 },
                      height: { ideal: 1080 }
                    }}
                    className="camera-feed"
                    onUserMediaError={(error) => {
                      console.error("Error de cámara:", error);
                      setCameraError("No se pudo acceder a la cámara");
                    }}
                  />

                  {/* GUIAS DE ENCUADRE */}
                  <div className="camera-guides">
                    <div className="guide-center"></div>
                    <div className="guide-corner tl"></div>
                    <div className="guide-corner tr"></div>
                    <div className="guide-corner bl"></div>
                    <div className="guide-corner br"></div>
                  </div>

                  {/* CONTROLES DE CÁMARA */}
                  <div className="camera-controls">
                    <div className="camera-control-group">
                      <button
                        onClick={toggleCamera}
                        className="camera-control-btn"
                        title="Cambiar cámara"
                      >
                        <FlipHorizontal size={20} />
                      </button>

                      <button
                        onClick={toggleFullscreen}
                        className="camera-control-btn"
                        title={isFullscreen ? "Salir pantalla completa" : "Pantalla completa"}
                      >
                        <Maximize2 size={20} />
                      </button>
                    </div>

                    <button
                      onClick={handleCapture}
                      className="camera-capture-btn"
                      title="Tomar foto"
                    >
                      <div className="capture-btn-inner">
                        <Camera size={24} />
                      </div>
                    </button>

                    <button
                      onClick={handleCloseCamera}
                      className="camera-control-btn danger"
                      title="Cerrar cámara"
                    >
                      <Power size={20} />
                    </button>
                  </div>

                  {/* INFO DE CÁMARA */}
                  <div className="camera-info">
                    <div className="camera-info-badge">
                      <Video size={14} />
                      <span>
                        {facingMode === "environment" ? "Cámara trasera" : "Cámara frontal"}
                      </span>
                    </div>
                    <div className="camera-tip">
                      <Target size={12} />
                      <span>Coloca el residuo en el centro del marco</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : capturedImage ? (
            <>
              <img
                src={capturedImage}
                alt="Preview"
                className="preview-image"
              />
              <div className="preview-badge">
                <CheckCircle2 size={16} />
                <span>Imagen lista para análisis</span>
              </div>
            </>
          ) : (
            <div className="preview-empty">
              <div className="preview-icon">
                <Camera size={48} />
              </div>

              <h3 className="preview-title">
                Captura una foto o sube una imagen para analizar con IA
              </h3>

              <div className="preview-info">
                <Scan size={18} />
                <span>La IA clasificará automáticamente el tipo de residuo</span>
              </div>
            </div>
          )}
        </div>

        {/* BOTONES DE CONTROL */}
        <div className={`detection-controls ${capturedImage ? 'has-image' : ''}`}>
          {!usingCamera && (
            <>
              <button
                onClick={handleOpenCamera}
                className="control-btn camera-btn"
                disabled={cameraDevices.length === 0}
              >
                <Camera size={20} />
                <span>
                  {capturedImage ? 'Tomar otra foto' :
                   cameraDevices.length > 0 ? 'Abrir Cámara' : 'Sin cámara'}
                </span>
              </button>

              <button
                onClick={handleOpenFileSelector}
                className="control-btn upload-btn"
              >
                <Upload size={20} />
                <span>{capturedImage ? 'Subir otra imagen' : 'Subir Imagen'}</span>
              </button>

              {capturedImage && (
                <button
                  onClick={onResetImage}
                  className="control-btn reset-btn"
                >
                  <X size={20} />
                  <span>Eliminar</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* MENSAJE SI NO HAY CÁMARAS */}
        {cameraDevices.length === 0 && !cameraError && (
          <div className="camera-warning">
            <AlertCircle size={16} />
            <span>No se detectaron cámaras disponibles. Usa la opción de subir imagen.</span>
          </div>
        )}

        {/* Input oculto para archivos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="file-input-hidden"
          capture="environment"
        />

        {/* INFO */}
        <div className="detection-info">
          <Scan size={20} className="info-icon" />
          <span className="info-text">
            {usingCamera
              ? "🔍 Enfoca el residuo en el centro del marco para una mejor detección"
              : capturedImage
              ? "✅ Imagen cargada. La detección se guardará solo en tu cuenta personal."
              : "💡 Utiliza cámara en vivo o sube una imagen existente para clasificar residuos automáticamente."
            }
          </span>
        </div>

        {/* SELECCIÓN DE CÁMARA (solo si hay múltiples) */}
        {cameraDevices.length > 1 && !usingCamera && (
          <div className="camera-selector">
            <label className="camera-selector-label">
              <Video size={16} />
              <span>Seleccionar cámara:</span>
            </label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="camera-select"
            >
              {cameraDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Cámara ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* PROCESADOR IA MODIFICADO */}
      {capturedImage && !usingCamera && (
        <div ref={aiSectionRef} className="ai-processor-section">
          <div className="ai-processor-card">
            <AIProcessor
              capturedImage={capturedImage}
              onNewDetection={onNewDetection}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NuevaDeteccionIA;