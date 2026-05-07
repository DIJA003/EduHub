/**
 * pages/mentor/EnrollStudents.jsx
 * Same logic as web EnrollStudents.jsx
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { enrollmentApi, mentorApi } from '../../services/api';
import Modal from '../../components/admin/Modal';
import { Badge, PageHeader, TableSearch, EmptyState, BtnPrimary, BtnDanger, BtnSecondary, FormGroup, FormSelect } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

export default function EnrollStudents() {
  const [enrollments, setEnrollments] = useState([]);
  const [students,    setStudents]    = useState([]);
  const [courses,     setCourses]     = useState([]);
  const [search,      setSearch]      = useState('');
  const [modal,       setModal]       = useState(false);
  const [form,        setForm]        = useState({ studentId: '', courseId: '' });
  const [saving,      setSaving]      = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [refreshing,  setRefreshing]  = useState(false);

  const loadAll = async () => {
    setLoading(true); setError(null);
    try {
      const [sRes, cRes, eRes] = await Promise.all([
        enrollmentApi.mentorStudents(),
        enrollmentApi.mentorCourses(),
        mentorApi.getStudents(),
      ]);
      setStudents(sRes.data || []);
      setCourses(cRes.data  || []);
      setEnrollments(eRes.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleEnroll = async () => {
    if (!form.studentId || !form.courseId) return;
    setSaving(true);
    try {
      await enrollmentApi.mentorEnroll(form.studentId, form.courseId);
      setModal(false);
      setForm({ studentId: '', courseId: '' });
      await loadAll();
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  const handleUnenroll = (studentId, courseId, name) => {
    Alert.alert('Remove Enrollment', `Remove ${name} from this course?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try { await enrollmentApi.mentorUnenroll(studentId, courseId); await loadAll(); }
        catch (err) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  const filtered = enrollments.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.course?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={st.container}>
      <View style={st.topBar}>
        <TableSearch value={search} onChange={e => setSearch(e.target.value)} placeholder="Search enrollments…" />
        <TouchableOpacity style={st.addBtn} onPress={() => { setForm({ studentId: '', courseId: '' }); setModal(true); }}>
          <Text style={st.addBtnTxt}>+ Enroll</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={st.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAll(); }} tintColor={colors.accent} />}>

        <PageHeader title="Enroll Students" subtitle="Add students to your courses and manage enrollments." />

        {error    ? <View style={st.errorBox}><Text style={st.errorTxt}>⚠ {error}</Text></View> : null}
        {loading  ? <Text style={st.loadingTxt}>Loading…</Text>
        : filtered.length === 0 ? <EmptyState icon="➕" title="No enrollments yet" description="Use the Enroll button to add a student to your course." />
        : filtered.map((e, i) => (
          <View key={`${e.studentId}-${e.courseId}-${i}`} style={st.card}>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text style={st.name}>{e.name || e.studentName}</Text>
              <Text style={st.email}>{e.email}</Text>
              <Badge variant="blue">{e.course || e.courseTitle}</Badge>
            </View>
            <TouchableOpacity style={st.removeBtn}
              onPress={() => handleUnenroll(e.studentId || e._id, e.courseId, e.name)}>
              <Text style={st.removeTxt}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Enroll Modal */}
      <Modal title="Enroll Student" onClose={() => setModal(false)} visible={modal}
        footer={
          <View style={{ flexDirection: 'row', gap: spacing.sm, flex: 1 }}>
            <BtnSecondary onPress={() => setModal(false)} style={{ flex: 1 }}>Cancel</BtnSecondary>
            <BtnPrimary   onPress={handleEnroll} loading={saving} style={{ flex: 1 }}>Enroll</BtnPrimary>
          </View>
        }>
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
  container:  { flex: 1, backgroundColor: colors.bgBase },
  topBar:     { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border },
  addBtn:     { backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: spacing.md - 2, borderRadius: radius.sm },
  addBtnTxt:  { color: colors.white, fontWeight: fontWeight.semibold, fontSize: fontSize.md },
  list:       { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  loadingTxt: { textAlign: 'center', color: colors.textMuted, padding: spacing.xxl },
  errorBox:   { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: radius.sm, padding: spacing.md },
  errorTxt:   { color: colors.danger, fontSize: fontSize.sm },
  card:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
  name:       { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  email:      { fontSize: fontSize.sm, color: colors.textSecondary },
  removeBtn:  { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.danger },
  removeTxt:  { color: colors.danger, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});
