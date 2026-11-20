import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import {
  useCreateFollowUp,
  usePreBookDetail,
  useUpdateFollowUp,
  type FollowUpPayload,
  type FollowUpResult,
} from '@fs-management/prebook';
import { colors, radius, spacing, fontSize } from '../../theme/tokens';
import TopBar from '../../components/ui/TopBar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Chip from '../../components/ui/Chip';
import SegmentedControl from '../../components/ui/SegmentedControl';
import InfoBanner from '../../components/ui/InfoBanner';
import Avatar from '../../components/ui/Avatar';
import { formatEstimatedBooking } from '../../utils/format';
import type { MainStackParamList } from '../../navigation/MainNavigator';

type Precision = 'year' | 'year_month' | 'full';

const RESULTS: { value: FollowUpResult; label: string }[] = [
  { value: 'not_ready', label: 'Not Ready' },
  { value: 'interested', label: 'Interested' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'ready_to_book', label: 'Ready to Book' },
];

const PRECISION_OPTIONS: { value: Precision; label: string }[] = [
  { value: 'year', label: 'Year' },
  { value: 'year_month', label: 'Year + Month' },
  { value: 'full', label: 'Full Date' },
];

const LogFollowUpScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'LogFollowUp'>>();
  const { preBookId, followUpId } = route.params;
  const { detail } = usePreBookDetail(preBookId);
  const { createFollowUp, isLoading: isCreating } = useCreateFollowUp(preBookId);
  const { updateFollowUp, isLoading: isUpdating } = useUpdateFollowUp();
  const isLoading = isCreating || isUpdating;

  const [customerInformation, setCustomerInformation] = useState('');
  const [customerIntent, setCustomerIntent] = useState('');
  const [precision, setPrecision] = useState<Precision>('year_month');
  const [estYear, setEstYear] = useState('');
  const [estMonth, setEstMonth] = useState('');
  const [estDate, setEstDate] = useState('');
  const [result, setResult] = useState<FollowUpResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedResult, setSavedResult] = useState<FollowUpResult | null>(null);

  const buildPayload = (): FollowUpPayload => {
    const payload: FollowUpPayload = {
      customer_information: customerInformation.trim() || undefined,
      customer_intent: customerIntent.trim() || undefined,
      follow_up_result: result ?? undefined,
    };
    const year = parseInt(estYear, 10);
    const month = parseInt(estMonth, 10);
    const date = parseInt(estDate, 10);
    if (!isNaN(year)) payload.estimated_booking_year = year;
    if (precision !== 'year' && !isNaN(month)) payload.estimated_booking_month = month;
    if (precision === 'full' && !isNaN(date)) payload.estimated_booking_date = date;
    return payload;
  };

  const handleSave = async () => {
    setError(null);
    if (!result) {
      setError('Select a follow-up result');
      return;
    }
    const payload = buildPayload();
    let ok = false;
    if (followUpId) {
      // Complete follow-up yang sudah dijadwalkan (PATCH)
      ok = (await updateFollowUp(followUpId, { ...payload, activity_at: new Date().toISOString() })) !== null;
    } else {
      // Log aktual langsung (POST baru dengan activity_at)
      ok = (await createFollowUp({ ...payload, activity_at: new Date().toISOString() })) !== null;
    }
    if (ok) {
      setSavedResult(result);
    }
  };

  // State setelah save berhasil
  if (savedResult) {
    return (
      <View style={styles.container}>
        <TopBar title="Follow-up Saved" />
        <View style={styles.successWrap}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>Follow-up saved</Text>
          <Text style={styles.successSub}>
            Result: {RESULTS.find((r) => r.value === savedResult)?.label}
          </Text>
          {savedResult === 'ready_to_book' ? (
            <>
              <InfoBanner
                variant="success"
                message="Customer is ready to book! You can convert this opportunity to a booking."
              />
              <Button
                title="Convert to Booking"
                onPress={() => navigation.replace('ConvertToBooking', { preBookId })}
                style={styles.successBtn}
              />
            </>
          ) : null}
          <Button
            title="Back to Detail"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.successBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title={followUpId ? 'Complete Follow-up' : 'Log Follow-up'} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Header konfirmasi opportunity */}
          {detail ? (
            <View style={styles.confirmCard}>
              <Avatar name={detail.customer_id} size="sm" />
              <View style={styles.confirmInfo}>
                <Text style={styles.confirmName} numberOfLines={1}>
                  {detail.customer_id === detail.created_by ? 'Customer' : detail.customer_id}
                </Text>
                <Text style={styles.confirmSub}>
                  Est. booking: {formatEstimatedBooking(detail.estimated_booking)}
                </Text>
              </View>
            </View>
          ) : null}

          <Textarea
            label="Customer Information"
            placeholder="What did the customer say? Responses, concerns, questions..."
            value={customerInformation}
            onChangeText={setCustomerInformation}
          />

          <Input
            label="Customer Intent"
            placeholder="e.g. Looking for 2 units Nov-Dec"
            value={customerIntent}
            onChangeText={setCustomerIntent}
          />

          <Text style={styles.sectionLabel}>Estimated Booking (optional)</Text>
          <SegmentedControl options={PRECISION_OPTIONS} selected={precision} onChange={setPrecision} />
          <View style={styles.estRow}>
            <Input
              label="Year"
              placeholder="2026"
              keyboardType="number-pad"
              value={estYear}
              onChangeText={setEstYear}
              style={styles.estInput}
            />
            {precision !== 'year' ? (
              <Input
                label="Month"
                placeholder="1-12"
                keyboardType="number-pad"
                value={estMonth}
                onChangeText={setEstMonth}
                style={styles.estInput}
              />
            ) : null}
            {precision === 'full' ? (
              <Input
                label="Date"
                placeholder="1-31"
                keyboardType="number-pad"
                value={estDate}
                onChangeText={setEstDate}
                style={styles.estInput}
              />
            ) : null}
          </View>

          <Text style={styles.sectionLabel}>Follow-up Result *</Text>
          <View style={styles.resultRow}>
            {RESULTS.map((r) => (
              <Chip
                key={r.value}
                label={r.label}
                selected={result === r.value}
                onPress={() => setResult(r.value)}
              />
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.cta}>
        <Button title="Cancel" variant="secondary" onPress={() => navigation.goBack()} style={styles.ctaBtn} />
        <Button title="Save Follow-up" onPress={handleSave} loading={isLoading} style={styles.ctaBtn} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  confirmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  confirmInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  confirmName: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  confirmSub: {
    fontSize: fontSize.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  estRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  estInput: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  resultRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  error: {
    fontSize: fontSize.caption,
    color: colors.danger,
    marginTop: spacing.xs,
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
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  successSub: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  successBtn: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
});

export default LogFollowUpScreen;
