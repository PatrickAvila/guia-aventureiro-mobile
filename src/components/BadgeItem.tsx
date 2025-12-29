// mobile/src/components/BadgeItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '../hooks/useColors';

interface BadgeItemProps {
  icon: string;
  title: string;
  description: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  onPress?: () => void;
}

export const BadgeItem: React.FC<BadgeItemProps> = ({
  icon,
  title,
  description,
  points,
  unlocked,
  unlockedAt,
  onPress,
}) => {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: unlocked ? colors.card : colors.background,
          borderColor: unlocked ? colors.primary : colors.border,
          opacity: unlocked ? 1 : 0.5,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: unlocked ? colors.primary : colors.border }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {unlocked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {description}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.points, { color: colors.primary }]}>+{points} pontos</Text>
          {unlocked && unlockedAt && (
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              {new Date(unlockedAt).toLocaleDateString('pt-BR')}
            </Text>
          )}
        </View>
      </View>

      {!unlocked && (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
    color: '#4CAF50',
    marginLeft: 8,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  points: {
    fontSize: 14,
    fontWeight: '700',
  },
  date: {
    fontSize: 11,
  },
  lockOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  lockIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
});
