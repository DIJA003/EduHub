/**
 * components/admin/adminUtils.jsx
 * React Native equivalent of web adminUtils.jsx
 * Same component names + same props interface — internals use RN primitives
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight, badgeVariants } from '../../utils/theme';

// ─── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ variant = 'default', children }) {
  const s = badgeVariants[variant] || badgeVariants.default;
  return (
    <View style={[st.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={[st.badgeText, { color: s.text }]}>{children}</Text>
    </View>
  );
}

// ─── Buttons ───────────────────────────────────────────────────────────────────
export function BtnPrimary({ onPress, children, loading, disabled, style }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}
      style={[st.btnPrimary, style, (disabled || loading) && { opacity: 0.55 }]}>
      {loading
        ? <ActivityIndicator size="small" color="#fff" />
        : <Text style={st.btnPrimaryText}>{children}</Text>}
    </TouchableOpacity>
  );
}

export function BtnSecondary({ onPress, children, disabled, style }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}
      style={[st.btnSecondary, style]}>
      <Text style={st.btnSecondaryText}>{children}</Text>
    </TouchableOpacity>
  );
}

export function BtnDanger({ onPress, children, disabled, style }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}
      style={[st.btnDanger, style]}>
      <Text style={st.btnDangerText}>{children}</Text>
    </TouchableOpacity>
  );
}

// ─── Form helpers ──────────────────────────────────────────────────────────────
export function FormGroup({ label, children }) {
  return (
    <View style={st.formGroup}>
      {label ? <Text style={st.formLabel}>{label}</Text> : null}
      {children}
    </View>
  );
}

export function FormInput({ value, onChangeText, placeholder, secureTextEntry, keyboardType, multiline, numberOfLines, style, editable }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      value={value} onChangeText={onChangeText} placeholder={placeholder}
      placeholderTextColor={colors.textMuted} secureTextEntry={secureTextEntry}
      keyboardType={keyboardType || 'default'} multiline={multiline}
      numberOfLines={numberOfLines} editable={editable !== false}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={[st.input, focused && st.inputFocused, multiline && { height: 88, textAlignVertical: 'top' }, style]}
    />
  );
}

// Simple picker that renders a list of options as touchable chips
export function FormSelect({ value, onChange, children, style }) {
  const [open, setOpen] = useState(false);
  // Parse option children: [{ label, value }]
  const options = React.Children.toArray(children).map(c => ({
    label: c.props.children,
    value: String(c.props.value ?? c.props.children),
  }));
  const selected = options.find(o => String(o.value) === String(value));

  return (
    <View>
      <TouchableOpacity
        style={[st.input, st.selectTrigger, style]}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.8}>
        <Text style={{ color: selected ? colors.textPrimary : colors.textMuted, fontSize: fontSize.md }}>
          {selected?.label || 'Select…'}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>▼</Text>
      </TouchableOpacity>
      {open && (
        <View style={st.dropdown}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[st.dropdownItem, String(opt.value) === String(value) && st.dropdownItemActive]}
              onPress={() => { onChange({ target: { value: opt.value } }); setOpen(false); }}>
              <Text style={[st.dropdownText, String(opt.value) === String(value) && { color: colors.accentLight, fontWeight: fontWeight.semibold }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Page header (title + subtitle + optional actions) ─────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <View style={st.pageHeader}>
      <View style={{ flex: 1 }}>
        <Text style={st.pageTitle}>{title}</Text>
        {subtitle ? <Text style={st.pageSubtitle}>{subtitle}</Text> : null}
      </View>
      {actions ? <View style={st.pageActions}>{actions}</View> : null}
    </View>
  );
}

// ─── Table wrapper (card with optional toolbar) ────────────────────────────────
export function TableWrap({ toolbar, children }) {
  return (
    <View style={st.tableWrap}>
      {toolbar ? <View style={st.toolbar}>{toolbar}</View> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: '100%' }}>{children}</View>
      </ScrollView>
    </View>
  );
}

// ─── Table search ──────────────────────────────────────────────────────────────
export function TableSearch({ value, onChange, placeholder }) {
  return (
    <View style={st.searchWrap}>
      <Text style={st.searchIcon}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={t => onChange({ target: { value: t } })}
        placeholder={placeholder || 'Search…'}
        placeholderTextColor={colors.textMuted}
        style={st.searchInput}
      />
    </View>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description }) {
  return (
    <View style={st.emptyState}>
      <Text style={st.emptyIcon}>{icon}</Text>
      <Text style={st.emptyTitle}>{title}</Text>
      {description ? <Text style={st.emptyDesc}>{description}</Text> : null}
    </View>
  );
}

// ─── StatsCard (re-export shape) ───────────────────────────────────────────────
export { default as StatsCard } from './StatsCard';

// tw shims — not used in RN but imported by some pages
export const tw = { th: {}, td: {}, trHover: {} };

const st = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1 },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  btnPrimary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: spacing.md - 2, borderRadius: radius.sm },
  btnPrimaryText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  btnSecondary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.md - 2, borderRadius: radius.sm },
  btnSecondaryText: { color: colors.textSecondary, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  btnDanger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.danger, paddingHorizontal: spacing.lg, paddingVertical: spacing.md - 2, borderRadius: radius.sm },
  btnDangerText: { color: colors.danger, fontSize: fontSize.md, fontWeight: fontWeight.semibold },

  formGroup: { gap: spacing.sm, marginBottom: spacing.md },
  formLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md - 2, fontSize: fontSize.md, color: colors.textPrimary },
  inputFocused: { borderColor: colors.borderFocus },
  selectTrigger: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdown: { backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, marginTop: spacing.xs, zIndex: 100 },
  dropdownItem: { paddingHorizontal: spacing.md, paddingVertical: spacing.md - 2, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropdownItemActive: { backgroundColor: colors.accentGlow },
  dropdownText: { fontSize: fontSize.md, color: colors.textSecondary },

  pageHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.xl },
  pageTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 3 },
  pageActions: { flexDirection: 'row', gap: spacing.sm },

  tableWrap: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing.md },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },

  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minWidth: 180 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: fontSize.md, color: colors.textPrimary },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl * 2, gap: spacing.md },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  emptyDesc: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center', maxWidth: 280, lineHeight: 18 },
});
