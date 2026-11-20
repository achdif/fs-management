import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '@fs-management/auth';
import { useCreatePreBook, usePreBookList, type PreBookOpportunity, type PreBookStatusFilter } from '@fs-management/prebook';
import { colors, radius, spacing, fontSize } from '../../theme/tokens';
import OpportunityCard from '../../components/ui/OpportunityCard';
import Chip from '../../components/ui/Chip';
import type { MainStackParamList } from '../../navigation/MainNavigator';

const FILTERS: { value: PreBookStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'interested', label: 'Interested' },
  { value: 'ready_to_book', label: 'Ready to Book' },
  { value: 'overdue', label: 'Overdue' },
];

const OpportunitiesListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const { items, total, statusFilter, isLoading, error, refresh, setStatusFilter } = usePreBookList();
  const { createPreBook, isLoading: isCreating } = useCreatePreBook();
  const [search, setSearch] = useState('');

  const customerNameFor = (item: PreBookOpportunity) =>
    item.customer_id === user?.id ? user?.fullName || user?.email || null : null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      item.customer_id.toLowerCase().includes(q) ||
      (customerNameFor(item) || '').toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, user]);

  const handleCreate = async () => {
    if (!user?.id || isCreating) return;
    const created = await createPreBook(user.id);
    if (created) {
      navigation.navigate('OpportunityDetail', { preBookId: created.id });
    }
  };

  const renderItem = ({ item }: { item: PreBookOpportunity }) => (
    <OpportunityCard
      item={item}
      customerName={customerNameFor(item)}
      onPress={() => navigation.navigate('OpportunityDetail', { preBookId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Opportunities</Text>
            <Text style={styles.headerCount}>{total} active</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <ActivityIndicator size="small" color={colors.surface} />
            ) : (
              <Text style={styles.addBtnText}>+ New</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search customer..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            selected={statusFilter === f.value}
            onPress={() => setStatusFilter(f.value)}
          />
        ))}
      </View>

      {isLoading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Chip label="Retry" selected onPress={refresh} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { void refresh(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No opportunities yet</Text>
              <Text style={styles.emptySub}>Tap "+ New" to create one</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.heading,
    fontWeight: '700',
    color: colors.surface,
  },
  headerCount: {
    fontSize: fontSize.small,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  addBtnText: {
    color: colors.surface,
    fontSize: fontSize.small,
    fontWeight: '600',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
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
  emptyText: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontSize: fontSize.small,
    color: colors.textMuted,
  },
});

export default OpportunitiesListScreen;
