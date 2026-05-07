import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
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

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — mirrors web Tailwind palette
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg:          "#F8FAFC",
  white:       "#FFFFFF",
  border:      "#E2E8F0",
  borderLight: "#F1F5F9",
  blue:        "#2563EB",
  blueMid:     "#3B82F6",
  blueBg:      "#EFF6FF",
  emerald:     "#059669",
  emeraldBg:   "#ECFDF5",
  emeraldBorder:"#A7F3D0",
  amber:       "#D97706",
  amberBg:     "#FFFBEB",
  rose:        "#DC2626",
  slate900:    "#0F172A",
  slate700:    "#334155",
  slate600:    "#475569",
  slate500:    "#64748B",
  slate400:    "#94A3B8",
  slate200:    "#E2E8F0",
  slate100:    "#F1F5F9",
  slate50:     "#F8FAFC",
};

// ─────────────────────────────────────────────────────────────────────────────
// Base primitives
// ─────────────────────────────────────────────────────────────────────────────
function Screen({ children, noPad }) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ padding: noPad ? 0 : 16, paddingBottom: 40, gap: 12 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

function Card({ children, style, color }) {
  return (
    <View style={[s.card, color ? { backgroundColor: color } : {}, style]}>
      {children}
    </View>
  );
}

function SectionLabel({ children }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: "700", color: C.slate500, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
      {children}
    </Text>
  );
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
      <Text style={{ fontSize: 20, fontWeight: "800", color }}>{value}</Text>
      <Text style={{ fontSize: 10, color: C.slate500, marginTop: 2, textAlign: "center" }}>{label}</Text>
    </View>
  );
}

function ProgressBar({ value, color = C.blue, height = 6 }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  return (
    <View style={{ height, backgroundColor: C.slate200, borderRadius: 99, overflow: "hidden" }}>
      <View style={{ height, width: `${pct}%`, backgroundColor: pct >= 100 ? C.emerald : color, borderRadius: 99 }} />
    </View>
  );
}

function Avatar({ name, size = 44, bg = C.blue }) {
  const letter = (name || "?")[0].toUpperCase();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.38 }}>{letter}</Text>
    </View>
  );
}

function Btn({ label, onPress, variant = "primary", small, disabled }) {
  const bg = variant === "primary" ? C.blue : variant === "danger" ? C.rose : variant === "ghost" ? "transparent" : C.white;
  const tc = variant === "ghost" ? C.blue : variant === "outline" ? C.slate700 : "#fff";
  const border = variant === "outline" ? { borderWidth: 1, borderColor: C.slate200 } : {};
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[{ backgroundColor: bg, borderRadius: 99, paddingHorizontal: small ? 12 : 16, paddingVertical: small ? 7 : 10, alignItems: "center" }, border, disabled && { opacity: 0.5 }]}
    >
      <Text style={{ color: tc, fontWeight: "700", fontSize: small ? 12 : 13 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function Field({ label, value, onChangeText, placeholder, secure, multiline, editable = true }) {
  return (
    <View style={{ gap: 4 }}>
      {label ? <Text style={{ fontSize: 12, fontWeight: "600", color: C.slate600 }}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.slate400}
        secureTextEntry={secure}
        multiline={multiline}
        editable={editable}
        autoCapitalize="none"
        style={[s.input, multiline && { height: 80, textAlignVertical: "top" }, !editable && { backgroundColor: C.slate50, color: C.slate500 }]}
      />
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: C.borderLight, marginVertical: 4 }} />;
}

function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <Card color="#FEF2F2" style={{ borderColor: "#FECACA" }}>
      <Text style={{ color: C.rose, fontWeight: "600", fontSize: 13 }}>⚠️ {message}</Text>
    </Card>
  );
}

function EmptyState({ icon = "📭", title, subtitle }) {
  return (
    <Card>
      <View style={{ alignItems: "center", paddingVertical: 20 }}>
        <Text style={{ fontSize: 36, marginBottom: 8 }}>{icon}</Text>
        <Text style={{ fontWeight: "700", color: C.slate700, fontSize: 15, textAlign: "center" }}>{title}</Text>
        {subtitle ? <Text style={{ color: C.slate500, fontSize: 13, marginTop: 4, textAlign: "center" }}>{subtitle}</Text> : null}
      </View>
    </Card>
  );
}

