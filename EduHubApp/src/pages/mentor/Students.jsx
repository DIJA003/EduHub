/**
 * pages/mentor/Students.jsx
 * Same logic as web Students.jsx
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { mentorApi, enrollmentApi } from '../../services/api';
import { Badge, PageHeader, TableSearch, EmptyState } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const AVATAR_COLORS = [
  { bg: 'rgba(36,99,235,0.15)',   color: '#3b82f6' },
  { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e' },
  { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  { bg: 'rgba(139,92,246,0.15)',  color: '#a78bfa' },
];

export default function Students() {
  const [search,   setSearch]   = useState('');
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.course?.toLowerCase().includes(search.toLowerCase())
  );

  const loadAll = async () => {
    setLoading(true); setError(null);
    try {
      const res = await mentorApi.getStudents();
      setStudents(res.data || []);
    } catch (err) {
      setError(err.message);
      setStudents([]);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadAll(); }, []);

  return (
    <View style={st.container}>
      <View style={st.topBar}>
        <TableSearch value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…" />
      </View>

      <ScrollView contentContainerStyle={st.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAll(); }} tintColor={colors.accent} />}>

        <PageHeader title="My Students" subtitle={`${filtered.length} student${filtered.length !== 1 ? 's' : ''} enrolled in your courses.`} />

        {error ? (
          <View style={st.errorBox}><Text style={st.errorTxt}>⚠ {error}</Text></View>
        ) : loading ? (
          <Text style={st.loadingTxt}>Loading…</Text>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🎓" title="No students found" description={search ? 'Try a different search.' : 'No students enrolled yet.'} />
        ) : (
          filtered.map((s, i) => {
            const ac = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const initials = s.name ? s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
            return (
              <View key={s._id || s.id || i} style={st.card}>
                <View style={[st.avatar, { backgroundColor: ac.bg }]}>
                  <Text style={[st.avatarTxt, { color: ac.color }]}>{initials}</Text>
                </View>
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <Text style={st.name}>{s.name}</Text>
                  <Text style={st.email}>{s.email}</Text>
                  <View style={st.metaRow}>
                    {s.course ? <Badge variant="blue">{s.course}</Badge> : null}
                    {s.college ? <Text style={st.college}>{s.college}</Text> : null}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bgBase },
  topBar:     { padding: spacing.lg, backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border },
  list:       { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  loadingTxt: { textAlign: 'center', color: colors.textMuted, padding: spacing.xxl },
  errorBox:   { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: radius.sm, padding: spacing.md },
  errorTxt:   { color: colors.danger, fontSize: fontSize.sm },
  card:       { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt:  { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  name:       { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  email:      { fontSize: fontSize.sm, color: colors.textSecondary },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  college:    { fontSize: fontSize.xs, color: colors.textMuted },
});
