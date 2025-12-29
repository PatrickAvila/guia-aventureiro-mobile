// mobile/src/hooks/useColors.ts
import { useTheme } from '../context/ThemeContext';
import { LightColors, DarkColors } from '../constants/colors';

/**
 * Hook para acessar as cores do tema atual
 * Retorna a paleta Light ou Dark baseado no tema selecionado
 */
export const useColors = () => {
  const { theme } = useTheme();
  return theme === 'dark' ? DarkColors : LightColors;
};
