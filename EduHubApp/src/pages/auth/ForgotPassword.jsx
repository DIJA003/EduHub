/**
 * pages/auth/ForgotPassword.jsx
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import { FormInput, BtnPrimary } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.12:8000/api';

export default function ForgotPassword() {
  const navigation = useNavigation();
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setStatus('loading'); setErrMsg('');
    try {
      try {
        const checkRes = await fetch(`${API_URL}/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
        if (!checkRes.ok) {
          const data = await checkRes.json();
          if (checkRes.status === 404) { setStatus('error'); setErrMsg(data.message || 'Email not found.'); return; }
        }
      } catch (err) { console.warn('Backend email check failed:', err.message); }

      await sendPasswordResetEmail(auth, email.trim());
      setStatus('success');
    } catch (err) {
      setStatus('error');
      const FB = { 'auth/user-not-found': 'No account found with this email.', 'auth/invalid-email': 'Please enter a valid email address.' };
      setErrMsg(FB[err.code] || 'Something went wrong. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <View style={[st.container, { justifyContent: 'center', padding: spacing.xl }]}>
        <View style={st.successCard}>
          <Text style={{ fontSize: 40, textAlign: 'center' }}>📧</Text>
          <Text style={st.successTitle}>Check your email</Text>
          <Text style={st.successSub}>A password reset link has been sent to {email}</Text>
          <BtnPrimary onPress={() => navigation.navigate('Login')}>Back to Login</BtnPrimary>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={st.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={st.inner}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.back}>
          <Text style={st.backTxt}>← Back to Login</Text>
        </TouchableOpacity>

        <Text style={st.title}>Forgot Password?</Text>
        <Text style={st.sub}>Enter your email and we'll send you a reset link.</Text>

        <View style={st.card}>
          {status === 'error'
            ? <View style={st.errorBox}><Text style={st.errorTxt}>{errMsg}</Text></View>
            : null}

          <FormInput label="Email Address" value={email} onChangeText={t => { setEmail(t); setStatus('idle'); }}
            placeholder="you@university.edu" keyboardType="email-address" />

          <BtnPrimary onPress={handleSubmit} loading={status === 'loading'} style={{ marginTop: spacing.sm }}>
            {status === 'loading' ? '' : 'Send Reset Link'}
          </BtnPrimary>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.bgBase },
  inner:        { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  back:         { marginBottom: spacing.xxl },
  backTxt:      { color: colors.accentLight, fontSize: fontSize.base, fontWeight: fontWeight.medium },
  title:        { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  sub:          { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xxl, lineHeight: 20 },
  card:         { backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.xxl },
  errorBox:     { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: radius.sm, padding: spacing.md, marginBottom: spacing.md },
  errorTxt:     { color: colors.danger, fontSize: fontSize.sm },
  successCard:  { backgroundColor: colors.bgSurface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xxl, gap: spacing.lg, alignItems: 'center' },
  successTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center' },
  successSub:   { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
});