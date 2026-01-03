import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../utils/theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const base = [styles.button, styles[`button_${size}`]];

    switch (variant) {
      case 'secondary':
        base.push(styles.buttonSecondary);
        break;
      case 'outline':
        base.push(styles.buttonOutline);
        break;
      case 'ghost':
        base.push(styles.buttonGhost);
        break;
      case 'danger':
        base.push(styles.buttonDanger);
        break;
      default:
        base.push(styles.buttonPrimary);
    }

    if (disabled) {
      base.push(styles.buttonDisabled);
    }

    return base;
  };

  const getTextStyle = () => {
    const base = [styles.buttonText, styles[`text_${size}`]];

    switch (variant) {
      case 'outline':
      case 'ghost':
        base.push(styles.textPrimary);
        break;
      default:
        base.push(styles.textWhite);
    }

    if (disabled) {
      base.push(styles.textDisabled);
    }

    return base;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={[...getTextStyle(), icon && styles.textWithIcon, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  button_sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  button_md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  button_lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  buttonDanger: {
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  buttonText: {
    fontWeight: '600',
  },
  text_sm: {
    fontSize: fontSize.sm,
  },
  text_md: {
    fontSize: fontSize.md,
  },
  text_lg: {
    fontSize: fontSize.lg,
  },
  textWhite: {
    color: colors.textInverse,
  },
  textPrimary: {
    color: colors.primary,
  },
  textDisabled: {
    color: colors.textLight,
  },
  textWithIcon: {
    marginLeft: spacing.sm,
  },
});

export default Button;
