import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  status: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

const StatusBadge = memo(({ status, size = 'md', showDot = true }: Props) => {
  const s = colors.status[status] ?? { bg: '#F3F4F6', text: '#374151', dot: '#9CA3AF' };
  const label = colors.statusLabels[status] ?? status;
  const sm = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: s.bg }, sm && styles.sm]}>
      {showDot && <View style={[styles.dot, { backgroundColor: s.dot }, sm && styles.dotSm]} />}
      <Text style={[styles.label, { color: s.text }, sm && styles.labelSm]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 9999, alignSelf: 'flex-start', gap: 6,
  },
  sm: { paddingHorizontal: 7, paddingVertical: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotSm: { width: 5, height: 5 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  labelSm: { fontSize: 10 },
});

export default StatusBadge;