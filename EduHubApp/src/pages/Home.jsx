/**
 * pages/Home.jsx
 * Same logic as web Home.jsx — landing + user greeting
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme';

const FEATURES = [
  { icon: '🎓', title: 'Academic Paths',    desc: 'Structured year-by-year curriculum with credit tracking.' },
  { icon: '🤝', title: 'Mentor Support',    desc: 'Direct mentorship from experienced educators.' },
  { icon: '📁', title: 'Materials Hub',     desc: 'Upload, review, and access learning materials instantly.' },
  { icon: '📊', title: 'Progress Tracking', desc: 'Monitor your academic progress and earned credits.' },
];

const STATS = [
  { value: '2,400+', label: 'Students' },
  { value: '150+',   label: 'Courses' },
  { value: '98%',    label: 'Satisfaction' },
  { value: '50+',    label: 'Mentors' },
];

export default function Home() {
  const navigation = useNavigation();
  const { dbUser } = useAuth();

  const handleLogout = async () => { await signOut(auth); };

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>

      {/* Navbar bar */}
      <View style={st.navbar}>
        <Text style={st.navLogo}>Edu<Text style={{ color: colors.accentLight }}>Hub</Text></Text>
        {dbUser ? (
          <View style={st.navRight}>
            <View style={st.navAvatar}>
              <Text style={st.navAvatarTxt}>{dbUser.name?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={st.navLogout}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={st.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={st.loginBtnTxt}>Login</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Hero */}
      <View style={st.hero}>
        <View style={st.heroBadge}><Text style={st.heroBadgeTxt}>Connecting Minds</Text></View>
        <Text style={st.heroTitle}>
          Empowering Students & Mentors —{' '}
          <Text style={{ color: colors.accentLight }}>All in One Hub</Text>
        </Text>
        <Text style={st.heroSub}>
          A unified platform for collaboration, mentorship, and academic growth.
        </Text>

        {dbUser && (
          <View style={st.userGreeting}>
            <View style={st.greetAvatar}>
              <Text style={st.greetAvatarTxt}>{dbUser.name?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            <Text style={st.greetTxt}>
              Welcome back, <Text style={{ color: colors.accentLight, fontWeight: fontWeight.semibold }}>{dbUser.name}</Text>!
            </Text>
          </View>
        )}

        <TouchableOpacity style={st.ctaBtn} onPress={() => navigation.navigate('Academic')}>
          <Text style={st.ctaBtnTxt}>Get Started Free →</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={st.statsRow}>
        {STATS.map(s => (
          <View key={s.label} style={st.statItem}>
            <Text style={st.statValue}>{s.value}</Text>
            <Text style={st.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Features */}
      <View style={st.section}>
        <Text style={st.sectionTitle}>Everything you need to succeed</Text>
        <View style={st.featuresGrid}>
          {FEATURES.map(f => (
            <View key={f.title} style={st.featureCard}>
              <Text style={st.featureIcon}>{f.icon}</Text>
              <Text style={st.featureTitle}>{f.title}</Text>
              <Text style={st.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View style={st.ctaSection}>
        <Text style={st.ctaTitle}>Ready to start your journey?</Text>
        <Text style={st.ctaSub}>Join thousands of students already on EduHub.</Text>
        <TouchableOpacity style={st.ctaBtn2} onPress={() => navigation.navigate('Academic')}>
          <Text style={st.ctaBtnTxt2}>Explore Academic Paths →</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={st.footer}>
        <Text style={st.footerLogo}>Edu<Text style={{ color: colors.accentLight }}>Hub</Text></Text>
        <Text style={st.footerTxt}>© 2025 EduHub. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content:   { paddingBottom: 40 },

  navbar:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border },
  navLogo:     { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, letterSpacing: -0.5 },
  navRight:    { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  navAvatar:   { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  navAvatarTxt:{ fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.white },
  navLogout:   { fontSize: fontSize.sm, color: colors.danger, fontWeight: fontWeight.medium },
  loginBtn:    { backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.sm },
  loginBtnTxt: { color: colors.white, fontWeight: fontWeight.semibold, fontSize: fontSize.sm },

  hero:        { padding: spacing.xl, paddingTop: spacing.xxxl, alignItems: 'center', gap: spacing.lg },
  heroBadge:   { backgroundColor: colors.accentGlow, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: radius.full },
  heroBadgeTxt:{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.accentLight, textTransform: 'uppercase', letterSpacing: 1.5 },
  heroTitle:   { fontSize: fontSize.huge, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center', lineHeight: 36, letterSpacing: -0.5 },
  heroSub:     { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', maxWidth: 320, lineHeight: 22 },

  userGreeting: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, paddingHorizontal: spacing.lg },
  greetAvatar:  { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  greetAvatarTxt:{ fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.white },
  greetTxt:     { fontSize: fontSize.sm, color: colors.textSecondary },

  ctaBtn:      { backgroundColor: colors.accent, paddingHorizontal: spacing.xxl, paddingVertical: spacing.md, borderRadius: radius.xl, marginTop: spacing.sm },
  ctaBtnTxt:   { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold },

  statsRow:    { flexDirection: 'row', justifyContent: 'space-around', padding: spacing.xl, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.bgSurface },
  statItem:    { alignItems: 'center', gap: spacing.xs },
  statValue:   { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary, fontFamily: 'monospace' },
  statLabel:   { fontSize: fontSize.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },

  section:     { padding: spacing.xl },
  sectionTitle:{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.xl },
  featuresGrid:{ gap: spacing.md },
  featureCard: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, gap: spacing.sm },
  featureIcon: { fontSize: 32 },
  featureTitle:{ fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  featureDesc: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },

  ctaSection:  { margin: spacing.xl, backgroundColor: colors.accentGlow, borderRadius: radius.xl, borderWidth: 1, borderColor: 'rgba(36,99,235,0.25)', padding: spacing.xxl, alignItems: 'center', gap: spacing.md },
  ctaTitle:    { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, textAlign: 'center' },
  ctaSub:      { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
  ctaBtn2:     { backgroundColor: colors.accent, paddingHorizontal: spacing.xxl, paddingVertical: spacing.md, borderRadius: radius.xl },
  ctaBtnTxt2:  { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.bold },

  footer:      { alignItems: 'center', padding: spacing.xl, gap: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  footerLogo:  { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
  footerTxt:   { fontSize: fontSize.xs, color: colors.textMuted },
});
