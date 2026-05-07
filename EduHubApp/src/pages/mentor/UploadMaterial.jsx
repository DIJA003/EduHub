/**
 * pages/mentor/UploadMaterial.jsx
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { mentorApi } from '../../services/api';
import { auth } from '../../services/firebase';
import { Badge, PageHeader, EmptyState, BtnPrimary, BtnSecondary, FormGroup, FormInput } from '../../components/admin/adminUtils';
import Modal from '../../components/admin/Modal';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const API_URL  = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:8000/api';
const TYPES    = ['PDF', 'Slides', 'Video', 'ZIP', 'Other'];
const TYPE_ICON = { PDF: '📄', Slides: '📊', Video: '🎬', ZIP: '🗜️', Other: '📁' };
const STATUS_V  = { pending: 'warning', approved: 'success', rejected: 'danger' };
const EMPTY_FORM = { title: '', courseId: '', type: 'PDF', file: null };

export default function UploadMaterial() {
  const [materials,  setMaterials]  = useState([]);
  const [courses,    setCourses]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [uploading,  setUploading]  = useState(false);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selType,    setSelType]    = useState('PDF');

  const loadData = async () => {
    setLoading(true); setError(null);
    try {
      const [matRes, token] = await Promise.all([
        mentorApi.getMyMaterials(),
        auth.currentUser?.getIdToken(),
      ]);
      setMaterials(Array.isArray(matRes?.data) ? matRes.data : Array.isArray(matRes) ? matRes : []);
      if (token) {
        const cRes  = await fetch(`${API_URL}/mentor/my-courses`, { headers: { Authorization: `Bearer ${token}` } });
        const cData = await cRes.json();
        setCourses(Array.isArray(cData?.data) ? cData.data : []);
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setForm(f => ({ ...f, file: asset, title: f.title || asset.name.replace(/\.[^.]+$/, '') }));
      }
    } catch (err) { Alert.alert('Error', 'Could not pick file.'); }
  };

  const handleUpload = async () => {
    if (!form.title.trim()) { Alert.alert('Error', 'Please enter a title.'); return; }
    if (!form.file)         { Alert.alert('Error', 'Please select a file.'); return; }
    setUploading(true);
    try {
      const token    = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append('title',    form.title);
      formData.append('courseId', form.courseId || '');
      formData.append('type',     selType);
      formData.append('file',     { uri: form.file.uri, type: form.file.mimeType || 'application/octet-stream', name: form.file.name });
      const res  = await fetch(`${API_URL}/mentor/materials/upload`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      await loadData();
      setModal(false);
      setForm(EMPTY_FORM);
    } catch (err) { Alert.alert('Upload Failed', err.message); }
    finally { setUploading(false); }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Material', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await mentorApi.deleteMaterial(id); setMaterials(prev => prev.filter(m => m._id !== id)); }
        catch (err) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  const set = field => val => setForm(f => ({ ...f, [field]: val }));

  return (
    <View style={st.container}>
      <View style={st.topBar}>
        <Text style={st.countTxt}>{materials.length} material{materials.length !== 1 ? 's' : ''}</Text>
        <TouchableOpacity style={st.addBtn} onPress={() => { setForm(EMPTY_FORM); setSelType('PDF'); setModal(true); }}>
          <Text style={st.addBtnTxt}>↑ Upload New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={st.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.accent} />}>
        <PageHeader title="My Materials" subtitle="Files you've uploaded for review." />
        {error   ? <View style={st.errorBox}><Text style={st.errorTxt}>⚠ {error}</Text></View> : null}
        {loading ? <Text style={st.loadingTxt}>Loading…</Text>
        : materials.length === 0 ? <EmptyState icon="📁" title="No materials yet" description="Upload your first material above." />
        : materials.map(m => (
          <View key={m._id} style={st.card}>
            <Text style={st.fileIcon}>{TYPE_ICON[m.type] || '📁'}</Text>
            <View style={{ flex: 1, gap: spacing.xs }}>
              <Text style={st.matTitle} numberOfLines={1}>{m.title}</Text>
              <View style={st.matMeta}>
                <Badge variant={STATUS_V[m.status] || 'default'}>{m.status || 'pending'}</Badge>
                <Badge variant="blue">{m.type}</Badge>
                {m.size ? <Text style={st.matSize}>{m.size}</Text> : null}
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(m._id)} style={st.delBtn}>
              <Text style={{ fontSize: 20 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal title="Upload New Material" onClose={() => setModal(false)} visible={modal}
        footer={
          <View style={{ flexDirection: 'row', gap: spacing.sm, flex: 1 }}>
            <BtnSecondary onPress={() => setModal(false)} style={{ flex: 1 }}>Cancel</BtnSecondary>
            <BtnPrimary   onPress={handleUpload} loading={uploading} style={{ flex: 1 }}>↑ Upload</BtnPrimary>
          </View>
        }>

        <TouchableOpacity style={st.dropZone} onPress={pickFile} activeOpacity={0.8}>
          <Text style={{ fontSize: 36 }}>☁️</Text>
          {form.file
            ? <Text style={st.dropFile}>✅ {form.file.name}</Text>
            : <>
                <Text style={st.dropTitle}>Tap to browse files</Text>
                <Text style={st.dropSub}>PDF, Slides, Videos, ZIP</Text>
              </>
          }
        </TouchableOpacity>

        <FormGroup label="Title">
          <FormInput value={form.title} onChangeText={set('title')} placeholder="e.g. Week 4 Lecture Notes" />
        </FormGroup>

        <FormGroup label="Course (optional)">
          <FormInput value={form.courseId} onChangeText={set('courseId')} placeholder="Course ID or name" />
        </FormGroup>

        <FormGroup label="Type">
          <View style={st.typeRow}>
            {TYPES.map(t => (
              <TouchableOpacity key={t} onPress={() => setSelType(t)}
                style={[st.typeChip, selType === t && st.typeChipActive]}>
                <Text style={[st.typeChipTxt, selType === t && { color: colors.white }]}>
                  {TYPE_ICON[t]} {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormGroup>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bgBase },
  topBar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border },
  countTxt:   { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  addBtn:     { backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.sm },
  addBtnTxt:  { color: colors.white, fontWeight: fontWeight.semibold, fontSize: fontSize.sm },
  list:       { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  loadingTxt: { textAlign: 'center', color: colors.textMuted, padding: spacing.xxl },
  errorBox:   { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: radius.sm, padding: spacing.md },
  errorTxt:   { color: colors.danger, fontSize: fontSize.sm },
  card:       { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  fileIcon:   { fontSize: 28, flexShrink: 0 },
  matTitle:   { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  matMeta:    { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  matSize:    { fontSize: fontSize.xs, color: colors.textMuted },
  delBtn:     { padding: spacing.sm },
  dropZone:   { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xxl, alignItems: 'center', backgroundColor: colors.bgCard, gap: spacing.sm, marginBottom: spacing.md },
  dropTitle:  { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  dropSub:    { fontSize: fontSize.xs, color: colors.textMuted },
  dropFile:   { fontSize: fontSize.md, color: colors.success, fontWeight: fontWeight.semibold },
  typeRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip:   { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
  typeChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  typeChipTxt:    { fontSize: fontSize.sm, color: colors.textSecondary },
});