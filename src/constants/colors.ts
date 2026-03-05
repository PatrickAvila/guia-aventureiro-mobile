// mobile/src/constants/colors.ts

// Paleta Light (padrão)
export const LightColors = {
  primary: '#005A8D',
  accent: '#FF6B6B',
  accentAlt: '#FFD166',
  background: '#F8F9FA',
  backgroundLight: '#FFFFFF',
  card: '#FFFFFF',
  text: '#212529',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  white: '#FFFFFF',
  border: '#DEE2E6',
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
  info: '#17A2B8',
};

// Paleta Dark
export const DarkColors = {
  primary: '#4A9BD6',
  accent: '#FF8A8A',
  accentAlt: '#FFE499',
  background: '#121212',
  backgroundLight: '#1E1E1E',
  card: '#2C2C2C',
  text: '#E8E8E8',
  textSecondary: '#A0A0A0',
  textLight: '#707070',
  white: '#FFFFFF',
  border: '#3A3A3A',
  error: '#FF5252',
  success: '#4CAF50',
  warning: '#FFB300',
  info: '#29B6F6',
};

// Exporta o tema padrão (será sobrescrito pelo hook useColors)
export const Colors = LightColors;

export const CATEGORY_COLORS: Record<string, string> = {
  hospedagem: '#FF6B6B',
  alimentacao: '#4ECDC4',
  transporte: '#FFE66D',
  passeios: '#95E1D3',
  atracao: '#95E1D3',
  compras: '#F38181',
  outros: '#AA96DA',
  outro: '#AA96DA',
};

export const NOTIFICATION_TYPE_COLORS: Record<string, string> = {
  itinerary_shared: '#34C759',
  itinerary_reminder: '#007AFF',
  budget_alert: '#FF9500',
  collaboration: '#5856D6',
  ai_suggestion: '#AF52DE',
  premium: '#FFD700',
  system: '#8E8E93',
};

export const NOTIFICATION_PRIORITY_COLORS: Record<string, string> = {
  high: '#FF3B30',
  medium: '#FF9500',
  low: '#007AFF',
};

export const OVERLAY_COLORS = {
  modalBackdrop: 'rgba(0,0,0,0.5)',
};