// mobile/src/components/OfflineIndicator.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { offlineService } from '../services/offlineService';
import { useColors } from '../hooks/useColors';

export const OfflineIndicator: React.FC = () => {
  const colors = useColors();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Verificar a cada 5s
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    const info = await offlineService.getCacheInfo();
    setIsOnline(info.isOnline);
    setPendingSync(info.pendingSyncCount);
  };

  const handleSync = async () => {
    await offlineService.syncPendingActions();
    checkStatus();
  };

  if (isOnline && pendingSync === 0) {
    return null; // Não mostrar nada se estiver online e sem pendências
  }

  return (
    <View style={[styles.container, !isOnline && styles.offline]}>
      {!isOnline ? (
        <View style={styles.content}>
          <Text style={styles.icon}>📴</Text>
          <Text style={styles.text}>Modo Offline</Text>
        </View>
      ) : pendingSync > 0 ? (
        <TouchableOpacity style={styles.content} onPress={handleSync}>
          <Text style={styles.icon}>🔄</Text>
          <Text style={styles.text}>
            {pendingSync} {pendingSync === 1 ? 'alteração' : 'alterações'} para sincronizar
          </Text>
          <Text style={styles.syncButton}>Sincronizar</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor aplicado dinamicamente
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offline: {
    backgroundColor: '#ff6b6b',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  syncButton: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
});
