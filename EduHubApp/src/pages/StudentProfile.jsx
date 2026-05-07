/**
 * pages/StudentProfile.jsx
 * Same logic as web Studentprofile.jsx — AsyncStorage instead of localStorage
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../context/CourseContext';
import { profileApi } from '../services/api';
import { Badge, BtnPrimary, BtnSecondary, FormGroup, FormInput } from '../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme';

const STORAGE_KEY = 'eduhub-profile-edits-v1';

async function loadProfileEdits()       { try { const r = await AsyncStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
async function saveProfileEdits(form)   { try { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch {} }

function buildBase(dbUser, user, currentYearId, years) {
  const mongoId   = dbUser?._id ?? dbUser?.id;
  const studentId = mongoId ? `…${String(mongoId).slice(-8)}` : user?.uid?.slice(0, 8) || '—';
  const activeYear  = currentYearId && years?.[currentYearId];
  const shortTitle  = activeYear?.meta?.title?.split(':')?.[0]?.trim();
  const yearLevel   = currentYearId && shortTitle
    ? `${shortTitle} — in progress (Year ${currentYearId})`
    : currentYearId ? `Year ${currentYearId} — in progress` : '—';
  return {
    name:         dbUser?.name    || user?.displayName    || '',
    email:        dbUser?.email   || user?.email          || '',
    phone:        dbUser?.phone   || '',
    studentId,
    college:      dbUser?.college || '',
    yearLevel,
    gpa:          dbUser?.gpa     || '',
    bio:          dbUser?.bio     || '',
    linkedin:     dbUser?.linkedin || '',
    github:       dbUser?.github  || '',
  };
}

export default function StudentProfile() {
  const { user, dbUser } = useAuth();
  const { years, currentYearId } = useCourses();
  const [editMode, setEditMode] = useState(false);
  const [form,     setForm]     = useState(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    const init = async () => {
      const base   = buildBase(dbUser, user, currentYearId, years);
      const stored = await loadProfileEdits();
      setForm(stored ? { ...base, ...stored } : base);
    };
    init();
  }, [dbUser, user, currentYearId, years]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.update({ name: form.name, college: form.college, bio: form.bio, phone: form.phone, linkedin: form.linkedin, github: form.github });
      await saveProfileEdits(form);
      setEditMode(false);
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  const handleLogout = () => Alert.alert('Sign Out', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', style: 'destructive', onPress: () => signOut(auth) },
  ]);

  const set = field => val => setForm(f => ({ ...f, [field]: val }));

  const initials = form?.name ? form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'S';

  const enrolled = Object.values(years).flatMap(y => y.enrolled || []);
  const completed = enrolled.filter(c => c.progress >= 100).length;
  const inProgress = enrolled.length - completed;

  if (!form) return <View style={st.loading}><Text style={{ color: colors.textMuted }}>Loading…</Text></View>;

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      {/* Profile card */}
      <View style={st.profileCard}>
        <View style={st.banner} />
        <View style={st.avatarRow}>
          <View style={st.avatarCircle}><Text style={st.avatarTxt}>{initials}</Text></View>
          {editMode ? (
            <View style={st.editActions}>
              <BtnSecondary onPress={() => setEditMode(false)}>Cancel</BtnSecondary>
              <BtnPrimary   onPress={handleSave} loading={saving}>Save</BtnPrimary>
            </View>
          ) : (
            <BtnSecondary onPress={() => setEditMode(true)}>✏️ Edit</BtnSecondary>
          )}
        </View>

        {editMode ? (
          <View style={st.formBlock}>
            <FormGroup label="Full Name">    <FormInput value={form.name}     onChangeText={set('name')}     placeholder="Full name" /></FormGroup>
            <FormGroup label="Phone">        <FormInput value={form.phone}    onChangeText={set('phone')}    placeholder="+20 xxx" keyboardType="phone-pad" /></FormGroup>
            <FormGroup label="College">      <FormInput value={form.college}  onChangeText={set('college')}  placeholder="Faculty" /></FormGroup>
            <FormGroup label="Bio">          <FormInput value={form.bio}      onChangeText={set('bio')}      placeholder="Short bio…" multiline numberOfLines={3} /></FormGroup>
            <FormGroup label="LinkedIn URL"> <FormInput value={form.linkedin} onChangeText={set('linkedin')} placeholder="https://linkedin.com/in/…" /></FormGroup>
            <FormGroup label="GitHub URL">   <FormInput value={form.github}   onChangeText={set('github')}  placeholder="https://github.com/…" /></FormGroup>
          </View>
        ) : (
          <View style={st.infoBlock}>
            <View style={st.nameRow}>
              <Text style={st.profileName}>{form.name || 'Student'}</Text>
              <Badge variant="blue">Student</Badge>
            </View>
            <Text style={st.profileEmail}>{form.email}</Text>
            {form.college   ? <Text style={st.profileMeta}>🏫 {form.college}</Text>      : null}
            {form.yearLevel ? <Text style={st.profileMeta}>📅 {form.yearLevel}</Text>    : null}
            {form.studentId ? <Text style={st.profileMeta}>🆔 ID: {form.studentId}</Text>: null}
            {form.bio       ? <Text style={st.profileBio}>{form.bio}</Text>              : null}
            {form.linkedin  ? <Text style={st.profileLink}>🔗 LinkedIn</Text>            : null}
            {form.github    ? <Text style={st.profileLink}>💻 GitHub</Text>              : null}
          </View>
        )}
      </View>

      {/* Quick stats */}
      <View style={st.statsRow}>
        {[
          { label: 'Enrolled',    value: String(enrolled.length) },
          { label: 'Completed',   value: String(completed) },
          { label: 'In Progress', value: String(inProgress) },
        ].map(s => (
          <View key={s.label} style={st.statItem}>
            <Text style={st.statValue}>{s.value}</Text>
            <Text style={st.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={st.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={st.logoutTxt}>🚪 Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.bgBase },
  content:       { padding: spacing.xl, gap: spacing.xl, paddingBottom: 60 },
  loading:       { flex: 1, backgroundColor: colors.bgBase, alignItems: 'center', justifyContent: 'center' },
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
  profileMeta:   { fontSize: fontSize.sm, color: colors.textMuted },
  profileBio:    { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22 },
  profileLink:   { fontSize: fontSize.sm, color: colors.accentLight },
  statsRow:      { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.bgSurface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  statItem:      { alignItems: 'center', gap: spacing.xs },
  statValue:     { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary, fontFamily: 'monospace' },
  statLabel:     { fontSize: fontSize.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.7 },
  logoutBtn:     { borderWidth: 1, borderColor: colors.danger, borderRadius: radius.md, padding: spacing.lg, alignItems: 'center' },
  logoutTxt:     { color: colors.danger, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});
