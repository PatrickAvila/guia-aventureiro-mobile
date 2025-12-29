import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { useColors } from '../hooks/useColors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const colors = useColors();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const SkeletonItineraryCard: React.FC = () => {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <SkeletonLoader height={150} borderRadius={12} style={{ marginBottom: 16 }} />
      <SkeletonLoader width="80%" height={24} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="60%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="70%" height={16} style={{ marginBottom: 16 }} />
      <View style={styles.footer}>
        <SkeletonLoader width={100} height={28} borderRadius={12} />
        <SkeletonLoader width={60} height={28} borderRadius={12} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    // backgroundColor aplicado dinamicamente
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
  },
});
