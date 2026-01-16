// mobile/src/components/ShareModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Linking,
  Platform
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { showAlert } from './CustomAlert';
import { useColors } from '../hooks/useColors';
import { useToast } from '../hooks/useToast';
import { itineraryService } from '../services/itineraryService';
import { Colors } from '../constants/colors';
import { Toast } from './Toast';

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
  const { toast, hideToast, success } = useToast();
  const [shareLink, setShareLink] = useState(existingShareLink || '');
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleGenerateLink = async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const response = await itineraryService.generateShareLink(itineraryId);
      if (isMounted.current) {
        setShareLink(response.fullUrl);
        success('Link gerado com sucesso!');
      }
    } catch (error: any) {
      if (isMounted.current) {
        showAlert('Erro', error.response?.data?.message || 'Erro ao gerar link');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleCopyLink = async () => {
    if (!isMounted.current) return;
    if (!shareLink) {
      await handleGenerateLink();
      return;
    }

    await Clipboard.setStringAsync(shareLink);
    if (isMounted.current) {
      success('Link copiado!');
    }
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

  const handleShareWhatsApp = async () => {
    if (!isMounted.current) return;
    let linkToShare = shareLink;
    
    // Se não tem link, gera um primeiro
    if (!linkToShare) {
      try {
        setLoading(true);
        const response = await itineraryService.generateShareLink(itineraryId);
        linkToShare = response.fullUrl;
        if (isMounted.current) {
          setShareLink(linkToShare);
        }
      } catch (error: any) {
        if (isMounted.current) {
          showAlert('Erro', error.response?.data?.message || 'Erro ao gerar link');
          setLoading(false);
        }
        return;
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    }

    const message = `Confira meu roteiro de viagem: ${itineraryTitle}\n\n${linkToShare}`;
    
    // Tenta abrir WhatsApp diretamente
    try {
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      await Linking.openURL(whatsappUrl);
    } catch (error) {
      // Fallback: usa Share nativo
      try {
        await Share.share({
          message: message,
          title: itineraryTitle,
        });
      } catch (shareError) {
        if (isMounted.current) {
          showAlert('Erro', 'Não foi possível compartilhar');
        }
      }
    }
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
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={{
            width: '100%',
            maxWidth: 400,
            alignSelf: 'center',
            borderRadius: 16,
            padding: 20,
            backgroundColor: colors.card
          }}
        >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, flex: 1 }]}>Compartilhar Roteiro</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.itinerarySubtitle, { color: colors.primary }]}>{itineraryTitle}</Text>

              {shareLink ? (
                <>
                  <View style={styles.linkContainer}>
                    <Text style={[styles.linkLabel, { color: colors.textSecondary }]}>Link de compartilhamento:</Text>
                    <View style={[styles.linkBox, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]}>
                      <Text style={[styles.linkText, { color: colors.primary }]} numberOfLines={1}>
                        {shareLink}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]} 
                    onPress={handleCopyLink}
                  >
                    <Text style={styles.primaryButtonText}>📋 Copiar Link</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.secondaryButton, { backgroundColor: colors.backgroundLight, borderColor: colors.border }]} 
                    onPress={handleShareNative}
                  >
                    <Text style={[styles.secondaryButtonText, { color: colors.text }]}>📤 Compartilhar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.whatsappButton, { backgroundColor: '#25D366' }]} 
                    onPress={handleShareWhatsApp}
                  >
                    <Text style={styles.whatsappButtonText}>💬 Enviar no WhatsApp</Text>
                  </TouchableOpacity>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  <TouchableOpacity
                    style={[styles.dangerButton, { backgroundColor: colors.backgroundLight, borderColor: colors.error }]}
                    onPress={handleRevokeLink}
                    disabled={loading}
                  >
                    <Text style={[styles.dangerButtonText, { color: colors.error }]}>🔒 Tornar Privado</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.description, { color: colors.textSecondary }]}>
                    Gere um link para compartilhar este roteiro com amigos e familiares. Qualquer
                    pessoa com o link poderá visualizar.
                  </Text>

                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
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
      
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    minWidth: 320,
    alignSelf: 'center',
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  itinerarySubtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  linkContainer: {
    marginBottom: 16,
  },
  linkLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  linkBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  linkText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  whatsappButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  dangerButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
