// mobile/src/navigation/RootNavigator.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SplashScreen } from '../components/SplashScreen';

export const RootNavigator = () => {
  const { user, isLoading, isTransitioning } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const skipOnboarding = await AsyncStorage.getItem(
        '@guia_aventureiro:skip_onboarding'
      );
      setShowOnboarding(!skipOnboarding);
    } catch (error) {
      console.error('Erro ao verificar onboarding:', error);
      setShowOnboarding(true); // Mostrar por padrão em caso de erro
    }
  };

  if (isLoading || showOnboarding === null || isTransitioning) {
    return <SplashScreen />;
  }

  // Se não tem usuário e nunca viu o onboarding, mostrar
  if (!user && showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};