import React, { useEffect, useState } from 'react';
import { Alert, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  Screen, Card, SectionLabel, Tag, Pill, ProgressBar,
  Btn, Divider, ErrorBox, Avatar, useColors, st,
} from '../components/UI';

function safeArray(d) { return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []; }

export default function StudentProfile() {
  const { dbUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const C = useColors();

  const [form, setForm] = useState({
    name:    dbUser?.name    || '',
    email:   dbUser?.email   || '',
    college: dbUser?.college || '',
    phone:   dbUser?.phone   || '',
  });
  const [editMode,    setEditMode]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    api.get('/users/enrollments')
      .then(r => setEnrollments(safeArray(r)))
      .catch(() => {});
  }, []);

  // Refill form when dbUser loads
  useEffect(() => {
    if (dbUser) {
      setForm({
        name:    dbUser.name    || '',
        email:   dbUser.email   || '',
        college: dbUser.college || '',
        phone:   dbUser.phone   || '',
      });
    }
  }, [dbUser]);

  const completed    = enrollments.filter(e => e.progress >= 100);
  const totalCredits = completed.reduce((s, e) => s + (e.credits || 0), 0);
  const progressPct  = Math.min(100, Math.round((totalCredits / 168) * 100));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await api.put('/users/profile', { name: form.name, phone: form.phone, college: form.college });
      setSaved(true); setEditMode(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const inputStyle = [st.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }];

  return (
    <Screen>
      {/* Profile card */}
      <Card style={{ backgroundColor: C.card, borderColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={form.name || 'S'} size={56} />
          <View style={{ flex: 1 }}>
            {editMode ? (
              <TextInput
                value={form.name}
                onChangeText={v => setForm(p => ({ ...p, name: v }))}
                style={[inputStyle, { fontWeight: '700', fontSize: 16 }]}
              />
            ) : (
              <Text style={{ fontWeight: '800', fontSize: 17, color: C.text }}>{form.name || 'Student'}</Text>
            )}
            <Text style={{ fontSize: 12, color: C.blueLight, fontWeight: '600', marginTop: 2 }}>{form.email}</Text>
            <Text style={{ fontSize: 11, color: C.textSub, textTransform: 'capitalize' }}>{dbUser?.role || 'student'}</Text>
          </View>
        </View>
        <Divider />
        {saved && <Text style={{ fontSize: 12, color: C.emerald, fontWeight: '600' }}>✓ Saved!</Text>}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {editMode ? (
            <>
              <View style={{ flex: 1 }}><Btn label="Cancel" variant="outline" small onPress={() => setEditMode(false)} /></View>
              <View style={{ flex: 1 }}><Btn label={saving ? 'Saving…' : 'Save'} small disabled={saving} onPress={handleSave} /></View>
            </>
          ) : (
            <Btn label="✏️  Edit Profile" variant="outline" small onPress={() => setEditMode(true)} />
          )}
        </View>
      </Card>

      <ErrorBox message={error} />

      {/* Preferences — Dark / Light mode */}
      <Card style={{ backgroundColor: C.card, borderColor: C.border }}>
        <SectionLabel>Preferences</SectionLabel>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
          <View>
            <Text style={{ fontWeight: '700', fontSize: 14, color: C.text }}>
              {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </Text>
            <Text style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>
              {isDark ? 'Switch to light interface' : 'Switch to dark interface'}
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: C.blue }}
            thumbColor={isDark ? C.blueLight : '#fff'}
          />
        </View>
      </Card>

      {/* Academic overview */}
      <Card style={{ backgroundColor: C.card, borderColor: C.border }}>
        <SectionLabel>Academic Overview</SectionLabel>
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <Pill label="Credits Earned"    value={totalCredits}       color={C.blueLight} />
          <Pill label="Courses Completed" value={completed.length}   color={C.emerald}   />
          <Pill label="Total Enrolled"    value={enrollments.length} color={C.amber}     />
        </View>
        <Text style={{ fontSize: 12, color: C.textSub, marginBottom: 6 }}>
          Degree Progress · <Text style={{ fontWeight: '700', color: C.text }}>{progressPct}%</Text>
        </Text>
        <ProgressBar value={progressPct} height={8} />
      </Card>

      {/* Personal info */}
      <Card style={{ backgroundColor: C.card, borderColor: C.border }}>
        <SectionLabel>Personal Information</SectionLabel>
        {[
          { label: 'Email',   key: 'email',   readOnly: true  },
          { label: 'College', key: 'college', readOnly: false },
          { label: 'Phone',   key: 'phone',   readOnly: false },
        ].map(({ label, key, readOnly }) => (
          <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: C.textSub, width: 70 }}>{label}</Text>
            {editMode && !readOnly ? (
              <TextInput
                value={form[key]}
                onChangeText={v => setForm(p => ({ ...p, [key]: v }))}
                style={[inputStyle, { flex: 1, marginLeft: 8 }]}
                autoCapitalize="none"
              />
            ) : (
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.text, flex: 1, textAlign: 'right' }}>
                {form[key] || '—'}
              </Text>
            )}
          </View>
        ))}
      </Card>

      {/* Completed courses */}
      {completed.length > 0 && (
        <Card style={{ backgroundColor: C.card, borderColor: C.border }}>
          <SectionLabel>Completed Courses</SectionLabel>
          {completed.slice(0, 5).map((e, i) => (
            <View key={e.courseId || i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: i > 0 ? 8 : 4 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: C.text, fontSize: 13 }} numberOfLines={1}>{e.name}</Text>
                <Text style={{ fontSize: 11, color: C.textSub }}>{e.code} · Year {e.yearId} · {e.credits || 0} cr</Text>
              </View>
              <Tag label="✓" color={C.emerald} bg={C.emeraldBg} />
            </View>
          ))}
          {completed.length > 5 && (
            <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>+{completed.length - 5} more</Text>
          )}
        </Card>
      )}

      <View style={{ marginTop: 8 }}>
        <Btn label="Logout" variant="danger" onPress={logout} />
      </View>
    </Screen>
  );
}