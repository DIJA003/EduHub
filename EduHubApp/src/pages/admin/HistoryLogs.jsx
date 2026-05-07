import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { logsApi } from '../../services/api';
import { Badge, PageHeader, TableSearch, EmptyState } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const ENTITY_TYPES = ['All','College','Course','Material','User','Enrollment','Session','Notification','AcademicYear','System'];
const ACTION_TYPES = ['All','CREATE','UPDATE','DELETE','RESTORE','LOGIN','REGISTER','LOGOUT','APPROVE','REJECT','UPLOAD','ENROLL','UNENROLL','ERROR'];

const ACTION_V = {
  CREATE: 'success', UPDATE: 'blue', DELETE: 'danger', RESTORE: 'success',
  LOGIN: 'default', REGISTER: 'blue', LOGOUT: 'default', APPROVE: 'success',
  REJECT: 'danger', UPLOAD: 'blue', ENROLL: 'success', UNENROLL: 'warning', ERROR: 'danger',
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function HistoryLogs() {
  const [logs,        setLogs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [search,      setSearch]      = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');

  const load = useCallback(async () => {
    try {
      const params = {};
      if (entityFilter !== 'All') params.entityType = entityFilter;
      if (actionFilter !== 'All') params.action      = actionFilter;
      if (search.trim())          params.search       = search.trim();
      const res = await logsApi.getLogs(params);
      setLogs(res.data || []);
    } catch { setLogs([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, [entityFilter, actionFilter, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={st.container}>
      {/* Search */}
      <View style={st.topBar}>
        <TableSearch value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…" />
      </View>

      {/* Entity filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.filterRow} contentContainerStyle={st.filterContent}>
        {ENTITY_TYPES.map(e => (
          <TouchableOpacity key={e} onPress={() => setEntityFilter(e)}
            style={[st.chip, entityFilter === e && st.chipActive]}>
            <Text style={[st.chipTxt, entityFilter === e && { color: colors.white }]}>{e}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Action filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.filterRow} contentContainerStyle={st.filterContent}>
        {ACTION_TYPES.map(a => (
          <TouchableOpacity key={a} onPress={() => setActionFilter(a)}
            style={[st.chip, actionFilter === a && st.chipActive]}>
            <Text style={[st.chipTxt, actionFilter === a && { color: colors.white }]}>{a}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={st.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent} />}>

        <PageHeader title="History Logs" subtitle={`${logs.length} log${logs.length !== 1 ? 's' : ''}`} />

        {loading ? (
          <Text style={st.loadingTxt}>Loading…</Text>
        ) : logs.length === 0 ? (
          <EmptyState icon="📋" title="No logs found" description="Try adjusting your filters." />
        ) : (
          logs.map((log, i) => (
            <View key={log._id || i} style={st.card}>
              <View style={st.dot} />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <View style={st.cardTop}>
                  <Badge variant={ACTION_V[log.action] || 'default'}>{log.action}</Badge>
                  <Badge variant="default">{log.entityType}</Badge>
                </View>
                <Text style={st.desc} numberOfLines={2}>{log.description || log.message || `${log.action} on ${log.entityType}`}</Text>
                <View style={st.cardMeta}>
                  <Text style={st.user}>👤 {log.performedBy?.name || log.user || 'System'}</Text>
                  <Text style={st.time}>{timeAgo(log.createdAt)}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.bgBase },
  topBar:        { padding: spacing.lg, backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterRow:     { backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border, maxHeight: 48 },
  filterContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  chip:          { paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
  chipActive:    { backgroundColor: colors.accent, borderColor: colors.accent },
  chipTxt:       { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: fontWeight.medium },
  list:          { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  loadingTxt:    { textAlign: 'center', color: colors.textMuted, padding: spacing.xxl },
  card:          { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  dot:           { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 5, flexShrink: 0 },
  cardTop:       { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  desc:          { fontSize: fontSize.sm, color: colors.textPrimary, lineHeight: 18 },
  cardMeta:      { flexDirection: 'row', justifyContent: 'space-between' },
  user:          { fontSize: fontSize.xs, color: colors.textSecondary },
  time:          { fontSize: fontSize.xs, color: colors.textMuted },
});
