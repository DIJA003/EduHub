/**
 * components/admin/Modal.jsx
 * Same props as web: { title, onClose, footer, children }
 */
import React from 'react';
import { View, Text, TouchableOpacity, Modal as RNModal, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

export default function Modal({ title, onClose, footer, children, visible = true }) {
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={st.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={st.card}>
          {/* Header */}
          <View style={st.header}>
            <Text style={st.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={st.closeBtn}>
              <Text style={st.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>
          {/* Body */}
          <ScrollView contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          {/* Footer */}
          {footer ? (
            <View style={st.footer}>{footer}</View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const st = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  card:    { backgroundColor: colors.bgSurface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderWidth: 1, borderColor: colors.border, maxHeight: '90%' },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  title:   { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
  closeBtn:{ padding: spacing.sm },
  closeTxt:{ fontSize: 22, color: colors.textMuted },
  body:    { padding: spacing.xl, gap: spacing.md },
  footer:  { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bgCard },
});
