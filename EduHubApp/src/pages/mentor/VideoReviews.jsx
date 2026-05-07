/**
 * pages/mentor/VideoReviews.jsx
 * Same logic as web VideoReviews.jsx — uses MaterialContext
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, RefreshControl } from 'react-native';
import { useMaterials } from '../../context/MaterialContext';
import { Badge, PageHeader, TableSearch, EmptyState, BtnPrimary, BtnDanger, BtnSecondary } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight, badgeVariants } from '../../utils/theme';

const STATUS_VARIANT = { pending: 'warning', approved: 'success', rejected: 'danger' };
const FILTER_BTNS    = ['All', 'Pending', 'Approved', 'Rejected'];

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const MOCK = [
  { id: 'm1', fileName: 'Intro to Linked Lists',  uploader: 'Ahmed Samy',   courseName: 'Data Structures', status: 'pending',  uploadDate: '2025-03-10T10:00:00Z' },
  { id: 'm2', fileName: 'CSS Flexbox Deep Dive',  uploader: 'Nour Tarek',   courseName: 'Web Dev',         status: 'pending',  uploadDate: '2025-03-11T08:30:00Z' },
  { id: 'm3', fileName: 'Binary Trees Explained', uploader: 'Omar Khalid',  courseName: 'Algorithms',      status: 'approved', uploadDate: '2025-03-09T14:00:00Z' },
  { id: 'm4', fileName: 'React Hooks Tutorial',   uploader: 'Layla Hassan', courseName: 'Web Dev',         status: 'approved', uploadDate: '2025-03-08T09:15:00Z' },
  { id: 'm5', fileName: 'SQL Joins Crash Course', uploader: 'Karim Ali',    courseName: 'Databases',       status: 'rejected', uploadDate: '2025-03-07T11:45:00Z' },
];

export default function VideoReviews() {
  const { materials, pendingMaterials, approveMaterial, rejectMaterial, loading } = useMaterials();

  const allMaterials = materials.length > 0
    ? materials.map(m => ({ ...m, uploader: m.uploader || 'Student' }))
    : MOCK;

  const [localStatus,  setLocalStatus]  = useState({});
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [feedbackId,   setFeedbackId]   = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [actionType,   setActionType]   = useState('');
  const [refreshing,   setRefreshing]   = useState(false);

  const getStatus = m => localStatus[m.id] ?? m.status;

  const filtered = allMaterials.filter(v =>
    (v.fileName?.toLowerCase().includes(search.toLowerCase()) ||
     v.uploader?.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'All' || getStatus(v) === statusFilter.toLowerCase())
  );

  const openFeedback = (id, type) => { setFeedbackId(id); setActionType(type); setFeedbackText(''); };

  const submitFeedback = () => {
    const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
    setLocalStatus(prev => ({ ...prev, [feedbackId]: newStatus }));
    if (pendingMaterials.some(m => m.id === feedbackId)) {
      if (actionType === 'approve') approveMaterial(feedbackId, feedbackText);
      else                          rejectMaterial(feedbackId, feedbackText);
    }
    setFeedbackId(null);
  };

  return (
    <View style={st.container}>
      {/* Search */}
      <View style={st.topBar}>
        <TableSearch value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or uploader…" />
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.filterRow} contentContainerStyle={st.filterContent}>
        {FILTER_BTNS.map(f => (
          <TouchableOpacity key={f} onPress={() => setStatusFilter(f)}
            style={[st.chip, statusFilter === f && st.chipActive]}>
            <Text style={[st.chipTxt, statusFilter === f && { color: colors.white }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={st.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={colors.accent} />}>

        <PageHeader title="Material Reviews" subtitle="Review, approve, or reject student-uploaded materials." />

        {loading ? (
          <Text style={st.loadingTxt}>Loading…</Text>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🎬" title="No videos found" description="Try adjusting your search or filter." />
        ) : (
          filtered.map(v => (
            <View key={v.id} style={st.card}>
              <View style={st.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={st.cardTitle} numberOfLines={1}>🎬 {v.fileName}</Text>
                  <Text style={st.cardMeta}>👤 {v.uploader}</Text>
                  <Text style={st.cardTime}>{timeAgo(v.uploadDate)} · <Text style={{ color: colors.accentLight }}>{v.courseName}</Text></Text>
                </View>
                <Badge variant={STATUS_VARIANT[getStatus(v)] || 'default'}>
                  {getStatus(v).charAt(0).toUpperCase() + getStatus(v).slice(1)}
                </Badge>
              </View>

              {getStatus(v) === 'pending' ? (
                <View style={st.actionRow}>
                  <TouchableOpacity style={st.approveBtn} onPress={() => openFeedback(v.id, 'approve')}>
                    <Text style={st.approveTxt}>✓ Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={st.rejectBtn} onPress={() => openFeedback(v.id, 'reject')}>
                    <Text style={st.rejectTxt}>✕ Reject</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={st.changeBtn}
                  onPress={() => openFeedback(v.id, getStatus(v) === 'approved' ? 'reject' : 'approve')}>
                  <Text style={st.changeTxt}>Change Decision</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Feedback Modal */}
      <Modal visible={!!feedbackId} transparent animationType="slide" onRequestClose={() => setFeedbackId(null)}>
        <View style={st.overlay}>
          <View style={st.modal}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>{actionType === 'approve' ? '✅ Approve' : '❌ Reject'}</Text>
              <TouchableOpacity onPress={() => setFeedbackId(null)}><Text style={{ color: colors.textMuted, fontSize: 22 }}>✕</Text></TouchableOpacity>
            </View>
            <Text style={st.modalSub}>Add feedback for the student (optional):</Text>
            <TextInput value={feedbackText} onChangeText={setFeedbackText}
              placeholder={actionType === 'approve' ? 'Great work!…' : 'Please redo with better quality…'}
              placeholderTextColor={colors.textMuted}
              multiline numberOfLines={4} style={st.textarea} />
            <View style={st.modalBtns}>
              <BtnSecondary onPress={() => setFeedbackId(null)} style={{ flex: 1 }}>Cancel</BtnSecondary>
              {actionType === 'approve'
                ? <BtnPrimary onPress={submitFeedback} style={{ flex: 1 }}>Confirm</BtnPrimary>
                : <BtnDanger  onPress={submitFeedback} style={{ flex: 1 }}>Confirm Reject</BtnDanger>
              }
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bgBase },
  topBar:     { padding: spacing.lg, backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterRow:  { backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border, maxHeight: 52 },
  filterContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  chip:       { paddingHorizontal: spacing.md, paddingVertical: spacing.sm - 2, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipTxt:    { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  list:       { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  loadingTxt: { textAlign: 'center', color: colors.textMuted, padding: spacing.xxl },
  card:       { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
  cardTop:    { flexDirection: 'row', gap: spacing.md },
  cardTitle:  { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary, flex: 1 },
  cardMeta:   { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  cardTime:   { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  actionRow:  { flexDirection: 'row', gap: spacing.sm },
  approveBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.accent, alignItems: 'center' },
  approveTxt: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  rejectBtn:  { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.danger, alignItems: 'center' },
  rejectTxt:  { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  changeBtn:  { paddingVertical: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  changeTxt:  { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  modal:      { backgroundColor: colors.bgSurface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xxl, gap: spacing.lg },
  modalHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
  modalSub:   { fontSize: fontSize.sm, color: colors.textSecondary },
  textarea:   { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.md, color: colors.textPrimary, height: 100, textAlignVertical: 'top' },
  modalBtns:  { flexDirection: 'row', gap: spacing.md },
});
