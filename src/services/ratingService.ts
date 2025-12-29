// mobile/src/services/ratingService.ts
import api from './api';

export interface Rating {
  _id: string;
  itinerary: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  score: number;
  comment?: string;
  photos?: string[];
  highlights?: string[];
  wouldRecommend: boolean;
  travelDate?: Date;
  likes: string[];
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RatingStats {
  total: number;
  average: string;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  recommendationRate: string;
}

export const ratingService = {
  // Criar ou atualizar avaliação
  createOrUpdate: async (itineraryId: string, data: {
    score: number;
    comment?: string;
    photos?: string[];
    highlights?: string[];
    wouldRecommend?: boolean;
  }): Promise<{ rating: Rating; message: string }> => {
    const response = await api.post(`/ratings/${itineraryId}`, data);
    return response.data;
  },

  // Obter todas as avaliações de um roteiro
  getByItinerary: async (itineraryId: string): Promise<{ ratings: Rating[]; stats: RatingStats }> => {
    const response = await api.get(`/ratings/${itineraryId}/all`);
    return response.data;
  },

  // Obter avaliação do usuário para um roteiro específico
  getMyRating: async (itineraryId: string): Promise<{ rating: Rating }> => {
    const response = await api.get(`/ratings/${itineraryId}/my-rating`);
    return response.data;
  },

  // Obter todas as avaliações do usuário logado
  getMyRatings: async (): Promise<{ ratings: Rating[]; total: number }> => {
    const response = await api.get('/ratings/my-ratings');
    return response.data;
  },

  // Deletar avaliação
  deleteRating: async (ratingId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/ratings/${ratingId}`);
    return response.data;
  },

  // Curtir/descurtir avaliação
  toggleLike: async (ratingId: string): Promise<{ message: string; liked: boolean; likesCount: number }> => {
    const response = await api.post(`/ratings/${ratingId}/like`);
    return response.data;
  },
};
