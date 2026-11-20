import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing, fontSize } from '../../theme/tokens';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'lg' | 'md';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const Button = ({ title, onPress, variant = 'primary', size = 'lg', disabled = false, loading = false, style }: ButtonProps) => {
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';
  const isLg = size === 'lg';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isLg ? styles.lg : styles.md,
        isPrimary ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.surface : colors.primary} size="small" />
      ) : (
        <Text style={[styles.text, isLg ? styles.textLg : styles.textMd, isPrimary ? styles.textPrimary : styles.textSecondary]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.input,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  lg: {
    height: 52,
    paddingHorizontal: spacing.xl,
  },
  md: {
    height: 44,
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  textLg: {
    fontSize: fontSize.body,
  },
  textMd: {
    fontSize: fontSize.small + 1,
  },
  textPrimary: {
    color: colors.surface,
  },
  textSecondary: {
    color: colors.textPrimary,
  },
});

export default Button;
