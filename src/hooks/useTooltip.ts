// mobile/src/hooks/useTooltip.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TooltipId = 
  | 'createItinerary'
  | 'useAI'
  | 'budget'
  | 'explore'
  | 'achievements';

const TOOLTIP_STORAGE_KEY = '@guia_aventureiro:tooltips_shown';

interface TooltipsState {
  createItinerary: boolean;
  useAI: boolean;
  budget: boolean;
  explore: boolean;
  achievements: boolean;
}

export const useTooltip = () => {
  const [tooltipsShown, setTooltipsShown] = useState<TooltipsState>({
    createItinerary: false,
    useAI: false,
    budget: false,
    explore: false,
    achievements: false,
  });
  const [loading, setLoading] = useState(true);
  const [recentlyReset, setRecentlyReset] = useState(false);

  // Carregar estado dos tooltips do AsyncStorage
  useEffect(() => {
    loadTooltipsState();
  }, []);

  const loadTooltipsState = async () => {
    try {
      const stored = await AsyncStorage.getItem(TOOLTIP_STORAGE_KEY);
      if (stored) {
        setTooltipsShown(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar estado dos tooltips:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTooltipsState = async (newState: TooltipsState) => {
    try {
      await AsyncStorage.setItem(TOOLTIP_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Erro ao salvar estado dos tooltips:', error);
    }
  };

  const shouldShowTooltip = useCallback((id: TooltipId): boolean => {
    return !tooltipsShown[id] && !loading && !recentlyReset;
  }, [tooltipsShown, loading, recentlyReset]);

  const markTooltipAsShown = useCallback(async (id: TooltipId) => {
    const newState = { ...tooltipsShown, [id]: true };
    setTooltipsShown(newState);
    await saveTooltipsState(newState);
  }, [tooltipsShown]);

  const resetTooltips = async () => {
    const initialState: TooltipsState = {
      createItinerary: false,
      useAI: false,
      budget: false,
      explore: false,
      achievements: false,
    };
    setTooltipsShown(initialState);
    await saveTooltipsState(initialState);
    
    // Também limpar o flag de onboarding para mostrar as telas de boas-vindas novamente
    await AsyncStorage.removeItem('@guia_aventureiro:skip_onboarding');
    
    // Prevenir que tooltips apareçam imediatamente após reset
    setRecentlyReset(true);
    setTimeout(() => {
      setRecentlyReset(false);
    }, 3000); // 3 segundos de cooldown
  };

  return {
    shouldShowTooltip,
    markTooltipAsShown,
    resetTooltips,
    loading,
  };
};
