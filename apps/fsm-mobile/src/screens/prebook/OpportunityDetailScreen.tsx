import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useAuthStore } from '@fs-management/auth';
import { usePreBookDetail, type FollowUpActivity } from '@fs-management/prebook';
import { colors, radius, spacing, fontSize } from '../../theme/tokens';
import TopBar from '../../components/ui/TopBar';
import Avatar from '../../components/ui/Avatar';
import StatusChip from '../../components/ui/StatusChip';
import Button from '../../components/ui/Button';
import TimelineItem from '../../components/ui/TimelineItem';
import { formatDateTime, formatEstimatedBooking } from '../../utils/format';
import type { MainStackParamList } from '../../navigation/MainNavigator';

const sortFollowUps = (fus: FollowUpActivity[]) =>
  [...fus].sort((a, b) => {
    const ta = a.activity_at ?? a.scheduled_at ?? a.created_at;
    const tb = b.activity_at ?? b.scheduled_at ?? b.created_at;
    return new Date(tb).getTime() - new Date(ta).getTime();
  });

const OpportunityDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'OpportunityDetail'>>();
  const { preBookId } = route.params;
  const user = useAuthStore((s) => s.user);
  const { detail, isLoading, error, refresh } = usePreBookDetail(preBookId);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  if (isLoading && !detail) {
    return (
      <View style={styles.container}>
        <TopBar title="Opportunity" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error && !detail) {
    return (
      <View style={styles.container}>
        <TopBar title="Opportunity" />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" variant="secondary" size="md" onPress={() => void refresh()} />
        </View>
      </View>
    );
  }

  if (!detail) return null;

  const followUps = sortFollowUps(detail.follow_ups);
  const nextFu = detail.next_follow_up;
  const customerName = detail.customer_id === user?.id ? user?.fullName || user?.email || 'Customer' : detail.customer_id;

  const goLogFollowUp = () => {
    navigation.navigate('LogFollowUp', { preBookId, followUpId: nextFu?.id });
  };
  const goSchedule = () => {
    navigation.navigate('ScheduleFollowUp', { preBookId });
  };

  return (
    <View style={styles.container}>
      <TopBar title="Opportunity Detail" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Customer card */}
        <View style={styles.card}>
          <View style={styles.customerRow}>
            <Avatar name={customerName} size="lg" />
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.customerSub}>ID: {detail.customer_id}</Text>
            </View>
            <StatusChip kind={detail.latest_follow_up_result ?? 'none'} />
          </View>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Estimated Booking</Text>
              <Text style={styles.gridValue}>{formatEstimatedBooking(detail.estimated_booking)}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Sales Owner</Text>
              <Text style={styles.gridValue}>{detail.created_by}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Last Contact</Text>
              <Text style={styles.gridValue}>{formatDateTime(detail.last_contact_at)}</Text>
            </View>
          </View>
        </View>

        {/* Next follow-up card */}
        <View style={styles.card}>
          <View style={styles.nextHeader}>
            <Text style={styles.cardTitle}>Next Follow-up</Text>
            {nextFu?.overdue ? <StatusChip kind="overdue" /> : null}
          </View>
          {nextFu ? (
            <>
              <Text style={styles.nextDate}>{formatDateTime(nextFu.scheduled_at)}</Text>
              <Text style={styles.nextSub}>
                {nextFu.overdue ? 'This follow-up is overdue' : 'Scheduled follow-up'}
              </Text>
              <View style={styles.nextActions}>
                <Button title="Mark Done" size="md" style={styles.nextBtn} onPress={goLogFollowUp} />
                <Button title="Reschedule" variant="secondary" size="md" style={styles.nextBtn} onPress={goSchedule} />
              </View>
            </>
          ) : (
            <Text style={styles.nextSub}>No scheduled follow-up</Text>
          )}
        </View>

        {/* History preview */}
        <View style={styles.card}>
          <View style={styles.historyHeader}>
            <Text style={styles.cardTitle}>Follow-up History</Text>
            <TouchableOpacity onPress={() => navigation.navigate('FollowUpHistory', { preBookId })}>
              <Text style={styles.viewAll}>View all ({followUps.length})</Text>
            </TouchableOpacity>
          </View>
          {followUps.length === 0 ? (
            <Text style={styles.nextSub}>No follow-ups yet</Text>
          ) : (
            followUps.slice(0, 2).map((fu, idx) => (
              <TimelineItem
                key={fu.id}
                title={fu.activity_at ? 'Follow-up completed' : 'Follow-up scheduled'}
                timestamp={fu.activity_at ?? fu.scheduled_at}
                chip={fu.follow_up_result ?? (fu.activity_at ? 'none' : undefined)}
                state={fu.activity_at ? 'completed' : 'planned'}
                isLast={idx === Math.min(followUps.length, 2) - 1}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.cta}>
        <Button title="Log Follow-up" onPress={goLogFollowUp} style={styles.ctaBtn} />
        <Button title="Schedule Follow-up" variant="secondary" onPress={goSchedule} style={styles.ctaBtn} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.body,
    color: colors.danger,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  customerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  customerName: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  customerSub: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  gridValue: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  nextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  nextDate: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  nextSub: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  nextActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  nextBtn: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  viewAll: {
    fontSize: fontSize.small,
    color: colors.primary,
    fontWeight: '600',
  },
  cta: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  ctaBtn: {
    flex: 1,
  },
});

export default OpportunityDetailScreen;
