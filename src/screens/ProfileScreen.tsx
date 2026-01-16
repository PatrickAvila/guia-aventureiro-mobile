import { formatBRL } from '../components/Input';
// mobile/src/screens/ProfileScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Share,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { showAlert } from '../components/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useColors } from '../hooks/useColors';
import { ThemeToggle } from '../components/ThemeToggle';
import { itineraryService } from '../services/itineraryService';
import { authService } from '../services/authService';
import { photoService } from '../services/photoService';
import { apiUrl } from '../config/env';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, updateProfile } = useAuth();
  const colors = useColors();
  
  const [stats, setStats] = useState({ total: 0, completed: 0, countries: 0, lastItinerary: '' });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Modal Editar Perfil
  const [showEditModal, setShowEditModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState<string | undefined>(undefined);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Modal Alterar Senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Modal Preferências
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState({
    travelStyle: user?.preferences?.travelStyle || '',
    interests: user?.preferences?.interests || [],
    budgetLevel: user?.preferences?.budgetLevel || '',
    pace: user?.preferences?.pace || '',
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Modal Compartilhar
  const [showShareModal, setShowShareModal] = useState(false);
  const [publicProfile, setPublicProfile] = useState(user?.publicProfile || false);
  const [sharingProfile, setSharingProfile] = useState(false);

  // Modal Configurações
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [cacheSize, setCacheSize] = useState('0 MB');

  const loadStats = useCallback(async () => {
    try {
      const response = await itineraryService.getAll();
      
      // Normalizar resposta (pode ser array ou objeto com itineraries)
      let itineraries = Array.isArray(response) ? response : response?.itineraries || [];
      
      // Verificar se itineraries é um array válido
      if (!Array.isArray(itineraries) || itineraries.length === 0) {
        setStats({
          total: 0,
          completed: 0,
          countries: 0,
          lastItinerary: 'Nenhum roteiro ainda',
        });
        return;
      }
      
      const completed = itineraries.filter(i => i.status === 'concluido').length;
      const countries = new Set(
        itineraries
          .filter(i => i.destination && i.destination.country)
          .map(i => i.destination.country)
      ).size;
      const lastItinerary = itineraries.length > 0 ? itineraries[0].title : 'Nenhum roteiro ainda';
      
      setStats({
        total: itineraries.length,
        completed,
        countries,
        lastItinerary,
      });
    } catch (error: any) {
      // Não logar erro se for 401 (sessão expirada já tratada)
      if (error?.response?.status !== 401) {
        console.error('Erro ao carregar estatísticas:', error);
      }
      // Definir stats vazias em caso de erro
      setStats({
        total: 0,
        completed: 0,
        countries: 0,
        lastItinerary: 'Nenhum roteiro ainda',
      });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const calculateCacheSize = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      const size = items.reduce((acc, [key, value]) => acc + (value?.length || 0), 0);
      setCacheSize(`${(size / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      console.error('Erro ao calcular cache:', error);
    }
  }, []);

  useEffect(() => {
    loadStats();
    calculateCacheSize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Carregar apenas no mount

  const handleEditProfile = () => {
    setNewName(user?.name || '');
    setNewAvatar(user?.avatar);
    setShowEditModal(true);
  };

  const handleSelectAvatar = async () => {
    try {
      const result = await photoService.pickFromGallery();
      if (result) {
        // Upload da foto
        const uploadedUrl = await photoService.uploadPhoto(result.uri);
        setNewAvatar(uploadedUrl);
      }
    } catch (error: any) {
      showAlert('Erro', error.message || 'Erro ao selecionar foto');
    }
  };

  const handleSaveProfile = async () => {
    if (!newName.trim()) {
      showAlert('Erro', 'Digite seu nome');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile(newName.trim(), newAvatar);
      showAlert('Sucesso', 'Perfil atualizado com sucesso!');
      setShowEditModal(false);
    } catch (error: any) {
      showAlert('Erro', error.message || 'Erro ao atualizar perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert('Erro', 'Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Erro', 'As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      showAlert('Erro', 'A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.updatePassword(currentPassword, newPassword);
      showAlert('Sucesso', 'Senha alterada com sucesso!');
      setShowPasswordModal(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao alterar senha';
      showAlert('Erro', message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleOpenPreferences = () => {
    setPreferences({
      travelStyle: user?.preferences?.travelStyle || '',
      interests: user?.preferences?.interests || [],
      budgetLevel: user?.preferences?.budgetLevel || '',
      pace: user?.preferences?.pace || '',
    });
    setShowPreferencesModal(true);
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      await updateProfile(user?.name || '', user?.avatar, preferences);
      showAlert('Sucesso', 'Preferências salvas!');
      setShowPreferencesModal(false);
    } catch (error: any) {
      showAlert('Erro', 'Erro ao salvar preferências');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleShareProfile = async () => {
    if (!publicProfile) {
      showAlert(
        'Perfil Privado',
        'Deseja tornar seu perfil público para poder compartilhá-lo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sim', onPress: async () => {
            setSharingProfile(true);
            try {
              await updateProfile(user?.name || '', user?.avatar, user?.preferences, true);
              setPublicProfile(true);
              shareProfileLink();
            } catch (error) {
              showAlert('Erro', 'Erro ao tornar perfil público');
            } finally {
              setSharingProfile(false);
            }
          }},
        ]
      );
    } else {
      shareProfileLink();
    }
  };

  const shareProfileLink = async () => {
    const profileUrl = `${apiUrl}/profile/${user?._id}`;
    try {
      await Share.share({
        message: `Confira meu perfil de viagens! ${profileUrl}`,
        url: profileUrl,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleTogglePublicProfile = async () => {
    setSharingProfile(true);
    try {
      await updateProfile(user?.name || '', user?.avatar, user?.preferences, !publicProfile);
      setPublicProfile(!publicProfile);
      // Removido Alert de sucesso - mudança silenciosa
    } catch (error) {
      showAlert('Erro', 'Erro ao atualizar privacidade');
    } finally {
      setSharingProfile(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setCacheSize('0 MB');
      setShowSettingsModal(false);
      // Aguarda um momento para fechar a modal antes de mostrar alerta
      setTimeout(() => {
        showAlert('Sucesso', 'Cache atualizado!');
      }, 300);
    } catch (error) {
      setShowSettingsModal(false);
      setTimeout(() => {
        showAlert('Erro', 'Erro ao atualizar cache');
      }, 300);
    }
  };

  const handleDeleteAccount = () => {
    showAlert(
      'Excluir Conta',
      'ATENÇÃO: Esta ação é irreversível. Todos os seus roteiros serão perdidos. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: executeDelete },
      ]
    );
  };

  const executeDelete = async () => {
    try {
      await authService.deleteAccount();
      showAlert('Conta Excluída', 'Sua conta foi excluída com sucesso.');
      logout();
    } catch (error: any) {
      showAlert('Erro', 'Erro ao excluir conta');
    }
  };

  const handleLogout = () => {
    showAlert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: executeLogout },
      ]
    );
  };

  const executeLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      showAlert('Erro', 'Não foi possível sair. Tente novamente.');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleEditProfile}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.headerAvatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: colors.white }]}>{user?.name.charAt(0).toUpperCase()}</Text>
            )}
          </View>
        </TouchableOpacity>
        <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        <Text style={[styles.memberSince, { color: colors.textSecondary }]}>
          Membro desde {formatDate(user?.createdAt || '')}
        </Text>
        {user?.isPremium && (
          <View style={[styles.premiumBadge, { backgroundColor: colors.accentAlt }]}>
            <Text style={[styles.premiumText, { color: colors.text }]}>✨ Premium</Text>
          </View>
        )}
      </View>

      {/* Estatísticas */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ESTATÍSTICAS</Text>
        {loadingStats ? (
          <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <>
            <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{stats.total}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Roteiros</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{stats.completed}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Concluídos</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{stats.countries}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Países</Text>
              </View>
            </View>
            <View style={[styles.lastItinerary, { backgroundColor: colors.card }]}>
              <Text style={[styles.lastLabel, { color: colors.textSecondary }]}>Último roteiro:</Text>
              <Text style={[styles.lastValue, { color: colors.text }]}>{stats.lastItinerary}</Text>
            </View>
            {/* Botão de Conquistas */}
            <TouchableOpacity
              style={[styles.achievementsButton, { backgroundColor: colors.card, borderColor: colors.primary }]}
              onPress={() => navigation.navigate('Achievements')}
            >
              <Text style={styles.achievementsIcon}>🏆</Text>
              <View style={styles.achievementsContent}>
                <Text style={[styles.achievementsTitle, { color: colors.text }]}>Conquistas</Text>
                <Text style={[styles.achievementsSubtitle, { color: colors.textSecondary }]}>
                  Veja suas conquistas e estatísticas
                </Text>
              </View>
              <Text style={[styles.achievementsArrow, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APARÊNCIA</Text>
        <ThemeToggle />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CONTA</Text>
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={handleEditProfile}
        >
          <Text style={[styles.menuText, { color: colors.text }]}>Editar perfil</Text>
          <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={handleChangePassword}
        >
          <Text style={[styles.menuText, { color: colors.text }]}>Alterar senha</Text>
          <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={handleOpenPreferences}
        >
          <Text style={[styles.menuText, { color: colors.text }]}>Preferências de viagem</Text>
          <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>COMPARTILHAR</Text>
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={() => setShowShareModal(true)}
        >
          <View>
            <Text style={[styles.menuText, { color: colors.text }]}>Compartilhar perfil</Text>
            <Text style={[styles.menuSubtext, { color: colors.textSecondary }]}>
              {publicProfile ? 'Perfil público' : 'Perfil privado'}
            </Text>
          </View>
          <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CONFIGURAÇÕES</Text>
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={() => setShowSettingsModal(true)}
        >
          <View>
            <Text style={[styles.menuText, { color: colors.text }]}>Dados e armazenamento</Text>
            <Text style={[styles.menuSubtext, { color: colors.textSecondary }]}>Cache: {cacheSize}</Text>
          </View>
          <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.menuText, { color: colors.error }]}>Excluir conta</Text>
          <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.textLight }]}>Versão 1.0.0</Text>

      {/* Modal Editar Perfil */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            <View style={{
              width: '90%',
              maxWidth: 500,
              minWidth: 320,
              alignSelf: 'center',
              borderRadius: 16,
              padding: 24,
              backgroundColor: colors.card
            }}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Editar Perfil</Text>
              <View style={styles.avatarSection}>
                <View style={[styles.modalAvatar, { backgroundColor: colors.primary }]}> 
                  {newAvatar ? (
                    <Image source={{ uri: newAvatar }} style={styles.avatarImage} />
                  ) : (
                    <Text style={[styles.avatarText, { color: colors.white }]}>{newName.charAt(0).toUpperCase() || user?.name.charAt(0).toUpperCase()}</Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={[styles.changePhotoButton, { backgroundColor: colors.primary }]}
                  onPress={handleSelectAvatar}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 12 }}>Alterar Foto</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Nome</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                value={newName}
                onChangeText={setNewName}
                placeholder="Digite seu nome"
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.backgroundLight }]}
                  onPress={() => setShowEditModal(false)}
                  disabled={savingProfile}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.primary }]}
                  onPress={handleSaveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal Alterar Senha */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            <View style={{
              width: '90%',
              maxWidth: 500,
              minWidth: 320,
              alignSelf: 'center',
              borderRadius: 16,
              padding: 24,
              backgroundColor: colors.card
            }}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Alterar Senha</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Senha Atual</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Digite sua senha atual"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Nova Senha</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Digite a nova senha"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Confirmar Nova Senha</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirme a nova senha"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.backgroundLight }]}
                onPress={() => setShowPasswordModal(false)}
                disabled={savingPassword}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={handleSavePassword}
                disabled={savingPassword}
              >
                {savingPassword ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>

      {/* Modal Preferências */}
      <Modal
        visible={showPreferencesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPreferencesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            <View style={[styles.modalContentLarge, { backgroundColor: colors.card }]}> 
            <Text style={[styles.modalTitle, { color: colors.text }]}>Preferências de Viagem</Text>
            <Text style={[styles.scrollHint, { color: colors.textSecondary }]}>↓ Role para ver todas as opções ↓</Text>
            
            <ScrollView style={styles.preferencesScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.formContent}>
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>Estilo de Viagem</Text>
              <View style={styles.optionsGrid}>
                {[
                  { value: 'solo', label: 'Solo', icon: '🚶' },
                  { value: 'casal', label: 'Casal', icon: '💑' },
                  { value: 'familia', label: 'Família', icon: '👨‍👩‍👧‍👦' },
                  { value: 'amigos', label: 'Amigos', icon: '👥' },
                  { value: 'mochileiro', label: 'Mochileiro', icon: '🎒' },
                ].map((style) => (
                  <TouchableOpacity
                    key={style.value}
                    style={[
                      styles.optionButton,
                      { borderColor: colors.border },
                      preferences.travelStyle === style.value && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setPreferences({ ...preferences, travelStyle: style.value as any })}
                  >
                    <Text style={{ fontSize: 24, marginBottom: 4 }}>{style.icon}</Text>
                    <Text style={[
                      styles.optionText,
                      { color: colors.text },
                      preferences.travelStyle === style.value && { color: '#FFFFFF' }
                    ]}>
                      {style.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Nível de Orçamento</Text>
              <View style={styles.optionsGrid}>
                {[
                  { value: 'economico', label: 'Econômico', icon: '💰' },
                  { value: 'medio', label: 'Médio', icon: '💳' },
                  { value: 'luxo', label: 'Luxo', icon: '💎' },
                ].map((budget) => (
                  <TouchableOpacity
                    key={budget.value}
                    style={[
                      styles.optionButton,
                      { borderColor: colors.border },
                      preferences.budgetLevel === budget.value && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setPreferences({ ...preferences, budgetLevel: budget.value as any })}
                  >
                    <Text style={{ fontSize: 24, marginBottom: 4 }}>{budget.icon}</Text>
                    <Text style={[
                      styles.optionText,
                      { color: colors.text },
                      preferences.budgetLevel === budget.value && { color: '#FFFFFF' }
                    ]}>
                      {budget.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.textSecondary }]}>Ritmo da Viagem</Text>
              <View style={styles.optionsGrid}>
                {[
                  { value: 'relaxado', label: 'Relaxado', icon: '🧘' },
                  { value: 'moderado', label: 'Moderado', icon: '🚶' },
                  { value: 'intenso', label: 'Intenso', icon: '🏃' },
                ].map((pace) => (
                  <TouchableOpacity
                    key={pace.value}
                    style={[
                      styles.optionButton,
                      { borderColor: colors.border },
                      preferences.pace === pace.value && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setPreferences({ ...preferences, pace: pace.value as any })}
                  >
                    <Text style={{ fontSize: 24, marginBottom: 4 }}>{pace.icon}</Text>
                    <Text style={[
                      styles.optionText,
                      { color: colors.text },
                      preferences.pace === pace.value && { color: '#FFFFFF' }
                    ]}>
                      {pace.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={[styles.label, { color: colors.textSecondary }]}>Interesses (selecione vários)</Text>
              <View style={styles.optionsGrid}>
                {[
                  { value: 'cultura', label: 'Cultura', icon: '🎭' },
                  { value: 'natureza', label: 'Natureza', icon: '🏞️' },
                  { value: 'gastronomia', label: 'Gastronomia', icon: '🍽️' },
                  { value: 'aventura', label: 'Aventura', icon: '🧗' },
                  { value: 'praia', label: 'Praia', icon: '🏖️' },
                  { value: 'historia', label: 'História', icon: '🏛️' },
                  { value: 'compras', label: 'Compras', icon: '🛍️' },
                  { value: 'vida-noturna', label: 'Vida Noturna', icon: '🎉' },
                ].map((interest) => (
                  <TouchableOpacity
                    key={interest.value}
                    style={[
                      styles.optionButton,
                      { borderColor: colors.border },
                      preferences.interests.includes(interest.value) && { 
                        backgroundColor: colors.primary, 
                        borderColor: colors.primary 
                      }
                    ]}
                    onPress={() => {
                      const newInterests = preferences.interests.includes(interest.value)
                        ? preferences.interests.filter(i => i !== interest.value)
                        : [...preferences.interests, interest.value];
                      setPreferences({ ...preferences, interests: newInterests });
                    }}
                  >
                    <Text style={{ fontSize: 24, marginBottom: 4 }}>{interest.icon}</Text>
                    <Text style={[
                      styles.optionText,
                      { color: colors.text },
                      preferences.interests.includes(interest.value) && { color: '#FFFFFF' }
                    ]}>
                      {interest.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.backgroundLight }]}
              onPress={() => setShowPreferencesModal(false)}
              disabled={savingPreferences}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.primary }]}
              onPress={handleSavePreferences}
              disabled={savingPreferences}
            >
              {savingPreferences ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
    </Modal>

      {/* Modal Compartilhar */}
      <Modal
        visible={showShareModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            <View style={{
              width: '90%',
              maxWidth: 500,
              minWidth: 320,
              alignSelf: 'center',
              borderRadius: 16,
              padding: 20,
              backgroundColor: colors.card
            }}> 
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>Compartilhar Perfil</Text>
              <TouchableOpacity onPress={() => setShowShareModal(false)} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.description, { color: colors.textSecondary, marginBottom: 16 }]}>
              Escolha quem pode ver suas estatísticas de viagem
            </Text>

            <TouchableOpacity
              style={[
                styles.visibilityOption,
                { 
                  backgroundColor: !publicProfile ? colors.backgroundLight : 'transparent',
                  borderColor: !publicProfile ? colors.primary : colors.border,
                  borderWidth: !publicProfile ? 2 : 1,
                }
              ]}
              onPress={() => !publicProfile ? null : handleTogglePublicProfile()}
              disabled={sharingProfile}
            >
              <View style={styles.radioCircle}>
                {!publicProfile && <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>🔒 Privado</Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  Apenas você pode ver suas estatísticas
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.visibilityOption,
                { 
                  backgroundColor: publicProfile ? colors.backgroundLight : 'transparent',
                  borderColor: publicProfile ? colors.primary : colors.border,
                  borderWidth: publicProfile ? 2 : 1,
                }
              ]}
              onPress={() => publicProfile ? null : handleTogglePublicProfile()}
              disabled={sharingProfile}
            >
              <View style={styles.radioCircle}>
                {publicProfile && <View style={[styles.radioSelected, { backgroundColor: colors.primary }]} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>🌍 Público</Text>
                <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                  Qualquer pessoa com o link pode ver
                </Text>
              </View>
            </TouchableOpacity>

            {sharingProfile && (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 16 }} />
            )}

            {publicProfile && (
              <TouchableOpacity
                style={[styles.shareButton, { backgroundColor: colors.primary, marginTop: 16 }]}
                onPress={handleShareProfile}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>📤 Copiar Link de Compartilhamento</Text>
              </TouchableOpacity>
            )}

            {/* Botão textual 'Fechar' removido, pois o X já cumpre essa função */}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>

      {/* Modal Configurações */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            <View style={{
              width: '90%',
              maxWidth: 500,
              minWidth: 320,
              alignSelf: 'center',
              borderRadius: 16,
              padding: 24,
              backgroundColor: colors.card
            }}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Dados e Armazenamento</Text>
            
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Cache de dados</Text>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{cacheSize}</Text>
              </View>
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: colors.error }]}
                onPress={handleClearCache}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 14 }}>Limpar</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Roteiros offline</Text>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {stats.total} roteiros salvos
                </Text>
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Versão do app</Text>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>1.0.0</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.backgroundLight }]}
                onPress={() => setShowSettingsModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  headerAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  premiumBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
  },
  menuSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  menuArrow: {
    fontSize: 24,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  version: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  lastItinerary: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  lastLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  lastValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '98%',
    maxWidth: 500,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 40,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  changePhotoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    // backgroundColor aplicado dinamicamente
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  toggleButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  modalContentLarge: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  preferencesScroll: {
    maxHeight: 500,
  },
  formContent: {
    paddingBottom: 16,
  },
  achievementsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 12,
  },
  achievementsIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementsContent: {
    flex: 1,
  },
  achievementsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  achievementsSubtitle: {
    fontSize: 13,
  },
  achievementsArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  scrollHint: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 8,
    opacity: 0.7,
  },
});