// src/components/AIProcessor.jsx
import { useEffect, useState } from "react";
import { Camera, Zap, Target, AlertCircle, CheckCircle2, XCircle, Info } from "lucide-react";
import {
  detectWasteWithAI,
  checkAIHealth,
  isValidImageFormat,
  getImageSize,
  CATEGORY_INFO,
} from "../../api/deteccionApi";

export default function AIProcessor({ capturedImage }) {
  const [processingStatus, setProcessingStatus] = useState("ready");
  const [detectionResults, setDetectionResults] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);

  useEffect(() => {
    checkServiceStatus();
  }, []);

  useEffect(() => {
    if (capturedImage) {
      setProcessingStatus("ready");
      setDetectionResults(null);
      setErrorInfo(null);
    }
  }, [capturedImage]);

  const checkServiceStatus = async () => {
    const result = await checkAIHealth();
    setServiceStatus(result.data);
    console.log("Estado del servicio:", result.data);
  };

  const handleStartProcessing = async () => {
    // Validar imagen
    if (!isValidImageFormat(capturedImage)) {
      setErrorInfo({
        type: "error",
        message: "Formato de imagen no válido",
        suggestions: ["Asegúrate de usar una imagen JPG, PNG o WebP"]
      });
      setProcessingStatus("error");
      return;
    }

    // Verificar tamaño (opcional)
    const imageSize = getImageSize(capturedImage);
    console.log(`Tamaño de imagen: ${imageSize} MB`);

    setProcessingStatus("processing");
    setErrorInfo(null);

    try {
      const result = await detectWasteWithAI(capturedImage);

      // Caso: No se detectó nada
      if (!result.success && result.noDetection) {
        console.warn("No se detectaron objetos en la imagen");
        setErrorInfo({
          type: "no_detection",
          message: result.message,
          suggestions: result.suggestions
        });
        setProcessingStatus("error");
        return;
      }

      // Caso: Error general
      if (!result.success) {
        setErrorInfo({
          type: "error",
          message: result.error,
          suggestions: result.suggestions || [
            "Verifica tu conexión a internet",
            "Intenta con otra imagen",
            "Contacta al administrador si el problema persiste"
          ]
        });
        setProcessingStatus("error");
        return;
      }

      // Caso: Éxito
      console.log("Resultado procesado:", result.result);
      setDetectionResults(result.result);
      setProcessingStatus("complete");

    } catch (error) {
      console.error("Error inesperado:", error);
      setErrorInfo({
        type: "error",
        message: `Error inesperado: ${error.message}`,
        suggestions: [
          "Intenta recargar la página",
          "Contacta al administrador"
        ]
      });
      setProcessingStatus("error");
    }
  };

  const handleRetry = () => {
    setProcessingStatus("ready");
    setErrorInfo(null);
    setDetectionResults(null);
  };

  if (!capturedImage) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
        <div style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
          padding: '48px', backgroundColor: '#f9fafb', borderRadius: '12px',
          border: '2px dashed #d1d5db'
        }}>
          <Camera size={48} color="#9ca3af" />
          <h4 style={{ margin: 0, fontSize: '18px', color: '#374151', fontWeight: '700' }}>
            No hay imagen para procesar
          </h4>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Captura o sube una imagen para iniciar el análisis con IA
          </p>
          
          {serviceStatus && (
            <div style={{ 
              marginTop: '16px', padding: '8px 16px',
              backgroundColor: serviceStatus.roboflow_available ? '#d1fae5' : '#fee2e2',
              borderRadius: '6px', fontSize: '13px',
              color: serviceStatus.roboflow_available ? '#065f46' : '#991b1b',
              fontWeight: '600'
            }}>
              {serviceStatus.message || 'Verificando servicio...'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#fff', 
      borderRadius: '12px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '2px solid #e5e7eb'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          display: 'flex', alignItems: 'center', gap: '12px',
          margin: '0 0 8px 0', fontSize: '20px', color: '#111827',
          fontWeight: '800', letterSpacing: '-0.5px'
        }}>
          <Zap size={24} color="#10b981" />
          Centro de Procesamiento IA
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
          Análisis en tiempo real con Roboflow Workflow
        </p>
      </div>

      {/* ÁREA DE IMAGEN */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          position: 'relative', 
          borderRadius: '12px', 
          overflow: 'hidden', 
          backgroundColor: '#000',
          border: '3px solid #10b981'
        }}>
          <img 
            src={capturedImage} 
            alt="Imagen para procesar" 
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />

          {/* INDICADOR DE ESTADO */}
          <div style={{ 
            position: 'absolute', top: '16px', right: '16px',
            padding: '8px 16px', borderRadius: '20px',
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', fontWeight: '600', border: '2px solid rgba(255,255,255,0.3)'
          }}>
            {processingStatus === "ready" && (
              <>
                <span style={{ 
                  width: '8px', height: '8px', borderRadius: '50%', 
                  backgroundColor: '#10b981' 
                }}></span>
                <span style={{ color: '#fff' }}>Listo</span>
              </>
            )}
            {processingStatus === "processing" && (
              <>
                <span style={{ 
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: '#3b82f6', animation: 'pulse 1s infinite'
                }}></span>
                <span style={{ color: '#fff' }}>Analizando...</span>
              </>
            )}
            {processingStatus === "complete" && (
              <>
                <CheckCircle2 size={16} color="#10b981" />
                <span style={{ color: '#fff' }}>Completado</span>
              </>
            )}
            {processingStatus === "error" && (
              <>
                <XCircle size={16} color="#ef4444" />
                <span style={{ color: '#fff' }}>Error</span>
              </>
            )}
          </div>
        </div>

        {/* CONTROLES */}
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleStartProcessing}
            disabled={processingStatus === "processing"}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px 28px', fontSize: '16px', fontWeight: '700', color: '#fff',
              backgroundColor: processingStatus === "processing" ? '#9ca3af' : '#10b981',
              border: processingStatus === "processing" ? 'none' : '2px solid #059669',
              borderRadius: '10px',
              cursor: processingStatus === "processing" ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: processingStatus === "processing" ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
              letterSpacing: '0.3px'
            }}
          >
            <Zap size={20} />
            {processingStatus === "processing" ? "Procesando..." : "Iniciar Análisis IA"}
          </button>

          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px',
            fontSize: '13px', color: '#6b7280', border: '1px solid #e5e7eb'
          }}>
            <AlertCircle size={16} />
            <span style={{ fontWeight: '500' }}>Modelo: Roboflow Workflow - Clasificador de Residuos</span>
          </div>
        </div>
      </div>

      {/* MENSAJE DE ERROR / NO DETECCIÓN */}
      {processingStatus === "error" && errorInfo && (
        <div style={{ 
          padding: '24px', borderRadius: '12px', marginBottom: '24px',
          backgroundColor: errorInfo.type === "no_detection" ? '#fef3c7' : '#fee2e2',
          border: `2px solid ${errorInfo.type === "no_detection" ? '#fbbf24' : '#ef4444'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '16px' }}>
            {errorInfo.type === "no_detection" ? (
              <Info size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
            ) : (
              <XCircle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <h4 style={{ 
                margin: '0 0 12px 0', fontSize: '17px', fontWeight: '700',
                color: errorInfo.type === "no_detection" ? '#92400e' : '#991b1b',
                letterSpacing: '0.3px'
              }}>
                {errorInfo.type === "no_detection" ? "No se detectaron objetos" : "Error en el análisis"}
              </h4>
              <p style={{ 
                margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280',
                lineHeight: '1.6'
              }}>
                {errorInfo.message}
              </p>
              
              {errorInfo.suggestions && errorInfo.suggestions.length > 0 && (
                <div>
                  <p style={{ 
                    margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700', 
                    color: '#374151', letterSpacing: '0.3px'
                  }}>
                    Sugerencias:
                  </p>
                  <ul style={{ 
                    margin: 0, paddingLeft: '20px', fontSize: '13px', 
                    color: '#6b7280', lineHeight: '1.8'
                  }}>
                    {errorInfo.suggestions.map((suggestion, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleRetry}
            style={{
              width: '100%', padding: '12px', fontSize: '15px', fontWeight: '700',
              color: '#fff', backgroundColor: '#10b981', border: '2px solid #059669',
              borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
              letterSpacing: '0.3px'
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* ÁREA DE RESULTADOS */}
      {processingStatus === "complete" && detectionResults && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              margin: 0, fontSize: '16px', color: '#374151', 
              fontWeight: '700', letterSpacing: '0.3px'
            }}>
              <Target size={20} />
              Resultados del Análisis
            </h4>
          </div>

          {/* CLASIFICACIÓN PRINCIPAL */}
          <div style={{ 
            padding: '24px', 
            borderLeft: `4px solid ${detectionResults.color}`,
            backgroundColor: detectionResults.bgColor, 
            borderRadius: '12px', 
            marginBottom: '16px',
            border: `2px solid ${detectionResults.color}`
          }}>
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', 
              alignItems: 'center', marginBottom: '12px' 
            }}>
              <span style={{ 
                fontSize: '14px', fontWeight: '600', color: '#6b7280',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <span style={{ 
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: detectionResults.color, color: '#fff',
                  fontWeight: '700', fontSize: '14px'
                }}>{detectionResults.icon}</span>
                Clasificación Principal
              </span>
              <span style={{ 
                fontSize: '14px', fontWeight: '700', color: detectionResults.color,
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                padding: '4px 12px', borderRadius: '6px'
              }}>
                {detectionResults.confianza.toFixed(2)}% confianza
              </span>
            </div>
            
            <div style={{ 
              fontSize: '28px', fontWeight: '800', color: detectionResults.color, 
              marginBottom: '12px', letterSpacing: '0.5px'
            }}>
              {detectionResults.categoriaLabel}
            </div>
            
            {/* Barra de confianza */}
            <div style={{ 
              width: '100%', height: '10px', backgroundColor: 'rgba(0, 0, 0, 0.1)', 
              borderRadius: '5px', overflow: 'hidden', marginBottom: '12px',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                width: `${detectionResults.confianza}%`, height: '100%',
                backgroundColor: detectionResults.color, transition: 'width 0.5s ease'
              }}></div>
            </div>

            <div style={{ fontSize: '14px' }}>
              <p style={{ 
                marginBottom: '10px', color: '#374151', fontWeight: '500',
                lineHeight: '1.6'
              }}>
                <strong>Descripción:</strong> {detectionResults.descripcion}
              </p>
              <p style={{ 
                color: '#6b7280', fontSize: '13px', margin: 0,
                lineHeight: '1.6'
              }}>
                <strong>Ejemplos:</strong> {detectionResults.ejemplos}
              </p>
            </div>
          </div>

          {/* TOP PREDICCIONES */}
          {detectionResults.topPredicciones && detectionResults.topPredicciones.length > 0 && (
            <div style={{ 
              padding: '16px', backgroundColor: '#f9fafb', 
              borderRadius: '8px', marginBottom: '16px',
              border: '2px solid #e5e7eb'
            }}>
              <h5 style={{ 
                margin: '0 0 12px 0', fontSize: '14px', fontWeight: '700',
                color: '#111827', letterSpacing: '0.3px'
              }}>
                Predicciones Principales
              </h5>
              {detectionResults.topPredicciones.slice(0, 3).map((pred, idx) => {
                const catInfo = CATEGORY_INFO[pred.categoria.toLowerCase()] || CATEGORY_INFO.inorganico;
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      marginBottom: '8px', padding: '12px',
                      backgroundColor: catInfo.bgColor, borderRadius: '8px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      border: `2px solid ${catInfo.color}`
                    }}
                  >
                    <span style={{ 
                      fontSize: '14px', fontWeight: '600', color: '#374151',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      <span style={{ fontSize: '18px' }}>{catInfo.icon}</span>
                      {catInfo.label}
                    </span>
                    <span style={{ 
                      fontSize: '14px', fontWeight: '700', color: catInfo.color,
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                      padding: '2px 10px', borderRadius: '6px'
                    }}>
                      {pred.confianza.toFixed(2)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MENSAJE DE INFORMACIÓN */}
      {processingStatus === "ready" && !errorInfo && (
        <div style={{ 
          display: 'flex', alignItems: 'start', gap: '12px',
          padding: '16px', backgroundColor: '#ecfdf5',
          border: '2px solid #10b981', borderRadius: '8px', marginTop: '16px'
        }}>
          <AlertCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ 
            margin: 0, fontSize: '14px', color: '#065f46',
            fontWeight: '500', lineHeight: '1.6'
          }}>
            La imagen está lista. Haz clic en "Iniciar Análisis IA" para clasificar usando el workflow de Roboflow.
          </p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}