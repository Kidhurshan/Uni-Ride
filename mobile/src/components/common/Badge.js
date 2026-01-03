import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../utils/theme';

const Badge = ({
  text,
  variant = 'default',
  size = 'md',
  style,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: colors.success + '20', textColor: colors.success };
      case 'warning':
        return { backgroundColor: colors.warning + '20', textColor: colors.warning };
      case 'error':
        return { backgroundColor: colors.error + '20', textColor: colors.error };
      case 'info':
        return { backgroundColor: colors.info + '20', textColor: colors.info };
      case 'primary':
        return { backgroundColor: colors.primary + '20', textColor: colors.primary };
      default:
        return { backgroundColor: colors.borderLight, textColor: colors.textSecondary };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 2, paddingHorizontal: 6, fontSize: fontSize.xs };
      case 'lg':
        return { paddingVertical: 8, paddingHorizontal: 14, fontSize: fontSize.md };
      default:
        return { paddingVertical: 4, paddingHorizontal: 10, fontSize: fontSize.sm };
    }
  };

  const { backgroundColor, textColor } = getVariantStyle();
  const sizeStyle = getSizeStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColor, fontSize: sizeStyle.fontSize },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});

export default Badge;
