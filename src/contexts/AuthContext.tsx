// mobile/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { authService } from '../services/authService';
import { User, AuthContextType } from '../types';
import { showAlert } from '../components/CustomAlert';
import { apiEvents } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    loadStoredAuth();

    // Escutar eventos de falha de autenticação da API
    const handleUnauthorized = () => {
      setUser(null);
      setAccessToken(null);
      showAlert('Sessão Expirada', 'Sua sessão expirou. Faça login novamente.');
    };

    apiEvents.on('unauthorized', handleUnauthorized);

    return () => {
      apiEvents.off('unauthorized', handleUnauthorized);
    };
  }, []);

  const loadStoredAuth = async () => {
    try {
      const stored = await authService.loadStoredAuth();
      if (stored) {
        setUser(stored.user);
        setAccessToken(stored.accessToken);
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Erro ao carregar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      setIsTransitioning(true);
      const { user, accessToken } = await authService.signup(name, email, password);
      setUser(user);
      setAccessToken(accessToken);
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error: any) {
      // Don't expose server error messages to user
      const status = error.response?.status;
      let userMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (status === 409) {
        userMessage = 'Este email já está registrado.';
      } else if (status === 400) {
        userMessage = 'Dados inválidos. Verifique os campos.';
      } else if (status === 429) {
        userMessage = 'Muitas tentativas. Aguarde alguns minutos.';
      }
      
      showAlert('Erro', userMessage);
      throw error;
    } finally {
      setIsTransitioning(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsTransitioning(true);
      const { user, accessToken } = await authService.login(email, password);
      setUser(user);
      setAccessToken(accessToken);
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error: any) {
      // Don't expose server error messages to user (prevents user enumeration)
      const status = error.response?.status;
      let userMessage = 'Erro ao fazer login. Tente novamente.';
      
      if (status === 401) {
        userMessage = 'Credenciais inválidas.';
      } else if (status === 429) {
        userMessage = 'Muitas tentativas. Aguarde alguns minutos.';
      } else if (status === 503) {
        userMessage = 'Serviço indisponível. Tente novamente mais tarde.';
      }
      
      showAlert('Erro', userMessage);
      throw error;
    } finally {
      setIsTransitioning(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsTransitioning(true);
      await authService.logout();
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(null);
      setAccessToken(null);
    } catch (error) {
      // Logout failed but continue anyway (don't expose error details)
      if (__DEV__) {
        console.error('❌ Logout failed');
      }
    } finally {
      setIsTransitioning(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      // Profile refresh failed but don't expose details
      if (__DEV__) {
        console.error('❌ Profile refresh failed');
      }
    }
  }, []);

  const updateProfile = useCallback(async (name: string, avatar?: string, preferences?: any, publicProfile?: boolean) => {
    try {
      const updatedUser = await authService.updateProfile(name, avatar, preferences, publicProfile);
      setUser(updatedUser);
      return updatedUser;
    } catch (error: any) {
      // Don't expose server error messages
      const status = error.response?.status;
      let message = 'Erro ao atualizar perfil. Tente novamente.';
      
      if (status === 400) {
        message = 'Dados inválidos.';
      } else if (status === 413) {
        message = 'Foto muito grande. Use uma imagem menor.';
      }
      
      throw new Error(message);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      isTransitioning,
      login,
      signup,
      logout,
      refreshAuth,
      updateProfile,
    }),
    [user, accessToken, isLoading, isTransitioning, login, signup, logout, refreshAuth, updateProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};