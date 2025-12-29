// mobile/src/utils/passwordValidator.ts

export interface PasswordStrength {
  score: number; // 0-4 (muito fraca a muito forte)
  feedback: string[];
  isValid: boolean;
}

/**
 * Valida a força de uma senha
 * @param password - Senha a ser validada
 * @returns Objeto com score, feedback e isValid
 */
export const validatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Comprimento mínimo
  if (password.length < 6) {
    feedback.push('Senha deve ter no mínimo 6 caracteres');
    return { score: 0, feedback, isValid: false };
  }

  // Comprimento ideal
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('Use pelo menos 8 caracteres para maior segurança');
  }

  // Contém letra minúscula
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    feedback.push('Adicione letras minúsculas');
  }

  // Contém letra maiúscula
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Adicione letras maiúsculas');
  }

  // Contém número
  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Adicione números');
  }

  // Contém caractere especial
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    feedback.push('Adicione caracteres especiais (!@#$%&*)');
  }

  // Senha muito comum
  const commonPasswords = ['123456', 'password', '123456789', '12345678', '12345', '1234567'];
  if (commonPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push('Esta senha é muito comum e insegura');
    return { score, feedback, isValid: false };
  }

  // Padrões repetidos
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Evite caracteres repetidos');
    score = Math.max(0, score - 1);
  }

  // Sequências
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    feedback.push('Evite sequências previsíveis');
    score = Math.max(0, score - 1);
  }

  const isValid = score >= 2; // Mínimo: 2 critérios além do tamanho

  return { score: Math.min(4, score), feedback, isValid };
};

/**
 * Retorna cor baseada no score da senha
 */
export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return '#FF3B30'; // Vermelho
    case 2:
      return '#FF9500'; // Laranja
    case 3:
      return '#FFCC00'; // Amarelo
    case 4:
      return '#34C759'; // Verde
    default:
      return '#8E8E93'; // Cinza
  }
};

/**
 * Retorna texto baseado no score da senha
 */
export const getPasswordStrengthLabel = (score: number): string => {
  switch (score) {
    case 0:
      return 'Muito fraca';
    case 1:
      return 'Fraca';
    case 2:
      return 'Razoável';
    case 3:
      return 'Boa';
    case 4:
      return 'Muito forte';
    default:
      return '';
  }
};
