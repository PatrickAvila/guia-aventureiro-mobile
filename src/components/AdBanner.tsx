// mobile/src/components/AdBanner.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useColors } from '../hooks/useColors';
import { useMySubscription } from '../hooks/useSubscription';

const { width } = Dimensions.get('window');

interface AdBannerProps {
  onUpgradePress?: () => void;
}

/**
 * Banner de anúncio exibido apenas para usuários FREE
 * No futuro, pode ser substituído por AdMob ou similar
 */
export const AdBanner: React.FC<AdBannerProps> = ({ onUpgradePress }) => {
  const colors = useColors();
  const { data: subscriptionData } = useMySubscription();

  const currentPlan = subscriptionData?.subscription?.plan || 'free';

  // Só mostrar para usuários FREE
  if (currentPlan !== 'free') {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          ✨ Remova anúncios
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={onUpgradePress}
        >
          <Text style={styles.buttonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
