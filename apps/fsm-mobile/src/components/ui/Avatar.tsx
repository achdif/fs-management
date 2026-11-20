import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, fontSize } from '../../theme/tokens';

interface AvatarProps {
  name?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { box: 32, font: 12 },
  md: { box: 44, font: 16 },
  lg: { box: 56, font: 20 },
} as const;

const Avatar = ({ name, size = 'md' }: AvatarProps) => {
  const s = SIZES[size];
  const initials = (name || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={[styles.avatar, { width: s.box, height: s.box, borderRadius: s.box / 2 }]}>
      <Text style={[styles.text, { fontSize: s.font }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.surface,
    fontWeight: '700',
  },
});

export default Avatar;
