import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, fontSize } from '../../theme/tokens';
import StatusChip, { type ChipKind } from './StatusChip';

export type TimelineState = 'completed' | 'planned' | 'inquiry';

interface TimelineItemProps {
  title: string;
  subtitle?: string;
  timestamp?: string | null;
  chip?: ChipKind;
  chipLabel?: string;
  quote?: string | null;
  state?: TimelineState;
  isLast?: boolean;
}

const DOT_COLORS: Record<TimelineState, string> = {
  completed: colors.primary,
  planned: colors.primary,
  inquiry: colors.textMuted,
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const TimelineItem = ({ title, subtitle, timestamp, chip, chipLabel, quote, state = 'completed', isLast = false }: TimelineItemProps) => {
  const isPlanned = state === 'planned';
  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.dot, { backgroundColor: DOT_COLORS[state] }, isPlanned && styles.dotPlanned]} />
        {!isLast && <View style={styles.line} />}
      </View>
      <View style={[styles.card, isPlanned && styles.cardPlanned]}>
        <View style={styles.cardHeader}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            {timestamp ? <Text style={styles.timestamp}>{formatDate(timestamp)}</Text> : null}
          </View>
          {chip ? <StatusChip kind={chip} label={chipLabel} /> : null}
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {quote ? (
          <View style={styles.quote}>
            <Text style={styles.quoteText}>"{quote}"</Text>
          </View>
        ) : null}
        {isPlanned ? <Text style={styles.plannedLabel}>Scheduled — editable</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  rail: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 18,
  },
  dotPlanned: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardPlanned: {
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  subtitle: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  quote: {
    marginTop: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
  },
  quoteText: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  plannedLabel: {
    fontSize: fontSize.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});

export default TimelineItem;
