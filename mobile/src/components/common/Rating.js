import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize } from '../../utils/theme';

const Rating = ({
  value = 0,
  maxValue = 5,
  size = 20,
  showValue = false,
  count,
  editable = false,
  onRatingChange,
  style,
}) => {
  const handlePress = (rating) => {
    if (editable && onRatingChange) {
      onRatingChange(rating);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxValue; i++) {
      const filled = i <= value;
      const halfFilled = i === Math.ceil(value) && value % 1 !== 0;

      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handlePress(i)}
          disabled={!editable}
          activeOpacity={editable ? 0.7 : 1}
        >
          <Ionicons
            name={filled ? 'star' : halfFilled ? 'star-half' : 'star-outline'}
            size={size}
            color={filled || halfFilled ? colors.warning : colors.disabled}
            style={styles.star}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>{renderStars()}</View>
      {showValue && (
        <Text style={styles.value}>{value.toFixed(1)}</Text>
      )}
      {count !== undefined && (
        <Text style={styles.count}>({count})</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  value: {
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  count: {
    marginLeft: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});

export default Rating;
