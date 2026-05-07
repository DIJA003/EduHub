import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { coursesApi, collegesApi, adminUsersApi } from '../../services/api';
import Modal from '../../components/admin/Modal';
import { Badge, PageHeader, TableSearch, EmptyState, BtnPrimary, BtnSecondary, FormGroup, FormInput, FormSelect } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const STATUS_V = { Published: 'success', Draft: 'warning', Archived: 'default' };

export default function CourseManagement() {
  const [courses,    setCourses]    = useState([]);
  const [colleges,   setColleges]   = useState([]);
  const [mentors,    setMentors]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState({ title: '', code: '', collegeId: '', instructorId: '', status: 'Draft', creditHours: '3' });
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [cRes, colRes, usersRes] = await Promise.all([
        coursesApi.getAll(),
        collegesApi.getAll(),
        adminUsersApi.getAll(),
      ]);
      setCourses(cRes.data   || []);
      setColleges(colRes.data || []);
      setMentors((usersRes.data || []).filter(u => u.role === 'mentor'));
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) await coursesApi.update(editId, form);
      else        await coursesApi.create(form);
      setModal(false); setEditId(null);
      await load();
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = (id, title) => Alert.alert('Delete Course', `Delete "${title}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { try { await coursesApi.remove(id); await load(); } catch (err) { Alert.alert('Error', err.message); } } },
  ]);

  const filtered = courses.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase())
  );
  const set = f => v => setForm(p => ({ ...p, [f]: v }));

  return (
    <View style={st.container}>
      <View style={st.topBar}>
        <TableSearch value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…" />
        <TouchableOpacity style={st.addBtn} onPress={() => { setForm({ title: '', code: '', collegeId: '', instructorId: '', status: 'Draft', creditHours: '3' }); setEditId(null); setModal(true); }}>
          <Text style={st.addBtnTxt}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={st.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent} />}>
        <PageHeader title="Course Management" subtitle={`${filtered.length} course${filtered.length !== 1 ? 's' : ''}`} />
        {loading ? <Text style={st.loadingTxt}>Loading…</Text>
        : filtered.length === 0 ? <EmptyState icon="📚" title="No courses found" description="Add a course to get started." />
        : filtered.map(c => (
          <View key={c._id} style={st.card}>
            <View style={st.courseIcon}><Text style={{ fontSize: 22 }}>📘</Text></View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={st.courseTitle} numberOfLines={1}>{c.title}</Text>
              <Text style={st.courseMeta}>{c.code} · {c.instructor || c.instructorRef?.name || 'TBA'}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Badge variant={STATUS_V[c.status] || 'default'}>{c.status || 'Draft'}</Badge>
                <Text style={st.students}>👥 {c.students || 0}</Text>
              </View>
            </View>
            <View style={{ gap: 4 }}>
              <TouchableOpacity style={st.iconBtn} onPress={() => { setForm({ title: c.title || '', code: c.code || '', collegeId: c.collegeRef || '', instructorId: c.instructorRef?._id || '', status: c.status || 'Draft', creditHours: String(c.creditHours || 3) }); setEditId(c._id); setModal(true); }}><Text>✏️</Text></TouchableOpacity>
              <TouchableOpacity style={st.iconBtn} onPress={() => handleDelete(c._id, c.title)}><Text>🗑️</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal title={editId ? 'Edit Course' : 'Add Course'} onClose={() => setModal(false)} visible={modal}
        footer={<View style={{ flexDirection: 'row', gap: 8, flex: 1 }}><BtnSecondary onPress={() => setModal(false)} style={{ flex: 1 }}>Cancel</BtnSecondary><BtnPrimary onPress={handleSave} loading={saving} style={{ flex: 1 }}>{editId ? 'Update' : 'Create'}</BtnPrimary></View>}>
        <FormGroup label="Title"><FormInput value={form.title} onChangeText={set('title')} placeholder="Course title" /></FormGroup>
        <FormGroup label="Code"><FormInput value={form.code} onChangeText={set('code')} placeholder="e.g. CS201" /></FormGroup>
        <FormGroup label="Credit Hours"><FormInput value={form.creditHours} onChangeText={set('creditHours')} placeholder="3" keyboardType="numeric" /></FormGroup>
        <FormGroup label="College">
          <FormSelect value={form.collegeId} onChange={e => set('collegeId')(e.target.value)}>
            <option value="">Select college…</option>
            {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </FormSelect>
        </FormGroup>
        <FormGroup label="Instructor">
          <FormSelect value={form.instructorId} onChange={e => set('instructorId')(e.target.value)}>
            <option value="">Select mentor…</option>
            {mentors.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
          </FormSelect>
        </FormGroup>
        <FormGroup label="Status">
          <FormSelect value={form.status} onChange={e => set('status')(e.target.value)}>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </FormSelect>
        </FormGroup>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bgBase },
  topBar:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border },
  addBtn:     { backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 4 },
  addBtnTxt:  { color: colors.white, fontWeight: '600', fontSize: 14 },
  list:       { padding: 16, gap: 12, paddingBottom: 40 },
  loadingTxt: { textAlign: 'center', color: colors.textMuted, padding: 32 },
  card:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bgSurface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 16 },
  courseIcon: { width: 44, height: 44, borderRadius: 8, backgroundColor: 'rgba(36,99,235,0.15)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  courseTitle:{ fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  courseMeta: { fontSize: 12, color: colors.textSecondary },
  students:   { fontSize: 12, color: colors.textMuted },
  iconBtn:    { padding: 8 },
});
