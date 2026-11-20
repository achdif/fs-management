import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { usePreBookDetail, type FollowUpActivity } from '@fs-management/prebook';
import { colors, radius, spacing, fontSize } from '../../theme/tokens';
import TopBar from '../../components/ui/TopBar';
import TimelineItem from '../../components/ui/TimelineItem';
import { formatDate } from '../../utils/format';
import type { MainStackParamList } from '../../navigation/MainNavigator';

const sortFollowUps = (fus: FollowUpActivity[]) =>
  [...fus].sort((a, b) => {
    const ta = a.activity_at ?? a.scheduled_at ?? a.created_at;
    const tb = b.activity_at ?? b.scheduled_at ?? b.created_at;
    return new Date(tb).getTime() - new Date(ta).getTime();
  });

const FollowUpHistoryScreen = () => {
  const route = useRoute<RouteProp<MainStackParamList, 'FollowUpHistory'>>();
  const { preBookId } = route.params;
  const { detail, isLoading, error, refresh } = usePreBookDetail(preBookId);

  const items = useMemo(() => {
    if (!detail) return [];
    const sorted = sortFollowUps(detail.follow_ups);
    // Tandai follow-up scheduled terbaru (belum activity) sebagai editable
    const editableId = detail.next_follow_up?.id;
    return sorted.map((fu) => ({
      fu,
      isEditable: fu.id === editableId && !fu.activity_at,
    }));
  }, [detail]);

  return (
    <View style={styles.container}>
      <TopBar title="Follow-up History" />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading && !detail ? (
          <Text style={styles.muted}>Loading...</Text>
        ) : error && !detail ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : items.length === 0 ? (
          <Text style={styles.muted}>No follow-up activity yet</Text>
        ) : (
          items.map(({ fu, isEditable }, idx) => (
            <TimelineItem
              key={fu.id}
              title={fu.activity_at ? 'Follow-up completed' : 'Follow-up scheduled'}
              subtitle={fu.customer_intent ?? undefined}
              timestamp={fu.activity_at ?? fu.scheduled_at ?? fu.created_at}
              chip={fu.follow_up_result ?? (fu.activity_at ? 'none' : undefined)}
              quote={fu.customer_information}
              state={fu.activity_at ? 'completed' : isEditable ? 'planned' : 'completed'}
              isLast={idx === items.length - 1}
            />
          ))
        )}

        {/* Inquiry = titik awal (pre-book created) */}
        {detail ? (
          <TimelineItem
            title="Inquiry"
            subtitle="Opportunity created"
            timestamp={detail.created_at}
            state="inquiry"
            isLast
          />
        ) : null}
      </ScrollView>
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
  muted: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.body,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default FollowUpHistoryScreen;
