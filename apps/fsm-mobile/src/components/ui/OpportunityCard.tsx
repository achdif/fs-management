import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, fontSize } from '../../theme/tokens';
import Avatar from './Avatar';
import StatusChip from './StatusChip';
import type { PreBookOpportunity } from '@fs-management/prebook';

interface OpportunityCardProps {
  item: PreBookOpportunity;
  customerName?: string | null;
  onPress?: () => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatEstimatedBooking = (eb: PreBookOpportunity['estimated_booking']): string => {
  if (eb.date && eb.month && eb.year) {
    return `${eb.date} ${MONTHS[eb.month - 1]} ${eb.year}`;
  }
  if (eb.month && eb.year) {
    return `${MONTHS[eb.month - 1]} ${eb.year}`;
  }
  if (eb.year) {
    return String(eb.year);
  }
  return '—';
};

const formatDateTime = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
    ', ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const OpportunityCard = ({ item, customerName, onPress }: OpportunityCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.topRow}>
        <Avatar name={customerName} size="md" />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{customerName || item.customer_id}</Text>
          <Text style={styles.sub} numberOfLines={1}>ID: {item.customer_id}</Text>
        </View>
        <StatusChip kind={item.latest_follow_up_result ?? 'none'} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Estimated Booking</Text>
          <Text style={styles.metaValue}>{formatEstimatedBooking(item.estimated_booking)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Next Follow-up</Text>
          <Text style={[styles.metaValue, item.overdue && styles.overdueText]}>
            {item.next_follow_up?.scheduled_at ? formatDateTime(item.next_follow_up.scheduled_at) : '—'}
          </Text>
        </View>
      </View>

      {item.overdue ? (
        <View style={styles.overdueBadge}>
          <Text style={styles.overdueBadgeText}>OVERDUE</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sub: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: fontSize.small,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  overdueText: {
    color: colors.danger,
    fontWeight: '600',
  },
  overdueBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  overdueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger,
  },
});

export default OpportunityCard;
