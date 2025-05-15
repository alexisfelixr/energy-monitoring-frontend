import { LoginRequest, RegisterRequest, AuthTokens, User, RefreshTokenRequest } from './types';

// Ensure the API URL always includes the protocol
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Make sure the URL has a protocol, if not add https://
const ensureAbsoluteUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

const ABSOLUTE_API_URL = ensureAbsoluteUrl(API_URL);

export class AuthAPI {
  // Almacenamiento de tokens y usuario
  private static getTokens(): AuthTokens | null {
    if (typeof window === 'undefined') return null;
    
    const tokensStr = localStorage.getItem('auth_tokens');
    if (!tokensStr) return null;
    
    try {
      return JSON.parse(tokensStr) as AuthTokens;
    } catch (e) {
      console.error('Error al obtener tokens:', e);
      localStorage.removeItem('auth_tokens');
      return null;
    }
  }
  
  public static getCurrentUser(): User | null {
    const tokens = this.getTokens();
    return tokens?.user || null;
  }

  private static saveTokens(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    }
  }

  private static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_tokens');
    }
  }

  private static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const tokens = this.getTokens();
    
    if (tokens?.accessToken) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${tokens.accessToken}`
      };
    }
    
    // Make sure we're using absolute URLs
    const absoluteUrl = url.startsWith('http') ? url : `${ABSOLUTE_API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    return fetch(absoluteUrl, options);
  }

  // Métodos de autenticación
  static async login(loginData: LoginRequest): Promise<AuthTokens> {
    const response = await fetch(`${ABSOLUTE_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    const tokens = await response.json();

    // await this.getProfile();
    
    // El backend ahora devuelve los datos del usuario junto con los tokens
    
    this.saveTokens(tokens);
    return tokens;
  }

  static async register(registerData: RegisterRequest): Promise<AuthTokens> {
    const response = await fetch(`${ABSOLUTE_API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al registrar usuario');
    }

    const tokens = await response.json();
    
    // El backend ahora devuelve los datos del usuario junto con los tokens
    
    this.saveTokens(tokens);
    return tokens;
  }

  static async logout(): Promise<void> {
    const tokens = this.getTokens();
    if (!tokens) return;

    try {
      await this.fetchWithAuth(`${ABSOLUTE_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken })
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      this.clearTokens();
    }
  }

  static async refreshToken(): Promise<AuthTokens | null> {
    const tokens = this.getTokens();
    if (!tokens?.refreshToken) return null;

    try {
      const refreshRequest: RefreshTokenRequest = {
        refreshToken: tokens.refreshToken
      };

      const response = await fetch(`${ABSOLUTE_API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(refreshRequest)
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const newTokens = await response.json();

      this.saveTokens(newTokens);
      return newTokens;
    } catch (error) {
      console.error('Error al renovar token:', error);
      this.clearTokens();
      return null;
    }
  }

  static async getProfile(): Promise<User | null> {
    // Si ya tenemos los datos del usuario en el almacenamiento, usarlos
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      return currentUser;
    }
    
    // Si no tenemos los datos, obtenerlos del API
    try {
      const response = await this.fetchWithAuth(`${ABSOLUTE_API_URL}/auth/profile`);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado, intentar refresh
          const newTokens = await this.refreshToken();
          if (newTokens) {
            // Si ya tenemos los datos del usuario en los nuevos tokens, usarlos
            if (newTokens.user) {
              return newTokens.user;
            }
            
            // Sino, reintentar con el nuevo token
            const retryResponse = await this.fetchWithAuth(`${ABSOLUTE_API_URL}/auth/profile`);
            if (retryResponse.ok) {
              return await retryResponse.json();
            }
          }
        }
        return null;
      }
      
      const user = await response.json();
      
      // Actualizar los tokens con los datos del usuario
      const tokens = this.getTokens();
      if (tokens) {
        tokens.user = user;
        this.saveTokens(tokens);
      }
      
      return user;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return !!this.getTokens()?.accessToken;
  }
}
