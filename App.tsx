// mobile/App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { NotificationsProvider } from './src/contexts/NotificationsContext';
import { AlertProvider } from './src/components/AlertProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

// Componente interno que acessa o tema
const AppContent = () => {
  const { theme } = useTheme();
  
  return (
    <>
      <RootNavigator />
      {/* Inverte: tema escuro = ícones claros, tema claro = ícones escuros */}
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <NotificationsProvider>
                <AlertProvider>
                  <AppContent />
                </AlertProvider>
              </NotificationsProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}