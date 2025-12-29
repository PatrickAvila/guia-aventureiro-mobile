// mobile/src/services/offlineService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Itinerary } from '../types';
import { Platform } from 'react-native';
import env from '../config/env';

const OFFLINE_ITINERARIES_KEY = '@guia_aventureiro:offline_itineraries';
const PENDING_SYNC_KEY = '@guia_aventureiro:pending_sync';

export interface PendingSyncAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  data?: any;
  timestamp: number;
}

class OfflineService {
  private isOnline: boolean = true;
  private lastCheck: number = 0;
  private checkInterval: number = 10000; // 10 segundos de cache

  /**
   * Verifica se está online (com cache de 10s)
   */
  async checkConnection(): Promise<boolean> {
    const now = Date.now();
    
    // Se checou há menos de 10 segundos, retornar cache
    if (now - this.lastCheck < this.checkInterval) {
      return this.isOnline;
    }

    this.lastCheck = now;

    try {
      // No web, usar navigator.onLine primeiro
      if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
        this.isOnline = navigator.onLine;
        
        // Se diz que está online, validar com API
        if (this.isOnline) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            // Tenta fazer requisição para nossa própria API (sem problemas de CORS)
            const response = await fetch(`${env.apiUrl.replace('/api', '')}/health`, {
              method: 'GET',
              signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            this.isOnline = response.ok;
          } catch {
            // Se falhar, assumir que está offline
            this.isOnline = false;
          }
        }
        
        return this.isOnline;
      }
      
      // No mobile, tentar requisição para a API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${env.apiUrl.replace('/api', '')}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      this.isOnline = response.ok;
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  /**
   * Obtém status de conexão atual (cache)
   */
  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Salva roteiros para acesso offline
   */
  async saveItinerariesOffline(itineraries: Itinerary[]): Promise<void> {
    try {
      // Validar que é um array
      if (!Array.isArray(itineraries)) {
        console.warn('⚠️ Tentativa de salvar roteiros não-array:', typeof itineraries);
        return;
      }
      
      const json = JSON.stringify(itineraries);
      await AsyncStorage.setItem(OFFLINE_ITINERARIES_KEY, json);
      console.log(`💾 ${itineraries.length} roteiros salvos offline`);
    } catch (error) {
      console.error('Erro ao salvar roteiros offline:', error);
    }
  }

  /**
   * Carrega roteiros salvos offline
   */
  async getOfflineItineraries(): Promise<Itinerary[]> {
    try {
      const json = await AsyncStorage.getItem(OFFLINE_ITINERARIES_KEY);
      if (!json) return [];
      return JSON.parse(json);
    } catch (error) {
      console.error('Erro ao carregar roteiros offline:', error);
      return [];
    }
  }

  /**
   * Salva roteiro individual offline
   */
  async saveItineraryOffline(itinerary: Itinerary): Promise<void> {
    try {
      const itineraries = await this.getOfflineItineraries();
      const index = itineraries.findIndex((i) => i._id === itinerary._id);

      if (index >= 0) {
        itineraries[index] = itinerary;
      } else {
        itineraries.push(itinerary);
      }

      await this.saveItinerariesOffline(itineraries);
    } catch (error) {
      console.error('Erro ao salvar roteiro offline:', error);
    }
  }

  /**
   * Remove roteiro do cache offline
   */
  async removeItineraryOffline(id: string): Promise<void> {
    try {
      const itineraries = await this.getOfflineItineraries();
      const filtered = itineraries.filter((i) => i._id !== id);
      await this.saveItinerariesOffline(filtered);
    } catch (error) {
      console.error('Erro ao remover roteiro offline:', error);
    }
  }

  /**
   * Adiciona ação pendente de sincronização
   */
  async addPendingSync(action: Omit<PendingSyncAction, 'timestamp'>): Promise<void> {
    try {
      const pending = await this.getPendingSync();
      const newAction: PendingSyncAction = {
        ...action,
        timestamp: Date.now(),
      };
      pending.push(newAction);
      await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pending));
      console.log(`📝 Ação pendente adicionada: ${action.type} ${action.id}`);
    } catch (error) {
      console.error('Erro ao adicionar ação pendente:', error);
    }
  }

  /**
   * Obtém ações pendentes de sincronização
   */
  async getPendingSync(): Promise<PendingSyncAction[]> {
    try {
      const json = await AsyncStorage.getItem(PENDING_SYNC_KEY);
      if (!json) return [];
      return JSON.parse(json);
    } catch (error) {
      console.error('Erro ao obter ações pendentes:', error);
      return [];
    }
  }

  /**
   * Remove ação pendente específica
   */
  async removePendingSync(actionId: string): Promise<void> {
    try {
      const pending = await this.getPendingSync();
      const filtered = pending.filter((a) => a.id !== actionId);
      await AsyncStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Erro ao remover ação pendente:', error);
    }
  }

  /**
   * Sincroniza ações pendentes quando voltar online
   */
  async syncPendingActions(): Promise<void> {
    const isOnline = await this.checkConnection();
    if (!isOnline) {
      console.log('📴 Offline - sincronização adiada');
      return;
    }

    const pending = await this.getPendingSync();
    if (pending.length === 0) {
      console.log('✅ Nenhuma ação pendente');
      return;
    }

    console.log(`🔄 Sincronizando ${pending.length} ações pendentes...`);

    // Aqui você chamaria as APIs reais
    // Por enquanto, apenas limpa as ações pendentes
    for (const action of pending) {
      try {
        // TODO: Implementar chamadas de API reais
        console.log(`✅ Sincronizado: ${action.type} ${action.id}`);
        await this.removePendingSync(action.id);
      } catch (error) {
        console.error(`❌ Erro ao sincronizar ${action.id}:`, error);
      }
    }
  }

  /**
   * Limpa todo o cache offline
   */
  async clearOfflineCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OFFLINE_ITINERARIES_KEY);
      await AsyncStorage.removeItem(PENDING_SYNC_KEY);
      console.log('🗑️ Cache offline limpo');
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  /**
   * Obtém informações do cache
   */
  async getCacheInfo(): Promise<{
    itinerariesCount: number;
    pendingSyncCount: number;
    isOnline: boolean;
  }> {
    const itineraries = await this.getOfflineItineraries();
    const pending = await this.getPendingSync();
    const isOnline = await this.checkConnection();

    return {
      itinerariesCount: itineraries.length,
      pendingSyncCount: pending.length,
      isOnline,
    };
  }
}

export const offlineService = new OfflineService();
