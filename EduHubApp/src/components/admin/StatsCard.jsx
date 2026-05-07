/**
 * components/admin/StatsCard.jsx
 * Same props interface as web StatsCard
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const ICON_COLOR = {
  blue:  { bg: 'rgba(36,99,235,0.15)',  color: '#3b82f6' },
  green: { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
  amber: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  red:   { bg: 'rgba(239,68,68,0.10)',  color: '#ef4444' },
};

export default function StatsCard({ title, value, icon, iconColor = 'blue', delta, deltaType }) {
  const ic = ICON_COLOR[iconColor] || ICON_COLOR.blue;
  return (
    <View style={st.card}>
      <View style={st.row}>
        <Text style={st.title} numberOfLines={2}>{title}</Text>
        <View style={[st.iconBox, { backgroundColor: ic.bg }]}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
        </View>
      </View>
      <Text style={st.value}>{value}</Text>
      {delta ? (
        <Text style={[st.delta, { color: deltaType === 'down' ? colors.danger : colors.success }]}>
          {deltaType === 'down' ? '▼' : '▲'} {delta}
        </Text>
      ) : null}
    </View>
  );
}

const st = StyleSheet.create({
  card:    { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, gap: spacing.md },
  row:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title:   { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, flex: 1, marginRight: spacing.sm },
  iconBox: { width: 38, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  value:   { fontSize: fontSize.huge, fontWeight: fontWeight.bold, color: colors.textPrimary, fontFamily: 'monospace' },
  delta:   { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
});
