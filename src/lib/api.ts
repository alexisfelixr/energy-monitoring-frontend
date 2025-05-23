// Base URL for the API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Make sure the URL has a protocol, if not add https://
const ensureAbsoluteUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

// Ensure we always use an absolute URL with the proper protocol
const ABSOLUTE_API_BASE_URL = ensureAbsoluteUrl(API_BASE_URL);

// Importar nuestro interceptor de autenticación
import { getAuthTokenWithRefresh } from './auth-interceptor';

// Helper function for API requests
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    // Obtener el token de autorización con capacidad de renovación automática
    const token = await getAuthTokenWithRefresh();
    
    // Preparar los headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };
    
    // Añadir el token de autorización si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${ABSOLUTE_API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  
    if (!response.ok) {
      // Si el error es 401 (No autorizado) incluso después de intentar refrescar el token,
      // podríamos redirigir al usuario a la página de login
      if (response.status === 401 && typeof window !== 'undefined') {
        console.error('Error de autenticación incluso después de refrescar el token');
        // Limpiar tokens almacenados
        localStorage.removeItem('auth_tokens');
        // Redireccionar a login
        window.location.href = '/login';
        return null;
      }
      
      console.error(`API error: ${response.statusText}`);
      return null;
    }
  
    return response.json();
  } catch (error) {
    console.error('Error fetching API:', error);
    return null;
  }
}

// Sensors API
export const SensorsAPI = {
  getAll: () => fetchAPI('/sensores'),
  getById: (id: number) => fetchAPI(`/sensores/${id}`),
  getByCentro: (centroId: number) => fetchAPI(`/sensores/centro/${centroId}`),
  getByArea: (areaId: number) => fetchAPI(`/sensores/area/${areaId}`),
};

// Measurements API
export const MedicionesAPI = {
  getAll: (params: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    return fetchAPI(`/mediciones?${queryParams}`);
  },
  getBySensor: (sensorId: number, fecha?: string) => {
    const queryParams = fecha ? `?fecha=${fecha}` : '';
    return fetchAPI(`/mediciones/sensor/${sensorId}${queryParams}`);
  },
  getResumenPorSensor: (sensorId: number, fecha?: string) => {
    const queryParams = fecha ? `?fecha=${fecha}` : '';
    return fetchAPI(`/mediciones/resumen/sensor/${sensorId}${queryParams}`);
  },
  // New endpoint to get all monitoring data for a center from the last 3 hours
  getCentroMonitoringData: (centroId: number) => {
    return fetchAPI(`/mediciones/centro/${centroId}/monitoring`);
  },
  // New endpoint to get historical data with filters
  getHistoricalData: (filters: {
    startDate?: string;
    endDate?: string;
    centroId?: number;
    areaId?: number;
    sensorId?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.centroId) queryParams.append('centroId', filters.centroId.toString());
    if (filters.areaId) queryParams.append('areaId', filters.areaId.toString());
    if (filters.sensorId) queryParams.append('sensorId', filters.sensorId.toString());
    
    return fetchAPI(`/mediciones/historico?${queryParams}`);
  },
};

// Centros API
export const CentrosAPI = {
  getAll: () => fetchAPI('/centros'),
  getById: (id: number) => fetchAPI(`/centros/${id}`),
};

// Areas API
export const AreasAPI = {
  getAll: () => fetchAPI('/areas'),
  getById: (id: number) => fetchAPI(`/areas/${id}`),
  getByCentro: (centroId: number) => fetchAPI(`/areas/centro/${centroId}`),
};

// Types for API responses
export interface Sensor {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  estado: string;
  areaId: number;
  area?: Area;
}

export interface Medicion {
  id: number;
  fecha: string;
  hora: string;
  voltaje: number;
  corriente: number;
  potencia: number;
  energiaConsumida: number;
  sensorId: number;
  sensor?: Sensor;
}

export interface Area {
  id: number;
  nombre: string;
  descripcion: string;
  centroId: number;
}

export interface Centro {
  id: number;
  nombre: string;
  direccion: string;
  descripcion: string;
}

export interface DeviceData {
  name: string;
  status: string;
  consumption: number;
  lastUpdate: string;
}

export interface ResumenSensor {
  promedioVoltaje: number;
  promedioCorriente: number;
  potenciaTotal: number;
  energiaConsumidaTotal: number;
}

// New interface for the center monitoring data response
export interface CentroMonitoringData {
  // Basic center info
  centroId: number;
  centroNombre: string;
  
  // Summary metrics
  consumoTotal: number;
  eficiencia: number;
  
  // Chart data
  voltajeCorrienteSeries: {
    fecha: string;
    hora: string;
    voltaje: number;
    corriente: number;
  }[];
  
  // Device data
  dispositivos: {
    id: number;
    nombre: string;
    estado: string;
    ultimaActualizacion: string;
    consumo: number;
  }[];
  
  // Energy by device data
  energiaPorDispositivo: {
    nombre: string;
    valor: number;
  }[];
  
  // Consumption by type (sample data - actual implementation may vary)
  consumoPorTipo: {
    nombre: string;
    valor: number;
  }[];
}
