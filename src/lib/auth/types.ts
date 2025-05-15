// Tipos para autenticación
export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  estaActivo: boolean;
  fechaCreacion: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
