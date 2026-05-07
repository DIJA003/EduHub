/**
 * pages/StudentDashboard.jsx
 * Same logic as web StudentDashboard.jsx — uses CourseContext + MaterialContext
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../context/AuthContext';
import { useCourses, sumEnrolledCredits } from '../context/CourseContext';
import { useMaterials } from '../context/MaterialContext';
import { auth } from '../services/firebase';
import { Badge, PageHeader, EmptyState, BtnPrimary } from '../components/admin/adminUtils';
import StatsCard from '../components/admin/StatsCard';
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme';

const STATUS_V = { pending: 'warning', approved: 'success', Active: 'success', rejected: 'danger', Rejected: 'danger' };
const API_URL  = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:8000/api';

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TABS = ['Dashboard', 'My Courses', 'Upload Material', 'My Materials'];

export default function StudentDashboard() {
  const { dbUser } = useAuth();
  const { years, currentYearId } = useCourses();
  const { materials, addMaterial, removeMaterial } = useMaterials();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [uploading, setUploading] = useState(false);

  const currentYear = years[currentYearId] || {};
  const enrolled    = Object.values(years).flatMap(y => y.enrolled || []);
  const totalCreds  = sumEnrolledCredits(enrolled);
  const pending     = materials.filter(m => m.status === 'pending' || m.status === 'Active');

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setUploading(true);

      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append('title', asset.name);
      formData.append('type',  asset.mimeType?.includes('pdf') ? 'PDF' : 'Other');
      formData.append('file',  { uri: asset.uri, type: asset.mimeType || 'application/octet-stream', name: asset.name });

      const res  = await fetch(`${API_URL}/users/materials`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        await addMaterial({ id: data.data?._id || `tmp-${Date.now()}`, fileName: asset.name, type: 'Other', status: 'pending' });
        Alert.alert('Uploaded!', 'Your material has been submitted for review.');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      Alert.alert('Upload Failed', err.message);
    } finally {
      setUploading(false);
    }
  };

  const statCards = [
    { title: 'Enrolled Courses',  value: String(enrolled.length),  icon: '📚', iconColor: 'blue' },
    { title: 'Total Credits',     value: String(totalCreds),        icon: '🎓', iconColor: 'green' },
    { title: 'Pending Materials', value: String(pending.length),    icon: '⏳', iconColor: 'amber' },
    { title: 'Approved',          value: String(materials.filter(m => m.status === 'approved').length), icon: '✅', iconColor: 'green' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return (
          <View style={st.sectionContent}>
            <View style={st.statsGrid}>
              {statCards.map(c => <View key={c.title} style={st.statsCell}><StatsCard {...c} /></View>)}
            </View>
            <Text style={st.sectionLabel}>Current Year Courses</Text>
            {(currentYear.enrolled || []).length === 0 ? (
              <EmptyState icon="📚" title="No courses enrolled" description="Go to Academic Year to enroll in courses." />
            ) : (
              (currentYear.enrolled || []).map(c => (
                <View key={c.id} style={st.courseRow}>
                  <View style={st.courseIcon}><Text style={{ fontSize: 20 }}>📘</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.courseName}>{c.name}</Text>
                    <Text style={st.courseMeta}>{c.code} · {c.credits || 3} credits</Text>
                  </View>
                  <Text style={st.progress}>{c.progress || 0}%</Text>
                </View>
              ))
            )}
          </View>
        );

      case 'My Courses':
        return (
          <View style={st.sectionContent}>
            {enrolled.length === 0 ? (
              <EmptyState icon="📚" title="No enrolled courses" description="Enroll in courses from the Academic Year tab." />
            ) : (
              enrolled.map(c => (
                <View key={c.id} style={st.courseRow}>
                  <View style={st.courseIcon}><Text style={{ fontSize: 20 }}>📘</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.courseName}>{c.name}</Text>
                    <Text style={st.courseMeta}>{c.code} · {c.credits || 3} cr · {c.progress || 0}% done</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        );

      case 'Upload Material':
        return (
          <View style={st.sectionContent}>
            <TouchableOpacity style={st.dropZone} onPress={handleUpload} activeOpacity={0.8}>
              <Text style={{ fontSize: 40 }}>☁️</Text>
              <Text style={st.dropTitle}>{uploading ? 'Uploading…' : 'Tap to upload a file'}</Text>
              <Text style={st.dropSub}>PDF, Video, Documents — submitted for mentor review</Text>
            </TouchableOpacity>
            <BtnPrimary onPress={handleUpload} loading={uploading} style={{ marginTop: spacing.md }}>
              {uploading ? '' : '↑ Select & Upload'}
            </BtnPrimary>
          </View>
        );

      case 'My Materials':
        return (
          <View style={st.sectionContent}>
            {materials.length === 0 ? (
              <EmptyState icon="📁" title="No materials yet" description="Upload a material from the Upload tab." />
            ) : (
              materials.map(m => (
                <View key={m.id} style={st.matRow}>
                  <View style={{ flex: 1, gap: spacing.xs }}>
                    <Text style={st.matTitle} numberOfLines={1}>{m.fileName}</Text>
                    <Text style={st.matMeta}>{m.courseName || 'No course'} · {timeAgo(m.uploadDate)}</Text>
                    <Badge variant={STATUS_V[m.status] || 'default'}>{m.status}</Badge>
                  </View>
                  <TouchableOpacity onPress={() => Alert.alert('Delete', 'Delete this material?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => removeMaterial(m.id) },
                  ])}>
                    <Text style={{ fontSize: 20 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        );
    }
  };

  return (
    <View style={st.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.tabBar} contentContainerStyle={st.tabContent}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
            style={[st.tab, activeTab === tab && st.tabActive]}>
            <Text style={[st.tabTxt, activeTab === tab && st.tabTxtActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={st.scroll}>
        <PageHeader
          title={activeTab}
          subtitle={dbUser ? `Welcome, ${dbUser.name}` : 'Your learning dashboard'}
        />
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.bgBase },
  tabBar:        { backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border, maxHeight: 52 },
  tabContent:    { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  tab:           { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm - 2, borderRadius: radius.sm, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:     { borderBottomColor: colors.accent },
  tabTxt:        { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  tabTxtActive:  { color: colors.accentLight, fontWeight: fontWeight.semibold },
  scroll:        { padding: spacing.xl, paddingBottom: 40 },
  sectionContent:{ gap: spacing.md },
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md },
  statsCell:     { width: '47.5%' },
  sectionLabel:  { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  courseRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  courseIcon:    { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.accentGlow, alignItems: 'center', justifyContent: 'center' },
  courseName:    { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  courseMeta:    { fontSize: fontSize.xs, color: colors.textMuted },
  progress:      { fontSize: fontSize.sm, color: colors.accentLight, fontWeight: fontWeight.semibold },
  dropZone:      { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.border, borderRadius: radius.xl, padding: spacing.xxxl, alignItems: 'center', backgroundColor: colors.bgCard, gap: spacing.sm },
  dropTitle:     { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  dropSub:       { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center' },
  matRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  matTitle:      { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  matMeta:       { fontSize: fontSize.xs, color: colors.textMuted },
});