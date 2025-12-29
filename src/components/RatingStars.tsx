// mobile/src/components/RatingStars.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useColors } from '../hooks/useColors';

interface RatingStarsProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  editable?: boolean;
  showLabel?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRatingChange,
  size = 24,
  editable = false,
  showLabel = false,
}) => {
  const colors = useColors();
  const stars = [1, 2, 3, 4, 5];

  const handlePress = (value: number) => {
    if (editable && onRatingChange) {
      onRatingChange(value);
    }
  };

  const getLabel = (value: number): string => {
    const labels: Record<number, string> = {
      1: 'Muito Ruim',
      2: 'Ruim',
      3: 'Regular',
      4: 'Bom',
      5: 'Excelente',
    };
    return labels[value] || '';
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {stars.map((star) => {
          const filled = star <= rating;
          const StarComponent = editable ? TouchableOpacity : View;

          return (
            <StarComponent
              key={star}
              onPress={() => handlePress(star)}
              style={[styles.star, !editable && styles.staticStar]}
              activeOpacity={0.7}
            >
              <Text style={[styles.starText, { fontSize: size, color: filled ? (colors.warning || '#FFA500') : colors.textSecondary }]}>
                {filled ? '★' : '☆'}
              </Text>
            </StarComponent>
          );
        })}
      </View>

      {showLabel && rating > 0 && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>{getLabel(rating)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    padding: 2,
  },
  staticStar: {
    padding: 0,
  },
  starText: {
  },
  label: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
});
