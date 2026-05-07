import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { mentorApi } from '../../services/api';
import { PageHeader, Badge, BtnPrimary, BtnSecondary, FormGroup, FormInput } from '../../components/admin/adminUtils';
import StatsCard from '../../components/admin/StatsCard';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:8000/api';

const MOCK_COURSES = [
  { name: 'Data Structures', students: 32, videos: 8,  status: 'Active' },
  { name: 'Algorithms',      students: 28, videos: 12, status: 'Active' },
  { name: 'Web Dev',         students: 45, videos: 20, status: 'Active' },
  { name: 'Databases',       students: 15, videos: 5,  status: 'Inactive' },
];

const STATUS_V = { Active: 'success', Inactive: 'default' };

export default function MentorProfile() {
  const { dbUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [stats,    setStats]    = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({
    name:    dbUser?.name    || 'Mentor User',
    email:   dbUser?.email   || '',
    college: dbUser?.college || '',
    bio:     dbUser?.bio     || '',
  });

  useEffect(() => {
    if (dbUser) setForm({ name: dbUser.name || '', email: dbUser.email || '', college: dbUser.college || '', bio: dbUser.bio || '' });
  }, [dbUser]);

  useEffect(() => {
    mentorApi.getDashboardStats().then(res => { if (res?.data) setStats(res.data); }).catch(() => {});
  }, []);

  const initials = form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_URL}/users/profile`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: form.name, college: form.college, bio: form.bio }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setEditMode(false);
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  const set = field => val => setForm(f => ({ ...f, [field]: val }));

  const statCards = [
    { title: 'Videos Reviewed', value: String(stats?.reviewedCount || 39),  icon: '📋', iconColor: 'blue' },
    { title: 'Approved',        value: String(stats?.approvedCount || 34),  icon: '✅', iconColor: 'green' },
    { title: 'Rejected',        value: String(stats?.rejectedCount || 5),   icon: '❌', iconColor: 'red' },
    { title: 'Total Students',  value: String(stats?.studentCount  || 120), icon: '🎓', iconColor: 'amber' },
  ];

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      <PageHeader title="My Profile" subtitle="Manage your personal information." />

      <View style={st.profileCard}>
        <View style={st.banner} />
        <View style={st.avatarRow}>
          <View style={st.avatarCircle}><Text style={st.avatarTxt}>{initials}</Text></View>
          {editMode ? (
            <View style={st.editActions}>
              <BtnSecondary onPress={() => setEditMode(false)}>Cancel</BtnSecondary>
              <BtnPrimary   onPress={handleSave} loading={saving}>Save Changes</BtnPrimary>
            </View>
          ) : (
            <BtnSecondary onPress={() => setEditMode(true)}>✏️ Edit Profile</BtnSecondary>
          )}
        </View>

        {editMode ? (
          <View style={st.formBlock}>
            <FormGroup label="Full Name">
              <FormInput value={form.name}    onChangeText={set('name')}    placeholder="Full name" />
            </FormGroup>
            <FormGroup label="Email">
              <FormInput value={form.email}   editable={false} placeholder="Email (read-only)" />
            </FormGroup>
            <FormGroup label="College / Department">
              <FormInput value={form.college} onChangeText={set('college')} placeholder="e.g. Faculty of Engineering" />
            </FormGroup>
            <FormGroup label="Bio">
              <FormInput value={form.bio}     onChangeText={set('bio')}     placeholder="Short bio…" multiline numberOfLines={3} />
            </FormGroup>
          </View>
        ) : (
          <View style={st.infoBlock}>
            <View style={st.nameRow}>
              <Text style={st.profileName}>{form.name}</Text>
              <Badge variant="blue">Mentor</Badge>
            </View>
            <Text style={st.profileEmail}>{form.email}</Text>
            {form.college ? <Text style={st.profileCollege}>🏫 {form.college}</Text> : null}
            {form.bio     ? <Text style={st.profileBio}>{form.bio}</Text>            : null}
          </View>
        )}
      </View>

      <View style={st.statsGrid}>
        {statCards.map(c => <View key={c.title} style={st.statsCell}><StatsCard {...c} /></View>)}
      </View>

      <View style={st.coursesCard}>
        <Text style={st.sectionTitle}>Courses I Supervise</Text>
        {MOCK_COURSES.map(c => (
          <View key={c.name} style={st.courseRow}>
            <View style={st.courseIcon}><Text style={{ fontSize: 22 }}>📘</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={st.courseName}>{c.name}</Text>
              <Text style={st.courseMeta}>{c.students} students · {c.videos} videos</Text>
            </View>
            <Badge variant={STATUS_V[c.status] || 'default'}>{c.status}</Badge>
          </View>
        ))}
      </View>

      <TouchableOpacity style={st.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={st.logoutTxt}>🚪 Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.bgBase },
  content:       { padding: spacing.xl, gap: spacing.xl, paddingBottom: 60 },
  profileCard:   { backgroundColor: colors.bgSurface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  banner:        { height: 90, backgroundColor: colors.accent },
  avatarRow:     { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: spacing.xl, marginTop: -36, marginBottom: spacing.md },
  avatarCircle:  { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent, borderWidth: 4, borderColor: colors.bgSurface, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:     { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.white },
  editActions:   { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  formBlock:     { padding: spacing.xl, paddingTop: 0 },
  infoBlock:     { padding: spacing.xl, paddingTop: 0, gap: spacing.sm },
  nameRow:       { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  profileName:   { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  profileEmail:  { fontSize: fontSize.md, color: colors.textSecondary },
  profileCollege:{ fontSize: fontSize.md, color: colors.textMuted },
  profileBio:    { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22 },
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statsCell:     { width: '47.5%' },
  coursesCard:   { backgroundColor: colors.bgSurface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, gap: spacing.lg },
  sectionTitle:  { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  courseRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  courseIcon:    { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.accentGlow, alignItems: 'center', justifyContent: 'center' },
  courseName:    { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  courseMeta:    { fontSize: fontSize.sm, color: colors.textMuted },
  logoutBtn:     { borderWidth: 1, borderColor: colors.danger, borderRadius: radius.md, padding: spacing.lg, alignItems: 'center' },
  logoutTxt:     { color: colors.danger, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});