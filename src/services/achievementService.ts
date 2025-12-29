// mobile/src/services/achievementService.ts
import api from './api';

export interface Achievement {
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserStats {
  itineraries: {
    total: number;
    completed: number;
    inProgress: number;
    planned: number;
  };
  destinations: {
    countries: number;
    cities: number;
  };
  days: {
    totalTraveled: number;
    averageTripLength: number;
  };
  budget: {
    totalSpent: number;
    averagePerTrip: number;
  };
  social: {
    sharedItineraries: number;
    collaborativeItineraries: number;
    totalCollaborators: number;
  };
  achievements: {
    total: number;
    points: number;
  };
  ratings: {
    total: number;
    averageScore: string;
  };
}

export interface LeaderboardEntry {
  position: number;
  _id: string;
  totalPoints: number;
  achievementsCount: number;
  user: {
    name: string;
    avatar?: string;
    publicProfile?: boolean;
  };
}

const achievementService = {
  /**
   * Busca todas as conquistas do usuário
   */
  getMyAchievements: async (): Promise<{
    totalPoints: number;
    unlockedCount: number;
    totalCount: number;
    achievements: Achievement[];
  }> => {
    const response = await api.get('/achievements/my-achievements');
    return response.data;
  },

  /**
   * Busca estatísticas do usuário
   */
  getMyStats: async (): Promise<UserStats> => {
    const response = await api.get('/achievements/stats');
    return response.data;
  },

  /**
   * Busca leaderboard
   */
  getLeaderboard: async (limit: number = 50): Promise<LeaderboardEntry[]> => {
    const response = await api.get('/achievements/leaderboard', { params: { limit } });
    return response.data;
  },

  /**
   * Verifica e desbloqueia novas conquistas
   */
  checkAchievements: async (): Promise<{
    message: string;
    newAchievements: Achievement[];
  }> => {
    const response = await api.post('/achievements/check');
    return response.data;
  },
};

export default achievementService;
