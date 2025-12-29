// mobile/src/services/budgetService.ts
import api from './api';

export interface Expense {
  _id: string;
  date: Date;
  category: 'hospedagem' | 'alimentacao' | 'transporte' | 'atracao' | 'compras' | 'outro';
  description: string;
  amount: number;
  currency: string;
  receipt?: string;
  createdAt: Date;
}

export interface BudgetSummary {
  budget: {
    estimated: number;
    spent: number;
    remaining: number;
    percentageUsed: number;
    currency: string;
    level: 'economico' | 'moderado' | 'confortavel' | 'luxo';
  };
  expenses: {
    total: number;
    byCategory: {
      [key: string]: {
        total: number;
        count: number;
        items: Expense[];
      };
    };
    recent: Expense[];
  };
  dailyAverage: number;
}

export interface AddExpenseData {
  category: string;
  description: string;
  amount: number;
  date?: Date;
  currency?: string;
  receipt?: string;
}

export interface UpdateExpenseData {
  category?: string;
  description?: string;
  amount?: number;
  date?: Date;
  currency?: string;
  receipt?: string;
}

const budgetService = {
  /**
   * Adiciona um novo gasto ao roteiro
   */
  addExpense: async (itineraryId: string, data: AddExpenseData): Promise<{ expense: Expense; budgetSummary: any }> => {
    const response = await api.post(`/roteiros/${itineraryId}/expenses`, data);
    return response.data;
  },

  /**
   * Atualiza um gasto existente
   */
  updateExpense: async (
    itineraryId: string,
    expenseId: string,
    data: UpdateExpenseData
  ): Promise<{ expense: Expense; budgetSummary: any }> => {
    const response = await api.put(`/roteiros/${itineraryId}/expenses/${expenseId}`, data);
    return response.data;
  },

  /**
   * Deleta um gasto
   */
  deleteExpense: async (itineraryId: string, expenseId: string): Promise<{ budgetSummary: any }> => {
    const response = await api.delete(`/roteiros/${itineraryId}/expenses/${expenseId}`);
    return response.data;
  },

  /**
   * Busca o resumo completo do orçamento
   */
  getBudgetSummary: async (itineraryId: string): Promise<BudgetSummary> => {
    const response = await api.get(`/roteiros/${itineraryId}/budget-summary`);
    return response.data;
  },
};

export default budgetService;
