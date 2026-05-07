import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { dashboardApi } from '../../services/api';
import StatsCard from '../../components/admin/StatsCard';
import { Badge, TableWrap, PageHeader } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const FALLBACK_ACTIVITY = [
  { id: 1, user: 'Sara Ahmed',   action: 'enrolled in React Fundamentals',    time: '2m ago' },
  { id: 2, user: 'Omar Khalid',  action: 'submitted assignment for CS101',     time: '15m ago' },
  { id: 3, user: 'Layla Hassan', action: 'uploaded new material',              time: '1h ago' },
  { id: 4, user: 'Karim Ali',    action: 'completed Python Basics course',     time: '3h ago' },
];

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardHome() {
  const [stats,    setStats]    = useState(null);
  const [activity, setActivity] = useState(FALLBACK_ACTIVITY);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    Promise.all([
      dashboardApi.getStats().catch(() => null),
      dashboardApi.getActivity().catch(() => null),
    ]).then(([s, a]) => {
      if (s?.data) setStats(s.data);
      if (a?.data?.length) setActivity(a.data);
    }).finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { load(); }, []);

  const statCards = [
    { title: 'Total Students',    value: loading ? '…' : String(stats?.totalStudents    ?? 348), icon: '🎓', iconColor: 'blue',  delta: 'registered',       deltaType: 'up' },
    { title: 'Total Mentors',     value: loading ? '…' : String(stats?.totalMentors     ?? 12),  icon: '👨‍🏫', iconColor: 'green', delta: 'active',           deltaType: 'up' },
    { title: 'Active Courses',    value: loading ? '…' : String(stats?.activeCourses    ?? 27),  icon: '📚', iconColor: 'amber', delta: 'published',         deltaType: 'up' },
    { title: 'Pending Approvals', value: loading ? '…' : String(stats?.pendingApprovals ?? 9),   icon: '⏳', iconColor: 'red',   delta: 'need action',       deltaType: 'down' },
  ];

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent} />}>

      <PageHeader title="Admin Dashboard" subtitle="Platform overview and recent activity." />

      <View style={st.statsGrid}>
        {statCards.map(c => <View key={c.title} style={st.statsCell}><StatsCard {...c} /></View>)}
      </View>

      <TableWrap toolbar={<Text style={st.tableTitle}>Recent Activity</Text>}>
        {activity.map((item, i) => (
          <View key={item.id || i} style={[st.actRow, i === activity.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={st.dot} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={st.actAction}><Text style={st.actUser}>{item.user} </Text>{item.action}</Text>
              <Text style={st.actTime}>{item.time || timeAgo(item.createdAt || new Date())}</Text>
            </View>
          </View>
        ))}
      </TableWrap>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bgBase },
  content:    { padding: spacing.xl, gap: spacing.xl, paddingBottom: 40 },
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statsCell:  { width: '47.5%' },
  tableTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  actRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 5, flexShrink: 0 },
  actUser:    { fontWeight: fontWeight.semibold, color: colors.textPrimary },
  actAction:  { fontSize: fontSize.sm, color: colors.textSecondary },
  actTime:    { fontSize: fontSize.xs, color: colors.textMuted },
});
