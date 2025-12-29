import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '../hooks/useColors';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ops! Algo deu errado',
  message = 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.',
  onRetry,
  retryText = 'Tentar novamente',
}) => {
  const colors = useColors();
  
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>😕</Text>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={onRetry}>
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    // color aplicado dinamicamente
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    // color aplicado dinamicamente
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    // backgroundColor aplicado dinamicamente
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
