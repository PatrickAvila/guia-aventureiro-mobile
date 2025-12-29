// mobile/src/components/ThemeToggle.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useColors } from '../hooks/useColors';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={[styles.icon, isDark && styles.iconActive]}>☀️</Text>
        <View
          style={[
            styles.toggle,
            { backgroundColor: isDark ? colors.primary : colors.border },
          ]}
        >
          <View
            style={[
              styles.thumb,
              { backgroundColor: colors.card, borderWidth: isDark ? 0 : 1, borderColor: colors.border },
              isDark && styles.thumbActive,
            ]}
          />
        </View>
        <Text style={[styles.icon, !isDark && styles.iconActive]}>🌙</Text>
      </View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {isDark ? 'Modo Escuro' : 'Modo Claro'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 24,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 4,
    justifyContent: 'center',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    elevation: 3,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
});
