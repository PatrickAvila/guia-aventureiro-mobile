// Importa utilitário de formatação BRL
import { formatBRL } from './Input';
// mobile/src/components/RatingModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { showAlert } from './CustomAlert';
import { useColors } from '../hooks/useColors';
import { RatingStars } from './RatingStars';
import { PhotoPicker } from './PhotoPicker';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: { 
    score: number; 
    comment: string; 
    photos: string[];
    highlights?: string[];
    wouldRecommend?: boolean;
  }) => Promise<void>;
  existingRating?: {
    score: number;
    comment?: string;
    photos?: string[];
    highlights?: string[];
    wouldRecommend?: boolean;
  };
  itineraryId: string;
}

const HIGHLIGHT_OPTIONS = [
  { id: 'acomodacao', label: 'Acomodação', icon: '🏨' },
  { id: 'gastronomia', label: 'Gastronomia', icon: '🍽️' },
  { id: 'atracao', label: 'Atrações', icon: '🎭' },
  { id: 'transporte', label: 'Transporte', icon: '🚗' },
  { id: 'custo_beneficio', label: 'Custo-Benefício', icon: '💰' },
  { id: 'organizacao', label: 'Organização', icon: '📋' },
];

export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  existingRating,
  itineraryId,
}) => {
  const colors = useColors();
  const [score, setScore] = useState(existingRating?.score || 0);
  const [comment, setComment] = useState(existingRating?.comment || '');
  const [photos, setPhotos] = useState<string[]>(existingRating?.photos || []);
  const [highlights, setHighlights] = useState<string[]>(existingRating?.highlights || []);
  const [wouldRecommend, setWouldRecommend] = useState(existingRating?.wouldRecommend ?? true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingRating) {
      setScore(existingRating.score);
      setComment(existingRating.comment || '');
      setPhotos(existingRating.photos || []);
      setHighlights(existingRating.highlights || []);
      setWouldRecommend(existingRating.wouldRecommend ?? true);
    }
  }, [existingRating]);

  const toggleHighlight = (highlightId: string) => {
    setHighlights(prev => {
      if (prev.includes(highlightId)) {
        return prev.filter(h => h !== highlightId);
      } else {
        return [...prev, highlightId];
      }
    });
  };

  const handleSubmit = async () => {
    if (score === 0) {
      showAlert('Atenção', 'Por favor, selecione uma nota');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ score, comment, photos, highlights, wouldRecommend });
      onClose();
    } catch (error) {
      showAlert('Erro', 'Não foi possível salvar a avaliação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}> 
            <View style={[styles.header, { borderBottomColor: colors.border }]}> 
              <Text style={[styles.title, { color: colors.text }]}> 
                {existingRating ? 'Editar Avaliação' : 'Avaliar Viagem'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Avaliação com Estrelas */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Como foi sua experiência?</Text>
                <RatingStars
                  rating={score}
                  onRatingChange={setScore}
                  size={40}
                  editable
                  showLabel
                />
              </View>

              {/* Highlights */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>O que você mais gostou?</Text>
                <View style={styles.highlightsContainer}>
                  {HIGHLIGHT_OPTIONS.map((option) => {
                    const isSelected = highlights.includes(option.id);
                    return (
                      <Pressable
                        key={option.id}
                        style={[
                          styles.highlightChip,
                          { 
                            backgroundColor: isSelected ? colors.primary : colors.background,
                            borderColor: isSelected ? colors.primary : colors.border 
                          }
                        ]}
                        onPress={() => toggleHighlight(option.id)}
                      >
                        <Text style={styles.highlightIcon}>{option.icon}</Text>
                        <Text style={[
                          styles.highlightLabel,
                          { color: isSelected ? '#FFFFFF' : colors.text }
                        ]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Recomendação */}
              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Você recomendaria este roteiro?</Text>
                <View style={styles.recommendContainer}>
                  <Pressable
                    style={[
                      styles.recommendButton,
                      { 
                        backgroundColor: wouldRecommend ? colors.success : colors.background,
                        borderColor: wouldRecommend ? colors.success : colors.border 
                      }
                    ]}
                    onPress={() => setWouldRecommend(true)}
                  >
                    <Text style={[styles.recommendText, { color: wouldRecommend ? '#FFFFFF' : colors.text }]}>
                      👍 Sim
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.recommendButton,
                      { 
                        backgroundColor: !wouldRecommend ? colors.error : colors.background,
                        borderColor: !wouldRecommend ? colors.error : colors.border 
                      }
                    ]}
                    onPress={() => setWouldRecommend(false)}
                  >
                    <Text style={[styles.recommendText, { color: !wouldRecommend ? '#FFFFFF' : colors.text }]}>
                      👎 Não
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Comentário (opcional)</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder="Conte como foi sua viagem, dicas, lugares favoritos..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={6}
                  maxLength={1000}
                  value={comment}
                  onChangeText={setComment}
                  textAlignVertical="top"
                />
                <Text style={[styles.charCount, { color: colors.textSecondary }]}>{comment.length}/1000</Text>
              </View>

              <View style={styles.section}>
                <Text style={[styles.label, { color: colors.text }]}>Fotos da viagem (opcional)</Text>
                <PhotoPicker
                  onPhotosSelected={setPhotos}
                  maxPhotos={6}
                  itineraryId={itineraryId}
                  existingPhotos={photos}
                />
              </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border }]}> 
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: colors.background }]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {existingRating ? 'Atualizar' : 'Publicar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    // backgroundColor aplicado dinamicamente
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    // borderBottomColor aplicado dinamicamente
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    // color aplicado dinamicamente
  },
  closeButton: {
    fontSize: 24,
    // color aplicado dinamicamente
    fontWeight: '300',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    // color aplicado dinamicamente
    marginBottom: 12,
  },
  textArea: {
    // backgroundColor, borderColor, color aplicados dinamicamente
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 120,
    borderWidth: 1,
  },
  charCount: {
    fontSize: 12,
    // color aplicado dinamicamente
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    // borderTopColor aplicado dinamicamente
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    // backgroundColor aplicado dinamicamente
  },
  cancelButtonText: {
    // color aplicado dinamicamente
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    // backgroundColor aplicado dinamicamente
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
  highlightsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  highlightIcon: {
    fontSize: 18,
  },
  highlightLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  recommendButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  recommendText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
