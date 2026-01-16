// mobile/src/services/photoService.ts
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../config/env';

interface UploadResult {
  url: string;
  publicId: string;
}

class PhotoService {
  /**
   * Solicita permissões de câmera e galeria
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true; // Web não precisa de permissões
    }

    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      Alert.alert(
        'Permissões necessárias',
        'Precisamos de acesso à câmera e galeria para você adicionar fotos aos seus roteiros.'
      );
      return false;
    }

    return true;
  }

  /**
   * Abre a câmera para tirar uma foto
   */
  async takePhoto(): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
      return null;
    }
  }

  /**
   * Abre a galeria para selecionar uma foto
   */
  async pickFromGallery(): Promise<{ uri: string } | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      return { uri: result.assets[0].uri };
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a foto.');
      return null;
    }
  }

  /**
   * Seleciona múltiplas fotos da galeria
   */
  async pickMultipleFromGallery(max: number = 10): Promise<string[]> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return [];

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: max,
        quality: 0.8,
      });

      if (result.canceled) {
        return [];
      }

      return result.assets.map((asset) => asset.uri);
    } catch (error) {
      console.error('Erro ao selecionar fotos:', error);
      Alert.alert('Erro', 'Não foi possível selecionar as fotos.');
      return [];
    }
  }

  /**
   * Faz upload de uma foto para o backend (que enviará ao Cloudinary)
   */
  async uploadPhoto(uri: string, itineraryId?: string): Promise<string | null> {
    try {
      if (!uri) {
        throw new Error('URI da foto não fornecida');
      }

      // Criar FormData
      const formData = new FormData();
      
      // Adicionar imagem
      const filename = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('photo', {
        uri: Platform.OS === 'web' ? uri : uri,
        name: filename,
        type,
      } as any);

      if (itineraryId) {
        formData.append('itineraryId', itineraryId);
      }

      // Fazer upload
      const token = await AsyncStorage.getItem('accessToken');
      console.log('📤 Fazendo upload para:', `${env.apiUrl}/upload`);
      console.log('📤 URI da foto:', uri);
      console.log('📤 Nome do arquivo:', filename);
      console.log('📤 Tipo:', type);
      
      const response = await fetch(`${env.apiUrl}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📥 Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro do servidor:', errorData);
        throw new Error(errorData.message || 'Erro ao fazer upload da foto');
      }

      const data = await response.json();
      console.log('✅ Upload concluído:', data);
      return data.url; // Retorna apenas a URL
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      throw error; // Lança o erro para ser tratado pelo chamador
    }
  }

  /**
   * Faz upload de múltiplas fotos
   */
  async uploadMultiplePhotos(
    uris: string[],
    itineraryId?: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<string[]> {
    const results: string[] = [];

    for (let i = 0; i < uris.length; i++) {
      if (onProgress) {
        onProgress(i + 1, uris.length);
      }

      const result = await this.uploadPhoto(uris[i], itineraryId);
      if (result && typeof result === 'string') {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Mostra opções para escolher câmera ou galeria
   */
  showImagePickerOptions(
    onTakePhoto: () => void,
    onPickFromGallery: () => void
  ): void {
    if (Platform.OS === 'web') {
      // No web, apenas permitir seleção de arquivo
      onPickFromGallery();
      return;
    }

    Alert.alert(
      'Adicionar foto',
      'Escolha uma opção',
      [
        {
          text: 'Tirar foto',
          onPress: onTakePhoto,
        },
        {
          text: 'Escolher da galeria',
          onPress: onPickFromGallery,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }
}

export const photoService = new PhotoService();
