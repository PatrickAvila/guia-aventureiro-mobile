// mobile/src/config/env.ts
//import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'http://192.168.0.14:3000/api',
    googleMapsKey: 'AIzaSyDJERNmmT8x4AnEKjQEFHSTmSvMBwgTi0o', // Substitua pela sua chave do Google Maps
  },
  prod: {
    apiUrl: 'https://guia-aventureiro-backend.onrender.com/api',
    googleMapsKey: 'AIzaSyDJERNmmT8x4AnEKjQEFHSTmSvMBwgTi0o',
  },
};

const getEnvVars = () => {
  // return ENV.dev; // Remova ou comente esta linha
  return ENV.prod; // Force sempre produção para testar
};

const env = getEnvVars();
export const apiUrl = env.apiUrl;
export default env;