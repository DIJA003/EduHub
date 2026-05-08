/**
 * src/components/UI.jsx
 * Shared primitives — fully theme-reactive (dark ↔ light).
 *
 * Pages that imported the static `C` object still get dark-theme values for
 * backward-compat with slate* keys. All components now call useColors() so
 * they respond instantly when the theme toggles.
 */
import React from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { darkColors, lightColors } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';

// ── Design tokens ─────────────────────────────────────────────────────────────
function makeC(colors) {
  return {
    bg:            colors.bgBase,
    surface:       colors.bgSurface,
    card:          colors.bgCard,
    border:        colors.border,
    borderLight:   colors.border,
    blue:          colors.accent,
    blueLight:     colors.accentLight,
    blueBg:        colors.accentGlow,
    blueBorder:    colors.accentLight + '66',
    emerald:       colors.success,
    emeraldBg:     colors.successBg,
    emeraldBorder: colors.success + '66',
    amber:         colors.warning,
    amberBg:       colors.warningBg,
    rose:          colors.danger,
    roseBg:        colors.dangerBg,
    text:          colors.textPrimary,
    textSub:       colors.textSecondary,
    textMuted:     colors.textMuted,
    // slate* aliases for backward-compat with existing pages
    slate900:      colors.textPrimary,
    slate700:      colors.textPrimary,
    slate600:      colors.textSecondary,
    slate500:      colors.textSecondary,
    slate400:      colors.textMuted,
    slate300:      colors.textMuted,
    slate100:      colors.bgHover,
    slate50:       colors.bgHover,
    white:         colors.bgCard,
  };
}

/** Static export — dark palette, kept for pages that use `import { C }`. */
export const C = makeC(darkColors);

