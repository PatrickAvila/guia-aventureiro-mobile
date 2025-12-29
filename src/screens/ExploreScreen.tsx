// mobile/src/screens/ExploreScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useColors } from '../hooks/useColors';
import { ItineraryCard } from '../components/ItineraryCard';
import { Toast } from '../components/Toast';
import exploreService, { PublicItinerary, ExploreFilters } from '../services/exploreService';
import { useToast } from '../hooks/useToast';

export const ExploreScreen = ({ navigation }: any) => {
  const colors = useColors();
  const { toast, hideToast, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<'discover' | 'featured' | 'saved'>('discover');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Descobrir
  const [itineraries, setItineraries] = useState<PublicItinerary[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, hasNext: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ExploreFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Em Destaque
  const [featuredItineraries, setFeaturedItineraries] = useState<PublicItinerary[]>([]);

  // Salvos
  const [savedItineraries, setSavedItineraries] = useState<PublicItinerary[]>([]);
  const [savedPagination, setSavedPagination] = useState<any>({ page: 1, hasNext: false });

  const loadDiscoverItineraries = useCallback(async (page: number) => {
    try {
      const data = await exploreService.getPublicItineraries({
        ...filters,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });
      
      if (page === 1) {
        setItineraries(data.itineraries);
      } else {
        setItineraries(prev => [...prev, ...data.itineraries]);
      }
      setPagination(data.pagination);
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        showError('Erro ao carregar roteiros');
      }
      throw error;
    } finally {
      setLoadingMore(false);
    }
  }, [filters, searchQuery, showError]);

  const loadFeaturedItineraries = useCallback(async () => {
    try {
      const data = await exploreService.getFeatured(20);
      setFeaturedItineraries(data);
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        showError('Erro ao carregar destaques');
      }
    }
  }, [showError]);

  const loadSavedItineraries = useCallback(async (page: number) => {
    try {
      const data = await exploreService.getSaved(page, 20);
      
      if (page === 1) {
        setSavedItineraries(data.itineraries);
      } else {
        setSavedItineraries(prev => [...prev, ...data.itineraries]);
      }
      setSavedPagination(data.pagination);
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        showError('Erro ao carregar salvos');
      }
    } finally {
      setLoadingMore(false);
    }
  }, [showError]);

  const loadData = useCallback(async () => {
    try {
      if (activeTab === 'discover') {
        await loadDiscoverItineraries(1);
      } else if (activeTab === 'featured') {
        await loadFeaturedItineraries();
      } else {
        await loadSavedItineraries(1);
      }
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        showError('Erro ao carregar roteiros');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, loadDiscoverItineraries, loadFeaturedItineraries, loadSavedItineraries, showError]);

  // Carregar dados quando a tela ganhar foco ou mudar de aba
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [activeTab]) // Apenas activeTab para evitar loop
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLoadMore = () => {
    if (loadingMore) return;
    
    if (activeTab === 'discover' && pagination.hasNext) {
      setLoadingMore(true);
      loadDiscoverItineraries(pagination.page + 1);
    } else if (activeTab === 'saved' && savedPagination.hasNext) {
      setLoadingMore(true);
      loadSavedItineraries(savedPagination.page + 1);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      await loadDiscoverItineraries(1);
    } catch (error) {
      // Erro já tratado em loadDiscoverItineraries
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (id: string) => {
    try {
      await exploreService.toggleLike(id);
      
      // Atualizar localmente
      const updateItineraries = (items: PublicItinerary[]) =>
        items.map(item => {
          if (item._id === id) {
            const isLiked = item.likes?.includes('user');
            return {
              ...item,
              likes: isLiked
                ? item.likes.filter(l => l !== 'user')
                : [...(item.likes || []), 'user'],
            };
          }
          return item;
        });

      if (activeTab === 'discover') {
        setItineraries(updateItineraries);
      } else if (activeTab === 'featured') {
        setFeaturedItineraries(updateItineraries);
      }
    } catch (error) {
      showError('Erro ao curtir roteiro');
    }
  };

  const handleToggleSave = async (id: string) => {
    try {
      const result = await exploreService.toggleSave(id);
      
      if (!result.saved && activeTab === 'saved') {
        // Remove dos salvos
        setSavedItineraries(prev => prev.filter(i => i._id !== id));
      }
    } catch (error) {
      showError('Erro ao salvar roteiro');
    }
  };

  const getCurrentData = () => {
    if (activeTab === 'discover') return itineraries;
    if (activeTab === 'featured') return featuredItineraries;
    return savedItineraries;
  };

  const renderItineraryCard = ({ item }: { item: PublicItinerary }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ItineraryDetail', { id: item._id })}
      style={styles.cardWrapper}
    >
      <ItineraryCard
        itinerary={item}
        onPress={() => navigation.navigate('ItineraryDetail', { id: item._id })}
      />
      {/* Botões de ação */}
      <View style={[styles.actions, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            👁️ {item.views || 0}
          </Text>
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            ❤️ {item.likes?.length || 0}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={() => handleToggleLike(item._id)}
            style={[styles.actionButton, { backgroundColor: colors.background }]}
          >
            <Text style={styles.actionIcon}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleToggleSave(item._id)}
            style={[styles.actionButton, { backgroundColor: colors.background }]}
          >
            <Text style={styles.actionIcon}>🔖</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Explorar</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'discover' ? colors.primary : colors.textSecondary }]}>
            Descobrir
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'featured' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('featured')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'featured' ? colors.primary : colors.textSecondary }]}>
            Em Destaque
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'saved' ? colors.primary : colors.textSecondary }]}>
            Salvos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search (apenas em Descobrir) */}
      {activeTab === 'discover' && (
        <>
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Buscar destino, país..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: colors.primary }]}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>🔍</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.infoBar, { backgroundColor: colors.card }]}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              💡 Exibindo apenas roteiros públicos de usuários com perfil público
            </Text>
          </View>
        </>
      )}

      {/* Lista */}
      <FlatList
        data={getCurrentData()}
        renderItem={renderItineraryCard}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {activeTab === 'discover' ? '🌍' : activeTab === 'featured' ? '⭐' : '🔖'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {activeTab === 'discover'
                ? 'Nenhum roteiro encontrado'
                : activeTab === 'featured'
                  ? 'Nenhum destaque disponível'
                  : 'Você ainda não salvou roteiros'}
            </Text>
          </View>
        }
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  infoBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  list: {
    padding: 16,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 16,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
