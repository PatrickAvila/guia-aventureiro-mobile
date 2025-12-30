// mobile/src/components/ShareModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Clipboard,
} from 'react-native';
import { showAlert } from './CustomAlert';
import { useColors } from '../hooks/useColors';
import { itineraryService } from '../services/itineraryService';
import { Colors } from '../constants/colors';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  itineraryId: string;
  itineraryTitle: string;
  existingShareLink?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  itineraryId,
  itineraryTitle,
  existingShareLink,
}) => {
  const colors = useColors();
  const [shareLink, setShareLink] = useState(existingShareLink || '');
  const [loading, setLoading] = useState(false);

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const response = await itineraryService.generateShareLink(itineraryId);
      setShareLink(response.fullUrl);
      showAlert('Sucesso', 'Link de compartilhamento gerado!');
    } catch (error: any) {
      showAlert('Erro', error.response?.data?.message || 'Erro ao gerar link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) {
      await handleGenerateLink();
      return;
    }

    await Clipboard.setString(shareLink);
    showAlert('Copiado!', 'Link copiado para a área de transferência');
  };

  const handleShareNative = async () => {
    if (!shareLink) {
      await handleGenerateLink();
      return;
    }

    try {
      await Share.share({
        message: `Confira meu roteiro de viagem: ${itineraryTitle}\n\n${shareLink}`,
        title: itineraryTitle,
        url: shareLink,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleShareWhatsApp = () => {
    if (!shareLink) return;
    const message = encodeURIComponent(
      `Confira meu roteiro de viagem: ${itineraryTitle}\n\n${shareLink}`
    );
    const whatsappUrl = `whatsapp://send?text=${message}`;
    // Em produção, usar Linking.openURL(whatsappUrl)
    window.open(whatsappUrl, '_blank');
  };

  const handleRevokeLink = async () => {
    showAlert(
      'Revogar Link',
      'Tem certeza? O link atual será desativado e não poderá ser acessado por ninguém.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Revogar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await itineraryService.revokeShareLink(itineraryId);
              setShareLink('');
              showAlert('Link removido', 'Seu roteiro agora é privado');
              onClose();
            } catch (error: any) {
              showAlert('Erro', error.response?.data?.message || 'Erro ao remover link');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>Compartilhar Roteiro</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.itineraryTitle}>{itineraryTitle}</Text>

              {shareLink ? (
                <>
                  <View style={styles.linkContainer}>
                    <Text style={styles.linkLabel}>Link de compartilhamento:</Text>
                    <View style={styles.linkBox}>
                      <Text style={styles.linkText} numberOfLines={1}>
                        {shareLink}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.primaryButton} onPress={handleCopyLink}>
                    <Text style={styles.primaryButtonText}>📋 Copiar Link</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryButton} onPress={handleShareNative}>
                    <Text style={styles.secondaryButtonText}>📤 Compartilhar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.whatsappButton} onPress={handleShareWhatsApp}>
                    <Text style={styles.whatsappButtonText}>💬 Enviar no WhatsApp</Text>
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  <TouchableOpacity
                    style={styles.dangerButton}
                    onPress={handleRevokeLink}
                    disabled={loading}
                  >
                    <Text style={styles.dangerButtonText}>🔒 Tornar Privado</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.description}>
                    Gere um link para compartilhar este roteiro com amigos e familiares. Qualquer
                    pessoa com o link poderá visualizar.
                  </Text>

                  <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.disabledButton]}
                    onPress={handleGenerateLink}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.primaryButtonText}>🔗 Gerar Link</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
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
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textSecondary,
    fontWeight: '300',
  },
  content: {
    padding: 20,
  },
  itineraryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  linkContainer: {
    marginBottom: 20,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  linkBox: {
    backgroundColor: Colors.backgroundLight,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkText: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: 'monospace',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: Colors.backgroundLight,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  whatsappButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },
  dangerButton: {
    backgroundColor: Colors.backgroundLight,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  dangerButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
