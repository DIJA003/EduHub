import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { enrollmentApi, coursesApi } from '../../services/api';
import Modal from '../../components/admin/Modal';
import { Badge, PageHeader, TableSearch, EmptyState, BtnPrimary, BtnSecondary, FormGroup, FormSelect } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

export default function EnrollManagement() {
  const [enrollments, setEnrollments] = useState([]);
  const [students,    setStudents]    = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [search,      setSearch]      = useState('');
  const [modal,       setModal]       = useState(false);
  const [form,        setForm]        = useState({ studentId: '', courseId: '' });
  const [saving,      setSaving]      = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, eRes] = await Promise.all([
        enrollmentApi.getStudents(),
        coursesApi.getAll(),
        enrollmentApi.getAllEnrollments(),
      ]);
      setStudents(sRes.data    || []);
      setCourses(cRes.data     || []);
      setEnrollments(eRes.data || []);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(() => { load(); }, []);

  const handleEnroll = async () => {
    if (!form.studentId || !form.courseId) return;
    setSaving(true);
    try { await enrollmentApi.enroll(form.studentId, form.courseId); setModal(false); setForm({ studentId: '', courseId: '' }); await load(); }
    catch (err) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  const handleUnenroll = (studentId, courseId, name) => Alert.alert('Remove', `Remove ${name}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: async () => { try { await enrollmentApi.unenroll(studentId, courseId); await load(); } catch (err) { Alert.alert('Error', err.message); } } },
  ]);

  const filtered = enrollments.filter(e =>
    e.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    e.courseTitle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={st.container}>
      <View style={st.topBar}>
        <TableSearch value={search} onChange={e => setSearch(e.target.value)} placeholder="Search enrollments…" />
        <TouchableOpacity style={st.addBtn} onPress={() => { setForm({ studentId: '', courseId: '' }); setModal(true); }}>
          <Text style={st.addBtnTxt}>+ Enroll</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={st.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent} />}>
        <PageHeader title="Enrollment Management" subtitle={`${filtered.length} enrollment${filtered.length !== 1 ? 's' : ''}`} />
        {loading ? <Text style={st.loadingTxt}>Loading…</Text>
        : filtered.length === 0 ? <EmptyState icon="➕" title="No enrollments" description="Enroll a student using the button above." />
        : filtered.map((e, i) => (
          <View key={`${e.studentId}-${e.courseId}-${i}`} style={st.card}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={st.name}>{e.studentName}</Text>
              <Text style={st.meta}>{e.studentEmail}</Text>
              <Badge variant="blue">{e.courseTitle}</Badge>
            </View>
            <TouchableOpacity style={st.removeBtn} onPress={() => handleUnenroll(e.studentId, e.courseId, e.studentName)}>
              <Text style={st.removeTxt}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <Modal title="Enroll Student" onClose={() => setModal(false)} visible={modal}
        footer={<View style={{ flexDirection: 'row', gap: 8, flex: 1 }}><BtnSecondary onPress={() => setModal(false)} style={{ flex: 1 }}>Cancel</BtnSecondary><BtnPrimary onPress={handleEnroll} loading={saving} style={{ flex: 1 }}>Enroll</BtnPrimary></View>}>
        <FormGroup label="Student">
          <FormSelect value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}>
            <option value="">Select student…</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.name} — {s.email}</option>)}
          </FormSelect>
        </FormGroup>
        <FormGroup label="Course">
          <FormSelect value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}>
            <option value="">Select course…</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
          </FormSelect>
        </FormGroup>
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
  removeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, borderWidth: 1, borderColor: colors.danger },
  removeTxt: { color: colors.danger, fontSize: 12, fontWeight: '600' },
});
