/**
 * pages/auth/Register.jsx
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import { FormInput, BtnPrimary, FormGroup, FormSelect } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const API_URL   = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:8000/api';
const STRONG_PW = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const FIREBASE_ERRORS = {
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/invalid-email':        'Please enter a valid email address.',
  'auth/weak-password':        'Password is too weak.',
};

export default function Register() {
  const navigation = useNavigation();
  const [role,    setRole]    = useState('student');
  const [form,    setForm]    = useState({ name: '', email: '', college: '', password: '', confirmPassword: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = field => val => { setForm(f => ({ ...f, [field]: val })); setError(''); };

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim()) { setError('Please enter your name.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (!STRONG_PW.test(form.password)) { setError('Password must be 8+ chars with uppercase, lowercase, and a number.'); return; }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      await sendEmailVerification(userCredential.user);
      try {
        const token    = await userCredential.user.getIdToken();
        const response = await fetch(`${API_URL}/users/register`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name.trim(), role, college: form.college.trim() }),
        });
        if (!response.ok) console.warn('[Register] Backend error:', (await response.json()).message);
      } catch (err) { console.warn('[Register] Backend failed:', err.message); }
      navigation.navigate('Login');
    } catch (err) {
      setError(FIREBASE_ERRORS[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={st.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">
        <View style={st.header}>
          <Text style={st.title}>Create Account</Text>
          <Text style={st.sub}>Join EduHub and start learning</Text>
        </View>

        <View style={st.card}>
          {error ? <View style={st.errorBox}><Text style={st.errorTxt}>{error}</Text></View> : null}

          <FormInput label="Full Name"     value={form.name}            onChangeText={set('name')}            placeholder="Ahmed Mohamed" />
          <FormInput label="Email"         value={form.email}           onChangeText={set('email')}           placeholder="you@university.edu" keyboardType="email-address" />
          <FormInput label="College"       value={form.college}         onChangeText={set('college')}         placeholder="e.g. Faculty of Engineering" />
          <FormInput label="Password"      value={form.password}        onChangeText={set('password')}        placeholder="8+ chars, upper/lower/number" secureTextEntry />
          <FormInput label="Confirm Password" value={form.confirmPassword} onChangeText={set('confirmPassword')} placeholder="Repeat password" secureTextEntry />

          <FormGroup label="Role">
            <View style={st.roleRow}>
              {['student', 'mentor'].map(r => (
                <TouchableOpacity key={r} onPress={() => setRole(r)}
                  style={[st.roleChip, role === r && st.roleChipActive]}>
                  <Text style={[st.roleChipTxt, role === r && { color: colors.white }]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormGroup>

          <BtnPrimary onPress={handleSubmit} loading={loading} style={{ marginTop: spacing.sm }}>
            {loading ? '' : 'Create Account'}
          </BtnPrimary>

          <View style={st.loginRow}>
            <Text style={st.loginTxt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={st.loginLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  header:    { alignItems: 'center', marginBottom: spacing.xxl },
  title:     { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  sub:       { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  card:      { backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.xxl },
  errorBox:  { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.md },
  errorTxt:  { color: colors.danger, fontSize: fontSize.sm },
  roleRow:   { flexDirection: 'row', gap: spacing.md },
  roleChip:  { flex: 1, padding: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.bgCard },
  roleChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  roleChipTxt:    { fontSize: fontSize.md, color: colors.textSecondary, fontWeight: fontWeight.medium },
  loginRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  loginTxt:  { fontSize: fontSize.sm, color: colors.textSecondary },
  loginLink: { fontSize: fontSize.sm, color: colors.accentLight, fontWeight: fontWeight.semibold },
});