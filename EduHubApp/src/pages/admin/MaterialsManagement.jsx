import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { materialsApi } from '../../services/api';
import { Badge, PageHeader, TableSearch, EmptyState, BtnPrimary, BtnSecondary, BtnDanger } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const STATUS_V = { pending: 'warning', approved: 'success', rejected: 'danger' };
const TYPE_ICON = { PDF: '📄', Slides: '📊', Video: '🎬', ZIP: '🗜️', Other: '📁' };

export default function MaterialsManagement() {
  const [materials,  setMaterials]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const res = await materialsApi.getAll(); setMaterials(res.data || []); } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    try { await materialsApi.approve(id); setMaterials(prev => prev.map(m => m._id === id ? { ...m, status: 'approved' } : m)); }
    catch (err) { Alert.alert('Error', err.message); }
  };

  const handleReject = async (id) => {
    try { await materialsApi.reject(id); setMaterials(prev => prev.map(m => m._id === id ? { ...m, status: 'rejected' } : m)); }
    catch (err) { Alert.alert('Error', err.message); }
  };

  const handleDelete = (id, title) => Alert.alert('Delete', `Delete "${title}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { try { await materialsApi.remove(id); await load(); } catch (err) { Alert.alert('Error', err.message); } } },
  ]);

  const filtered = materials.filter(m =>
    m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.course?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={st.container}>
      <View style={st.topBar}>
        <TableSearch value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials…" />
      </View>
      <ScrollView contentContainerStyle={st.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent} />}>
        <PageHeader title="Materials Management" subtitle={`${filtered.length} material${filtered.length !== 1 ? 's' : ''}`} />
        {loading ? <Text style={st.loadingTxt}>Loading…</Text>
        : filtered.length === 0 ? <EmptyState icon="📁" title="No materials found" description="" />
        : filtered.map(m => (
          <View key={m._id} style={st.card}>
            <Text style={{ fontSize: 26 }}>{TYPE_ICON[m.type] || '📁'}</Text>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={st.title} numberOfLines={1}>{m.title}</Text>
              <Text style={st.meta}>{m.uploader || 'Unknown'} · {m.course || 'No course'}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Badge variant={STATUS_V[m.status] || 'default'}>{m.status || 'pending'}</Badge>
                {m.type ? <Badge variant="default">{m.type}</Badge> : null}
              </View>
            </View>
            <View style={{ gap: 6 }}>
              {m.status === 'pending' && <>
                <TouchableOpacity style={st.approveBtn} onPress={() => handleApprove(m._id)}><Text style={st.approveTxt}>✓</Text></TouchableOpacity>
                <TouchableOpacity style={st.rejectBtn}  onPress={() => handleReject(m._id)}><Text style={st.rejectTxt}>✕</Text></TouchableOpacity>
              </>}
              <TouchableOpacity onPress={() => handleDelete(m._id, m.title)}><Text style={{ fontSize: 18 }}>🗑️</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bgBase },
  topBar:     { padding: 16, backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border },
  list:       { padding: 16, gap: 12, paddingBottom: 40 },
  loadingTxt: { textAlign: 'center', color: colors.textMuted, padding: 32 },
  card:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bgSurface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16 },
  title:      { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  meta:       { fontSize: 12, color: colors.textSecondary },
  approveBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, backgroundColor: colors.accent, alignItems: 'center' },
  approveTxt: { color: colors.white, fontWeight: '600', fontSize: 14 },
  rejectBtn:  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, borderWidth: 1, borderColor: colors.danger, alignItems: 'center' },
  rejectTxt:  { color: colors.danger, fontWeight: '600', fontSize: 14 },
});
