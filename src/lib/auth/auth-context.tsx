'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthAPI } from './auth-service';
import { AuthState, LoginRequest, RegisterRequest, AuthContextProps } from './types';

// Crear contexto con valores por defecto
const AuthContext = createContext<AuthContextProps>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
});

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Comprobar si el usuario está autenticado al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (AuthAPI.isAuthenticated()) {
          const user = await AuthAPI.getProfile();
          if (user) {
            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
        }
        
        // No autenticado
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    };

    checkAuth();
  }, []);

  // Función de login
  const login = async (data: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // La respuesta de login ahora incluye directamente los datos del usuario
      const response = await AuthAPI.login(data);
      
      // Usar el usuario que viene en la respuesta
      const user = response.user;
      
      if (user) {
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        // Fallback si por alguna razón no viene el usuario en la respuesta
        const userFromProfile = await AuthAPI.getProfile();
        setState({
          user: userFromProfile,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
      router.push('/dashboard');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al iniciar sesión',
      }));
    }
  };

  // Función de registro
  const register = async (data: RegisterRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // La respuesta de register ahora incluye directamente los datos del usuario
      const response = await AuthAPI.register(data);
      
      // Usar el usuario que viene en la respuesta
      const user = response.user;
      
      if (user) {
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        // Fallback si por alguna razón no viene el usuario en la respuesta
        const userFromProfile = await AuthAPI.getProfile();
        setState({
          user: userFromProfile,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
      
      router.push('/dashboard');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al registrar usuario',
      }));
    }
  };

  // Función de logout
  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await AuthAPI.logout();
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      router.push('/login');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cerrar sesión',
      }));
    }
  };

  // Limpiar errores
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
