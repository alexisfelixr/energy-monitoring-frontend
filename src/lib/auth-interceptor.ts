import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: number;
  email: string;
  nombre: string;
  apellido: string;
  exp: number;
  iat: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Check if token is expired or about to expire (within 5 minutes)
export const isTokenExpiredOrClose = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    // Current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Consider token as expired if it's within 5 minutes (300 seconds) of expiration
    return decoded.exp <= currentTime + 300;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // If there's an error, assume token is expired
  }
};

// Function to refresh tokens using the refresh token
export const refreshTokens = async (): Promise<boolean> => {
  try {
    // Get tokens from localStorage
    const tokensStr = localStorage.getItem('auth_tokens');
    if (!tokensStr) return false;
    
    const tokens: AuthTokens = JSON.parse(tokensStr);
    
    // Call the refresh token endpoint
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    
    if (!response.ok) {
      console.error('Failed to refresh token:', response.statusText);
      // Clear tokens if refresh fails - user will need to login again
      localStorage.removeItem('auth_tokens');
      
      // Redirect to login page if we're in the browser
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return false;
    }
    
    // Store new tokens in localStorage
    const newTokens = await response.json();
    localStorage.setItem('auth_tokens', JSON.stringify({
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken
    }));
    
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Enhanced function to get auth token with refresh capabilities
export const getAuthTokenWithRefresh = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  
  const tokensStr = localStorage.getItem('auth_tokens');
  if (!tokensStr) return null;
  
  try {
    const tokens: AuthTokens = JSON.parse(tokensStr);
    
    // Check if token is expired or about to expire
    if (isTokenExpiredOrClose(tokens.accessToken)) {
      console.log('Token expired or close to expiry, refreshing...');
      const refreshed = await refreshTokens();
      
      if (!refreshed) {
        return null;
      }
      
      // Get the new tokens after refresh
      const newTokensStr = localStorage.getItem('auth_tokens');
      if (!newTokensStr) return null;
      
      const newTokens: AuthTokens = JSON.parse(newTokensStr);
      return newTokens.accessToken;
    }
    
    return tokens.accessToken;
  } catch (e) {
    console.error('Error al obtener token de autorización:', e);
    return null;
  }
};
