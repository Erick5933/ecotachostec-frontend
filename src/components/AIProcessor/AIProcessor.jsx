import { useState, useEffect } from "react";
import { Camera, Zap, Target, AlertCircle, CheckCircle2, Download, XCircle, Info } from "lucide-react";

export const AI_DETECT_URL = "http://127.0.0.1:8001/api/ia/detect/";
export const AI_STATUS_URL = "http://127.0.0.1:8001/api/ia/health/";

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
    try {
      const response = await fetch(AI_STATUS_URL);
      const data = await response.json();
      setServiceStatus(data);
      console.log("🔍 Estado del servicio:", data);
    } catch (error) {
      console.error("❌ Error verificando estado del servicio:", error);
      setServiceStatus({ status: 'error', message: 'No se pudo conectar con el backend' });
    }
  };

  const handleStartProcessing = async () => {
    setProcessingStatus("processing");
    setErrorInfo(null);

    try {
      const formData = new FormData();
      const imageBlob = await fetch(capturedImage).then(res => res.blob());
      console.log("📤 Enviando imagen a Roboflow...");
      console.log("📦 Tamaño del blob:", imageBlob.size, "bytes");
      formData.append("imagen", imageBlob, "captura.jpg");

      const response = await fetch(AI_DETECT_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();
      console.log("📥 Respuesta del servidor:", data);

      // ⚠️ Caso 1: No se detectó nada (predictions vacío)
      if (!data.success && data.no_detection) {
        console.warn("⚠️ No se detectaron objetos en la imagen");
        setErrorInfo({
          type: "no_detection",
          message: data.message || "No se detectaron objetos en la imagen",
          suggestions: data.suggestions || [
            "Asegúrate de que el objeto esté bien iluminado",
            "Intenta acercar más la cámara al objeto",
            "Verifica que el objeto esté en el centro de la imagen"
          ]
        });
        setProcessingStatus("error");
        return;
      }

      // ❌ Caso 2: Error general
      if (!data.success) {
        throw new Error(data.error || "Error desconocido del backend");
      }

      // ✅ Caso 3: Detección exitosa
      const categoria = data.clasificacion_principal.categoria.toLowerCase();
      const categoryInfo = data.category_info || CATEGORY_INFO[categoria] || CATEGORY_INFO.inorganico;

      const resultado = {
        categoria: categoria,
        categoriaLabel: categoryInfo.label,
        confianza: data.clasificacion_principal.confianza,
        icon: categoryInfo.icon,
        color: categoryInfo.color,
        bgColor: categoryInfo.bgColor,
        descripcion: categoryInfo.description,
        ejemplos: categoryInfo.examples,
        tipo: data.tipo || "clasificacion",
        topPredicciones: data.top_predicciones || [],
        roboflowRaw: data.roboflow_raw
      };

      console.log("✅ Resultado procesado:", resultado);
      setDetectionResults(resultado);
      setProcessingStatus("complete");

    } catch (error) {
      console.error("❌ Error analizando imagen:", error);
      setErrorInfo({
        type: "error",
        message: `Error al procesar la imagen: ${error.message}`,
        suggestions: [
          "Verifica tu conexión a internet",
          "Intenta con otra imagen",
          "Contacta al administrador si el problema persiste"
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
          <h4 style={{ margin: 0, fontSize: '18px', color: '#374151' }}>No hay imagen para procesar</h4>
          <p style={{ margin: 0, fontSize: '14px' }}>Captura o sube una imagen para iniciar el análisis con IA</p>
          
          {serviceStatus && (
            <div style={{ 
              marginTop: '16px', padding: '8px 16px',
              backgroundColor: serviceStatus.roboflow_available ? '#d1fae5' : '#fee2e2',
              borderRadius: '6px', fontSize: '13px',
              color: serviceStatus.roboflow_available ? '#065f46' : '#991b1b'
            }}>
              {serviceStatus.message || 'Verificando servicio...'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ 
          display: 'flex', alignItems: 'center', gap: '12px',
          margin: '0 0 8px 0', fontSize: '20px', color: '#111827'
        }}>
          <Zap size={24} color="#f59e0b" />
          Centro de Procesamiento IA - Roboflow
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          Análisis en tiempo real con Roboflow Workflow
        </p>
      </div>

      {/* ÁREA DE IMAGEN */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000' }}>
          <img 
            src={capturedImage} 
            alt="Imagen para procesar" 
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />

          {/* INDICADOR DE ESTADO */}
          <div style={{ 
            position: 'absolute', top: '16px', right: '16px',
            padding: '8px 16px', borderRadius: '20px',
            backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '14px', fontWeight: '500'
          }}>
            {processingStatus === "ready" && (
              <>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                <span style={{ color: '#fff' }}>Listo para procesar</span>
              </>
            )}
            {processingStatus === "processing" && (
              <>
                <span style={{ 
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: '#f59e0b', animation: 'pulse 1s infinite'
                }}></span>
                <span style={{ color: '#fff' }}>Analizando con Roboflow...</span>
              </>
            )}
            {processingStatus === "complete" && (
              <>
                <CheckCircle2 size={16} color="#10b981" />
                <span style={{ color: '#fff' }}>Análisis completado</span>
              </>
            )}
            {processingStatus === "error" && (
              <>
                <XCircle size={16} color="#ef4444" />
                <span style={{ color: '#fff' }}>No detectado</span>
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
              padding: '12px 24px', fontSize: '16px', fontWeight: '600', color: '#fff',
              backgroundColor: processingStatus === "processing" ? '#9ca3af' : '#f59e0b',
              border: 'none', borderRadius: '8px',
              cursor: processingStatus === "processing" ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: processingStatus === "processing" ? 'none' : '0 4px 6px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Zap size={20} />
            {processingStatus === "processing" ? "Procesando..." : "Iniciar Análisis con Roboflow"}
          </button>

          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px',
            fontSize: '13px', color: '#6b7280'
          }}>
            <AlertCircle size={16} />
            <span>Modelo: Roboflow Workflow - Clasificador de Residuos</span>
          </div>
        </div>
      </div>

      {/* MENSAJE DE ERROR / NO DETECCIÓN */}
      {processingStatus === "error" && errorInfo && (
        <div style={{ 
          padding: '20px', borderRadius: '12px', marginBottom: '24px',
          backgroundColor: errorInfo.type === "no_detection" ? '#fef3c7' : '#fee2e2',
          border: `2px solid ${errorInfo.type === "no_detection" ? '#fbbf24' : '#ef4444'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
            {errorInfo.type === "no_detection" ? (
              <Info size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
            ) : (
              <XCircle size={24} color="#ef4444" style={{ flexShrink: 0 }} />
            )}
            <div style={{ flex: 1 }}>
              <h4 style={{ 
                margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600',
                color: errorInfo.type === "no_detection" ? '#92400e' : '#991b1b'
              }}>
                {errorInfo.type === "no_detection" ? "No se detectaron objetos" : "Error en el análisis"}
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280' }}>
                {errorInfo.message}
              </p>
              
              {errorInfo.suggestions && errorInfo.suggestions.length > 0 && (
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                    💡 Sugerencias:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#6b7280' }}>
                    {errorInfo.suggestions.map((suggestion, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleRetry}
            style={{
              width: '100%', padding: '10px', fontSize: '14px', fontWeight: '600',
              color: '#fff', backgroundColor: '#3b82f6', border: 'none',
              borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            🔄 Intentar de nuevo
          </button>
        </div>
      )}

      {/* ÁREA DE RESULTADOS */}
      {processingStatus === "complete" && detectionResults && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '16px', color: '#374151' }}>
              <Target size={20} />
              Resultados del Análisis
            </h4>
          </div>

          {/* CLASIFICACIÓN PRINCIPAL */}
          <div style={{ 
            padding: '20px', borderLeft: `4px solid ${detectionResults.color}`,
            backgroundColor: detectionResults.bgColor, borderRadius: '8px', marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
                {detectionResults.icon} Clasificación Principal
              </span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: detectionResults.color }}>
                {detectionResults.confianza.toFixed(2)}% confianza
              </span>
            </div>
            
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: detectionResults.color, marginBottom: '12px' }}>
              {detectionResults.categoriaLabel}
            </div>
            
            {/* Barra de confianza */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ 
                width: `${detectionResults.confianza}%`, height: '100%',
                backgroundColor: detectionResults.color, transition: 'width 0.5s ease'
              }}></div>
            </div>

            <div style={{ fontSize: '14px' }}>
              <p style={{ marginBottom: '8px', color: '#374151' }}>
                <strong>📋 Descripción:</strong> {detectionResults.descripcion}
              </p>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                <strong>💡 Ejemplos:</strong> {detectionResults.ejemplos}
              </p>
            </div>
          </div>

          {/* TOP PREDICCIONES */}
          {detectionResults.topPredicciones && detectionResults.topPredicciones.length > 0 && (
            <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>📊 Top Predicciones</h5>
              {detectionResults.topPredicciones.slice(0, 3).map((pred, idx) => {
                const catInfo = CATEGORY_INFO[pred.categoria.toLowerCase()] || CATEGORY_INFO.inorganico;
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      marginBottom: '8px', padding: '10px',
                      backgroundColor: catInfo.bgColor, borderRadius: '6px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{catInfo.icon} {catInfo.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: catInfo.color }}>
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
          padding: '16px', backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe', borderRadius: '8px', marginTop: '16px'
        }}>
          <AlertCircle size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
            La imagen está lista. Haz clic en "Iniciar Análisis con Roboflow" para clasificar usando el workflow de Roboflow.
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