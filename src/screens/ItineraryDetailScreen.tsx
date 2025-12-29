// mobile/src/screens/ItineraryDetailScreen.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { showAlert } from '../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { itineraryService } from '../services/itineraryService';
import { Itinerary } from '../types';
import { useColors } from '../hooks/useColors';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Toast } from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { PhotoPicker } from '../components/PhotoPicker';
import { RatingStars } from '../components/RatingStars';
import { RatingModal } from '../components/RatingModal';
import { ShareModal } from '../components/ShareModal';
import { BudgetTracker } from '../components/BudgetTracker';
import budgetService from '../services/budgetService';

export const ItineraryDetailScreen = ({ route, navigation }: any) => {
  const { id, refresh } = route.params;
  const colors = useColors();
  const { toast, hideToast, success, error: showError } = useToast();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const isLoadingRef = useRef(false);

  // Carregar roteiro quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      // Prevenir múltiplas chamadas simultâneas
      if (isLoadingRef.current) {
        console.log('⚠️ Já está carregando, ignorando chamada duplicada');
        return;
      }

      let isMounted = true;
      isLoadingRef.current = true;
      
      const fetchItinerary = async () => {
        try {
          setLoading(true);
          console.log('📥 Carregando roteiro ID:', id);
          const data = await itineraryService.getById(id);
          
          if (isMounted) {
            console.log('✅ Roteiro carregado:', data._id);
            setItinerary(data);
            setLoading(false);
          }
        } catch (error) {
          if (isMounted) {
            console.error('❌ Erro ao carregar roteiro:', error);
            showError('Não foi possível carregar o roteiro.');
            setLoading(false);
            setTimeout(() => {
              navigation.goBack();
            }, 500);
          }
        } finally {
          if (isMounted) {
            isLoadingRef.current = false;
          }
        }
      };

      fetchItinerary();
      
      return () => {
        isMounted = false;
        isLoadingRef.current = false;
      };
    }, [id]) // Só recarrega se o ID mudar
  );

  const loadItinerary = useCallback(async () => {
    try {
      console.log('📥 Recarregando roteiro ID:', id);
      const data = await itineraryService.getById(id);
      console.log('✅ Roteiro recarregado:', data._id);
      setItinerary(data);
    } catch (error) {
      console.error('❌ Erro ao recarregar roteiro:', error);
      showError('Não foi possível carregar o roteiro.');
    }
  }, [id, showError]);

  const handleDelete = async () => {
    console.log('🗑️ Botão de deletar clicado. ID:', id);
    showAlert(
      'Excluir Roteiro',
      'Tem certeza que deseja excluir este roteiro? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔥 Deletando roteiro:', id);
              await itineraryService.delete(id);
              console.log('✅ Roteiro deletado com sucesso');
              success('Roteiro excluído com sucesso!');
              setTimeout(() => {
                navigation.goBack();
              }, 500);
            } catch (err: any) {
              showError(err.response?.data?.message || 'Erro ao excluir roteiro');
            }
          }
        }
      ]
    );
  };

  const handleDuplicate = async () => {
    console.log('📋 Botão de duplicar clicado. ID:', id);
    try {
      console.log('🔄 Duplicando roteiro:', id);
      const duplicate = await itineraryService.duplicate(id);
      console.log('✅ Roteiro duplicado com sucesso. Novo ID:', duplicate._id);
      success('Roteiro duplicado com sucesso!');
      
      showAlert(
        'Roteiro Duplicado',
        'Deseja visualizar a cópia agora?',
        [
          { text: 'Depois', style: 'cancel' },
          { 
            text: 'Ver Agora', 
            onPress: () => {
              navigation.goBack();
              setTimeout(() => {
                navigation.navigate('ItineraryDetail', { id: duplicate._id });
              }, 100);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Erro ao duplicar roteiro:', error);
      showError(error.response?.data?.message || 'Não foi possível duplicar o roteiro.');
    }
  };

  const handleSubmitRating = async (ratingData: {
    score: number;
    comment: string;
    photos: string[];
  }) => {
    try {
      await itineraryService.addRating(id, ratingData);
      success('Avaliação salva com sucesso!');
      await loadItinerary();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao salvar avaliação');
    }
  };

  const handleAddExpense = async (expenseData: {
    category: string;
    description: string;
    amount: number;
    date?: Date;
  }) => {
    try {
      await budgetService.addExpense(id, expenseData);
      success('Gasto adicionado com sucesso!');
      await loadItinerary();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao adicionar gasto');
    }
  };

  const handleUpdateExpense = async (expenseId: string, data: any) => {
    try {
      await budgetService.updateExpense(id, expenseId, data);
      success('Gasto atualizado com sucesso!');
      await loadItinerary();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao atualizar gasto');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await budgetService.deleteExpense(id, expenseId);
      success('Gasto removido com sucesso!');
      await loadItinerary();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao remover gasto');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!itinerary) {
    return null;
  }

  const startDate = format(new Date(itinerary.startDate), "dd 'de' MMMM", { locale: ptBR });
  const endDate = format(new Date(itinerary.endDate), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header fixo */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.primary }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {itinerary.title}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShareModalVisible(true)} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>🔗</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditItinerary', { id: itinerary._id })}
            style={styles.iconButton}
          >
            <Text style={styles.iconButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDuplicate} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{itinerary.title}</Text>
          <Text style={[styles.destination, { color: colors.textSecondary }]}>
            {itinerary.destination ? `${itinerary.destination.city || 'N/A'}, ${itinerary.destination.country || 'N/A'}` : 'Destino não informado'}
          </Text>
          <Text style={[styles.dates, { color: colors.textSecondary }]}>
            {startDate} - {endDate}
          </Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>{itinerary.duration} dias</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>
                {itinerary.budget.level === 'economico'
                  ? '💰 Econômico'
                  : itinerary.budget.level === 'medio'
                    ? '💳 Médio'
                    : '💎 Luxo'}
              </Text>
            </View>
            {itinerary.generatedByAI && (
              <View style={[styles.badge, { backgroundColor: colors.accent || colors.primary }]}>
                <Text style={[styles.aiText, { color: colors.text }]}>✨ IA</Text>
              </View>
            )}
          </View>
        </View>

        {/* Orçamento */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Orçamento</Text>
          <BudgetTracker
            itineraryId={itinerary._id}
            budgetEstimated={itinerary.budget.estimatedTotal}
            budgetSpent={itinerary.budget.spent || 0}
            currency={itinerary.budget.currency}
            expenses={itinerary.expenses || []}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        </View>

        {/* Fotos do roteiro */}
        <View style={styles.section}>
          <PhotoPicker
            itineraryId={itinerary._id}
            maxPhotos={10}
            existingPhotos={[]}
          />
        </View>

        {/* Avaliação - só aparece se status for 'concluido' */}
        {itinerary.status === 'concluido' && (
          <View style={styles.section}>
            <View style={styles.ratingHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Avaliação da Viagem</Text>
              {itinerary.rating?.score && (
                <TouchableOpacity onPress={() => setRatingModalVisible(true)}>
                  <Text style={[styles.editRatingButton, { color: colors.primary }]}>Editar</Text>
                </TouchableOpacity>
              )}
            </View>

            {itinerary.rating?.score ? (
              <View style={[styles.ratingCard, { backgroundColor: colors.card }]}>
                <RatingStars rating={itinerary.rating.score} size={32} />
                {itinerary.rating.comment && (
                  <Text style={[styles.ratingComment, { color: colors.text }]}>{itinerary.rating.comment}</Text>
                )}
                {itinerary.rating.ratedAt && (
                  <Text style={[styles.ratingDate, { color: colors.textSecondary }]}>
                    Avaliado em {format(new Date(itinerary.rating.ratedAt), "dd/MM/yyyy")}
                  </Text>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addRatingButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => setRatingModalVisible(true)}
              >
                <Text style={styles.addRatingIcon}>⭐</Text>
                <Text style={[styles.addRatingText, { color: colors.text }]}>Como foi sua viagem?</Text>
                <Text style={[styles.addRatingSubtext, { color: colors.textSecondary }]}>Toque para avaliar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Dias */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Roteiro dia a dia</Text>
          {itinerary.days && Array.isArray(itinerary.days) && itinerary.days.map((day, index) => (
            <View key={day._id} style={[styles.dayCard, { backgroundColor: colors.card }]}>
              <View style={styles.dayHeader}>
                <Text style={[styles.dayNumber, { color: colors.primary }]}>Dia {day.dayNumber}</Text>
                <Text style={[styles.dayDate, { color: colors.textSecondary }]}>
                  {format(new Date(day.date), "dd 'de' MMMM", { locale: ptBR })}
                </Text>
              </View>
              <Text style={[styles.dayTitle, { color: colors.text }]}>{day.title}</Text>

              {day.activities && Array.isArray(day.activities) && day.activities.map((activity, actIndex) => (
                <View key={activity._id} style={[styles.activityCard, { backgroundColor: colors.background }]}>
                  <View style={styles.activityHeader}>
                    <Text style={[styles.activityTime, { color: colors.primary }]}>{activity.time}</Text>
                    <Text style={styles.activityCategory}>
                      {activity.category === 'transporte'
                        ? '🚗'
                        : activity.category === 'alimentacao'
                          ? '🍽️'
                          : activity.category === 'atracao'
                            ? '🎭'
                            : activity.category === 'hospedagem'
                              ? '🏨'
                              : activity.category === 'compras'
                                ? '🛍️'
                                : '📍'}
                    </Text>
                  </View>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                  {activity.description && (
                    <Text style={[styles.activityDescription, { color: colors.textSecondary }]}>{activity.description}</Text>
                  )}
                  {activity.location && (
                    <Text style={[styles.activityLocation, { color: colors.textSecondary }]}>📍 {activity.location.name}</Text>
                  )}
                  <View style={styles.activityFooter}>
                    <Text style={[styles.activityCost, { color: colors.primary }]}>
                      R$ {activity.estimatedCost.toFixed(2)}
                    </Text>

      <RatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
        onSubmit={handleSubmitRating}
        existingRating={itinerary?.rating}
        itineraryId={id}
      />
                    <Text style={[styles.activityDuration, { color: colors.textSecondary }]}>{activity.duration}min</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Colaboradores */}
        {itinerary.collaborators.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Colaboradores</Text>
            {itinerary.collaborators && Array.isArray(itinerary.collaborators) && itinerary.collaborators.map((collab) => (
              <View key={collab.user._id} style={[styles.collaboratorCard, { backgroundColor: colors.card }]}>
                <View style={[styles.collaboratorAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.collaboratorAvatarText, { color: '#FFFFFF' }]}>
                    {collab.user.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.collaboratorInfo}>
                  <Text style={[styles.collaboratorName, { color: colors.text }]}>{collab.user.name}</Text>
                  <Text style={[styles.collaboratorPermission, { color: colors.textSecondary }]}>
                    {collab.permission === 'edit' ? '✏️ Pode editar' : '👁️ Apenas visualizar'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    fontWeight: '300',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  hero: {
    padding: 24,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  destination: {
    fontSize: 18,
    marginBottom: 4,
  },
  dates: {
    fontSize: 16,
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  aiBadge: {
  },
  aiText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  budgetCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  budgetAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  budgetLabel: {
    fontSize: 14,
  },
  dayCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayDate: {
    fontSize: 14,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  activityCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTime: {
    fontSize: 14,
    fontWeight: '700',
  },
  activityCategory: {
    fontSize: 18,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  activityLocation: {
    fontSize: 14,
    marginBottom: 8,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityCost: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityDuration: {
    fontSize: 14,
  },
  collaboratorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  collaboratorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  collaboratorAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  collaboratorInfo: {
    flex: 1,
  },
  collaboratorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  collaboratorPermission: {
    fontSize: 14,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editRatingButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  ratingComment: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  ratingDate: {
    fontSize: 13,
    marginTop: 12,
  },
  addRatingButton: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addRatingIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  addRatingText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  addRatingSubtext: {
    fontSize: 14,
  },
});