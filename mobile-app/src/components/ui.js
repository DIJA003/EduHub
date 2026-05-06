import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export const colors = {
  bg: "#F8FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  primary: "#2563EB",
  text: "#0F172A",
  muted: "#475569",
  danger: "#DC2626",
};

export function Screen({ children }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      {children}
    </ScrollView>
  );
}

export function Title({ children }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Card({ children }) {
  return <View style={styles.card}>{children}</View>;
}

export function Field({ label, value, onChangeText, placeholder, secureTextEntry = false }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        autoCapitalize="none"
      />
    </View>
  );
}

export function Button({ label, onPress, variant = "primary" }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, variant === "danger" ? { backgroundColor: colors.danger } : null]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({ label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.ghost}>
      <Text style={{ color: colors.primary, fontWeight: "700" }}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Row({ children }) {
  return <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>{children}</View>;
}

export function DataTable({ columns, rows, actions }) {
  return (
    <Card>
      <ScrollView horizontal>
        <View>
          <View style={styles.tr}>
            {columns.map((c) => (
              <Text key={c} style={[styles.th, { width: 140 }]}>{c}</Text>
            ))}
            {actions ? <Text style={[styles.th, { width: 120 }]}>Actions</Text> : null}
          </View>
          {rows.map((row, idx) => (
            <View key={row.id || idx} style={[styles.tr, { borderTopWidth: 1, borderColor: colors.border }]}>
              {columns.map((c) => (
                <Text key={c} style={[styles.td, { width: 140 }]}>{String(row[c] ?? "-")}</Text>
              ))}
              {actions ? <View style={{ width: 120 }}>{actions(row)}</View> : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </Card>
  );
}

export function FormModal({ visible, title, children, onCancel, onSave }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>{title}</Text>
          <ScrollView style={{ maxHeight: 420 }}>{children}</ScrollView>
          <Row>
            <GhostButton label="Cancel" onPress={onCancel} />
            <Button label="Save" onPress={onSave} />
          </Row>
        </View>
      </View>
    </Modal>
  );
}

export function ConfirmModal({ visible, title, description, onCancel, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onCancel}>
        <Pressable style={styles.modalCard}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{description}</Text>
          <Row>
            <GhostButton label="Cancel" onPress={onCancel} />
            <Button label="Delete" variant="danger" onPress={onConfirm} />
          </Row>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted },
  label: { fontSize: 13, color: colors.muted, fontWeight: "600" },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 12, gap: 10 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  button: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  ghost: { paddingHorizontal: 10, paddingVertical: 8 },
  tr: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  th: { fontWeight: "800", color: colors.muted, fontSize: 12, textTransform: "uppercase" },
  td: { color: colors.text, fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(2,6,23,0.45)", justifyContent: "center", padding: 16 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 12 },
});
