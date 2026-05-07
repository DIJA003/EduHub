/**
 * RoleScreens.js — full feature parity with web
 * Covers: StudentHome, AcademicYears (with CoursePlayer), StudentDashboard,
 *         Profile, DataScienceCourses, all Admin + Mentor screens.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api, endpoints } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg: "#F8FAFC", white: "#FFFFFF", border: "#E2E8F0", borderLight: "#F1F5F9",
  blue: "#2563EB", blueBg: "#EFF6FF", blueBorder: "#BFDBFE",
  emerald: "#059669", emeraldBg: "#ECFDF5", emeraldBorder: "#A7F3D0",
  amber: "#D97706", amberBg: "#FFFBEB",
  rose: "#DC2626", roseBg: "#FEF2F2",
  slate900: "#0F172A", slate700: "#334155", slate600: "#475569",
  slate500: "#64748B", slate400: "#94A3B8", slate300: "#CBD5E1",
  slate200: "#E2E8F0", slate100: "#F1F5F9", slate50: "#F8FAFC",
  dark900: "#0F172A", dark800: "#1E293B", dark700: "#334155",
};

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────
function Screen({ children }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 48, gap: 12 }}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

function Card({ children, style, bg }) {
  return <View style={[s.card, bg ? { backgroundColor: bg } : {}, style]}>{children}</View>;
}

function SectionLabel({ children }) {
  return <Text style={{ fontSize: 10, fontWeight: "700", color: C.slate500, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{children}</Text>;
}

function Tag({ label, color = C.blue, bg = C.blueBg }) {
  return (
    <View style={{ alignSelf: "flex-start", backgroundColor: bg, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={{ fontSize: 10, fontWeight: "700", color }}>{label}</Text>
    </View>
  );
}

function Pill({ label, value, color = C.blue }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: "800", color }}>{String(value)}</Text>
      <Text style={{ fontSize: 10, color: C.slate500, marginTop: 2, textAlign: "center" }}>{label}</Text>
    </View>
  );
}

function ProgressBar({ value, height = 6 }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  return (
    <View style={{ height, backgroundColor: C.slate200, borderRadius: 99, overflow: "hidden" }}>
      <View style={{ height, width: `${pct}%`, backgroundColor: pct >= 100 ? C.emerald : C.blue, borderRadius: 99 }} />
    </View>
  );
}

function Avatar({ name, size = 44, bg = C.blue }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.38 }}>{(name || "?")[0].toUpperCase()}</Text>
    </View>
  );
}

function Btn({ label, onPress, variant = "primary", small, disabled }) {
  const bg = variant === "primary" ? C.blue : variant === "danger" ? C.rose : variant === "ghost" ? "transparent" : C.white;
  const tc = variant === "ghost" ? C.blue : variant === "outline" ? C.slate700 : "#fff";
  const border = variant === "outline" ? { borderWidth: 1, borderColor: C.slate200 } : {};
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}
      style={[{ backgroundColor: bg, borderRadius: 99, paddingHorizontal: small ? 12 : 16, paddingVertical: small ? 7 : 10, alignItems: "center" }, border, disabled && { opacity: 0.5 }]}>
      <Text style={{ color: tc, fontWeight: "700", fontSize: small ? 12 : 13 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function Field({ label, value, onChangeText, placeholder, secure, multiline, editable = true }) {
  return (
    <View style={{ gap: 4 }}>
      {label ? <Text style={{ fontSize: 12, fontWeight: "600", color: C.slate600 }}>{label}</Text> : null}
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor={C.slate400} secureTextEntry={secure} multiline={multiline}
        editable={editable} autoCapitalize="none"
        style={[s.input, multiline && { height: 80, textAlignVertical: "top" }, !editable && { backgroundColor: C.slate50, color: C.slate500 }]} />
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: C.borderLight, marginVertical: 4 }} />;
}

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <Card bg="#FEF2F2" style={{ borderColor: "#FECACA" }}>
      <Text style={{ color: C.rose, fontWeight: "600", fontSize: 13 }}>⚠️ {message}</Text>
    </Card>
  );
}

function EmptyState({ icon = "📭", title, subtitle }) {
  return (
    <Card>
      <View style={{ alignItems: "center", paddingVertical: 20 }}>
        <Text style={{ fontSize: 32, marginBottom: 8 }}>{icon}</Text>
        <Text style={{ fontWeight: "700", color: C.slate700, fontSize: 15, textAlign: "center" }}>{title}</Text>
        {subtitle ? <Text style={{ color: C.slate500, fontSize: 13, marginTop: 4, textAlign: "center" }}>{subtitle}</Text> : null}
      </View>
    </Card>
  );
}

function ConfirmModal({ visible, title, message, confirmLabel = "Confirm", onConfirm, onCancel, danger }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={s.modalOverlay} onPress={onCancel}>
        <Pressable style={s.modalCard}>
          <Text style={{ fontWeight: "800", fontSize: 16, color: C.slate900 }}>{title}</Text>
          {message ? <Text style={{ color: C.slate600, fontSize: 13, marginTop: 4 }}>{message}</Text> : null}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <View style={{ flex: 1 }}><Btn label="Cancel" variant="outline" onPress={onCancel} /></View>
            <View style={{ flex: 1 }}><Btn label={confirmLabel} variant={danger ? "danger" : "primary"} onPress={onConfirm} /></View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// Admin CRUD screen
function CrudScreen({ title, load, columns }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const fields = columns.filter((c) => !["id", "_id", "createdAt", "updatedAt"].includes(c));
  useEffect(() => { load.getAll().then((d) => setRows(safeArray(d))).catch((e) => setError(e.message)); }, []);
  return (
    <Screen>
      <Text style={s.pageTitle}>{title}</Text>
      <ErrorBox message={error} />
      {rows.length === 0 ? <EmptyState icon="📋" title="No records yet" /> : rows.slice(0, 30).map((row, i) => (
        <Card key={row._id || i}>
          {fields.slice(0, 4).map((f) => (
            <View key={f} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
              <Text style={{ fontSize: 11, color: C.slate500, fontWeight: "600", textTransform: "uppercase" }}>{f}</Text>
              <Text style={{ fontSize: 12, color: C.slate700, fontWeight: "500", flexShrink: 1, textAlign: "right", maxWidth: "60%" }}>{String(row[f] ?? "—")}</Text>
            </View>
          ))}
        </Card>
      ))}
    </Screen>
  );
}

function safeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// AsyncStorage helpers (replaces localStorage)
// ─────────────────────────────────────────────────────────────────────────────
async function storeJson(key, value) {
  try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {}
}
async function loadJson(key) {
  try { const v = await AsyncStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC HOME
// ─────────────────────────────────────────────────────────────────────────────
export function PublicHomeScreen({ navigation }) {
  return (
    <Screen>
      <Card>
        <Image source={{ uri: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800" }}
          style={{ width: "100%", height: 180, borderRadius: 12, marginBottom: 14 }} resizeMode="cover" />
        <Tag label="CONNECTING MINDS" />
        <Text style={[s.pageTitle, { marginTop: 8 }]}>Empowering Students{"\n"}& Mentors</Text>
        <Text style={{ color: C.slate600, fontSize: 14, lineHeight: 20, marginTop: 4 }}>
          A unified platform for collaboration and academic growth.
        </Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          <View style={{ flex: 1 }}><Btn label="Login" onPress={() => navigation.navigate("Login")} /></View>
          <View style={{ flex: 1 }}><Btn label="Register" variant="outline" onPress={() => navigation.navigate("Register")} /></View>
        </View>
      </Card>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT HOME
// ─────────────────────────────────────────────────────────────────────────────
export function StudentHomeScreen() {
  const { dbUser } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/enrollments")
      .then((r) => { setEnrollments(safeArray(r)); setError(""); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const firstName  = dbUser?.name?.split(" ")[0] || "Student";
  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100);
  const completed  = enrollments.filter((e) => e.progress >= 100);
  const totalCredits = completed.reduce((s, c) => s + (c.credits || 0), 0);

  return (
    <Screen>
      <Card bg={C.blueBg} style={{ borderColor: C.blueBorder }}>
        <Tag label="WELCOME BACK" />
        <Text style={[s.pageTitle, { marginTop: 6 }]}>Hello, {firstName}! 👋</Text>
        <Text style={{ color: C.slate600, fontSize: 13, marginTop: 4 }}>
          {dbUser?.college && dbUser.college !== "—" ? dbUser.college + " • " : ""}
          <Text style={{ fontWeight: "700", color: C.blue, textTransform: "capitalize" }}>{dbUser?.role || "Student"}</Text>
        </Text>
        <Divider />
        <View style={{ flexDirection: "row", marginTop: 4 }}>
          <Pill label="Enrolled"     value={enrollments.length}  color={C.blue}    />
          <Pill label="In Progress"  value={inProgress.length}   color={C.amber}   />
          <Pill label="Completed"    value={completed.length}    color={C.emerald} />
          <Pill label="Credits"      value={totalCredits}        color={C.blue}    />
        </View>
      </Card>

      <ErrorBox message={error} />

      {loading ? (
        <Card><Text style={{ color: C.slate500, textAlign: "center" }}>Loading…</Text></Card>
      ) : (
        <>
          {inProgress.length > 0 && (
            <Card>
              <SectionLabel>Continue Learning</SectionLabel>
              {inProgress.slice(0, 3).map((course, i) => (
                <View key={course.courseId || i} style={{ marginTop: i > 0 ? 12 : 4 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={{ fontWeight: "700", color: C.slate900, flex: 1, marginRight: 8, fontSize: 14 }} numberOfLines={1}>{course.name}</Text>
                    <Text style={{ fontWeight: "700", color: C.blue, fontSize: 12 }}>{course.progress}%</Text>
                  </View>
                  <ProgressBar value={course.progress} />
                  <Text style={{ fontSize: 11, color: C.slate500, marginTop: 3 }}>Next: {course.nextItem}</Text>
                </View>
              ))}
            </Card>
          )}

          {completed.length > 0 && (
            <Card>
              <SectionLabel>Completed Courses</SectionLabel>
              {completed.slice(0, 4).map((e, i) => (
                <View key={e.courseId || i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: i > 0 ? 8 : 4 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", color: C.slate900, fontSize: 13 }} numberOfLines={1}>{e.name}</Text>
                    <Text style={{ fontSize: 11, color: C.slate500 }}>{e.code} · {e.credits || 0} credits</Text>
                  </View>
                  <Tag label="✓ Done" color={C.emerald} bg={C.emeraldBg} />
                </View>
              ))}
            </Card>
          )}

          {enrollments.length === 0 && (
            <EmptyState icon="📚" title="No courses yet" subtitle="Go to Academic Years tab to enroll." />
          )}
        </>
      )}
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSE PLAYER (full section navigation + upload + progress tracking)
// ─────────────────────────────────────────────────────────────────────────────
function CoursePlayerScreen({ course, yearId, onBack }) {
  const { user } = useAuth();
  const [sections,       setSections]       = useState([]);
  const [sectionsLoading,setSectionsLoading] = useState(true);
  const [viewIndex,      setViewIndex]      = useState(0);
  const [started,        setStarted]        = useState(false);
  const [mode,           setMode]           = useState("study"); // "study" | "upload"
  const [selectedSecIdx, setSelectedSecIdx] = useState(0);

  // Materials (local + synced with backend)
  const [myMaterials,    setMyMaterials]    = useState([]);
  const [uploadLoading,  setUploadLoading]  = useState(false);

  // Confirm unenroll dialog
  const [confirmUnenroll, setConfirmUnenroll] = useState(false);

  const mongoId      = course.mongoId || course.courseId || course.id;
  const progress     = course.progress     || 0;
  const secDone      = course.sectionsCompleted ?? Math.round((progress / 100) * Math.max(sections.length, 1));
  const courseComplete = progress >= 100;
  const isStarted    = started || progress > 0;
  const n            = sections.length;

  // Fetch real sections from backend
  useEffect(() => {
    if (!mongoId) return;
    setSectionsLoading(true);
    api.get(`/sections/course/${mongoId}`)
      .then((r) => {
        const raw = safeArray(r?.data ?? r);
        setSections(raw.map((s) => ({ id: s._id, title: s.title, summary: s.summary || "", body: s.body || "" })));
      })
      .catch(() => setSections([]))
      .finally(() => setSectionsLoading(false));
  }, [mongoId]);

  // Keep viewIndex in bounds
  useEffect(() => {
    if (!n) return;
    const cap = courseComplete ? n - 1 : Math.max(0, Math.min(secDone, n - 1));
    setViewIndex((v) => Math.min(v, cap));
  }, [n, secDone, courseComplete]);

  // Load existing student materials for this course
  useEffect(() => {
    api.get("/users/materials")
      .then((r) => {
        const all = safeArray(r?.data ?? r);
        setMyMaterials(all.filter((m) => String(m.courseId) === String(mongoId) || String(m.courseRef) === String(mongoId)));
      })
      .catch(() => {});
  }, [mongoId]);

  const isSectionReadable = (idx) => {
    if (!isStarted && !courseComplete) return false;
    if (courseComplete) return true;
    return idx <= secDone;
  };

  const handleNext = async () => {
    if (!n) return;
    const nextDone    = Math.min(n, secDone + 1);
    const newProgress = Math.min(100, Math.round((nextDone / n) * 100));
    const done        = nextDone >= n;
    const nextLabel   = done ? "Course complete" : sections[nextDone]?.title ?? "Next section";
    try {
      await api.patch(`/users/enrollments/${mongoId}/progress`, {
        progress: newProgress, nextItem: nextLabel, sectionsCompleted: nextDone,
      });
    } catch {}
    if (!done) setViewIndex(Math.min(nextDone, n - 1));
    else       setViewIndex(n - 1);
    // Reload enrollments so parent reflects new progress
    onBack({ refresh: true });
  };

  const handlePrev = () => setViewIndex((i) => Math.max(0, i - 1));

  const showNext = isStarted && !courseComplete && mode === "study" && viewIndex === secDone && secDone < n;

  // Upload a material (text-based, no real file picker needed — just registers)
  const handleUploadMaterial = async () => {
    const sec = sections[selectedSecIdx];
    if (!sec) return;
    setUploadLoading(true);
    try {
      const res = await api.post("/users/materials", {
        title:        `Material for ${sec.title}`,
        course:       course.name,
        type:         "Other",
        courseId:     mongoId,
        yearId:       yearId,
        sectionId:    sec.id,
        sectionLabel: sec.title,
      });
      const m = res?.data || res;
      setMyMaterials((prev) => [{ id: m._id, title: m.title, courseId: mongoId, sectionLabel: sec.title, status: m.status || "pending", createdAt: m.createdAt }, ...prev]);
      Alert.alert("Uploaded!", "Material sent to mentor for review.");
    } catch (e) {
      Alert.alert("Upload failed", e.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRemoveMaterial = async (id) => {
    try {
      await api.delete(`/users/materials/${id}`);
      setMyMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      Alert.alert("Failed", e.message);
    }
  };

  const handleUnenroll = async () => {
    try {
      await api.delete(`/users/enrollments/${mongoId}`);
      onBack({ refresh: true, unenrolled: course.courseId || course.id });
    } catch (e) {
      Alert.alert("Failed", e.message);
    }
  };

  const currentSection = sections[viewIndex];
  const sectionMaterials = myMaterials.filter((m) => m.sectionLabel === sections[selectedSecIdx]?.title);
  const STATUS_COLOR = { pending: C.amber, approved: C.emerald, rejected: C.rose };
  const STATUS_LABEL = { pending: "⏳ Pending", approved: "✅ Approved", rejected: "❌ Rejected" };

  return (
    <Screen>
      <ConfirmModal visible={confirmUnenroll} title="Unenroll?" danger
        message={`Remove enrollment from "${course.name}"? You can re-enroll later.`}
        confirmLabel="Unenroll" onConfirm={handleUnenroll} onCancel={() => setConfirmUnenroll(false)} />

      {/* Header */}
      <Card>
        <TouchableOpacity onPress={() => onBack({})} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 }}>
          <Text style={{ color: C.blue, fontWeight: "600", fontSize: 13 }}>← Back to year</Text>
        </TouchableOpacity>
        <SectionLabel>Year {yearId} / {course.code}</SectionLabel>
        <Text style={s.pageTitle}>{course.name}</Text>
        {course.instructor ? <Text style={{ fontSize: 12, color: C.slate500 }}>Instructor: {course.instructor}</Text> : null}
        <Divider />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 11, color: C.slate500 }}>Progress</Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: C.slate900 }}>{progress}%</Text>
          </View>
          <View style={{ flex: 1, marginHorizontal: 14 }}>
            <ProgressBar value={progress} height={8} />
            <Text style={{ fontSize: 10, color: C.slate500, marginTop: 3 }}>Next: {course.nextItem || "Getting Started"}</Text>
          </View>
          <Btn label="Unenroll" variant="outline" small onPress={() => setConfirmUnenroll(true)} />
        </View>

        {/* Study / Upload toggle */}
        <View style={{ flexDirection: "row", borderWidth: 1, borderColor: C.border, borderRadius: 99, overflow: "hidden", alignSelf: "flex-start", marginTop: 8 }}>
          {["study", "upload"].map((m) => (
            <TouchableOpacity key={m} onPress={() => setMode(m)}
              style={{ paddingHorizontal: 16, paddingVertical: 7, backgroundColor: mode === m ? C.blue : "transparent" }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: mode === m ? "#fff" : C.slate500, textTransform: "capitalize" }}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Sections list */}
      <Card>
        <SectionLabel>{sectionsLoading ? "Loading sections…" : `Sections (${n})`}</SectionLabel>
        {sectionsLoading ? (
          <Text style={{ color: C.slate400 }}>Loading…</Text>
        ) : n === 0 ? (
          <Text style={{ color: C.slate500, fontSize: 13 }}>No sections available yet.</Text>
        ) : (
          sections.map((sec, idx) => {
            const done     = courseComplete || idx < secDone;
            const readable = isSectionReadable(idx);
            const active   = mode === "upload" ? selectedSecIdx === idx : viewIndex === idx;
            return (
              <TouchableOpacity key={sec.id}
                onPress={() => { if (mode === "upload") { setSelectedSecIdx(idx); } else if (readable) { setViewIndex(idx); } }}
                disabled={mode === "study" && !readable}
                style={[{ flexDirection: "row", gap: 10, padding: 10, borderRadius: 12, marginBottom: 4, borderWidth: 1 },
                  active ? { backgroundColor: C.blueBg, borderColor: "#93C5FD" } :
                  { backgroundColor: C.slate50, borderColor: "transparent" },
                  !readable && mode === "study" ? { opacity: 0.4 } : {}]}>
                <Text style={{ fontSize: 14, color: done ? C.emerald : active ? C.blue : C.slate400, fontWeight: "700", width: 20 }}>
                  {done ? "✓" : `${idx + 1}.`}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", color: C.slate900, fontSize: 13 }}>{sec.title}</Text>
                  {sec.summary ? <Text style={{ fontSize: 11, color: C.slate500, marginTop: 2 }}>{sec.summary}</Text> : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </Card>

      {/* Study mode — section content */}
      {mode === "study" && (
        <Card>
          {sectionsLoading ? (
            <Text style={{ color: C.slate400, textAlign: "center" }}>Loading sections…</Text>
          ) : n === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <Text style={{ color: C.slate500 }}>No sections for this course yet.</Text>
            </View>
          ) : !isStarted && !courseComplete ? (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Text style={{ color: C.slate600, textAlign: "center", fontSize: 14 }}>
                This course has {n} section{n !== 1 ? "s" : ""}. When ready, start with the first section.
              </Text>
              <View style={{ marginTop: 16 }}>
                <Btn label="Start" onPress={() => { setStarted(true); setViewIndex(0); }} />
              </View>
            </View>
          ) : (
            <>
              {courseComplete && (
                <Card bg={C.emeraldBg} style={{ borderColor: C.emeraldBorder, marginBottom: 8 }}>
                  <Text style={{ color: "#065F46", fontWeight: "700" }}>🎉 Course complete — review any section below.</Text>
                </Card>
              )}
              {!courseComplete && viewIndex < secDone && secDone > 0 && (
                <Card bg={C.slate50} style={{ marginBottom: 8 }}>
                  <Text style={{ color: C.slate600, fontSize: 13 }}>Review mode — browsing a section you already finished.</Text>
                </Card>
              )}
              <SectionLabel>Section {viewIndex + 1} of {n}</SectionLabel>
              <Text style={{ fontWeight: "700", fontSize: 17, color: C.slate900 }}>{currentSection?.title}</Text>
              {currentSection?.summary ? <Text style={{ fontSize: 13, color: C.slate500, marginTop: 2 }}>{currentSection.summary}</Text> : null}
              <View style={{ backgroundColor: C.slate50, borderRadius: 12, padding: 14, marginTop: 10 }}>
                <Text style={{ fontSize: 14, color: C.slate700, lineHeight: 22 }}>{currentSection?.body}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
                <Btn label="← Previous" variant="outline" small disabled={viewIndex <= 0} onPress={handlePrev} />
                {showNext && (
                  <Btn label={secDone >= n - 1 ? "Finish course" : "Next →"} small onPress={handleNext} />
                )}
              </View>
            </>
          )}
        </Card>
      )}

      {/* Upload mode */}
      {mode === "upload" && (
        <Card>
          <SectionLabel>Upload material</SectionLabel>
          <Text style={{ fontSize: 13, color: C.slate600 }}>
            Section: <Text style={{ fontWeight: "700", color: C.slate900 }}>{sections[selectedSecIdx]?.title || "—"}</Text>
          </Text>
          <View style={{ marginTop: 10 }}>
            <Btn label={uploadLoading ? "Uploading…" : "📎 Upload for this section"} disabled={uploadLoading || !sections[selectedSecIdx]}
              onPress={handleUploadMaterial} />
          </View>

          {sectionMaterials.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <SectionLabel>Files in this section</SectionLabel>
              {sectionMaterials.map((m, i) => (
                <View key={m.id || i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderColor: C.borderLight }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: C.slate900, fontWeight: "600" }}>{m.title}</Text>
                    <Text style={{ fontSize: 11, color: STATUS_COLOR[m.status] || C.slate400, marginTop: 2 }}>
                      {STATUS_LABEL[m.status] || m.status}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveMaterial(m.id)}>
                    <Text style={{ fontSize: 12, color: C.rose, fontWeight: "600" }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {myMaterials.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <SectionLabel>All materials in this course</SectionLabel>
              {myMaterials.map((m, i) => (
                <View key={m.id || i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderColor: C.borderLight }}>
                  <Text style={{ fontSize: 12, color: C.slate700, flex: 1 }} numberOfLines={1}>{m.title}</Text>
                  <Text style={{ fontSize: 11, color: C.slate400, marginLeft: 8 }}>{m.sectionLabel || "General"}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      )}
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMIC YEARS
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// LOCKING LOGIC — mirrors web CourseContext exactly
// Year 1: always unlocked
// Year 2: requires 39+ total earned credits
// Year 3: requires 78+ total earned credits
// Year 4: requires 117+ total earned credits
// ─────────────────────────────────────────────────────────────────────────────
const UNLOCK_THRESHOLDS = { 1: 0, 2: 39, 3: 78, 4: 117 };

const YEAR_META = {
  1: { title: "Year One — Foundations",             desc: "Foundational concepts: computing, mathematics, and logic." },
  2: { title: "Year Two — Core Specializations",    desc: "Core engineering principles and advanced programming foundations." },
  3: { title: "Year Three — Advanced Applications", desc: "Advanced applications: software engineering, cloud, and AI." },
  4: { title: "Year Four — Research & Thesis",      desc: "Capstone, research, and industry placement." },
};

function computeYearStatus(enrolled) {
  if (!enrolled?.length) return "Not Started";
  const allDone = enrolled.every((c) => c.progress >= 100);
  if (allDone) return "Completed";
  return "In Progress";
}

function computeEarnedCredits(enrolled) {
  return (enrolled || []).reduce((s, c) => s + (c.progress >= 100 ? c.credits || 0 : 0), 0);
}

function buildYearsState(dbYears, coursesPerYear, enrollments) {
  // Build in order 1→4 so threshold checks use already-built years
  const yearIds = ["1", "2", "3", "4"];
  const result  = {};

  for (const yid of yearIds) {
    const ynum   = Number(yid);
    const dbYear = dbYears.find((y) => String(y.year) === yid);
    const title  = dbYear?.name || YEAR_META[ynum]?.title || `Year ${ynum}`;

    const yearEnrollments = enrollments.filter((e) => String(e.yearId || "1") === yid);
    const enrolled = yearEnrollments.map((e) => ({
      id: e.id, name: e.name || "Course", code: e.code || "",
      credits: e.credits || 3, progress: e.progress || 0,
      sectionsCompleted: e.sectionsCompleted || 0,
      nextItem: e.nextItem || "Getting Started",
      mongoId: e.courseId, instructor: e.instructor || "",
      yearId: yid,
    }));

    const enrolledMongoIds = new Set(enrolled.map((c) => String(c.mongoId)));
    const available = (coursesPerYear[yid] || [])
      .filter((c) => !enrolledMongoIds.has(String(c._id)))
      .map((c) => ({
        id: String(c._id), name: c.title, code: c.code,
        credits: c.creditHours || 3, type: "Core", length: "16 weeks",
        instructor: c.instructor || "TBA", mongoId: String(c._id), yearId: yid,
      }));

    const earnedCredits = computeEarnedCredits(enrolled);

    // Total earned ACROSS all built years so far + this year
    const totalEarnedSoFar = Object.values(result).reduce(
      (sum, y) => sum + (y.earnedCredits ?? 0), 0
    ) + earnedCredits;

    const threshold = UNLOCK_THRESHOLDS[ynum] ?? 0;
    // Unlock if: Year 1 always, OR already has enrollments, OR meets credit threshold
    const unlocked = ynum === 1 || enrolled.length > 0 || totalEarnedSoFar >= threshold;
    const status   = unlocked ? computeYearStatus(enrolled) : "Locked";

    result[yid] = {
      title, desc: YEAR_META[ynum]?.desc || "",
      status, unlocked, earnedCredits,
      totalCredits: dbYear?.totalCredits || 42,
      enrolled, available,
    };
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMIC YEARS SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export function AcademicYearsScreen() {
  const [years,         setYears]          = useState({});
  const [dbYears,       setDbYears]        = useState([]);
  const [coursesPerYear,setCoursesPerYear] = useState({});
  const [enrollments,   setEnrollments]    = useState([]);
  const [selectedYear,  setSelectedYear]   = useState(null);
  const [playerCourse,  setPlayerCourse]   = useState(null);
  const [loadingInit,   setLoadingInit]    = useState(true);
  const [loadingCourses,setLoadingCourses] = useState(false);
  const [error,         setError]          = useState("");
  const [confirmUnenroll, setConfirmUnenroll] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [yrRes, enrRes, c1, c2, c3, c4] = await Promise.all([
        api.get("/academic-years"),
        api.get("/users/enrollments"),
        api.get("/courses/year/1"),
        api.get("/courses/year/2"),
        api.get("/courses/year/3"),
        api.get("/courses/year/4"),
      ]);
      const dby  = safeArray(yrRes);
      const enrs = safeArray(enrRes);
      const cpy  = { "1": safeArray(c1), "2": safeArray(c2), "3": safeArray(c3), "4": safeArray(c4) };

      setDbYears(dby);
      setEnrollments(enrs);
      setCoursesPerYear(cpy);
      setYears(buildYearsState(dby, cpy, enrs));
      setError("");
    } catch (e) { setError(e.message); }
    finally { setLoadingInit(false); }
  }, []);

  useEffect(() => { loadData(); }, []);

  const totalEarned = Object.values(years).reduce((s, y) => s + (y.earnedCredits ?? 0), 0);

  const handleEnroll = async (course, yearId) => {
    try {
      await api.post(`/users/enrollments/${course.mongoId || course._id || course.id}`);
      const enrRes = await api.get("/users/enrollments");
      const enrs   = safeArray(enrRes);
      setEnrollments(enrs);
      setYears(buildYearsState(dbYears, coursesPerYear, enrs));
      Alert.alert("Enrolled!", `You joined ${course.name || course.title}`);
    } catch (e) { Alert.alert("Failed", e.message); }
  };

  const handleUnenroll = async () => {
    if (!confirmUnenroll) return;
    try {
      await api.delete(`/users/enrollments/${confirmUnenroll.mongoId || confirmUnenroll.courseId}`);
      const enrRes = await api.get("/users/enrollments");
      const enrs   = safeArray(enrRes);
      setEnrollments(enrs);
      setYears(buildYearsState(dbYears, coursesPerYear, enrs));
      setConfirmUnenroll(null);
      if (selectedYear) {
        // refresh year detail
      }
    } catch (e) { Alert.alert("Failed", e.message); }
  };

  // CoursePlayer open
  if (playerCourse) {
    const enr = enrollments.find((e) => String(e.courseId) === String(playerCourse.mongoId));
    return (
      <CoursePlayerScreen
        course={{ ...playerCourse, progress: enr?.progress || 0, sectionsCompleted: enr?.sectionsCompleted || 0, nextItem: enr?.nextItem || "Getting Started" }}
        yearId={playerCourse.yearId}
        onBack={async ({ refresh, unenrolled }) => {
          if (refresh || unenrolled) await loadData();
          setPlayerCourse(null);
        }}
      />
    );
  }

  // Year detail view
  if (selectedYear) {
    const yid  = String(selectedYear);
    const year = years[yid];
    if (!year) return null;

    const allDone = year.enrolled.length > 0 && year.enrolled.every((c) => c.progress >= 100);

    return (
      <Screen>
        <ConfirmModal visible={Boolean(confirmUnenroll)} title="Unenroll?" danger
          message={confirmUnenroll ? `Remove "${confirmUnenroll.name}" from your enrollments?` : ""}
          confirmLabel="Unenroll" onConfirm={handleUnenroll} onCancel={() => setConfirmUnenroll(null)} />

        <TouchableOpacity onPress={() => setSelectedYear(null)} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={{ color: C.blue, fontWeight: "600", fontSize: 13 }}>← Back to Years</Text>
        </TouchableOpacity>

        {/* Year header */}
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <SectionLabel>Year {yid}</SectionLabel>
              <Text style={s.pageTitle}>{year.title}</Text>
              <Text style={{ fontSize: 13, color: C.slate600, marginTop: 4, lineHeight: 18 }}>{year.desc}</Text>
            </View>
            <Tag
              label={year.status}
              color={year.status === "Completed" ? C.emerald : year.status === "In Progress" ? C.amber : year.status === "Locked" ? C.slate400 : C.blue}
              bg={year.status === "Completed" ? C.emeraldBg : year.status === "In Progress" ? C.amberBg : year.status === "Locked" ? C.slate100 : C.blueBg}
            />
          </View>
          <Divider />
          <Text style={{ fontSize: 13, color: C.slate500 }}>
            Credits earned: <Text style={{ fontWeight: "700", color: C.slate900 }}>{year.earnedCredits}</Text>
            {" / "}{year.totalCredits}
          </Text>
        </Card>

        {/* Locked banner */}
        {!year.unlocked && (
          <Card bg="#FFFBEB" style={{ borderColor: "#FCD34D" }}>
            <Text style={{ fontSize: 22, marginBottom: 4 }}>🔒</Text>
            <Text style={{ fontWeight: "800", color: "#92400E", fontSize: 14 }}>Year {yid} is locked</Text>
            <Text style={{ color: "#B45309", fontSize: 13, marginTop: 4 }}>
              Earn {UNLOCK_THRESHOLDS[Number(yid)] - totalEarned} more credits across your enrolled courses to unlock this year.
            </Text>
          </Card>
        )}

        {/* Completed banner */}
        {allDone && year.unlocked && (
          <Card bg={C.emeraldBg} style={{ borderColor: C.emeraldBorder }}>
            <Text style={{ fontSize: 22, marginBottom: 6 }}>🎉</Text>
            <Text style={{ fontWeight: "800", color: "#065F46", fontSize: 15 }}>Year {yid} Complete!</Text>
            <Text style={{ color: "#047857", fontSize: 13, marginTop: 4 }}>
              You earned {year.earnedCredits} credits. You can revisit any course to review sections.
            </Text>
          </Card>
        )}

        {/* Enrolled courses */}
        {year.enrolled.length > 0 && (
          <>
            <SectionLabel>Your Courses</SectionLabel>
            {year.enrolled.map((e, i) => {
              const passed = e.progress >= 100;
              return (
                <Card key={e.id || i} style={passed ? { borderColor: C.emeraldBorder } : {}}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 14 }}>{e.name}</Text>
                      <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>{e.code} · {e.credits} credits</Text>
                      {e.instructor ? <Text style={{ fontSize: 11, color: C.slate400 }}>Instructor: {e.instructor}</Text> : null}
                    </View>
                    {passed ? <Tag label="Passed ✓" color={C.emerald} bg={C.emeraldBg} /> :
                      <Text style={{ fontWeight: "700", color: C.blue, fontSize: 13 }}>{e.progress}%</Text>}
                  </View>
                  <ProgressBar value={e.progress} height={6} />
                  <Text style={{ fontSize: 11, color: C.slate500, marginTop: 4 }}>
                    {passed ? "Completed — open to review sections" : `Next: ${e.nextItem}`}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Btn label="Open course" small onPress={() => setPlayerCourse({
                        id: e.id, courseId: e.id, mongoId: e.mongoId,
                        name: e.name, code: e.code, credits: e.credits,
                        instructor: e.instructor || "TBA",
                        progress: e.progress, sectionsCompleted: e.sectionsCompleted || 0,
                        nextItem: e.nextItem, yearId: yid,
                      })} />
                    </View>
                    {!passed && (
                      <View style={{ flex: 1 }}>
                        <Btn label="Unenroll" variant="outline" small
                          onPress={() => setConfirmUnenroll({ mongoId: e.mongoId, courseId: e.id, name: e.name })} />
                      </View>
                    )}
                  </View>
                </Card>
              );
            })}
          </>
        )}

        {/* Available to enroll — only show if unlocked */}
        {year.unlocked && (
          <>
            <SectionLabel>Available to Enroll</SectionLabel>
            {loadingCourses ? (
              <Card><Text style={{ color: C.slate500 }}>Loading…</Text></Card>
            ) : year.available.length === 0 ? (
              <Card bg={C.slate50}>
                <Text style={{ color: C.slate500, fontSize: 13 }}>
                  {year.enrolled.length > 0 ? "You are enrolled in all available courses." : "No courses published yet."}
                </Text>
              </Card>
            ) : (
              year.available.map((c) => (
                <Card key={c.id}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 14 }}>{c.name}</Text>
                      <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>{c.code} · {c.credits} cr · {c.instructor}</Text>
                    </View>
                    <Btn label="Enroll" small onPress={() => handleEnroll(c, yid)} />
                  </View>
                </Card>
              ))
            )}
          </>
        )}
      </Screen>
    );
  }

  // Year list
  return (
    <Screen>
      <Text style={s.pageTitle}>Academic Years</Text>
      <ErrorBox message={error} />

      {/* Degree progress */}
      <Card bg={C.blueBg} style={{ borderColor: C.blueBorder }}>
        <SectionLabel>Degree Progress</SectionLabel>
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <Pill label="Credits Earned" value={totalEarned} color={C.blue} />
          <Pill label="Completed" value={enrollments.filter((e) => e.progress >= 100).length} color={C.emerald} />
        </View>
        <ProgressBar value={Math.round((totalEarned / 168) * 100)} height={8} />
        <Text style={{ fontSize: 11, color: C.slate500, marginTop: 4 }}>
          {Math.round((totalEarned / 168) * 100)}% of degree completed (168 total credits)
        </Text>
      </Card>

      {loadingInit ? (
        <Card><Text style={{ color: C.slate500 }}>Loading…</Text></Card>
      ) : (
        ["1", "2", "3", "4"].map((yid) => {
          const year = years[yid];
          if (!year) return null;
          const ynum = Number(yid);
          const nextThreshold = UNLOCK_THRESHOLDS[ynum];
          const creditsNeeded = year.unlocked ? 0 : Math.max(0, nextThreshold - totalEarned);

          return (
            <TouchableOpacity key={yid}
              onPress={() => { if (!year.unlocked) { setSelectedYear(yid); return; } setSelectedYear(yid); }}
              activeOpacity={0.85}>
              <Card style={{
                borderWidth: year.status === "Completed" ? 1.5 : 1,
                borderColor: year.status === "Completed" ? C.emeraldBorder
                  : !year.unlocked ? "#FCD34D" : C.border,
                backgroundColor: !year.unlocked ? "#FFFBEB" : C.white,
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center",
                    backgroundColor: !year.unlocked ? "#FEF3C7" : year.status === "Completed" ? C.emeraldBg : C.blueBg }}>
                    <Text style={{ fontWeight: "800", fontSize: 20,
                      color: !year.unlocked ? C.amber : year.status === "Completed" ? C.emerald : C.blue }}>
                      {!year.unlocked ? "🔒" : yid}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 15 }}>{year.title}</Text>
                    <Text style={{ fontSize: 12, color: C.slate600, marginTop: 2 }} numberOfLines={2}>{year.desc}</Text>
                  </View>
                </View>
                <Divider />
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4,
                      backgroundColor: year.status === "Completed" ? C.emerald
                        : year.status === "In Progress" ? C.amber
                        : !year.unlocked ? "#FCD34D" : C.slate300 }} />
                    <Text style={{ fontSize: 12, fontWeight: "700",
                      color: year.status === "Completed" ? C.emerald
                        : year.status === "In Progress" ? C.amber
                        : !year.unlocked ? C.amber : C.slate500 }}>
                      {year.status}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: C.slate500 }}>
                    {!year.unlocked
                      ? `${creditsNeeded} more credits to unlock`
                      : `${year.earnedCredits} credits earned →`}
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })
      )}
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT DASHBOARD — with full activity backlog
// ─────────────────────────────────────────────────────────────────────────────
const DASH_TABS = [
  { id: "dashboard",  label: "Overview"  },
  { id: "courses",    label: "Courses"   },
  { id: "upload",     label: "Upload"    },
  { id: "materials",  label: "Materials" },
];

const ACTIVITY_STORAGE_KEY = "eduhub-mobile-activity-v2";

function addActivity(setLog, entry) {
  setLog((prev) => {
    const next = [{ id: Date.now() + Math.random(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), ...entry }, ...prev].slice(0, 100);
    storeJson(ACTIVITY_STORAGE_KEY, next);
    return next;
  });
}

export function StudentDashboardScreen() {
  const { dbUser } = useAuth();
  const [dbYears,      setDbYears]      = useState([]);
  const [coursesPerYear,setCoursesPerYear] = useState({});
  const [enrollments,  setEnrollments]  = useState([]);
  const [myMaterials,  setMyMaterials]  = useState([]);
  const [years,        setYears]        = useState({});
  const [activeTab,    setActiveTab]    = useState("dashboard");
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [activityLog,  setActivityLog]  = useState([]);
  const [confirmUnenroll, setConfirmUnenroll] = useState(null);

  const prevEnrolled  = useRef([]);
  const prevMaterials = useRef([]);
  const isMounted     = useRef(false);

  // Load persisted activity log on mount
  useEffect(() => {
    loadJson(ACTIVITY_STORAGE_KEY).then((v) => { if (v) setActivityLog(v); });
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const [yrRes, enrRes, matRes, c1, c2, c3, c4] = await Promise.all([
        api.get("/academic-years"),
        api.get("/users/enrollments"),
        api.get("/users/materials"),
        api.get("/courses/year/1"),
        api.get("/courses/year/2"),
        api.get("/courses/year/3"),
        api.get("/courses/year/4"),
      ]);
      const dby  = safeArray(yrRes);
      const enrs = safeArray(enrRes);
      const cpy  = { "1": safeArray(c1), "2": safeArray(c2), "3": safeArray(c3), "4": safeArray(c4) };
      setDbYears(dby);
      setEnrollments(enrs);
      setCoursesPerYear(cpy);
      setMyMaterials(safeArray(matRes));
      setYears(buildYearsState(dby, cpy, enrs));
      setError("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, []);

  // Track enrollment changes → backlog
  useEffect(() => {
    if (!isMounted.current) { prevEnrolled.current = enrollments; return; }
    const prev = prevEnrolled.current;
    const curr = enrollments;

    curr.forEach((c) => {
      if (!prev.some((p) => p.courseId === c.courseId))
        addActivity(setActivityLog, { icon: "📚", text: `Enrolled in "${c.name}" (Year ${c.yearId})`, color: C.emerald });
    });
    prev.forEach((p) => {
      if (!curr.some((c) => c.courseId === p.courseId))
        addActivity(setActivityLog, { icon: "🗑️", text: `Unenrolled from "${p.name}"`, color: C.rose });
    });
    curr.forEach((c) => {
      const p = prev.find((p) => p.courseId === c.courseId);
      if (p) {
        if (c.progress === 100 && p.progress < 100)
          addActivity(setActivityLog, { icon: "🎉", text: `Completed "${c.name}"! +${c.credits || 0} credits`, color: C.emerald });
        else if (c.nextItem !== p.nextItem && c.progress < 100)
          addActivity(setActivityLog, { icon: "▶️", text: `Progress in "${c.name}" → ${c.nextItem}`, color: C.blue });
      }
    });
    prevEnrolled.current = curr;
  }, [enrollments]);

  // Track material changes → backlog
  useEffect(() => {
    if (!isMounted.current) { prevMaterials.current = myMaterials; isMounted.current = true; return; }
    const prev = prevMaterials.current;
    const curr = myMaterials;

    curr.forEach((m) => {
      if (!prev.some((p) => (p._id || p.id) === (m._id || m.id)))
        addActivity(setActivityLog, { icon: "📎", text: `Uploaded "${m.title}" — awaiting mentor review`, color: C.amber });
      const pm = prev.find((p) => (p._id || p.id) === (m._id || m.id));
      if (pm && m.status !== pm.status) {
        const icon = m.status === "approved" ? "✅" : m.status === "rejected" ? "❌" : "⏳";
        const color = m.status === "approved" ? C.emerald : m.status === "rejected" ? C.rose : C.amber;
        addActivity(setActivityLog, { icon, text: `"${m.title}" was ${m.status} by mentor`, color });
      }
    });
    prevMaterials.current = curr;
  }, [myMaterials]);

  const handleEnroll = async (course) => {
    try {
      await api.post(`/users/enrollments/${course.mongoId || course._id || course.id}`);
      await loadAll();
    } catch (e) { Alert.alert("Failed", e.message); }
  };

  const handleUnenroll = async () => {
    if (!confirmUnenroll) return;
    try {
      await api.delete(`/users/enrollments/${confirmUnenroll.mongoId || confirmUnenroll.courseId}`);
      setConfirmUnenroll(null);
      await loadAll();
    } catch (e) { Alert.alert("Failed", e.message); }
  };

  const handleRemoveMaterial = async (id) => {
    try {
      await api.delete(`/users/materials/${id}`);
      setMyMaterials((prev) => prev.filter((m) => (m._id || m.id) !== id));
    } catch (e) { Alert.alert("Failed", e.message); }
  };

  // Flatten enrolled courses from all years
  const enrolledCourses = Object.values(years).flatMap((y) => y.enrolled || []);
  // Available from unlocked years only
  const availableCourses = Object.entries(years)
    .filter(([, y]) => y.unlocked)
    .flatMap(([, y]) => y.available || []);

  const inProgress   = enrolledCourses.filter((c) => c.progress > 0 && c.progress < 100);
  const completed    = enrolledCourses.filter((c) => c.progress >= 100);
  const totalCredits = completed.reduce((s, c) => s + (c.credits || 0), 0);
  const firstName    = dbUser?.name?.split(" ")[0] || "Student";

  const STATUS_COLOR = { pending: C.amber, approved: C.emerald, rejected: C.rose };
  const STATUS_LABEL = { pending: "⏳ Pending", approved: "✅ Approved", rejected: "❌ Rejected" };

  return (
    <Screen>
      <ConfirmModal visible={Boolean(confirmUnenroll)} title="Unenroll?" danger
        message={confirmUnenroll ? `Remove "${confirmUnenroll.name}" from your enrollments?` : ""}
        confirmLabel="Unenroll" onConfirm={handleUnenroll} onCancel={() => setConfirmUnenroll(null)} />

      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Avatar name={dbUser?.name || "S"} />
        <View>
          <Text style={{ fontWeight: "800", fontSize: 16, color: C.slate900 }}>Welcome, {firstName} 👋</Text>
          <Text style={{ fontSize: 12, color: C.slate500, marginTop: 1, textTransform: "capitalize" }}>{dbUser?.role || "student"}</Text>
        </View>
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {DASH_TABS.map((tab) => (
            <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
                backgroundColor: activeTab === tab.id ? C.blue : C.white,
                borderWidth: 1, borderColor: activeTab === tab.id ? C.blue : C.border }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: activeTab === tab.id ? "#fff" : C.slate500 }}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ErrorBox message={error} />

      {loading ? (
        <Card><Text style={{ color: C.slate500, textAlign: "center" }}>Loading…</Text></Card>
      ) : (
        <>
          {/* ── Overview ── */}
          {activeTab === "dashboard" && (
            <>
              <Card>
                <SectionLabel>Overview</SectionLabel>
                <View style={{ flexDirection: "row" }}>
                  <Pill label="Enrolled"    value={enrolledCourses.length} color={C.blue}    />
                  <Pill label="In Progress" value={inProgress.length}      color={C.amber}   />
                  <Pill label="Completed"   value={completed.length}       color={C.emerald} />
                  <Pill label="Credits"     value={totalCredits}           color={C.blue}    />
                </View>
              </Card>

              {inProgress.length > 0 && (
                <Card>
                  <SectionLabel>Continue Learning</SectionLabel>
                  {inProgress.slice(0, 3).map((e, i) => (
                    <View key={e.id || i} style={{ marginTop: i > 0 ? 12 : 4 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                        <Text style={{ fontWeight: "700", color: C.slate900, flex: 1, marginRight: 8 }} numberOfLines={1}>{e.name}</Text>
                        <Text style={{ fontWeight: "700", color: C.blue, fontSize: 12 }}>{e.progress}%</Text>
                      </View>
                      <ProgressBar value={e.progress} />
                      <Text style={{ fontSize: 11, color: C.slate500, marginTop: 3 }}>Next: {e.nextItem}</Text>
                    </View>
                  ))}
                </Card>
              )}

              {/* Activity Backlog */}
              <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <SectionLabel>Activity Log</SectionLabel>
                  {activityLog.length > 0 && (
                    <TouchableOpacity onPress={() => { setActivityLog([]); storeJson(ACTIVITY_STORAGE_KEY, []); }}>
                      <Text style={{ fontSize: 11, color: C.rose, fontWeight: "600" }}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {activityLog.length === 0 ? (
                  <Text style={{ color: C.slate500, fontSize: 13 }}>No activity yet. Enroll in a course or upload materials.</Text>
                ) : (
                  activityLog.slice(0, 15).map((entry) => (
                    <View key={entry.id} style={{ flexDirection: "row", gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderColor: C.borderLight }}>
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.slate100, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 15 }}>{entry.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, color: entry.color, fontWeight: "600" }}>{entry.text}</Text>
                        <Text style={{ fontSize: 11, color: C.slate400, marginTop: 1 }}>{entry.time}</Text>
                      </View>
                    </View>
                  ))
                )}
              </Card>

              {enrolledCourses.length === 0 && (
                <EmptyState icon="📚" title="No courses yet" subtitle="Go to Academic Years to enroll." />
              )}
            </>
          )}

          {/* ── My Courses ── */}
          {activeTab === "courses" && (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <SectionLabel>Enrolled ({enrolledCourses.length})</SectionLabel>
                <Text style={{ fontSize: 11, color: C.slate400 }}>{totalCredits} credits earned</Text>
              </View>
              {enrolledCourses.length === 0 ? (
                <EmptyState icon="📚" title="No courses" subtitle="Enroll from available below." />
              ) : (
                enrolledCourses.map((e, i) => (
                  <Card key={e.id || i} style={e.progress >= 100 ? { borderColor: C.emeraldBorder } : {}}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 14 }}>{e.name}</Text>
                        <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>{e.code} · Year {e.yearId} · {e.credits} cr</Text>
                      </View>
                      {e.progress >= 100 ? <Tag label="Done ✓" color={C.emerald} bg={C.emeraldBg} /> :
                        <Text style={{ fontWeight: "700", color: C.blue, fontSize: 13 }}>{e.progress}%</Text>}
                    </View>
                    <ProgressBar value={e.progress} height={6} />
                    <Text style={{ fontSize: 11, color: C.slate500, marginTop: 4 }}>
                      {e.progress >= 100 ? "Completed ✓" : `Next: ${e.nextItem}`}
                    </Text>
                    {e.progress < 100 && (
                      <View style={{ marginTop: 10 }}>
                        <Btn label="Unenroll" variant="outline" small
                          onPress={() => setConfirmUnenroll({ mongoId: e.mongoId, courseId: e.id, name: e.name })} />
                      </View>
                    )}
                  </Card>
                ))
              )}

              <SectionLabel>Available to Enroll ({availableCourses.length})</SectionLabel>
              {availableCourses.length === 0 ? (
                <Card bg={C.slate50}><Text style={{ color: C.slate500, fontSize: 13 }}>No additional courses available from unlocked years.</Text></Card>
              ) : (
                availableCourses.map((c) => (
                  <Card key={c.id}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 14 }}>{c.name}</Text>
                        <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>Year {c.yearId} · {c.code} · {c.credits} cr · {c.instructor}</Text>
                      </View>
                      <Btn label="Enroll" small onPress={() => handleEnroll(c)} />
                    </View>
                  </Card>
                ))
              )}
            </>
          )}

          {/* ── Upload ── */}
          {activeTab === "upload" && (
            enrolledCourses.length === 0 ? (
              <EmptyState icon="📎" title="No courses enrolled" subtitle="Enroll first to upload materials." />
            ) : (
              <>
                <Text style={{ fontSize: 13, color: C.slate600 }}>
                  Open a course from Academic Years → Upload tab to submit materials by section.
                </Text>
                {enrolledCourses.map((e, i) => {
                  const courseMats    = myMaterials.filter((m) => String(m.courseId || m.courseRef) === String(e.mongoId));
                  const pendingCount  = courseMats.filter((m) => m.status === "pending").length;
                  return (
                    <Card key={e.id || i}>
                      <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 14 }}>{e.name}</Text>
                      <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>{e.code} · {courseMats.length} material{courseMats.length !== 1 ? "s" : ""}</Text>
                      {pendingCount > 0 && <Text style={{ fontSize: 12, color: C.amber, marginTop: 2 }}>⏳ {pendingCount} pending review</Text>}
                    </Card>
                  );
                })}
                {myMaterials.length > 0 && (
                  <>
                    <SectionLabel>Your Materials</SectionLabel>
                    {myMaterials.map((m, i) => (
                      <Card key={m._id || m.id || i}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: "600", color: C.slate900, fontSize: 13 }}>{m.title}</Text>
                            <Text style={{ fontSize: 11, color: STATUS_COLOR[m.status] || C.slate400, marginTop: 2 }}>
                              {STATUS_LABEL[m.status] || m.status}
                            </Text>
                            {m.mentorFeedback ? <Text style={{ fontSize: 11, color: C.slate500, marginTop: 2 }}>Feedback: {m.mentorFeedback}</Text> : null}
                          </View>
                          <TouchableOpacity onPress={() => handleRemoveMaterial(m._id || m.id)}>
                            <Text style={{ fontSize: 12, color: C.rose, fontWeight: "600" }}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </Card>
                    ))}
                  </>
                )}
              </>
            )
          )}

          {/* ── Materials ── */}
          {activeTab === "materials" && (
            myMaterials.length === 0 ? (
              <EmptyState icon="📋" title="No materials yet" />
            ) : (
              myMaterials.map((m, i) => (
                <Card key={m._id || m.id || i}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 13 }}>{m.title}</Text>
                      <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>{m.course} · {m.type}</Text>
                      {m.mentorFeedback ? <Text style={{ fontSize: 11, color: C.slate600, marginTop: 2, fontStyle: "italic" }}>Feedback: {m.mentorFeedback}</Text> : null}
                      <Text style={{ fontSize: 10, color: C.slate400, marginTop: 2 }}>{new Date(m.createdAt || Date.now()).toLocaleString()}</Text>
                    </View>
                    <Tag label={STATUS_LABEL[m.status] || m.status}
                      color={STATUS_COLOR[m.status] || C.slate500}
                      bg={m.status === "approved" ? C.emeraldBg : m.status === "rejected" ? C.roseBg : C.amberBg} />
                  </View>
                </Card>
              ))
            )
          )}
        </>
      )}
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALL COURSES SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export function DataScienceCoursesScreen() {
  const [allCourses,    setAllCourses]    = useState([]);
  const [enrollments,   setEnrollments]   = useState([]);
  const [years,         setYears]         = useState({});
  const [dbYears,       setDbYears]       = useState([]);
  const [coursesPerYear,setCoursesPerYear]= useState({});
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [selectedYear,  setSelectedYear]  = useState("1");
  const [confirmUnenroll, setConfirmUnenroll] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [yrRes, enrRes, c1, c2, c3, c4] = await Promise.all([
        api.get("/academic-years"),
        api.get("/users/enrollments"),
        api.get("/courses/year/1"), api.get("/courses/year/2"),
        api.get("/courses/year/3"), api.get("/courses/year/4"),
      ]);
      const dby  = safeArray(yrRes);
      const enrs = safeArray(enrRes);
      const cpy  = { "1": safeArray(c1), "2": safeArray(c2), "3": safeArray(c3), "4": safeArray(c4) };
      setDbYears(dby); setEnrollments(enrs); setCoursesPerYear(cpy);
      setYears(buildYearsState(dby, cpy, enrs));
      setAllCourses([
        ...safeArray(c1).map((c) => ({ ...c, yearId: "1" })),
        ...safeArray(c2).map((c) => ({ ...c, yearId: "2" })),
        ...safeArray(c3).map((c) => ({ ...c, yearId: "3" })),
        ...safeArray(c4).map((c) => ({ ...c, yearId: "4" })),
      ]);
      setError("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, []);

  const enrolledIds  = useMemo(() => new Set(enrollments.map((e) => String(e.courseId))), [enrollments]);
  const completedIds = useMemo(() => new Set(enrollments.filter((e) => e.progress >= 100).map((e) => String(e.courseId))), [enrollments]);
  const yearCourses  = allCourses.filter((c) => c.yearId === selectedYear);
  const yearUnlocked = years[selectedYear]?.unlocked ?? false;
  const totalEarned  = Object.values(years).reduce((s, y) => s + (y.earnedCredits ?? 0), 0);

  const handleEnroll = async (course) => {
    if (completedIds.has(String(course._id))) { Alert.alert("Already completed", "You have already completed this course."); return; }
    try {
      await api.post(`/users/enrollments/${course._id}`);
      await loadAll();
      Alert.alert("Enrolled!", `You joined ${course.title}`);
    } catch (e) { Alert.alert("Failed", e.message); }
  };

  const handleUnenroll = async () => {
    if (!confirmUnenroll) return;
    const enr = enrollments.find((e) => String(e.courseId) === String(confirmUnenroll._id));
    if (!enr) return;
    try {
      await api.delete(`/users/enrollments/${enr.courseId}`);
      setConfirmUnenroll(null);
      await loadAll();
    } catch (e) { Alert.alert("Failed", e.message); }
  };

  return (
    <Screen>
      <ConfirmModal visible={Boolean(confirmUnenroll)} title="Unenroll?" danger
        message={confirmUnenroll ? `Remove "${confirmUnenroll.title}" from your enrollments?` : ""}
        confirmLabel="Unenroll" onConfirm={handleUnenroll} onCancel={() => setConfirmUnenroll(null)} />

      <Text style={s.pageTitle}>All Courses</Text>
      <ErrorBox message={error} />

      {/* Year selector */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {["1", "2", "3", "4"].map((y) => {
          const isLocked = !(years[y]?.unlocked ?? false);
          return (
            <TouchableOpacity key={y} onPress={() => setSelectedYear(y)}
              style={{ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center",
                backgroundColor: selectedYear === y ? C.blue : isLocked ? "#FFFBEB" : C.white,
                borderWidth: 1, borderColor: selectedYear === y ? C.blue : isLocked ? "#FCD34D" : C.border }}>
              <Text style={{ fontWeight: "700", fontSize: 12,
                color: selectedYear === y ? "#fff" : isLocked ? C.amber : C.slate600 }}>
                {isLocked ? "🔒" : `Year ${y}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Locked year notice */}
      {!yearUnlocked && (
        <Card bg="#FFFBEB" style={{ borderColor: "#FCD34D" }}>
          <Text style={{ fontWeight: "700", color: "#92400E" }}>🔒 Year {selectedYear} is locked</Text>
          <Text style={{ color: "#B45309", fontSize: 13, marginTop: 4 }}>
            You need {Math.max(0, UNLOCK_THRESHOLDS[Number(selectedYear)] - totalEarned)} more credits to unlock this year.
          </Text>
        </Card>
      )}

      {loading ? (
        <Card><Text style={{ color: C.slate500 }}>Loading…</Text></Card>
      ) : yearCourses.length === 0 ? (
        <EmptyState icon="📚" title={`No courses for Year ${selectedYear}`} />
      ) : (
        yearCourses.map((course) => {
          const enrolled   = enrolledIds.has(String(course._id));
          const done       = completedIds.has(String(course._id));
          const enrollment = enrollments.find((e) => String(e.courseId) === String(course._id));
          return (
            <Card key={course._id} style={done ? { borderColor: C.emeraldBorder } : {}}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 14 }}>{course.title}</Text>
                  <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>{course.code} · {course.creditHours} cr · {course.instructor || "TBA"}</Text>
                </View>
                {done ? <Tag label="Done ✓" color={C.emerald} bg={C.emeraldBg} /> :
                  enrolled ? <Tag label="Enrolled" color={C.blue} bg={C.blueBg} /> : null}
              </View>
              {enrolled && enrollment && (
                <View style={{ marginTop: 8 }}>
                  <ProgressBar value={enrollment.progress} />
                  <Text style={{ fontSize: 11, color: C.slate500, marginTop: 3 }}>{enrollment.progress}% · {done ? "Completed ✓" : `Next: ${enrollment.nextItem}`}</Text>
                </View>
              )}
              {yearUnlocked && (
                <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
                  {!enrolled && !done && <View style={{ flex: 1 }}><Btn label="Enroll" small onPress={() => handleEnroll(course)} /></View>}
                  {enrolled && !done && <View style={{ flex: 1 }}><Btn label="Unenroll" variant="outline" small onPress={() => setConfirmUnenroll(course)} /></View>}
                </View>
              )}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

export function ProfileScreen() {
  const { dbUser, logout } = useAuth();
  const [form, setForm] = useState({
    name: dbUser?.name || "", email: dbUser?.email || "",
    college: dbUser?.college || "", phone: dbUser?.phone || "",
  });
  const [editMode,    setEditMode]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState("");
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    api.get("/users/enrollments")
      .then((r) => setEnrollments(safeArray(r)))
      .catch(() => {});
  }, []);

  const completed    = enrollments.filter((e) => e.progress >= 100);
  const totalCredits = completed.reduce((s, e) => s + (e.credits || 0), 0);
  const progressPct  = Math.min(100, Math.round((totalCredits / 168) * 100));

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await api.put("/users/profile", { name: form.name, phone: form.phone, college: form.college });
      setSaved(true); setEditMode(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Screen>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Avatar name={form.name || "S"} size={56} />
          <View style={{ flex: 1 }}>
            {editMode ? (
              <TextInput value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                style={[s.input, { fontWeight: "700", fontSize: 16 }]} />
            ) : (
              <Text style={{ fontWeight: "800", fontSize: 17, color: C.slate900 }}>{form.name || "Student"}</Text>
            )}
            <Text style={{ fontSize: 12, color: C.blue, fontWeight: "600", marginTop: 2 }}>{form.email}</Text>
            <Text style={{ fontSize: 11, color: C.slate500, textTransform: "capitalize" }}>{dbUser?.role || "student"}</Text>
          </View>
        </View>
        <Divider />
        {saved && <Text style={{ fontSize: 12, color: C.emerald, fontWeight: "600" }}>✓ Saved!</Text>}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {editMode ? (
            <>
              <View style={{ flex: 1 }}><Btn label="Cancel" variant="outline" small onPress={() => setEditMode(false)} /></View>
              <View style={{ flex: 1 }}><Btn label={saving ? "Saving…" : "Save"} small disabled={saving} onPress={handleSave} /></View>
            </>
          ) : (
            <Btn label="✏️  Edit Profile" variant="outline" small onPress={() => setEditMode(true)} />
          )}
        </View>
      </Card>

      <ErrorBox message={error} />

      <Card>
        <SectionLabel>Academic Overview</SectionLabel>
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <Pill label="Credits Earned"    value={totalCredits}       color={C.blue}    />
          <Pill label="Courses Completed" value={completed.length}   color={C.emerald} />
          <Pill label="Total Enrolled"    value={enrollments.length} color={C.amber}   />
        </View>
        <Text style={{ fontSize: 12, color: C.slate600, marginBottom: 6 }}>
          Degree Progress · <Text style={{ fontWeight: "700", color: C.slate900 }}>{progressPct}%</Text>
        </Text>
        <ProgressBar value={progressPct} height={8} />
      </Card>

      <Card>
        <SectionLabel>Personal Information</SectionLabel>
        {[
          { label: "Email",   key: "email",   readOnly: true  },
          { label: "College", key: "college", readOnly: false },
          { label: "Phone",   key: "phone",   readOnly: false },
        ].map(({ label, key, readOnly }) => (
          <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: C.slate500, width: 70 }}>{label}</Text>
            {editMode && !readOnly ? (
              <TextInput value={form[key]} onChangeText={(v) => setForm((p) => ({ ...p, [key]: v }))}
                style={[s.input, { flex: 1, marginLeft: 8 }]} autoCapitalize="none" />
            ) : (
              <Text style={{ fontSize: 13, fontWeight: "600", color: C.slate900, flex: 1, textAlign: "right" }}>
                {form[key] || "—"}
              </Text>
            )}
          </View>
        ))}
      </Card>

      {completed.length > 0 && (
        <Card>
          <SectionLabel>Completed Courses</SectionLabel>
          {completed.slice(0, 5).map((e, i) => (
            <View key={e.courseId || i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: i > 0 ? 8 : 4 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", color: C.slate900, fontSize: 13 }} numberOfLines={1}>{e.name}</Text>
                <Text style={{ fontSize: 11, color: C.slate500 }}>{e.code} · Year {e.yearId} · {e.credits || 0} cr</Text>
              </View>
              <Tag label="✓" color={C.emerald} bg={C.emeraldBg} />
            </View>
          ))}
          {completed.length > 5 && (
            <Text style={{ fontSize: 12, color: C.slate400, marginTop: 8 }}>+{completed.length - 5} more</Text>
          )}
        </Card>
      )}

      <View style={{ marginTop: 8 }}>
        <Btn label="Logout" variant="danger" onPress={logout} />
      </View>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN SCREENS
// ─────────────────────────────────────────────────────────────────────────────
export function AdminDashboardScreen() {
  const [stats,    setStats]    = useState({});
  const [activity, setActivity] = useState([]);
  const [error,    setError]    = useState("");

  useEffect(() => {
    Promise.all([endpoints.admin.dashboardStats(), endpoints.admin.dashboardActivity()])
      .then(([sRes, aRes]) => { setStats(sRes.data || sRes || {}); setActivity(safeArray(aRes)); })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <Screen>
      <Text style={s.pageTitle}>Admin Overview</Text>
      <ErrorBox message={error} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {[
          { label: "Total Students",    value: stats.totalStudents    ?? "—", color: C.blue    },
          { label: "Total Mentors",     value: stats.totalMentors     ?? "—", color: C.emerald },
          { label: "Active Courses",    value: stats.activeCourses    ?? "—", color: C.amber   },
          { label: "Pending Approvals", value: stats.pendingApprovals ?? "—", color: C.rose    },
        ].map((sc) => (
          <Card key={sc.label} style={{ flex: 1, minWidth: "45%", alignItems: "center", paddingVertical: 16 }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: sc.color }}>{sc.value}</Text>
            <Text style={{ fontSize: 11, color: C.slate500, marginTop: 4, textAlign: "center" }}>{sc.label}</Text>
          </Card>
        ))}
      </View>
      <Card>
        <SectionLabel>Recent Activity</SectionLabel>
        {activity.length === 0 ? (
          <Text style={{ color: C.slate500 }}>No recent activity.</Text>
        ) : (
          activity.slice(0, 8).map((a, i) => (
            <Text key={a.id || i} style={{ color: C.slate700, fontSize: 13, marginTop: 4 }}>
              · {a.user || "User"} {a.action || "performed an action"}
            </Text>
          ))
        )}
      </Card>
    </Screen>
  );
}

export const AdminAcademicsScreen = () => (
  <CrudScreen title="Academic Management" load={endpoints.admin.colleges}
    columns={["name", "years", "semesters", "programs", "status"]} />
);
export const AdminCoursesScreen = () => (
  <CrudScreen title="Course Management" load={endpoints.admin.courses}
    columns={["code", "title", "college", "instructor", "students", "status"]} />
);
export const AdminMaterialsScreen = () => (
  <CrudScreen title="Materials Management" load={endpoints.admin.materials}
    columns={["title", "course", "type", "size", "uploader", "status"]} />
);
export const AdminUsersScreen = () => (
  <CrudScreen title="Users Management" load={endpoints.admin.users}
    columns={["name", "email", "role", "college", "status"]} />
);

// ─────────────────────────────────────────────────────────────────────────────
// MENTOR SCREENS
// ─────────────────────────────────────────────────────────────────────────────
export function MentorDashboardScreen() {
  const [pending,   setPending]   = useState([]);
  const [mine,      setMine]      = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [action,    setAction]    = useState("approve");
  const [feedback,  setFeedback]  = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [error,     setError]     = useState("");

  useEffect(() => {
    Promise.all([endpoints.mentor.pendingMaterials(), endpoints.mentor.myMaterials()])
      .then(([pRes, mRes]) => { setPending(safeArray(pRes)); setMine(safeArray(mRes)); })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <Screen>
      <Text style={s.pageTitle}>Mentor Dashboard</Text>
      <ErrorBox message={error} />
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Card style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: C.amber }}>{pending.length}</Text>
          <Text style={{ fontSize: 11, color: C.slate500, marginTop: 4 }}>Pending Reviews</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: C.blue }}>{mine.length}</Text>
          <Text style={{ fontSize: 11, color: C.slate500, marginTop: 4 }}>My Materials</Text>
        </Card>
      </View>

      <SectionLabel>Pending Materials</SectionLabel>
      {pending.length === 0 ? (
        <EmptyState icon="✅" title="All clear!" subtitle="No materials pending review." />
      ) : (
        pending.map((m, i) => (
          <Card key={m._id || i}>
            <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 14 }}>{m.title}</Text>
            <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>{m.course} · {m.type} · by {m.uploader}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Btn label="✓ Approve" small onPress={() => { setSelected(m); setAction("approve"); setFeedback(""); setModalOpen(true); }} />
              </View>
              <View style={{ flex: 1 }}>
                <Btn label="✕ Reject" variant="danger" small onPress={() => { setSelected(m); setAction("reject"); setFeedback(""); setModalOpen(true); }} />
              </View>
            </View>
          </Card>
        ))
      )}

      <Modal visible={modalOpen} transparent animationType="slide">
        <Pressable style={s.modalOverlay} onPress={() => setModalOpen(false)}>
          <Pressable style={s.modalCard}>
            <Text style={{ fontWeight: "800", fontSize: 16, color: C.slate900, marginBottom: 8 }}>
              {action === "approve" ? "Approve Material" : "Reject Material"}
            </Text>
            <Field label="Feedback (optional)" value={feedback} onChangeText={setFeedback}
              placeholder={action === "approve" ? "Great work…" : "Please revise…"} />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <View style={{ flex: 1 }}><Btn label="Cancel" variant="outline" onPress={() => setModalOpen(false)} /></View>
              <View style={{ flex: 1 }}>
                <Btn label={action === "approve" ? "Approve" : "Reject"}
                  variant={action === "approve" ? "primary" : "danger"}
                  onPress={async () => {
                    try {
                      if (action === "approve") await endpoints.mentor.approveMaterial(selected._id, { feedback });
                      else await endpoints.mentor.rejectMaterial(selected._id);
                      setPending((prev) => prev.filter((m) => m._id !== selected._id));
                      setModalOpen(false);
                    } catch (e) { Alert.alert("Failed", e.message); }
                  }} />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

export function MentorUploadScreen() {
  const [title,    setTitle]    = useState("");
  const [course,   setCourse]   = useState("");
  const [type,     setType]     = useState("PDF");
  const [uploaded, setUploaded] = useState([]);
  const [error,    setError]    = useState("");

  useEffect(() => {
    endpoints.mentor.myMaterials()
      .then((r) => setUploaded(safeArray(r)))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <Screen>
      <Text style={s.pageTitle}>Upload Material</Text>
      <ErrorBox message={error} />
      <Card>
        <SectionLabel>New Material</SectionLabel>
        <Field label="Title"  value={title}  onChangeText={setTitle}  placeholder="Week 4 lecture notes" />
        <Field label="Course" value={course} onChangeText={setCourse} placeholder="Data Structures" />
        <Field label="Type"   value={type}   onChangeText={setType}   placeholder="PDF / Video / Slides" />
        <View style={{ marginTop: 8 }}>
          <Btn label="Upload" onPress={async () => {
            try {
              await endpoints.mentor.uploadMaterial({ title, course, type, status: "Draft" });
              const r = await endpoints.mentor.myMaterials();
              setUploaded(safeArray(r));
              setTitle(""); setCourse("");
            } catch (e) { Alert.alert("Upload failed", e.message); }
          }} />
        </View>
      </Card>

      <SectionLabel>My Uploaded Materials</SectionLabel>
      {uploaded.length === 0 ? (
        <EmptyState icon="📄" title="No materials yet" />
      ) : (
        uploaded.map((m, i) => (
          <Card key={m._id || i}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 13 }}>{m.title}</Text>
                <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>{m.course} · {m.type}</Text>
              </View>
              <Tag label={m.status || "Draft"}
                color={m.status === "Active" ? C.emerald : C.amber}
                bg={m.status === "Active" ? C.emeraldBg : C.amberBg} />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

export function MentorStudentsScreen() {
  const [users,  setUsers]  = useState([]);
  const [search, setSearch] = useState("");
  const [error,  setError]  = useState("");

  useEffect(() => {
    endpoints.admin.users.getAll()
      .then((r) => setUsers(safeArray(r)))
      .catch((e) => setError(e.message));
  }, []);

  const filtered = users
    .filter((u) => (u.role || "").toLowerCase() === "student")
    .filter((s) =>
      (s.name  || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <Screen>
      <Text style={s.pageTitle}>Students</Text>
      <ErrorBox message={error} />
      <Field value={search} onChangeText={setSearch} placeholder="🔍 Search by name or email…" />
      {filtered.length === 0 ? (
        <EmptyState icon="👨‍🎓" title="No students found" />
      ) : (
        filtered.map((u, i) => (
          <Card key={u._id || i}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Avatar name={u.name || "S"} size={36} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 13 }}>{u.name}</Text>
                <Text style={{ fontSize: 12, color: C.slate500 }}>{u.email}</Text>
                {u.college ? <Text style={{ fontSize: 11, color: C.slate400 }}>{u.college}</Text> : null}
              </View>
              <Tag label={u.status || "Active"}
                color={u.status === "Active" ? C.emerald : C.amber}
                bg={u.status === "Active" ? C.emeraldBg : C.amberBg} />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

export function MentorProfileScreen() {
  const { dbUser, logout } = useAuth();
  const [profile, setProfile] = useState({
    name: dbUser?.name || "", email: dbUser?.email || "",
    college: dbUser?.college || "", bio: dbUser?.bio || "",
  });
  const [saving, setSaving] = useState(false);

  return (
    <Screen>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Avatar name={profile.name || "M"} size={52} bg="#7C3AED" />
          <View>
            <Text style={{ fontWeight: "800", fontSize: 16, color: C.slate900 }}>{profile.name || "Mentor"}</Text>
            <Text style={{ fontSize: 12, color: "#7C3AED", fontWeight: "600" }}>{profile.email}</Text>
            <Tag label="Mentor" color="#7C3AED" bg="#F5F3FF" />
          </View>
        </View>
      </Card>
      <Card>
        <SectionLabel>Edit Profile</SectionLabel>
        <Field label="Name"    value={profile.name}    onChangeText={(v) => setProfile((p) => ({ ...p, name: v }))}    placeholder="Full name" />
        <Field label="College" value={profile.college} onChangeText={(v) => setProfile((p) => ({ ...p, college: v }))} placeholder="College" />
        <Field label="Bio"     value={profile.bio}     onChangeText={(v) => setProfile((p) => ({ ...p, bio: v }))}     placeholder="Bio" multiline />
        <View style={{ marginTop: 8 }}>
          <Btn label={saving ? "Saving…" : "Save Changes"} disabled={saving} onPress={async () => {
            setSaving(true);
            try {
              await api.put("/users/profile", { name: profile.name, college: profile.college });
              Alert.alert("Saved!", "Profile updated.");
            } catch (e) { Alert.alert("Error", e.message); }
            finally { setSaving(false); }
          }} />
        </View>
      </Card>
      <Btn label="Logout" variant="danger" onPress={logout} />
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  pageTitle: { fontSize: 22, fontWeight: "800", color: C.slate900 },
  card: {
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    borderRadius: 16, padding: 14, gap: 8,
  },
  input: {
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, color: C.slate900,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(2,6,23,0.45)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: C.white, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, gap: 10,
  },
});