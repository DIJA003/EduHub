import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { mentorApi } from '../../services/api';
import { PageHeader, EmptyState, Badge } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const STATUS_V = { Active: 'success', Draft: 'warning', Rejected: 'danger', Archived: 'default', pending: 'warning', approved: 'success', rejected: 'danger' };

export default function MentorHistory() {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = () => {
    mentorApi.getMyMaterials()
      .then(r => setItems(r.data || []))
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { load(); }, []);

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent} />}>

      <PageHeader title="My History" subtitle="All materials you have uploaded or reviewed." />

      <View style={st.card}>
        <Text style={st.countTxt}>{items.length} records</Text>

        {loading ? (
          <Text style={st.loadingTxt}>Loading…</Text>
        ) : items.length === 0 ? (
          <EmptyState icon="📋" title="No history yet" description="Uploaded materials will appear here." />
        ) : (
          items.map(m => (
            <View key={m._id} style={st.row}>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text style={st.rowTitle} numberOfLines={1}>{m.title}</Text>
                <Text style={st.rowMeta}>{m.type} · {m.course || 'Unknown course'}</Text>
                {m.mentorFeedback ? <Text style={st.feedback}>💬 {m.mentorFeedback}</Text> : null}
              </View>
              <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
                <Badge variant={STATUS_V[m.status] || 'default'}>{m.status || 'pending'}</Badge>
                {m.size ? <Text style={st.size}>{m.size}</Text> : null}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bgBase },
  content:    { padding: spacing.xl, gap: spacing.xl, paddingBottom: 40 },
  card:       { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  countTxt:   { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textMuted, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  loadingTxt: { textAlign: 'center', color: colors.textMuted, padding: spacing.xxl },
  row:        { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.lg, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowTitle:   { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  rowMeta:    { fontSize: fontSize.sm, color: colors.textSecondary },
  feedback:   { fontSize: fontSize.xs, color: colors.textMuted, fontStyle: 'italic' },
  size:       { fontSize: fontSize.xs, color: colors.textMuted },
});
