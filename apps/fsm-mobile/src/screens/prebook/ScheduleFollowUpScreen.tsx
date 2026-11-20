import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useCreateFollowUp, usePreBookDetail } from '@fs-management/prebook';
import { colors, radius, spacing, fontSize } from '../../theme/tokens';
import TopBar from '../../components/ui/TopBar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import InfoBanner from '../../components/ui/InfoBanner';
import Avatar from '../../components/ui/Avatar';
import { formatEstimatedBooking } from '../../utils/format';
import type { MainStackParamList } from '../../navigation/MainNavigator';

const ScheduleFollowUpScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'ScheduleFollowUp'>>();
  const { preBookId } = route.params;
  const { detail } = usePreBookDetail(preBookId);
  const { createFollowUp, isLoading } = useCreateFollowUp(preBookId);

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selected) {
      setDate(selected);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selected) {
      setTime(selected);
    }
  };

  const formatDisplay = (d: Date | null) =>
    d ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Select date';
  const formatTimeDisplay = (t: Date | null) =>
    t ? t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'Select time (optional)';

  const handleSubmit = async () => {
    setError(null);
    if (!date) {
      setError('Date is required');
      return;
    }
    // Gabungkan date + time (default 09:00 jika time kosong)
    const combined = new Date(date);
    if (time) {
      combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    } else {
      combined.setHours(9, 0, 0, 0);
    }
    const result = await createFollowUp({ scheduled_at: combined.toISOString() });
    if (result) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <TopBar title="Schedule Follow-up" />
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

        <InfoBanner
          variant="info"
          message="Follow-up baru = rencana. Detail (customer info, intent, result) dilengkapi setelah aktivitas dilakukan."
        />

        <View style={styles.form}>
          <Text style={styles.label}>Date *</Text>
          <Button
            title={formatDisplay(date)}
            variant="secondary"
            size="md"
            onPress={() => setShowDatePicker(true)}
            style={styles.pickerBtn}
          />
          {showDatePicker && (
            <DateTimePicker
              value={date ?? new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={onDateChange}
            />
          )}

          <Text style={styles.label}>Time (optional)</Text>
          <Button
            title={formatTimeDisplay(time)}
            variant="secondary"
            size="md"
            onPress={() => setShowTimePicker(true)}
            style={styles.pickerBtn}
          />
          {showTimePicker && (
            <DateTimePicker
              value={time ?? new Date()}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>

      <View style={styles.cta}>
        <Button title="Cancel" variant="secondary" onPress={() => navigation.goBack()} style={styles.ctaBtn} />
        <Button title="Schedule Follow-up" onPress={handleSubmit} loading={isLoading} style={styles.ctaBtn} />
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
  confirmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.md,
    marginBottom: spacing.md,
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
  form: {
    marginTop: spacing.md,
  },
  label: {
    fontSize: fontSize.small,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  pickerBtn: {
    justifyContent: 'flex-start',
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
});

export default ScheduleFollowUpScreen;
