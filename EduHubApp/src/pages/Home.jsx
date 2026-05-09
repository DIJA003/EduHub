import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ProgressBar, Tag, safeArray, useColors } from "../components/UI";

// ── Animated stat card ────────────────────────────────────────────────────────
function StatCard({ value, label, icon, color, bg, delay = 0 }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, delay, useNativeDriver: true, tension: 60, friction: 8 }).start();
  }, []);
  return (
    <Animated.View style={{
      flex: 1,
      opacity: anim,
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
    }}>
      <View style={{ backgroundColor: bg, borderRadius: 18, padding: 14, alignItems: "center", gap: 4, minHeight: 90, justifyContent: "center" }}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
        <Text style={{ fontSize: 26, fontWeight: "900", color, letterSpacing: -0.5 }}>{value}</Text>
        <Text style={{ fontSize: 10, fontWeight: "700", color, opacity: 0.7, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</Text>
      </View>
    </Animated.View>
  );
}

// ── Course progress row ───────────────────────────────────────────────────────
function CourseRow({ course, index, c }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, delay: 100 + index * 80, duration: 350, useNativeDriver: true }).start();
  }, []);
  const done = course.progress >= 100;
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12,
        borderBottomWidth: 1, borderColor: c.border }}>
        {/* Circle progress indicator */}
        <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center",
          backgroundColor: done ? c.emeraldBg : c.blueBg,
          borderWidth: 2, borderColor: done ? c.emerald : c.blue }}>
          <Text style={{ fontSize: 11, fontWeight: "900", color: done ? c.emerald : c.blue }}>
            {done ? "✓" : `${course.progress}%`}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", color: c.text, fontSize: 13, marginBottom: 4 }} numberOfLines={1}>
            {course.name}
          </Text>
          <ProgressBar value={course.progress} height={5} />
          {!done && (
            <Text style={{ fontSize: 10, color: c.textMuted, marginTop: 3 }}>
              Next · {course.nextItem}
            </Text>
          )}
        </View>
        {done && <Tag label="Done" color={c.emerald} bg={c.emeraldBg} />}
      </View>
    </Animated.View>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, c }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12, marginTop: 4 }}>
      <View>
        <Text style={{ fontSize: 17, fontWeight: "800", color: c.text, letterSpacing: -0.3 }}>{title}</Text>
        {subtitle ? <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 1 }}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StudentHome() {
  const { dbUser } = useAuth();
  const c          = useColors();
  const insets     = useSafeAreaInsets();

  const [enrollments, setEnrollments] = useState([]);
  const [materials,   setMaterials]   = useState([]);
  const [loading,     setLoading]     = useState(true);

  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Promise.all([
      api.get("/users/enrollments").then((r) => setEnrollments(safeArray(r))).catch(() => {}),
      api.get("/users/materials").then((r) => setMaterials(safeArray(r))).catch(() => {}),
    ]).finally(() => {
      setLoading(false);
      Animated.spring(heroAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 9 }).start();
    });
  }, []);

  const firstName    = dbUser?.name?.split(" ")[0] || "Student";
  const inProgress   = enrollments.filter((e) => e.progress > 0 && e.progress < 100);
  const completed    = enrollments.filter((e) => e.progress >= 100);
  const notStarted   = enrollments.filter((e) => e.progress === 0);
  const totalCredits = completed.reduce((s, e) => s + (e.credits || 0), 0);
  const degreeGoal   = 168;
  const degreePct    = Math.min(100, Math.round((totalCredits / degreeGoal) * 100));

  // Materials with new/approved status
  const newMaterials     = materials.filter((m) => m.status === "approved").slice(0, 3);
  const pendingMaterials = materials.filter((m) => m.status === "pending");

  // Greeting based on time
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: c.blue,
        paddingTop: insets.top + 24,
        paddingBottom: 32,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
      }}>
        <Animated.View style={{
          opacity: heroAnim,
          transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
        }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>
            {greeting} 👋
          </Text>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#fff", letterSpacing: -0.8, lineHeight: 34 }}>
            {firstName}
          </Text>
          {dbUser?.college && dbUser.college !== "—" ? (
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{dbUser.college}</Text>
          ) : null}

          {/* Degree progress bar inside hero */}
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Degree Progress
              </Text>
              <Text style={{ fontSize: 11, fontWeight: "900", color: "#fff" }}>{degreePct}%</Text>
            </View>
            <View style={{ height: 7, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 99, overflow: "hidden" }}>
              <View style={{ height: 7, width: `${degreePct}%`, backgroundColor: "#fff", borderRadius: 99 }} />
            </View>
            <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 5 }}>
              {totalCredits} / {degreeGoal} credits earned
            </Text>
          </View>
        </Animated.View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 20 }}>

        {/* ── Stat cards ─────────────────────────────────────────────────── */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatCard value={enrollments.length} label="Enrolled"    icon="📚" color={c.blue}    bg={c.blueBg}    delay={0}   />
          <StatCard value={inProgress.length}  label="In Progress" icon="⚡" color={c.amber}   bg={c.amberBg}   delay={80}  />
          <StatCard value={completed.length}   label="Completed"   icon="🏆" color={c.emerald} bg={c.emeraldBg} delay={160} />
        </View>

        {/* ── Material notifications ──────────────────────────────────────── */}
        {(newMaterials.length > 0 || pendingMaterials.length > 0) && (
          <View>
            <SectionHeader
              title="Materials"
              subtitle={pendingMaterials.length > 0 ? `${pendingMaterials.length} awaiting review` : "All up to date"}
              c={c}
            />
            <View style={{ backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.border, overflow: "hidden" }}>
              {newMaterials.map((m, i) => (
                <View key={m._id || m.id || i} style={{
                  flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
                  borderBottomWidth: i < newMaterials.length - 1 ? 1 : 0,
                  borderColor: c.border,
                }}>
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: c.emeraldBg, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 18 }}>✅</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700", color: c.text, fontSize: 13 }} numberOfLines={1}>{m.title}</Text>
                    <Text style={{ fontSize: 11, color: c.textSub, marginTop: 1 }}>{m.course} · Approved</Text>
                    {m.mentorFeedback ? (
                      <Text style={{ fontSize: 11, color: c.textMuted, fontStyle: "italic", marginTop: 2 }} numberOfLines={1}>
                        "{m.mentorFeedback}"
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
              {pendingMaterials.length > 0 && (
                <View style={{
                  flexDirection: "row", alignItems: "center", gap: 12, padding: 14,
                  borderTopWidth: newMaterials.length > 0 ? 1 : 0, borderColor: c.border,
                }}>
                  <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: c.amberBg, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 18 }}>⏳</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700", color: c.text, fontSize: 13 }}>
                      {pendingMaterials.length} material{pendingMaterials.length > 1 ? "s" : ""} pending review
                    </Text>
                    <Text style={{ fontSize: 11, color: c.textSub, marginTop: 1 }}>Mentor will review soon</Text>
                  </View>
                  <Tag label="Pending" color={c.amber} bg={c.amberBg} />
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── In-progress courses ─────────────────────────────────────────── */}
        {!loading && inProgress.length > 0 && (
          <View>
            <SectionHeader
              title="Continue Learning"
              subtitle={`${inProgress.length} course${inProgress.length > 1 ? "s" : ""} in progress`}
              c={c}
            />
            <View style={{ backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14 }}>
              {inProgress.map((course, i) => (
                <CourseRow key={course.courseId || i} course={course} index={i} c={c} />
              ))}
            </View>
          </View>
        )}

        {/* ── Completed courses ───────────────────────────────────────────── */}
        {!loading && completed.length > 0 && (
          <View>
            <SectionHeader
              title="Completed"
              subtitle={`${completed.length} course${completed.length > 1 ? "s" : ""} · ${totalCredits} credits`}
              c={c}
            />
            <View style={{ backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.emeraldBorder, paddingHorizontal: 14 }}>
              {completed.slice(0, 4).map((course, i) => (
                <CourseRow key={course.courseId || i} course={course} index={i} c={c} />
              ))}
              {completed.length > 4 && (
                <View style={{ paddingVertical: 12, alignItems: "center" }}>
                  <Text style={{ fontSize: 12, color: c.textMuted, fontWeight: "600" }}>+{completed.length - 4} more completed</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Not started ─────────────────────────────────────────────────── */}
        {!loading && notStarted.length > 0 && (
          <View>
            <SectionHeader title="Not Started Yet" subtitle={`${notStarted.length} enrolled`} c={c} />
            <View style={{ backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14 }}>
              {notStarted.slice(0, 3).map((course, i) => (
                <CourseRow key={course.courseId || i} course={course} index={i} c={c} />
              ))}
            </View>
          </View>
        )}

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {!loading && enrollments.length === 0 && (
          <View style={{ backgroundColor: c.card, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 32, alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 40 }}>🎓</Text>
            <Text style={{ fontWeight: "800", color: c.text, fontSize: 16, textAlign: "center" }}>Ready to start?</Text>
            <Text style={{ color: c.textSub, fontSize: 13, textAlign: "center", lineHeight: 19 }}>
              Head to the Academic Years tab to browse and enroll in your first course.
            </Text>
          </View>
        )}

        {loading && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Text style={{ color: c.textMuted, fontSize: 13 }}>Loading your courses…</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}