/**
 * pages/auth/Login.jsx
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import { FormInput, BtnPrimary } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:8000/api';

const FIREBASE_ERRORS = {
  'auth/invalid-credential':  'Invalid email or password.',
  'auth/user-not-found':      'No account found with this email.',
  'auth/wrong-password':      'Incorrect password.',
  'auth/invalid-email':       'Please enter a valid email.',
  'auth/too-many-requests':   'Too many attempts. Try again later.',
};

export default function Login() {
  const navigation = useNavigation();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await new Promise(r => setTimeout(r, 300));
      try {
        const token    = await userCredential.user.getIdToken(true);
        const response = await fetch(`${API_URL}/users/login`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) console.warn('[Login] Backend error');
      } catch (backendErr) {
        console.warn('[Login] Backend fetch failed:', backendErr.message);
      }
    } catch (err) {
      setError(FIREBASE_ERRORS[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={st.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">

        <View style={st.logoWrap}>
          <View style={st.logoIcon}><Text style={{ fontSize: 28 }}>📚</Text></View>
          <Text style={st.logoText}>Edu<Text style={{ color: colors.accentLight }}>Hub</Text></Text>
          <Text style={st.logoSub}>Academic Collaboration Platform</Text>
        </View>

        <View style={st.card}>
          <Text style={st.cardTitle}>Welcome Back!</Text>
          <Text style={st.cardSub}>Login to your account</Text>

          {error ? <View style={st.errorBox}><Text style={st.errorTxt}>{error}</Text></View> : null}

          <FormInput label="Email Address" value={email} onChangeText={t => { setEmail(t); setError(''); }}
            placeholder="Email address" keyboardType="email-address" />
          <FormInput label="Password" value={password} onChangeText={t => { setPassword(t); setError(''); }}
            placeholder="Password" secureTextEntry />

          <TouchableOpacity style={st.forgotWrap} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={st.forgotTxt}>Forgot password?</Text>
          </TouchableOpacity>

          <BtnPrimary onPress={handleSubmit} loading={loading} style={st.loginBtn}>
            {loading ? '' : 'Login'}
          </BtnPrimary>

          <View style={st.registerRow}>
            <Text style={st.registerTxt}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={st.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bgBase },
  scroll:       { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  logoWrap:     { alignItems: 'center', marginBottom: spacing.xxxl },
  logoIcon:     { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  logoText:     { fontSize: fontSize.xxl + 4, fontWeight: fontWeight.bold, color: colors.textPrimary, letterSpacing: -1 },
  logoSub:      { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  card:         { backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.xxl },
  cardTitle:    { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.xs },
  cardSub:      { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xl },
  errorBox:     { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.md },
  errorTxt:     { color: colors.danger, fontSize: fontSize.sm },
  forgotWrap:   { alignSelf: 'flex-end', marginTop: -spacing.sm, marginBottom: spacing.lg },
  forgotTxt:    { fontSize: fontSize.sm, color: colors.accentLight, fontWeight: fontWeight.medium },
  loginBtn:     { marginTop: spacing.sm },
  registerRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  registerTxt:  { fontSize: fontSize.sm, color: colors.textSecondary },
  registerLink: { fontSize: fontSize.sm, color: colors.accentLight, fontWeight: fontWeight.semibold },
});