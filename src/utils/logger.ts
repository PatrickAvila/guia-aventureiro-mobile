// mobile/src/utils/logger.ts
const isDev = __DEV__;

/**
 * Logger utilitário que só exibe logs em modo de desenvolvimento
 * Em produção, os logs são silenciados para melhor performance e segurança
 */
export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    if (isDev) {
      console.error(...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },

  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};
