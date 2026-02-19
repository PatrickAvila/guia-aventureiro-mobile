// mobile/src/components/PhotoPicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { photoService } from '../services/photoService';
import { useColors } from '../hooks/useColors';
import { useMySubscription } from '../hooks/useSubscription';
import { showAlert } from './CustomAlert';

interface PhotoPickerProps {
  onPhotosSelected?: (urls: string[]) => void;
  maxPhotos?: number;
  itineraryId?: string;
  existingPhotos?: string[];
  onUpgradePress?: () => void;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  onPhotosSelected,
  maxPhotos = 10,
  itineraryId,
  existingPhotos = [],
  onUpgradePress,
}) => {
  const colors = useColors();
  const { data: subscriptionData } = useMySubscription();
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const currentPlan = subscriptionData?.subscription?.plan || 'free';
  const planLimits = subscriptionData?.subscription?.limits;
  
  // Determinar limite de fotos baseado no plano
  const photoLimit = planLimits?.photos || 0;

  const handleAddPhoto = async () => {
    // Verificar se o plano permite upload de fotos
    if (photoLimit === 0) {
      showAlert(
        'Recurso Premium',
        'Upload de fotos está disponível apenas para assinantes Premium (até 20 fotos) e Pro (até 50 fotos).',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Ver Planos',
            onPress: () => {
              onUpgradePress?.();
            }
          }
        ]
      );
      return;
    }
    
    if (photos.length >= photoLimit) {
      showAlert(
        'Limite Atingido',
        `Você atingiu o limite de ${photoLimit} fotos por roteiro do plano ${currentPlan.toUpperCase()}. Faça upgrade para adicionar mais fotos!`,
        [
          { text: 'OK', style: 'cancel' },
          {
            text: 'Ver Planos',
            onPress: () => {
              onUpgradePress?.();
            }
          }
        ]
      );
      return;
    }

    photoService.showImagePickerOptions(
      async () => {
        const uri = await photoService.takePhoto();
        if (uri) {
          await uploadPhoto(uri);
        }
      },
      async () => {
        const remainingSlots = photoLimit - photos.length;
        const uris = await photoService.pickMultipleFromGallery(remainingSlots);
        if (uris.length > 0) {
          await uploadPhotos(uris);
        }
      }
    );
  };

  const uploadPhoto = async (uri: string) => {
    try {
      setUploading(true);
      const result = await photoService.uploadPhoto(uri, itineraryId);
      setUploading(false);

      if (result && typeof result === 'string') {
        const newPhotos = [...photos, result];
        setPhotos(newPhotos);
        onPhotosSelected?.(newPhotos);
        Alert.alert('Sucesso', 'Foto adicionada com sucesso!');
      } else {
        Alert.alert('Erro', 'Não foi possível fazer upload da foto. Tente novamente.');
      }
    } catch (error) {
      setUploading(false);
      console.error('Erro ao fazer upload:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao fazer upload da foto. Verifique sua conexão e tente novamente.');
    }
  };

  const uploadPhotos = async (uris: string[]) => {
    try {
      setUploading(true);
      const results = await photoService.uploadMultiplePhotos(
        uris,
        itineraryId,
        (current, total) => {
          setUploadProgress({ current, total });
        }
      );
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });

      if (results.length > 0) {
        const newPhotos = [...photos, ...results];
        setPhotos(newPhotos);
        onPhotosSelected?.(newPhotos);
        Alert.alert('Sucesso', `${results.length} foto(s) adicionada(s) com sucesso!`);
      } else {
        Alert.alert('Erro', 'Não foi possível fazer upload das fotos. Tente novamente.');
      }
    } catch (error) {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
      console.error('Erro ao fazer upload:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao fazer upload das fotos. Verifique sua conexão e tente novamente.');
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosSelected?.(newPhotos);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Fotos</Text>
        <Text style={[styles.counter, { color: colors.textSecondary }]}>
          {photos.length}/{photoLimit}
          {photoLimit === 0 && ' (Premium)'}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={[styles.photo, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: colors.error || '#DC2626' }]}
              onPress={() => removePhoto(index)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {photos.length < photoLimit && (
          <TouchableOpacity
            style={[styles.addButton, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={handleAddPhoto}
            disabled={uploading}
          >
            {uploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                {uploadProgress.total > 0 && (
                  <Text style={[styles.uploadingText, { color: colors.textSecondary }]}>
                    {uploadProgress.current}/{uploadProgress.total}
                  </Text>
                )}
              </View>
            ) : (
              <>
                <Text style={[styles.addIcon, { color: colors.textSecondary }]}>+</Text>
                <Text style={[styles.addText, { color: colors.textSecondary }]}>Adicionar</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        
        {photoLimit === 0 && (
          <TouchableOpacity
            style={[styles.upgradeButton, { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }]}
            onPress={onUpgradePress}
          >
            <Text style={[styles.upgradeIcon, { color: colors.primary }]}>⭐</Text>
            <Text style={[styles.upgradeText, { color: colors.primary }]}>Upgrade{'\n'}Premium</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    // color aplicado dinamicamente
  },
  counter: {
    fontSize: 14,
    // color aplicado dinamicamente
  },
  photosScroll: {
    flexDirection: 'row',
  },
  photoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    // backgroundColor aplicado dinamicamente
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    // backgroundColor aplicado dinamicamente
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    // borderColor, backgroundColor aplicados dinamicamente
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 32,
    // color aplicado dinamicamente
    marginBottom: 4,
  },
  addText: {
    fontSize: 12,
    // color aplicado dinamicamente
  },
  uploadingContainer: {
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 12,
    // color aplicado dinamicamente
    marginTop: 8,
  },
  upgradeButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  upgradeText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
