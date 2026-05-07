import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { collegesApi } from '../../services/api';
import Modal from '../../components/admin/Modal';
import { Badge, PageHeader, TableSearch, EmptyState, BtnPrimary, BtnSecondary, FormGroup, FormInput } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

export default function AcademicManagement() {
  const [colleges,   setColleges]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState({ name: '', years: '', semesters: '', programs: '', status: 'Active' });
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try { const res = await collegesApi.getAll(); setColleges(res.data || []); } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) await collegesApi.update(editId, form);
      else        await collegesApi.create(form);
      setModal(false); setEditId(null);
      await load();
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = (id, name) => Alert.alert('Delete', `Delete ${name}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { try { await collegesApi.remove(id); await load(); } catch (err) { Alert.alert('Error', err.message); } } },
  ]);

  const filtered = colleges.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));
  const set = f => v => setForm(p => ({ ...p, [f]: v }));

  return (
    <View style={st.container}>
      <View style={st.topBar}>
        <TableSearch value={search} onChange={e => setSearch(e.target.value)} placeholder="Search colleges…" />
        <TouchableOpacity style={st.addBtn} onPress={() => { setForm({ name: '', years: '', semesters: '', programs: '', status: 'Active' }); setEditId(null); setModal(true); }}>
          <Text style={st.addBtnTxt}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={st.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent} />}>
        <PageHeader title="Academic Management" subtitle="Manage colleges and academic structure." />
        {loading ? <Text style={st.loadingTxt}>Loading…</Text>
        : filtered.length === 0 ? <EmptyState icon="🏛️" title="No colleges found" description="Add a college to get started." />
        : filtered.map(c => (
          <View key={c._id} style={st.card}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={st.name}>{c.name}</Text>
              <Text style={st.meta}>{c.programs || 0} programs · {c.years || 0} years</Text>
            </View>
            <TouchableOpacity style={st.iconBtn} onPress={() => { setForm({ name: c.name || '', years: String(c.years || ''), semesters: String(c.semesters || ''), programs: String(c.programs || ''), status: c.status || 'Active' }); setEditId(c._id); setModal(true); }}><Text>✏️</Text></TouchableOpacity>
            <TouchableOpacity style={st.iconBtn} onPress={() => handleDelete(c._id, c.name)}><Text>🗑️</Text></TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <Modal title={editId ? 'Edit College' : 'Add College'} onClose={() => setModal(false)} visible={modal}
        footer={<View style={{ flexDirection: 'row', gap: 8, flex: 1 }}><BtnSecondary onPress={() => setModal(false)} style={{ flex: 1 }}>Cancel</BtnSecondary><BtnPrimary onPress={handleSave} loading={saving} style={{ flex: 1 }}>{editId ? 'Update' : 'Create'}</BtnPrimary></View>}>
        <FormGroup label="Name"><FormInput value={form.name} onChangeText={set('name')} placeholder="College name" /></FormGroup>
        <FormGroup label="Years"><FormInput value={form.years} onChangeText={set('years')} placeholder="e.g. 4" keyboardType="numeric" /></FormGroup>
        <FormGroup label="Semesters"><FormInput value={form.semesters} onChangeText={set('semesters')} placeholder="e.g. 8" keyboardType="numeric" /></FormGroup>
        <FormGroup label="Programs"><FormInput value={form.programs} onChangeText={set('programs')} placeholder="e.g. 12" keyboardType="numeric" /></FormGroup>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  topBar:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border },
  addBtn:    { backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 4 },
  addBtnTxt: { color: colors.white, fontWeight: '600', fontSize: 14 },
  list:      { padding: 16, gap: 12, paddingBottom: 40 },
  loadingTxt:{ textAlign: 'center', color: colors.textMuted, padding: 32 },
  card:      { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgSurface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 12 },
  name:      { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  meta:      { fontSize: 12, color: colors.textSecondary },
  iconBtn:   { padding: 8 },
});
