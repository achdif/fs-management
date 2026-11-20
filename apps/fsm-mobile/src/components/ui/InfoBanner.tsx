import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, fontSize } from '../../theme/tokens';

interface InfoBannerProps {
  message: string;
  variant?: 'info' | 'success' | 'warning';
}

const VARIANTS = {
  info: { bg: colors.infoBg, color: colors.info, icon: 'ℹ️' },
  success: { bg: colors.successBg, color: colors.success, icon: '✅' },
  warning: { bg: colors.warningBg, color: colors.warning, icon: '⚠️' },
} as const;

const InfoBanner = ({ message, variant = 'info' }: InfoBannerProps) => {
  const v = VARIANTS[variant];
  return (
    <View style={[styles.banner, { backgroundColor: v.bg }]}>
      <Text style={styles.icon}>{v.icon}</Text>
      <Text style={[styles.text, { color: v.color }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  icon: {
    fontSize: 14,
    marginTop: 1,
  },
  text: {
    flex: 1,
    fontSize: fontSize.small,
    lineHeight: 18,
  },
});

export default InfoBanner;