// Generic CRUD screen (admin panels)
function CrudScreen({ title, load, columns }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const fields = columns.filter((c) => !["id", "_id", "createdAt", "updatedAt"].includes(c));

  useEffect(() => {
    load.getAll().then((d) => setRows(safeArray(d))).catch((e) => setError(e.message));
  }, []);

  return (
    <Screen>
      <Text style={s.pageTitle}>{title}</Text>
      <ErrorBox message={error} />
      {rows.length === 0 ? (
        <EmptyState icon="📋" title="No records yet" />
      ) : (
        rows.slice(0, 30).map((row, i) => (
          <Card key={row._id || i}>
            {fields.slice(0, 4).map((f) => (
              <View key={f} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                <Text style={{ fontSize: 11, color: C.slate500, fontWeight: "600", textTransform: "uppercase" }}>{f}</Text>
                <Text style={{ fontSize: 12, color: C.slate700, fontWeight: "500", flexShrink: 1, textAlign: "right", maxWidth: "60%" }}>
                  {String(row[f] ?? "—")}
                </Text>
              </View>
            ))}
          </Card>
        ))
      )}
    </Screen>
  );
}

function safeArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC HOME
// ─────────────────────────────────────────────────────────────────────────────
export function PublicHomeScreen({ navigation }) {
  return (
    <Screen>
      <Card>
        <Image
          source={{ uri: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800" }}
          style={{ width: "100%", height: 180, borderRadius: 12, marginBottom: 14 }}
          resizeMode="cover"
        />
        <Tag label="CONNECTING MINDS" />
        <Text style={[s.pageTitle, { marginTop: 8 }]}>Empowering Students{"\n"}& Mentors</Text>
        <Text style={{ color: C.slate600, fontSize: 14, lineHeight: 20, marginTop: 4 }}>
          A unified platform for collaboration and academic growth.
        </Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          <View style={{ flex: 1 }}>
            <Btn label="Login" onPress={() => navigation.navigate("Login")} />
          </View>
          <View style={{ flex: 1 }}>
            <Btn label="Register" variant="outline" onPress={() => navigation.navigate("Register")} />
          </View>
        </View>
      </Card>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT HOME — mirrors web Home.jsx
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
      {/* Hero banner */}
      <Card color={C.blueBg} style={{ borderColor: "#BFDBFE" }}>
        <Tag label="WELCOME BACK" />
        <Text style={[s.pageTitle, { marginTop: 6, color: C.slate900 }]}>
          Hello, {firstName}! 👋
        </Text>
        <Text style={{ color: C.slate600, fontSize: 13, marginTop: 4 }}>
          {dbUser?.college && dbUser.college !== "—" ? dbUser.college + " • " : ""}
          <Text style={{ fontWeight: "700", color: C.blue, textTransform: "capitalize" }}>{dbUser?.role || "Student"}</Text>
        </Text>
        <Divider />
        {/* Quick stat pills */}
        <View style={{ flexDirection: "row", marginTop: 4 }}>
          <Pill label="Enrolled"    value={enrollments.length} color={C.blue} />
          <Pill label="In Progress" value={inProgress.length}  color={C.amber} />
          <Pill label="Completed"   value={completed.length}   color={C.emerald} />
          <Pill label="Credits"     value={totalCredits}       color={C.blue} />
        </View>
      </Card>

      <ErrorBox message={error} />

      {loading ? (
        <Card><Text style={{ color: C.slate500, textAlign: "center" }}>Loading your data…</Text></Card>
      ) : (
        <>
          {/* Continue learning */}
          {inProgress.length > 0 && (
            <Card>
              <SectionLabel>Continue Learning</SectionLabel>
              {inProgress.slice(0, 3).map((course, i) => (
                <View key={course.courseId || i} style={{ marginTop: i > 0 ? 12 : 4 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 14 }} numberOfLines={1}>{course.name}</Text>
                      <Text style={{ fontSize: 11, color: C.slate500, marginTop: 1 }}>{course.code} · Year {course.yearId}</Text>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: "700", color: C.blue }}>{course.progress}%</Text>
                  </View>
                  <ProgressBar value={course.progress} />
                  <Text style={{ fontSize: 11, color: C.slate500, marginTop: 3 }}>Next: {course.nextItem}</Text>
                </View>
              ))}
            </Card>
          )}

          {/* Completed courses */}
          {completed.length > 0 && (
            <Card>
              <SectionLabel>Completed Courses</SectionLabel>
              {completed.slice(0, 4).map((course, i) => (
                <View key={course.courseId || i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: i > 0 ? 8 : 4 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", color: C.slate900, fontSize: 13 }} numberOfLines={1}>{course.name}</Text>
                    <Text style={{ fontSize: 11, color: C.slate500 }}>{course.code} · {course.credits || 0} credits</Text>
                  </View>
                  <Tag label="✓ Done" color={C.emerald} bg={C.emeraldBg} />
                </View>
              ))}
              {completed.length > 4 && (
                <Text style={{ fontSize: 12, color: C.slate400, marginTop: 8 }}>+{completed.length - 4} more completed</Text>
              )}
            </Card>
          )}

          {enrollments.length === 0 && (
            <EmptyState icon="📚" title="No courses yet" subtitle="Go to the Academic Years tab to enroll in courses." />
          )}
        </>
      )}
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMIC YEARS — mirrors web AcademicYear + YearDetail
// ─────────────────────────────────────────────────────────────────────────────
const YEAR_META = {
  1: { title: "Year One — Foundations",             desc: "Foundational concepts: computing, mathematics, and logic."            },
  2: { title: "Year Two — Core Specializations",    desc: "Core engineering principles and advanced programming foundations."    },
  3: { title: "Year Three — Advanced Applications", desc: "Advanced applications: software engineering, cloud, and AI."          },
  4: { title: "Year Four — Research & Thesis",      desc: "Capstone, research, and industry placement."                          },
};

export function AcademicYearsScreen() {
  const [years,       setYears]       = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [yearCourses,  setYearCourses]  = useState([]);
  const [loadingInit,  setLoadingInit]  = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/academic-years"), api.get("/users/enrollments")])
      .then(([yrRes, enrRes]) => {
        setYears(safeArray(yrRes).sort((a, b) => a.year - b.year));
        setEnrollments(safeArray(enrRes));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingInit(false));
  }, []);

  const enrolledIds = useMemo(() => new Set(enrollments.map((e) => String(e.courseId))), [enrollments]);

  const totalEarned = enrollments.reduce((s, e) => s + (e.progress >= 100 ? e.credits || 0 : 0), 0);

  const selectYear = async (y) => {
    setSelectedYear(y);
    setLoadingCourses(true);
    setYearCourses([]);
    try {
      const r = await api.get(`/courses/year/${y.year}`);
      setYearCourses(safeArray(r));
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleEnroll = async (course) => {
    try {
      await api.post(`/users/enrollments/${course._id}`);
      setEnrollments((prev) => [...prev, {
        courseId: String(course._id),
        name: course.title, code: course.code,
        yearId: String(course.yearId), credits: course.creditHours || 3,
        progress: 0, nextItem: "Getting Started",
      }]);
      Alert.alert("Enrolled!", `You joined ${course.title}`);
    } catch (e) {
      Alert.alert("Enroll failed", e.message);
    }
  };

  if (selectedYear) {
    const yid = String(selectedYear.year);
    const meta = YEAR_META[selectedYear.year] || {};
    const yearEnrollments = enrollments.filter((e) => String(e.yearId) === yid);
    const yearCompleted   = yearEnrollments.filter((e) => e.progress >= 100);
    const yearEarned      = yearCompleted.reduce((s, e) => s + (e.credits || 0), 0);
    const allDone = yearEnrollments.length > 0 && yearEnrollments.every((e) => e.progress >= 100);

    return (
      <Screen>
        {/* Back */}
        <TouchableOpacity onPress={() => { setSelectedYear(null); setYearCourses([]); }} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <Text style={{ fontSize: 13, color: C.blue, fontWeight: "600" }}>← Back to Years</Text>
        </TouchableOpacity>

        {/* Year header */}
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <SectionLabel>Year {selectedYear.year}</SectionLabel>
              <Text style={s.pageTitle}>{meta.title || selectedYear.name}</Text>
              <Text style={{ fontSize: 13, color: C.slate600, marginTop: 4, lineHeight: 18 }}>{meta.desc}</Text>
            </View>
            <Tag
              label={allDone ? "Completed" : yearEnrollments.length > 0 ? "In Progress" : "Available"}
              color={allDone ? C.emerald : yearEnrollments.length > 0 ? C.amber : C.blue}
              bg={allDone ? C.emeraldBg : yearEnrollments.length > 0 ? C.amberBg : C.blueBg}
            />
          </View>
          <Divider />
          <Text style={{ fontSize: 13, color: C.slate500 }}>
            Credits earned: <Text style={{ fontWeight: "700", color: C.slate900 }}>{yearEarned}</Text>
          </Text>
        </Card>

        {/* Year completed banner */}
        {allDone && (
          <Card color={C.emeraldBg} style={{ borderColor: C.emeraldBorder }}>
            <Text style={{ fontSize: 22, marginBottom: 6 }}>🎉</Text>
            <Text style={{ fontWeight: "800", color: "#065F46", fontSize: 15 }}>Year {selectedYear.year} Complete!</Text>
            <Text style={{ color: "#047857", fontSize: 13, marginTop: 4 }}>
              You earned {yearEarned} credits. You can revisit any course below to review materials.
            </Text>
          </Card>
        )}

        {/* Enrolled courses */}
        {yearEnrollments.length > 0 && (
          <>
            <SectionLabel>Your Courses</SectionLabel>
            {yearEnrollments.map((e, i) => (
              <Card key={e.courseId || i}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 14 }}>{e.name}</Text>
                    <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>{e.code} · {e.credits || 0} credits</Text>
                  </View>
                  {e.progress >= 100 ? (
                    <Tag label="Passed ✓" color={C.emerald} bg={C.emeraldBg} />
                  ) : (
                    <Text style={{ fontSize: 12, fontWeight: "700", color: C.blue }}>{e.progress}%</Text>
                  )}
                </View>
                <ProgressBar value={e.progress} height={6} />
                <Text style={{ fontSize: 11, color: C.slate500, marginTop: 4 }}>
                  {e.progress >= 100 ? "✓ Finished — open to review" : `Next: ${e.nextItem}`}
                </Text>
              </Card>
            ))}
          </>
        )}

        {/* Available to enroll */}
        <SectionLabel>Available Courses</SectionLabel>
        {loadingCourses ? (
          <Card><Text style={{ color: C.slate500 }}>Loading courses…</Text></Card>
        ) : yearCourses.length === 0 ? (
          <EmptyState icon="📭" title="No courses yet" subtitle="The instructor hasn't published courses for this year yet." />
        ) : (
          yearCourses
            .filter((c) => !enrolledIds.has(String(c._id)))
            .map((c) => (
              <Card key={c._id}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 14 }}>{c.title}</Text>
                    <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>
                      {c.code} · {c.creditHours} cr · {c.instructor || "TBA"}
                    </Text>
                  </View>
                  <Btn label="Enroll" small onPress={() => handleEnroll(c)} />
                </View>
              </Card>
            ))
        )}

        {/* All already enrolled in this year */}
        {!loadingCourses && yearCourses.filter((c) => !enrolledIds.has(String(c._id))).length === 0 && yearEnrollments.length > 0 && (
          <Card color={C.slate50}>
            <Text style={{ color: C.slate500, fontSize: 13 }}>You are enrolled in all available courses for this year.</Text>
          </Card>
        )}
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={s.pageTitle}>Academic Years</Text>
      <Text style={{ fontSize: 13, color: C.slate600 }}>
        Select any year to view and enroll in courses.
      </Text>

      <ErrorBox message={error} />

      {/* Credits summary */}
      <Card color={C.blueBg} style={{ borderColor: "#BFDBFE" }}>
        <SectionLabel>Degree Progress</SectionLabel>
        <View style={{ flexDirection: "row" }}>
          <Pill label="Total Credits Earned" value={totalEarned} color={C.blue} />
          <Pill label="Courses Completed" value={enrollments.filter((e) => e.progress >= 100).length} color={C.emerald} />
        </View>
      </Card>

      {loadingInit ? (
        <Card><Text style={{ color: C.slate500 }}>Loading…</Text></Card>
      ) : years.length === 0 ? (
        <EmptyState icon="📅" title="No academic years" subtitle="Run the seed script on the server." />
      ) : (
        years.map((y) => {
          const meta = YEAR_META[y.year] || {};
          const yearEnrollments = enrollments.filter((e) => String(e.yearId) === String(y.year));
          const allDone  = yearEnrollments.length > 0 && yearEnrollments.every((e) => e.progress >= 100);
          const inProg   = yearEnrollments.some((e) => e.progress > 0 && e.progress < 100);
          const statusLabel = allDone ? "Completed" : inProg || yearEnrollments.length > 0 ? "In Progress" : "Available";
          const statusColor = allDone ? C.emerald : inProg || yearEnrollments.length > 0 ? C.amber : C.blue;
          const statusBg    = allDone ? C.emeraldBg : inProg || yearEnrollments.length > 0 ? C.amberBg : C.blueBg;
          const yearCredits = yearEnrollments.filter((e) => e.progress >= 100).reduce((s, e) => s + (e.credits || 0), 0);

          return (
            <TouchableOpacity key={y._id} onPress={() => selectYear(y)} activeOpacity={0.85}>
              <Card style={{ borderWidth: allDone ? 1.5 : 1, borderColor: allDone ? C.emeraldBorder : C.border }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.blueBg, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontWeight: "800", fontSize: 18, color: C.blue }}>{y.year}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 15 }}>{meta.title || y.name}</Text>
                    <Text style={{ fontSize: 12, color: C.slate600, marginTop: 2 }} numberOfLines={2}>{meta.desc}</Text>
                  </View>
                </View>
                <Divider />
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Tag label={statusLabel} color={statusColor} bg={statusBg} />
                  <Text style={{ fontSize: 12, color: C.slate500 }}>
                    {yearCredits} credits · View courses →
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
// STUDENT DASHBOARD — mirrors web StudentDashboard
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "dashboard",  label: "Dashboard"  },
  { id: "courses",    label: "My Courses" },
  { id: "materials",  label: "Materials"  },
];

export function StudentDashboardScreen() {
  const { dbUser } = useAuth();
  const [enrollments,  setEnrollments]  = useState([]);
  const [myMaterials,  setMyMaterials]  = useState([]);
  const [activeTab,    setActiveTab]    = useState("dashboard");
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  useEffect(() => {
    Promise.all([api.get("/users/enrollments"), api.get("/users/materials")])
      .then(([enrRes, matRes]) => {
        setEnrollments(safeArray(enrRes));
        setMyMaterials(safeArray(matRes));
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const inProgress   = enrollments.filter((e) => e.progress > 0 && e.progress < 100);
  const completed    = enrollments.filter((e) => e.progress >= 100);
  const totalCredits = completed.reduce((s, e) => s + (e.credits || 0), 0);
  const firstName    = dbUser?.name?.split(" ")[0] || "Student";

  const STATUS_COLOR = { pending: C.amber,   approved: C.emerald, rejected: C.rose };
  const STATUS_LABEL = { pending: "⏳ Pending", approved: "✅ Approved", rejected: "❌ Rejected" };

  return (
    <Screen>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 }}>
        <Avatar name={dbUser?.name || "S"} />
        <View>
          <Text style={{ fontWeight: "800", fontSize: 16, color: C.slate900 }}>Welcome, {firstName} 👋</Text>
          <Text style={{ fontSize: 12, color: C.slate500, marginTop: 1, textTransform: "capitalize" }}>{dbUser?.role || "student"}</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={{ flexDirection: "row", backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.border, overflow: "hidden" }}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{ flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: activeTab === tab.id ? C.blue : "transparent" }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: activeTab === tab.id ? "#fff" : C.slate500 }}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ErrorBox message={error} />

      {loading ? (
        <Card><Text style={{ color: C.slate500, textAlign: "center" }}>Loading…</Text></Card>
      ) : (
        <>
          {/* ── Dashboard tab ── */}
          {activeTab === "dashboard" && (
            <>
              {/* Stats row */}
              <Card>
                <SectionLabel>Overview</SectionLabel>
                <View style={{ flexDirection: "row" }}>
                  <Pill label="Enrolled"   value={enrollments.length}  color={C.blue}    />
                  <Pill label="In Progress" value={inProgress.length}  color={C.amber}   />
                  <Pill label="Completed"  value={completed.length}    color={C.emerald} />
                  <Pill label="Credits"    value={totalCredits}        color={C.blue}    />
                </View>
              </Card>

              {/* In progress preview */}
              {inProgress.length > 0 && (
                <Card>
                  <SectionLabel>Continue Learning</SectionLabel>
                  {inProgress.slice(0, 3).map((e, i) => (
                    <View key={e.courseId || i} style={{ marginTop: i > 0 ? 12 : 4 }}>
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

              {enrollments.length === 0 && (
                <EmptyState icon="📚" title="No courses yet" subtitle="Go to Academic Years to enroll in courses." />
              )}
            </>
          )}

          {/* ── My Courses tab ── */}
          {activeTab === "courses" && (
            enrollments.length === 0 ? (
              <EmptyState icon="📚" title="No courses enrolled" subtitle="Go to Academic Years to enroll." />
            ) : (
              enrollments.map((e, i) => (
                <Card key={e.courseId || i} style={e.progress >= 100 ? { borderColor: C.emeraldBorder } : {}}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 14 }}>{e.name}</Text>
                      <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>
                        {e.code} · Year {e.yearId} · {e.credits || 0} credits
                      </Text>
                    </View>
                    {e.progress >= 100 ? (
                      <Tag label="Done ✓" color={C.emerald} bg={C.emeraldBg} />
                    ) : (
                      <Text style={{ fontWeight: "700", color: C.blue, fontSize: 13 }}>{e.progress}%</Text>
                    )}
                  </View>
                  <ProgressBar value={e.progress} height={6} />
                  <Text style={{ fontSize: 11, color: C.slate500, marginTop: 4 }}>
                    {e.progress >= 100 ? "Completed ✓" : `Next: ${e.nextItem}`}
                  </Text>
                </Card>
              ))
            )
          )}

          {/* ── Materials tab ── */}
          {activeTab === "materials" && (
            myMaterials.length === 0 ? (
              <EmptyState icon="📎" title="No materials yet" subtitle="Upload materials through the CoursePlayer on the web." />
            ) : (
              myMaterials.map((m, i) => (
                <Card key={m._id || i}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 13 }} numberOfLines={2}>{m.title}</Text>
                      <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>{m.course} · {m.type}</Text>
                    </View>
                    <Tag
                      label={STATUS_LABEL[m.status] || m.status}
                      color={STATUS_COLOR[m.status] || C.slate500}
                      bg={m.status === "approved" ? C.emeraldBg : m.status === "rejected" ? "#FEF2F2" : C.amberBg}
                    />
                  </View>
                  {m.mentorFeedback ? (
                    <Text style={{ fontSize: 11, color: C.slate600, marginTop: 4, fontStyle: "italic" }}>
                      Feedback: {m.mentorFeedback}
                    </Text>
                  ) : null}
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
// COURSES SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export function DataScienceCoursesScreen() {
  const [allCourses,   setAllCourses]   = useState([]);
  const [enrollments,  setEnrollments]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [selectedYear, setSelectedYear] = useState("1");

  useEffect(() => {
    Promise.all([
      api.get("/users/enrollments"),
      api.get("/courses/year/1"),
      api.get("/courses/year/2"),
      api.get("/courses/year/3"),
      api.get("/courses/year/4"),
    ])
      .then(([enrRes, c1, c2, c3, c4]) => {
        setEnrollments(safeArray(enrRes));
        setAllCourses([
          ...safeArray(c1).map((c) => ({ ...c, yearId: "1" })),
          ...safeArray(c2).map((c) => ({ ...c, yearId: "2" })),
          ...safeArray(c3).map((c) => ({ ...c, yearId: "3" })),
          ...safeArray(c4).map((c) => ({ ...c, yearId: "4" })),
        ]);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const enrolledIds  = useMemo(() => new Set(enrollments.map((e) => String(e.courseId))), [enrollments]);
  const completedIds = useMemo(() => new Set(enrollments.filter((e) => e.progress >= 100).map((e) => String(e.courseId))), [enrollments]);
  const yearCourses  = allCourses.filter((c) => c.yearId === selectedYear);

  const handleEnroll = async (course) => {
    if (completedIds.has(String(course._id))) {
      Alert.alert("Already completed", "You have already completed this course.");
      return;
    }
    try {
      await api.post(`/users/enrollments/${course._id}`);
      setEnrollments((prev) => [...prev, {
        courseId: String(course._id),
        name: course.title, code: course.code,
        yearId: course.yearId, credits: course.creditHours || 3,
        progress: 0, nextItem: "Getting Started",
      }]);
      Alert.alert("Enrolled!", `You joined ${course.title}`);
    } catch (e) {
      Alert.alert("Failed", e.message);
    }
  };

  return (
    <Screen>
      <Text style={s.pageTitle}>All Courses</Text>
      <ErrorBox message={error} />

      {/* Year filter */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {["1", "2", "3", "4"].map((y) => (
          <TouchableOpacity
            key={y}
            onPress={() => setSelectedYear(y)}
            style={{ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", backgroundColor: selectedYear === y ? C.blue : C.white, borderWidth: 1, borderColor: selectedYear === y ? C.blue : C.border }}
          >
            <Text style={{ fontWeight: "700", fontSize: 12, color: selectedYear === y ? "#fff" : C.slate600 }}>Year {y}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Card><Text style={{ color: C.slate500 }}>Loading courses…</Text></Card>
      ) : yearCourses.length === 0 ? (
        <EmptyState icon="📚" title={`No courses for Year ${selectedYear}`} subtitle="No published courses yet." />
      ) : (
        yearCourses.map((course) => {
          const enrolled    = enrolledIds.has(String(course._id));
          const done        = completedIds.has(String(course._id));
          const enrollment  = enrollments.find((e) => String(e.courseId) === String(course._id));
          return (
            <Card key={course._id} style={done ? { borderColor: C.emeraldBorder } : {}}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "700", color: C.slate900, fontSize: 14 }}>{course.title}</Text>
                  <Text style={{ fontSize: 12, color: C.slate500, marginTop: 2 }}>
                    {course.code} · {course.creditHours} cr · {course.instructor || "TBA"}
                  </Text>
                </View>
                {done ? (
                  <Tag label="Done ✓" color={C.emerald} bg={C.emeraldBg} />
                ) : enrolled ? (
                  <Tag label="Enrolled" color={C.blue} bg={C.blueBg} />
                ) : null}
              </View>

              {enrolled && enrollment && (
                <View style={{ marginTop: 8 }}>
                  <ProgressBar value={enrollment.progress} />
                  <Text style={{ fontSize: 11, color: C.slate500, marginTop: 3 }}>
                    {enrollment.progress}% · {done ? "Completed ✓" : `Next: ${enrollment.nextItem}`}
                  </Text>
                </View>
              )}

              {!enrolled && !done && (
                <View style={{ marginTop: 8 }}>
                  <Btn label="Enroll" small onPress={() => handleEnroll(course)} />
                </View>
              )}
            </Card>
          );
        })
      )}
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE — mirrors web Studentprofile.jsx
// ─────────────────────────────────────────────────────────────────────────────
export function ProfileScreen() {
  const { dbUser, logout } = useAuth();
  const [form, setForm] = useState({
    name:    dbUser?.name    || "",
    email:   dbUser?.email   || "",
    college: dbUser?.college || "",
    phone:   dbUser?.phone   || "",
    bio:     dbUser?.bio     || "",
  });
  const [editMode, setEditMode] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState("");
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    api.get("/users/enrollments")
      .then((r) => setEnrollments(safeArray(r)))
      .catch(() => {});
  }, []);

  const completed    = enrollments.filter((e) => e.progress >= 100);
  const totalCredits = completed.reduce((s, e) => s + (e.credits || 0), 0);
  const totalPossible = 168;
  const progressPct  = Math.min(100, Math.round((totalCredits / totalPossible) * 100));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put("/users/profile", { name: form.name, phone: form.phone, college: form.college });
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const INFO_ROWS = [
    { label: "Email",   key: "email",   readOnly: true  },
    { label: "College", key: "college", readOnly: false },
    { label: "Phone",   key: "phone",   readOnly: false },
    { label: "Role",    key: null,      readOnly: true, value: dbUser?.role ? dbUser.role.charAt(0).toUpperCase() + dbUser.role.slice(1) : "Student" },
  ];

  return (
    <Screen>
      {/* Profile header card */}
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Avatar name={form.name || "S"} size={56} />
          <View style={{ flex: 1 }}>
            {editMode ? (
              <TextInput
                value={form.name}
                onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                style={[s.input, { marginBottom: 0, fontWeight: "700", fontSize: 16 }]}
              />
            ) : (
              <Text style={{ fontWeight: "800", fontSize: 17, color: C.slate900 }}>{form.name || "Student"}</Text>
            )}
            <Text style={{ fontSize: 12, color: C.blue, fontWeight: "600", marginTop: 2 }}>{form.email}</Text>
            <Text style={{ fontSize: 11, color: C.slate500, marginTop: 1, textTransform: "capitalize" }}>{dbUser?.role || "student"}</Text>
          </View>
        </View>

        <Divider />

        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
          {saved && <Text style={{ fontSize: 12, color: C.emerald, fontWeight: "600" }}>✓ Saved!</Text>}
          {editMode ? (
            <View style={{ flexDirection: "row", gap: 8, flex: 1 }}>
              <View style={{ flex: 1 }}>
                <Btn label="Cancel" variant="outline" small onPress={() => setEditMode(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Btn label={saving ? "Saving…" : "Save"} small disabled={saving} onPress={handleSave} />
              </View>
            </View>
          ) : (
            <Btn label="✏️  Edit Profile" variant="outline" small onPress={() => setEditMode(true)} />
          )}
        </View>
      </Card>

      <ErrorBox message={error} />

      {/* Academic overview */}
      <Card>
        <SectionLabel>Academic Overview</SectionLabel>
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <Pill label="Credits Earned"    value={totalCredits} color={C.blue}    />
          <Pill label="Courses Completed" value={completed.length} color={C.emerald} />
          <Pill label="Total Enrolled"    value={enrollments.length} color={C.amber}   />
        </View>
        <Text style={{ fontSize: 12, color: C.slate600, marginBottom: 6 }}>
          Degree Progress · <Text style={{ fontWeight: "700", color: C.slate900 }}>{progressPct}%</Text>
        </Text>
        <ProgressBar value={progressPct} height={8} />
      </Card>

      {/* Personal info */}
      <Card>
        <SectionLabel>Personal Information</SectionLabel>
        {INFO_ROWS.map((row) => (
          <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: C.slate500, width: 70 }}>{row.label}</Text>
            {editMode && !row.readOnly ? (
              <TextInput
                value={form[row.key]}
                onChangeText={(v) => setForm((p) => ({ ...p, [row.key]: v }))}
                style={[s.input, { flex: 1, marginLeft: 8 }]}
                autoCapitalize="none"
              />
            ) : (
              <Text style={{ fontSize: 13, fontWeight: "600", color: C.slate900, flex: 1, textAlign: "right" }}>
                {row.value ?? form[row.key] ?? "—"}
              </Text>
            )}
          </View>
        ))}
      </Card>

      {/* Completed courses */}
      {completed.length > 0 && (
        <Card>
          <SectionLabel>Completed Courses</SectionLabel>
          {completed.slice(0, 5).map((e, i) => (
            <View key={e.courseId || i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: i > 0 ? 8 : 4 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "600", color: C.slate900, fontSize: 13 }} numberOfLines={1}>{e.name}</Text>
                <Text style={{ fontSize: 11, color: C.slate500, marginTop: 1 }}>{e.code} · Year {e.yearId} · {e.credits || 0} cr</Text>
              </View>
              <Tag label="✓" color={C.emerald} bg={C.emeraldBg} />
            </View>
          ))}
          {completed.length > 5 && (
            <Text style={{ fontSize: 12, color: C.slate400, marginTop: 8 }}>+{completed.length - 5} more</Text>
          )}
        </Card>
      )}

      {/* Logout */}
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

  const STAT_CARDS = [
    { label: "Total Students",   value: stats.totalStudents   ?? "—", color: C.blue    },
    { label: "Total Mentors",    value: stats.totalMentors    ?? "—", color: C.emerald },
    { label: "Active Courses",   value: stats.activeCourses   ?? "—", color: C.amber   },
    { label: "Pending Approvals",value: stats.pendingApprovals?? "—", color: C.rose    },
  ];

  return (
    <Screen>
      <Text style={s.pageTitle}>Admin Overview</Text>
      <ErrorBox message={error} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {STAT_CARDS.map((sc) => (
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
  const [pending, setPending] = useState([]);
  const [mine,    setMine]    = useState([]);
  const [selected, setSelected] = useState(null);
  const [action,   setAction]   = useState("approve");
  const [feedback, setFeedback] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [error,    setError]    = useState("");

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
                <Btn
                  label={action === "approve" ? "Approve" : "Reject"}
                  variant={action === "approve" ? "primary" : "danger"}
                  onPress={async () => {
                    try {
                      if (action === "approve") await endpoints.mentor.approveMaterial(selected._id, { feedback });
                      else await endpoints.mentor.rejectMaterial(selected._id);
                      setPending((prev) => prev.filter((m) => m._id !== selected._id));
                      setModalOpen(false);
                    } catch (e) { Alert.alert("Failed", e.message); }
                  }}
                />
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
              <Tag label={m.status || "Draft"} color={m.status === "Active" ? C.emerald : C.amber}
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
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <Screen>
      <Text style={s.pageTitle}>Students</Text>
      <ErrorBox message={error} />
      <Field label="" value={search} onChangeText={setSearch} placeholder="🔍 Search by name or email…" />
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
              <Tag label={u.status || "Active"} color={u.status === "Active" ? C.emerald : C.amber}
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
            } catch (e) { Alert.alert("Error", e.message); } finally { setSaving(false); }
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
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  input: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: C.slate900,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 10,
  },
});