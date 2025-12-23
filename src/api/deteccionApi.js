// src/api/deteccionApi.js
import axios from 'axios';

// ==================== CONFIGURACIÓN BASE ====================
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

// ==================== AXIOS INSTANCE ====================
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// ==================== ENDPOINTS ====================
export const DETECCION_ENDPOINTS = {
  AI_DETECT: '/api/ia/detect/',
  AI_HEALTH: '/api/ia/health/',
  AI_INFO: '/api/ia/info/',
  AI_STATUS: '/api/ia/status/',
};

// ==================== INFORMACIÓN DE CATEGORÍAS ====================
export const CATEGORY_INFO = {
  organico: {
    label: 'ORGÁNICO',
    icon: '🌱',
    color: '#10b981',
    bgColor: '#d1fae5',
    description: 'Residuo orgánico - Depositar en contenedor verde',
    examples: 'Restos de comida, cáscaras, residuos vegetales',
  },
  reciclable: {
    label: 'RECICLABLE',
    icon: '♻️',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    description: 'Material reciclable - Depositar en contenedor azul',
    examples: 'Plástico, papel, cartón, vidrio, metal',
  },
  inorganico: {
    label: 'INORGÁNICO',
    icon: '🗑️',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    description: 'Residuo no reciclable - Depositar en contenedor gris',
    examples: 'Residuos no reciclables, desechos diversos',
  },
};
//----------------------------------------------------
export const isValidImageFormat = (file) => {
  if (!file) return false;
  if (typeof file === 'string') return file.startsWith('data:image');
  return file.type?.startsWith('image/');
};



export const getImageSize = (file) => {
  if (file instanceof Blob || file instanceof File) {
    return (file.size / 1024 / 1024).toFixed(2);
  }
  if (typeof file === 'string') {
    const base64Length = file.length - (file.indexOf(',') + 1);
    const padding = file.endsWith('==') ? 2 : file.endsWith('=') ? 1 : 0;
    const size = (base64Length * 0.75) - padding;
    return (size / 1024 / 1024).toFixed(2);
  }
  return 0;
};


// ==================== SERVICIOS ====================

export const checkAIHealth = async () => {
  try {
    const { data } = await api.get(DETECCION_ENDPOINTS.AI_HEALTH);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getAIModelInfo = async () => {
  try {
    const { data } = await api.get(DETECCION_ENDPOINTS.AI_INFO);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// ==================== DETECCIÓN IA ====================
export const detectWasteWithAI = async (imagen) => {
  try {
    const formData = new FormData();

    if (typeof imagen === 'string' && imagen.startsWith('data:image')) {
      const blob = await fetch(imagen).then((r) => r.blob());
      formData.append('imagen', blob, 'captura.jpg');
    } else if (imagen instanceof Blob || imagen instanceof File) {
      formData.append('imagen', imagen, imagen.name || 'captura.jpg');
    } else {
      throw new Error('Formato de imagen no válido');
    }

    const { data } = await api.post(
      DETECCION_ENDPOINTS.AI_DETECT,
      formData
      // ❌ NO headers aquí
    );

    // ⚠️ No detección
    if (!data.success && data.no_detection) {
      return {
        success: false,
        noDetection: true,
        message: data.message,
        suggestions: data.suggestions || [],
      };
    }

    if (!data.success) {
      throw new Error(data.error || 'Error del backend');
    }

    const categoria = data.clasificacion_principal.categoria.toLowerCase();
    const info =
      data.category_info || CATEGORY_INFO[categoria] || CATEGORY_INFO.inorganico;

    return {
      success: true,
      result: {
        categoria,
        categoriaLabel: info.label,
        confianza: data.clasificacion_principal.confianza,
        icon: info.icon,
        color: info.color,
        bgColor: info.bgColor,
        descripcion: info.description,
        ejemplos: info.examples,
        tipo: data.tipo,
        topPredicciones: data.top_predicciones || [],
      },
    };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        error: `Servidor (${error.response.status}): ${
          error.response.data?.error || 'Error interno'
        }`,
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  // servicios
  detectWasteWithAI,
  checkAIHealth,
  getAIModelInfo,

  // utils
  isValidImageFormat,

  // constantes
  DETECCION_ENDPOINTS,
  CATEGORY_INFO,
};

