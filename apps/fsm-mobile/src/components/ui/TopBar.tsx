import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize } from '../../theme/tokens';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

const TopBar = ({ title, onBack, right }: TopBarProps) => {
  const navigation = useNavigation();
  const handleBack = onBack ?? (() => navigation.goBack());

  return (
    <View style={styles.bar}>
      <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: colors.textPrimary,
    marginTop: -2,
  },
  title: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  right: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
});

export default TopBar;
