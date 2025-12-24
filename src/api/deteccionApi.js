// src/api/deteccionApi.js
import axiosInstance from "./axiosConfig.js";

// ==================== CRUD DETECCIONES ====================
export const getDetecciones = () => axiosInstance.get("/detecciones/");
export const getDeteccionById = (id) => axiosInstance.get(`/detecciones/${id}/`);
export const createDeteccion = (data) => axiosInstance.post("/detecciones/", data);
export const updateDeteccion = (id, data) => axiosInstance.put(`/detecciones/${id}/`, data);
export const deleteDeteccion = (id) => axiosInstance.delete(`/detecciones/${id}/`);

// ==================== ENDPOINTS ====================
export const DETECCION_ENDPOINTS = {
  DETECCIONES: "/detecciones/",
  AI_DETECT: "/ia/detect/",  // Cambiado de /ai/detect/ a /ia/detect/
  AI_HEALTH: "/ia/health/",  // Cambiado de /ai/health/ a /ia/health/
  AI_INFO: "/ia/info/",      // Cambiado de /ai/info/ a /ia/info/
  AI_STATUS: "/ia/status/",  // Cambiado de /ai/status/ a /ia/status/
  };

// ==================== UTILIDADES ====================
export const isValidImageFormat = (file) => {
  if (!file) return false;

  // base64
  if (typeof file === "string") {
    return file.startsWith("data:image/");
  }

  // File o Blob
  return file.type?.startsWith("image/");
};

// ==================== CATEGORÍAS ====================
export const CATEGORY_INFO = {
  organico: {
    label: "ORGÁNICO",
    icon: "O",
    color: "#10b981",
    bgColor: "#d1fae5",
    description: "Residuo orgánico",
    examples: "Restos de comida, cáscaras",
  },
  reciclable: {
    label: "RECICLABLE",
    icon: "R",
    color: "#3b82f6",
    bgColor: "#dbeafe",
    description: "Residuo reciclable",
    examples: "Plástico, cartón, vidrio",
  },
  inorganico: {
    label: "INORGÁNICO",
    icon: "I",
    color: "#6b7280",
    bgColor: "#f3f4f6",
    description: "Residuo no reciclable",
    examples: "Desechos varios",
  },
};

// ==================== IA - DETECCIÓN CON ROBOFLOW ====================
export const detectWasteWithAI = async (imagen) => {
  try {
    console.log("🚀 [detectWasteWithAI] Iniciando detección...");

    const formData = new FormData();

    // Convertir imagen base64 a blob si es necesario
    if (typeof imagen === "string") {
      console.log("📸 [detectWasteWithAI] Convirtiendo base64 a blob...");
      const blob = await fetch(imagen).then((r) => r.blob());
      formData.append("imagen", blob, "captura.jpg");
    } else {
      formData.append("imagen", imagen);
    }

    console.log(`📡 [detectWasteWithAI] POST ${DETECCION_ENDPOINTS.AI_DETECT}`);

    const { data } = await axiosInstance.post(
      DETECCION_ENDPOINTS.AI_DETECT,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    console.log("✅ [detectWasteWithAI] Respuesta exitosa:", data);

    return { success: true, ...data };
  } catch (error) {
    console.error("❌ [detectWasteWithAI] Error:", error);
    
    // Log detallado del error
    if (error.response) {
      console.error("📡 Status:", error.response.status);
      console.error("📡 Data:", error.response.data);
      console.error("📡 Headers:", error.response.headers);
    } else if (error.request) {
      console.error("📡 No response received:", error.request);
    } else {
      console.error("📡 Error message:", error.message);
    }

    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Error en detección IA",
    };
  }
};

// ==================== IA HEALTH ====================
export const checkAIHealth = async () => {
  try {
    console.log("🏥 [checkAIHealth] Verificando estado del servicio...");
    const { data } = await axiosInstance.get(DETECCION_ENDPOINTS.AI_HEALTH);
    console.log("✅ [checkAIHealth] Servicio operacional:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ [checkAIHealth] Error:", error);
    return { success: false, error: error.message };
  }
};

// ==================== EXPORT DEFAULT ====================
export default {
  detectWasteWithAI,
  isValidImageFormat,
  CATEGORY_INFO,
  getDetecciones,
  getDeteccionById,
  createDeteccion,
  updateDeteccion,
  deleteDeteccion,
  checkAIHealth,
};