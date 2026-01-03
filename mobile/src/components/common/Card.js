import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../utils/theme';

const Card = ({
  children,
  onPress,
  style,
  noPadding = false,
  variant = 'elevated',
}) => {
  const cardStyle = [
    styles.card,
    variant === 'elevated' && shadows.md,
    variant === 'outlined' && styles.outlined,
    !noPadding && styles.padding,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  padding: {
    padding: spacing.md,
  },
});

export default Card;
