/**
 * pages/mentor/DashboardHome.jsx
 * Same logic as web DashboardHome.jsx
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { mentorApi } from '../../services/api';
import StatsCard from '../../components/admin/StatsCard';
import { Badge, PageHeader, EmptyState, BtnPrimary, BtnDanger, BtnSecondary, TableWrap } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

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
  const { dbUser } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [feedbackId,   setFeedbackId]   = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [actionType,   setActionType]   = useState('');

  const load = async () => {
    try {
      const res   = await mentorApi.getPendingMaterials();
      const items = (res?.data || []).map(m => ({
        _id:        m._id,
        title:      m.title,
        uploader:   m.uploadedByRef?.name || m.uploader || 'Unknown',
        course:     m.courseRef?.title    || m.course   || 'Unknown',
        uploadedAt: m.createdAt,
      }));
      setPending(items);
      setStats({ pendingReviews: items.length, approved: 0, rejected: 0, students: 0 });
    } catch { setStats({ pendingReviews: 0, approved: 0, rejected: 0, students: 0 }); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const openFeedback = (id, type) => { setFeedbackId(id); setActionType(type); setFeedbackText(''); };

  const submitFeedback = async () => {
    try {
      if (actionType === 'approve') await mentorApi.approveMaterial(feedbackId, { feedback: feedbackText });
      else                          await mentorApi.rejectMaterial(feedbackId);
      setPending(prev => prev.filter(v => v._id !== feedbackId));
      setStats(prev => ({ ...prev, pendingReviews: Math.max(0, prev.pendingReviews - 1), ...(actionType === 'approve' ? { approved: prev.approved + 1 } : { rejected: prev.rejected + 1 }) }));
    } catch (err) { console.error('Review action failed:', err.message); }
    setFeedbackId(null);
  };

  const firstName = dbUser?.name ? dbUser.name.split(' ')[0] : 'Mentor';

  const statCards = [
    { title: 'Pending Reviews', value: loading ? '…' : String(stats?.pendingReviews ?? 0), icon: '🎬', iconColor: 'amber', delta: 'awaiting action',  deltaType: 'up' },
    { title: 'Approved Videos', value: loading ? '…' : String(stats?.approved ?? 0),       icon: '✅', iconColor: 'green', delta: 'total approved',   deltaType: 'up' },
    { title: 'Rejected Videos', value: loading ? '…' : String(stats?.rejected ?? 0),       icon: '❌', iconColor: 'red',   delta: 'total rejected',   deltaType: 'down' },
    { title: 'My Students',     value: loading ? '…' : String(stats?.students ?? 0),        icon: '🎓', iconColor: 'blue',  delta: 'enrolled',         deltaType: 'up' },
  ];

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent} />}>

      <PageHeader title={`Welcome back, ${firstName} 👋`} subtitle="Here's what needs your attention today." />

      {/* Stats */}
      <View style={st.statsGrid}>
        {statCards.map(c => (
          <View key={c.title} style={st.statsCell}><StatsCard {...c} /></View>
        ))}
      </View>

      {/* Pending table */}
      <TableWrap toolbar={
        <View>
          <Text style={{ color: colors.textPrimary, fontWeight: fontWeight.semibold, fontSize: fontSize.base }}>
            Pending Video Reviews{!loading && pending.length > 0 ? ` (${pending.length})` : ''}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSize.xs, marginTop: 2 }}>
            Review and approve or reject student uploads
          </Text>
        </View>
      }>
        {loading ? (
          <Text style={st.loadingTxt}>Loading…</Text>
        ) : pending.length === 0 ? (
          <EmptyState icon="🎉" title="All caught up!" description="No pending videos to review right now." />
        ) : (
          pending.map(v => (
            <View key={v._id} style={st.row}>
              <View style={{ flex: 1 }}>
                <Text style={st.rowTitle} numberOfLines={1}>🎬 {v.title}</Text>
                <Text style={st.rowMeta}>{v.uploader} · <Text style={{ color: colors.accentLight }}>{v.course}</Text></Text>
                <Text style={st.rowTime}>{timeAgo(v.uploadedAt)}</Text>
              </View>
              <View style={st.rowActions}>
                <TouchableOpacity style={st.approveBtn} onPress={() => openFeedback(v._id, 'approve')}>
                  <Text style={st.approveTxt}>✓ Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={st.rejectBtn} onPress={() => openFeedback(v._id, 'reject')}>
                  <Text style={st.rejectTxt}>✕ Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </TableWrap>

      {/* Feedback modal */}
      <Modal visible={!!feedbackId} transparent animationType="fade" onRequestClose={() => setFeedbackId(null)}>
        <View style={st.overlay}>
          <View style={st.modalCard}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>{actionType === 'approve' ? '✅ Approve Video' : '❌ Reject Video'}</Text>
              <TouchableOpacity onPress={() => setFeedbackId(null)}>
                <Text style={{ color: colors.textMuted, fontSize: 22 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={st.modalSub}>Add feedback for the student (optional):</Text>
            <TextInput
              value={feedbackText} onChangeText={setFeedbackText}
              placeholder={actionType === 'approve' ? 'Great work! Well explained…' : 'Please re-record with better audio…'}
              placeholderTextColor={colors.textMuted}
              multiline numberOfLines={4}
              style={st.textarea}
            />
            <View style={st.modalBtns}>
              <BtnSecondary onPress={() => setFeedbackId(null)} style={{ flex: 1 }}>Cancel</BtnSecondary>
              {actionType === 'approve'
                ? <BtnPrimary  onPress={submitFeedback} style={{ flex: 1 }}>Confirm Approval</BtnPrimary>
                : <BtnDanger   onPress={submitFeedback} style={{ flex: 1 }}>Confirm Rejection</BtnDanger>
              }
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bgBase },
  content:    { padding: spacing.xl, gap: spacing.xl, paddingBottom: 40 },
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statsCell:  { width: '47.5%' },
  loadingTxt: { textAlign: 'center', color: colors.textMuted, padding: spacing.xxl },
  row:        { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  rowTitle:   { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  rowMeta:    { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  rowTime:    { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  rowActions: { flexDirection: 'row', gap: spacing.sm },
  approveBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.accent, alignItems: 'center' },
  approveTxt: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  rejectBtn:  { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.danger, alignItems: 'center' },
  rejectTxt:  { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', padding: spacing.xl },
  modalCard:  { backgroundColor: colors.bgSurface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xxl, gap: spacing.lg },
  modalHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
  modalSub:   { fontSize: fontSize.sm, color: colors.textSecondary },
  textarea:   { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.md, color: colors.textPrimary, fontSize: fontSize.md, height: 100, textAlignVertical: 'top' },
  modalBtns:  { flexDirection: 'row', gap: spacing.md },
});