/** Hook — returns live colors that update when the theme toggles. */
export function useColors() {
  const { isDark } = useTheme();
  return makeC(isDark ? darkColors : lightColors);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export function safeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function storeJson(key, value) {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export async function loadJson(key) {
  try {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

/**
 * s — style shortcuts. Now returns live colors.
 * Usage: const c = useColors(); ... style={s.pageTitle(c)}
 * Backward compat: s.pageTitle is also a StyleSheet object for old code.
 */
export const s = StyleSheet.create({
  pageTitle: { fontSize: 22, fontWeight: '800', color: C.text },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export function Screen({ children, style }) {
  const insets = useSafeAreaInsets();
  const c = useColors();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={[
        { padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 48, gap: 12 },
        style,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style, bg }) {
  const c = useColors();
  return (
    <View style={[
      { backgroundColor: bg ?? c.card, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 14, gap: 8 },
      style,
    ]}>
      {children}
    </View>
  );
}

// ── SectionLabel ──────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  const c = useColors();
  return (
    <Text style={{ fontSize: 10, fontWeight: '700', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
      {children}
    </Text>
  );
}

// ── Tag ───────────────────────────────────────────────────────────────────────
export function Tag({ label, color, bg }) {
  const c = useColors();
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: bg || c.blueBg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={{ fontSize: 10, fontWeight: '700', color: color || c.blueLight }}>{label}</Text>
    </View>
  );
}

// ── Pill ──────────────────────────────────────────────────────────────────────
export function Pill({ label, value, color }) {
  const c = useColors();
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: '800', color: color || c.blueLight }}>{String(value)}</Text>
      <Text style={{ fontSize: 10, color: c.textMuted, marginTop: 2, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value, height = 6 }) {
  const c = useColors();
  const pct = Math.min(100, Math.max(0, value || 0));
  return (
    <View style={{ height, backgroundColor: c.border, borderRadius: 99, overflow: 'hidden' }}>
      <View style={{ height, width: `${pct}%`, backgroundColor: pct >= 100 ? c.emerald : c.blue, borderRadius: 99 }} />
    </View>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 44, bg }) {
  const c = useColors();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg || c.blue, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.38 }}>{(name || '?')[0].toUpperCase()}</Text>
    </View>
  );
}

// ── Btn ───────────────────────────────────────────────────────────────────────
export function Btn({ label, onPress, variant = 'primary', small, disabled }) {
  const c = useColors();
  const bgColor =
    variant === 'primary' ? c.blue :
    variant === 'danger'  ? c.rose :
    variant === 'ghost'   ? 'transparent' :
    c.card;
  const textColor =
    variant === 'ghost'   ? c.blueLight :
    variant === 'outline' ? c.text :
    '#fff';
  const borderStyle = variant === 'outline' ? { borderWidth: 1, borderColor: c.border } : {};
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[{ backgroundColor: bgColor, borderRadius: 99, paddingHorizontal: small ? 12 : 16, paddingVertical: small ? 7 : 10, alignItems: 'center' }, borderStyle, disabled && { opacity: 0.5 }]}
    >
      <Text style={{ color: textColor, fontWeight: '700', fontSize: small ? 12 : 13 }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({ label, value, onChangeText, placeholder, secure, multiline, editable = true, keyboardType }) {
  const c = useColors();
  return (
    <View style={{ gap: 4 }}>
      {label ? <Text style={{ fontSize: 12, fontWeight: '600', color: c.textSub }}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
        secureTextEntry={secure}
        multiline={multiline}
        editable={editable}
        autoCapitalize="none"
        keyboardType={keyboardType}
        style={[
          { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: c.text },
          multiline && { height: 80, textAlignVertical: 'top' },
          !editable && { opacity: 0.6 },
        ]}
      />
    </View>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider() {
  const c = useColors();
  return <View style={{ height: 1, backgroundColor: c.border, marginVertical: 4 }} />;
}

// ── ErrorBox ──────────────────────────────────────────────────────────────────
export function ErrorBox({ message }) {
  const c = useColors();
  if (!message) return null;
  return (
    <Card bg={c.roseBg} style={{ borderColor: c.rose, borderWidth: 1 }}>
      <Text style={{ color: c.rose, fontWeight: '600', fontSize: 13 }}>⚠️ {message}</Text>
    </Card>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, subtitle }) {
  const c = useColors();
  return (
    <Card>
      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Text style={{ fontSize: 32, marginBottom: 8 }}>{icon}</Text>
        <Text style={{ fontWeight: '700', color: c.text, fontSize: 15, textAlign: 'center' }}>{title}</Text>
        {subtitle ? <Text style={{ color: c.textSub, fontSize: 13, marginTop: 4, textAlign: 'center' }}>{subtitle}</Text> : null}
      </View>
    </Card>
  );
}

// ── ConfirmModal ──────────────────────────────────────────────────────────────
export function ConfirmModal({ visible, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, danger }) {
  const c = useColors();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} onPress={onCancel}>
        <Pressable style={{ backgroundColor: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 10, borderTopWidth: 1, borderColor: c.border }}>
          <Text style={{ fontWeight: '800', fontSize: 16, color: c.text }}>{title}</Text>
          {message ? <Text style={{ color: c.textSub, fontSize: 13, marginTop: 4 }}>{message}</Text> : null}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <View style={{ flex: 1 }}><Btn label="Cancel" variant="outline" onPress={onCancel} /></View>
            <View style={{ flex: 1 }}><Btn label={confirmLabel} variant={danger ? 'danger' : 'primary'} onPress={onConfirm} /></View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── ThemeToggle — drop-in toggle switch for any page ─────────────────────────
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const c = useColors();
  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.8}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 4 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={{ fontSize: 18 }}>{isDark ? '🌙' : '☀️'}</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>
      </View>
      {/* Pill switch */}
      <View style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: isDark ? c.blue : c.border, justifyContent: 'center', paddingHorizontal: 3 }}>
        <View style={{
          width: 22, height: 22, borderRadius: 11,
          backgroundColor: '#fff',
          transform: [{ translateX: isDark ? 22 : 0 }],
          shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
        }} />
      </View>
    </TouchableOpacity>
  );
}

// ── st (legacy static styles for backward compat) ────────────────────────────
export const st = StyleSheet.create({
  card:      { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, gap: 8 },
  input:     { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: C.text },
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 10, borderTopWidth: 1, borderColor: C.border },
  pageTitle: { fontSize: 22, fontWeight: '800', color: C.text },
});