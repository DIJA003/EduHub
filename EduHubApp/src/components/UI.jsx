/**
 * src/components/UI.jsx
 * Shared primitives used across all EduHubApp pages.
 * Design: dark theme matching colors from utils/theme.js
 */
import React from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { darkColors, lightColors } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';

// ── Design tokens hook — returns correct colors for current theme ──────────────
function makeC(colors) {
  return {
    bg:        colors.bgBase,
    surface:   colors.bgSurface,
    card:      colors.bgCard,
    border:    colors.border,
    blue:      colors.accent,
    blueLight: colors.accentLight,
    blueBg:    colors.accentGlow,
    emerald:   colors.success,
    emeraldBg: colors.successBg,
    amber:     colors.warning,
    amberBg:   colors.warningBg,
    rose:      colors.danger,
    roseBg:    colors.dangerBg,
    text:      colors.textPrimary,
    textSub:   colors.textSecondary,
    textMuted: colors.textMuted,
    white:     '#FFFFFF',
  };
}

// Static fallback for files that import C directly (uses dark)
export const C = makeC(darkColors);

// Hook to get theme-aware colors
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

// ── s (style shortcuts used by pages) ─────────────────────────────────────────
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
        {
          padding: 16,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 48,
          gap: 12,
        },
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
  return (
    <View style={[st.card, bg ? { backgroundColor: bg } : {}, style]}>
      {children}
    </View>
  );
}

// ── SectionLabel ──────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <Text
      style={{
        fontSize: 10,
        fontWeight: '700',
        color: C.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 6,
      }}
    >
      {children}
    </Text>
  );
}

// ── Tag ───────────────────────────────────────────────────────────────────────
export function Tag({ label, color, bg }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: bg || C.blueBg,
        borderRadius: 99,
        paddingHorizontal: 8,
        paddingVertical: 2,
      }}
    >
      <Text style={{ fontSize: 10, fontWeight: '700', color: color || C.blueLight }}>
        {label}
      </Text>
    </View>
  );
}

// ── Pill (stat) ───────────────────────────────────────────────────────────────
export function Pill({ label, value, color }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: '800', color: color || C.blueLight }}>
        {String(value)}
      </Text>
      <Text
        style={{
          fontSize: 10,
          color: C.textMuted,
          marginTop: 2,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export function ProgressBar({ value, height = 6 }) {
  const pct = Math.min(100, Math.max(0, value || 0));

  return (
    <View
      style={{
        height,
        backgroundColor: C.border,
        borderRadius: 99,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height,
          width: `${pct}%`,
          backgroundColor: pct >= 100 ? C.emerald : C.blue,
          borderRadius: 99,
        }}
      />
    </View>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 44, bg }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg || C.blue,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.38 }}>
        {(name || '?')[0].toUpperCase()}
      </Text>
    </View>
  );
}

// ── Btn ───────────────────────────────────────────────────────────────────────
export function Btn({ label, onPress, variant = 'primary', small, disabled }) {
  const bgColor =
    variant === 'primary'
      ? C.blue
      : variant === 'danger'
      ? C.rose
      : variant === 'ghost'
      ? 'transparent'
      : C.card;

  const textColor =
    variant === 'ghost'
      ? C.blueLight
      : variant === 'outline'
      ? C.text
      : '#fff';

  const borderStyle =
    variant === 'outline'
      ? { borderWidth: 1, borderColor: C.border }
      : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor: bgColor,
          borderRadius: 99,
          paddingHorizontal: small ? 12 : 16,
          paddingVertical: small ? 7 : 10,
          alignItems: 'center',
        },
        borderStyle,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text
        style={{
          color: textColor,
          fontWeight: '700',
          fontSize: small ? 12 : 13,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  multiline,
  editable = true,
  keyboardType,
}) {
  return (
    <View style={{ gap: 4 }}>
      {label ? (
        <Text style={{ fontSize: 12, fontWeight: '600', color: C.textSub }}>
          {label}
        </Text>
      ) : null}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
        secureTextEntry={secure}
        multiline={multiline}
        editable={editable}
        autoCapitalize="none"
        keyboardType={keyboardType}
        style={[
          st.input,
          multiline && { height: 80, textAlignVertical: 'top' },
          !editable && { opacity: 0.6 },
        ]}
      />
    </View>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider() {
  return <View style={{ height: 1, backgroundColor: C.border, marginVertical: 4 }} />;
}

// ── ErrorBox ──────────────────────────────────────────────────────────────────
export function ErrorBox({ message }) {
  if (!message) return null;

  return (
    <Card bg={C.roseBg} style={{ borderColor: C.rose, borderWidth: 1 }}>
      <Text style={{ color: C.rose, fontWeight: '600', fontSize: 13 }}>
        ⚠️ {message}
      </Text>
    </Card>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, subtitle }) {
  return (
    <Card>
      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
        <Text style={{ fontSize: 32, marginBottom: 8 }}>{icon}</Text>

        <Text
          style={{
            fontWeight: '700',
            color: C.text,
            fontSize: 15,
            textAlign: 'center',
          }}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={{
              color: C.textSub,
              fontSize: 13,
              marginTop: 4,
              textAlign: 'center',
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

// ── ConfirmModal ──────────────────────────────────────────────────────────────
export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  danger,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={st.overlay} onPress={onCancel}>
        <Pressable style={st.modalCard}>
          <Text style={{ fontWeight: '800', fontSize: 16, color: C.text }}>
            {title}
          </Text>

          {message ? (
            <Text style={{ color: C.textSub, fontSize: 13, marginTop: 4 }}>
              {message}
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <View style={{ flex: 1 }}>
              <Btn label="Cancel" variant="outline" onPress={onCancel} />
            </View>

            <View style={{ flex: 1 }}>
              <Btn
                label={confirmLabel}
                variant={danger ? 'danger' : 'primary'}
                onPress={onConfirm}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
export const st = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },

  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: C.text,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: C.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderColor: C.border,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
  },
});
