// mobile/src/services/authService.ts
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

export const authService = {
  async signup(name: string, email: string, password: string) {
    const response = await api.post('/auth/signup', {
      name,
      email,
      password,
      acceptedTerms: true,
    });

    const { user, accessToken, refreshToken } = response.data;

    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    return { user, accessToken, refreshToken };
  },

  async login(email: string, password: string) {
    try {
      console.log('Tentando login com:', email);
      console.log('API URL:', api.defaults.baseURL);
      
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      console.log('Login bem-sucedido:', response.data);
      const { user, accessToken, refreshToken } = response.data;

      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      return { user, accessToken, refreshToken };
    } catch (error: any) {
      console.error('Erro no login:', error.response?.data || error.message);
      throw error;
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout no servidor:', error);
    } finally {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    }
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(name: string, avatar?: string, preferences?: any, publicProfile?: boolean) {
    const response = await api.put('/auth/profile', { name, avatar, preferences, publicProfile });
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data.user;
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    const response = await api.put('/auth/password', { currentPassword, newPassword });
    return response.data;
  },

  async deleteAccount() {
    await api.delete('/auth/account');
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  },

  async getPublicProfile(userId: string) {
    const response = await api.get(`/auth/public/${userId}`);
    return response.data;
  },

  async loadStoredAuth() {
    const [accessToken, refreshToken, userJson] = await AsyncStorage.multiGet([
      'accessToken',
      'refreshToken',
      'user',
    ]);

    if (accessToken[1] && refreshToken[1] && userJson[1]) {
      return {
        accessToken: accessToken[1],
        refreshToken: refreshToken[1],
        user: JSON.parse(userJson[1]) as User,
      };
    }

    return null;
  },
};