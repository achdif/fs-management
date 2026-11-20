import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, fontSize } from '../../theme/tokens';
import type { FollowUpResult } from '@fs-management/prebook';

export type ChipKind = FollowUpResult | 'overdue' | 'converted' | 'lost' | 'none';

const META: Record<string, { label: string; color: string; bg: string }> = {
  not_ready: { label: 'Not Ready', color: colors.neutral, bg: colors.neutralBg },
  interested: { label: 'Interested', color: colors.info, bg: colors.infoBg },
  meeting: { label: 'Meeting', color: colors.warning, bg: colors.warningBg },
  ready_to_book: { label: 'Ready to Book', color: colors.success, bg: colors.successBg },
  overdue: { label: 'OVERDUE', color: colors.danger, bg: colors.dangerBg },
  converted: { label: 'Converted', color: colors.success, bg: colors.successBg },
  lost: { label: 'Lost', color: colors.danger, bg: colors.dangerBg },
  none: { label: '—', color: colors.textMuted, bg: colors.neutralBg },
};

interface StatusChipProps {
  kind: ChipKind;
  label?: string;
}

const StatusChip = ({ kind, label }: StatusChipProps) => {
  const meta = META[kind] ?? META.none;
  return (
    <View style={[styles.chip, { backgroundColor: meta.bg }]}>
      <Text style={[styles.text, { color: meta.color }]}>{label ?? meta.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.caption,
    fontWeight: '600',
  },
});

export default StatusChip;
