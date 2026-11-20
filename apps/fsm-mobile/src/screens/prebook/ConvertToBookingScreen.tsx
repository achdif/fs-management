import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useAuthStore } from '@fs-management/auth';
import { usePreBookDetail } from '@fs-management/prebook';
import { colors, radius, spacing, fontSize } from '../../theme/tokens';
import TopBar from '../../components/ui/TopBar';
import Button from '../../components/ui/Button';
import InfoBanner from '../../components/ui/InfoBanner';
import Avatar from '../../components/ui/Avatar';
import StatusChip from '../../components/ui/StatusChip';
import { formatDateTime, formatEstimatedBooking } from '../../utils/format';
import type { MainStackParamList } from '../../navigation/MainNavigator';

// STUB — backend convert endpoint belum ada (Flow 2).
// UI lengkap, tombol Convert disabled sampai backend siap.
const ConvertToBookingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'ConvertToBooking'>>();
  const { preBookId } = route.params;
  const user = useAuthStore((s) => s.user);
  const { detail } = usePreBookDetail(preBookId);

  const customerName = detail?.customer_id === user?.id
    ? user?.fullName || user?.email || 'Customer'
    : detail?.customer_id || 'Customer';

  return (
    <View style={styles.container}>
      <TopBar title="Convert to Booking" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🚀</Text>
          <Text style={styles.heroTitle}>Ready to convert!</Text>
          <Text style={styles.heroSub}>
            This opportunity will become a booking. Your customer record stays the same — no duplication.
          </Text>
        </View>

        {detail ? (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Avatar name={customerName} size="md" />
              <View style={styles.summaryInfo}>
                <Text style={styles.summaryName}>{customerName}</Text>
                <StatusChip kind={detail.latest_follow_up_result ?? 'ready_to_book'} />
              </View>
            </View>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Estimated Booking</Text>
                <Text style={styles.summaryValue}>{formatEstimatedBooking(detail.estimated_booking)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Follow-ups</Text>
                <Text style={styles.summaryValue}>{detail.follow_up_count}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Sales Owner</Text>
                <Text style={styles.summaryValue}>{detail.created_by}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Last Contact</Text>
                <Text style={styles.summaryValue}>{formatDateTime(detail.last_contact_at)}</Text>
              </View>
            </View>
          </View>
        ) : null}

        <InfoBanner
          variant="info"
          message="After conversion, continue to Flow 2 — Smart Booking & Operational Planning."
        />
      </ScrollView>

      <View style={styles.cta}>
        <Button
          title="Convert to Booking"
          disabled
          onPress={() => {}}
          style={styles.ctaBtn}
        />
        <Text style={styles.comingSoon}>Coming soon — backend conversion not available yet</Text>
        <Button
          title="Not yet — keep following up"
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={styles.ctaBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  heroSub: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryInfo: {
    flex: 1,
    marginLeft: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryName: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  summaryItem: {
    width: '45%',
  },
  summaryLabel: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cta: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  ctaBtn: {
    marginBottom: spacing.sm,
  },
  comingSoon: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});

export default ConvertToBookingScreen;
