import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors, fontSize, borderRadius } from '../../utils/theme';
import { getInitials } from '../../utils/helpers';

const Avatar = ({
  source,
  firstName,
  lastName,
  size = 'md',
  style,
}) => {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const fontSizes = {
    sm: fontSize.xs,
    md: fontSize.md,
    lg: fontSize.xl,
    xl: fontSize.xxxl,
  };

  const dimension = sizes[size] || sizes.md;
  const textSize = fontSizes[size] || fontSizes.md;

  const containerStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
  };

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[styles.image, containerStyle, style]}
      />
    );
  }

  return (
    <View style={[styles.placeholder, containerStyle, style]}>
      <Text style={[styles.initials, { fontSize: textSize }]}>
        {getInitials(firstName, lastName)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.borderLight,
  },
  placeholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.textInverse,
    fontWeight: '600',
  },
});

export default Avatar;
