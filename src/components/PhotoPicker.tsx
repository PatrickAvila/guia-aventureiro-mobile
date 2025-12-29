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
} from 'react-native';
import { photoService } from '../services/photoService';
import { useColors } from '../hooks/useColors';

interface PhotoPickerProps {
  onPhotosSelected?: (urls: string[]) => void;
  maxPhotos?: number;
  itineraryId?: string;
  existingPhotos?: string[];
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  onPhotosSelected,
  maxPhotos = 10,
  itineraryId,
  existingPhotos = [],
}) => {
  const colors = useColors();
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const handleAddPhoto = async () => {
    if (photos.length >= maxPhotos) {
      alert(`Você pode adicionar no máximo ${maxPhotos} fotos`);
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
        const remainingSlots = maxPhotos - photos.length;
        const uris = await photoService.pickMultipleFromGallery(remainingSlots);
        if (uris.length > 0) {
          await uploadPhotos(uris);
        }
      }
    );
  };

  const uploadPhoto = async (uri: string) => {
    setUploading(true);
    const result = await photoService.uploadPhoto(uri, itineraryId);
    setUploading(false);

    if (result && typeof result === 'object' && 'url' in result) {
      const newPhotos = [...photos, result.url];
      setPhotos(newPhotos);
      onPhotosSelected?.(newPhotos);
    }
  };

  const uploadPhotos = async (uris: string[]) => {
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
      const urls = results.map((r) => r.url);
      const newPhotos = [...photos, ...urls];
      setPhotos(newPhotos);
      onPhotosSelected?.(newPhotos);
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
          {photos.length}/{maxPhotos}
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

        {photos.length < maxPhotos && (
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
});
