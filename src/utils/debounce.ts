// mobile/src/utils/debounce.ts

/**
 * Função utilitária para debounce
 * Atrasa a execução de uma função até que um certo tempo tenha passado
 * sem novas chamadas
 * 
 * @param func - Função a ser executada
 * @param delay - Delay em milissegundos
 * @returns Função debounced
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
