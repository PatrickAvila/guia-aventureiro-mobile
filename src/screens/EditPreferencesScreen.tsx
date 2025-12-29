import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { showAlert } from '../components/CustomAlert';
import { useAuth } from '../context/AuthContext';
import { useColors } from '../hooks/useColors';

export const EditPreferencesScreen = ({ navigation }: any) => {
  const colors = useColors();
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  
  const [preferences, setPreferences] = useState({
    travelStyle: user?.preferences?.travelStyle || '',
    interests: user?.preferences?.interests || [],
    budgetLevel: user?.preferences?.budgetLevel || '',
    pace: user?.preferences?.pace || '',
  });

  const travelStyles = [
    { value: 'solo', label: 'Solo', icon: '🚶' },
    { value: 'casal', label: 'Casal', icon: '💑' },
    { value: 'familia', label: 'Família', icon: '👨‍👩‍👧‍👦' },
    { value: 'amigos', label: 'Amigos', icon: '👥' },
    { value: 'mochileiro', label: 'Mochileiro', icon: '🎒' },
  ];

  const budgetOptions = [
    { value: 'economico', label: 'Econômico', icon: '💰' },
    { value: 'medio', label: 'Médio', icon: '💳' },
    { value: 'luxo', label: 'Luxo', icon: '💎' },
  ];

  const paceOptions = [
    { value: 'relaxado', label: 'Relaxado', icon: '🧘' },
    { value: 'moderado', label: 'Moderado', icon: '🚶' },
    { value: 'intenso', label: 'Intenso', icon: '🏃' },
  ];

  const interestOptions = [
    { value: 'cultura', label: 'Cultura', icon: '🎭' },
    { value: 'natureza', label: 'Natureza', icon: '🏞️' },
    { value: 'gastronomia', label: 'Gastronomia', icon: '🍽️' },
    { value: 'aventura', label: 'Aventura', icon: '🧗' },
    { value: 'praia', label: 'Praia', icon: '🏖️' },
    { value: 'historia', label: 'História', icon: '🏛️' },
    { value: 'compras', label: 'Compras', icon: '🛍️' },
    { value: 'vida-noturna', label: 'Vida Noturna', icon: '🎉' },
  ];

  const toggleInterest = (interest: string) => {
    setPreferences((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(user?.name || '', user?.avatar, preferences);
      showAlert('Sucesso', 'Preferências salvas!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      showAlert('Erro', 'Erro ao salvar preferências');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Estilo de Viagem</Text>
          <View style={styles.optionsGrid}>
            {travelStyles.map((style) => (
              <TouchableOpacity
                key={style.value}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      preferences.travelStyle === style.value
                        ? colors.primary + '20'
                        : colors.backgroundLight,
                    borderColor:
                      preferences.travelStyle === style.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setPreferences({ ...preferences, travelStyle: style.value })}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{style.icon}</Text>
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        preferences.travelStyle === style.value ? colors.primary : colors.text,
                    },
                  ]}
                >
                  {style.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Orçamento</Text>
          <View style={styles.optionsGrid}>
            {budgetOptions.map((budget) => (
              <TouchableOpacity
                key={budget.value}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      preferences.budgetLevel === budget.value
                        ? colors.primary + '20'
                        : colors.backgroundLight,
                    borderColor:
                      preferences.budgetLevel === budget.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setPreferences({ ...preferences, budgetLevel: budget.value })}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{budget.icon}</Text>
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        preferences.budgetLevel === budget.value ? colors.primary : colors.text,
                    },
                  ]}
                >
                  {budget.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ritmo da Viagem</Text>
          <View style={styles.optionsGrid}>
            {paceOptions.map((pace) => (
              <TouchableOpacity
                key={pace.value}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      preferences.pace === pace.value
                        ? colors.primary + '20'
                        : colors.backgroundLight,
                    borderColor: preferences.pace === pace.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setPreferences({ ...preferences, pace: pace.value })}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{pace.icon}</Text>
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: preferences.pace === pace.value ? colors.primary : colors.text,
                    },
                  ]}
                >
                  {pace.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Interesses</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Selecione um ou mais
          </Text>
          <View style={styles.optionsGrid}>
            {interestOptions.map((interest) => (
              <TouchableOpacity
                key={interest.value}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: preferences.interests.includes(interest.value)
                      ? colors.primary + '20'
                      : colors.backgroundLight,
                    borderColor: preferences.interests.includes(interest.value)
                      ? colors.primary
                      : colors.border,
                  },
                ]}
                onPress={() => toggleInterest(interest.value)}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{interest.icon}</Text>
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: preferences.interests.includes(interest.value)
                        ? colors.primary
                        : colors.text,
                    },
                  ]}
                >
                  {interest.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Preferências</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    minWidth: 100,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
