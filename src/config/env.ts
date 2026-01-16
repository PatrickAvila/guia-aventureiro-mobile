// mobile/src/config/env.ts
import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'http://192.168.0.14:3000/api',
    googleMapsKey: 'AIzaSyDJERNmmT8x4AnEKjQEFHSTmSvMBwgTi0o',
  },
  prod: {
    apiUrl: 'https://guia-aventureiro-backend.onrender.com/api',
    googleMapsKey: 'AIzaSyDJERNmmT8x4AnEKjQEFHSTmSvMBwgTi0o',
  },
};

const getEnvVars = () => {
  // Detecta automaticamente se está em desenvolvimento ou produção
  if (__DEV__) {
    console.log('🔧 Ambiente: DESENVOLVIMENTO');
    return ENV.dev;
  }
  console.log('🚀 Ambiente: PRODUÇÃO');
  return ENV.prod;
};

const env = getEnvVars();
export const apiUrl = env.apiUrl;
export default env;