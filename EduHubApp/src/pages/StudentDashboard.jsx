import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Screen, Card, SectionLabel, Tag, Pill, ProgressBar,
  ErrorBox, EmptyState, ConfirmModal, Btn, Avatar,
  safeArray, storeJson, loadJson, useColors,
} from "../components/UI";

const UNLOCK_THRESHOLDS = { 1: 0, 2: 39, 3: 78, 4: 117 };
const ACTIVITY_KEY      = "eduhub-mobile-activity-v2";

function computeEarnedCredits(enrolled) {
  return (enrolled || []).reduce((s, c) => s + (c.progress >= 100 ? c.credits || 0 : 0), 0);
}
function buildYearsState(dbYears, coursesPerYear, enrollments) {
  const result = {};
  for (const yid of ["1", "2", "3", "4"]) {
    const ynum            = Number(yid);
    const dbYear          = dbYears.find((y) => String(y.year) === yid);
    const yearEnrollments = enrollments.filter((e) => String(e.yearId || "1") === yid);
    const enrolled = yearEnrollments.map((e) => ({
      id: e.id, name: e.name || "Course", code: e.code || "",
      credits: e.credits || 3, progress: e.progress || 0,
      sectionsCompleted: e.sectionsCompleted || 0,
      nextItem: e.nextItem || "Getting Started",
      mongoId: e.courseId, yearId: yid,
    }));
    const enrolledMongoIds = new Set(enrolled.map((c) => String(c.mongoId)));
    const available = (coursesPerYear[yid] || [])
      .filter((c) => !enrolledMongoIds.has(String(c._id)))
      .map((c) => ({
        id: String(c._id), name: c.title, code: c.code,
        credits: c.creditHours || 3, instructor: c.instructor || "TBA",
        mongoId: String(c._id), yearId: yid,
      }));
    const earnedCredits    = computeEarnedCredits(enrolled);
    const totalEarnedSoFar = Object.values(result).reduce((s, y) => s + (y.earnedCredits ?? 0), 0) + earnedCredits;
    const threshold        = UNLOCK_THRESHOLDS[ynum] ?? 0;
    const unlocked         = ynum === 1 || enrolled.length > 0 || totalEarnedSoFar >= threshold;
    result[yid] = { enrolled, available, unlocked, earnedCredits, totalCredits: dbYear?.totalCredits || 42 };
  }
  return result;
}

function addActivity(setLog, entry) {
  setLog((prev) => {
    const next = [{ id: Date.now() + Math.random(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), ...entry }, ...prev].slice(0, 100);
    storeJson(ACTIVITY_KEY, next);
    return next;
  });
}

const DASH_TABS = [
  { id: "dashboard", label: "Overview" },
  { id: "courses",   label: "Courses"  },
];

const STATUS_COLOR = { pending: null, approved: null, rejected: null };
const STATUS_LABEL = { pending: "⏳ Pending review", approved: "✅ Approved", rejected: "❌ Rejected" };

export default function StudentDashboard() {
  const { dbUser } = useAuth();
  const c = useColors();

  // live STATUS colors — resolved after render when c is available
  STATUS_COLOR.pending  = c.amber;
  STATUS_COLOR.approved = c.emerald;
  STATUS_COLOR.rejected = c.rose;

  const [dbYears,        setDbYears]        = useState([]);
  const [coursesPerYear, setCoursesPerYear] = useState({});
  const [enrollments,    setEnrollments]    = useState([]);
  const [years,          setYears]          = useState({});
  const [myMaterials,    setMyMaterials]    = useState([]);
  const [activeTab,      setActiveTab]      = useState("dashboard");
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [activityLog,    setActivityLog]    = useState([]);
  const [confirmUnenroll, setConfirmUnenroll] = useState(null);

  const prevEnrolled  = useRef([]);
  const prevMaterials = useRef([]);
  const isMounted     = useRef(false);

  useEffect(() => { loadJson(ACTIVITY_KEY).then((v) => { if (v) setActivityLog(v); }); }, []);

  const loadAll = useCallback(async () => {
    try {
      const [yrRes, enrRes, matRes, c1, c2, c3, c4] = await Promise.all([
        api.get("/academic-years"),
        api.get("/users/enrollments"),
        api.get("/users/materials"),
        api.get("/courses/year/1"), api.get("/courses/year/2"),
        api.get("/courses/year/3"), api.get("/courses/year/4"),
      ]);
      const dby  = safeArray(yrRes);
      const enrs = safeArray(enrRes);
      const cpy  = { "1": safeArray(c1), "2": safeArray(c2), "3": safeArray(c3), "4": safeArray(c4) };
      setDbYears(dby); setEnrollments(enrs); setCoursesPerYear(cpy);
      setMyMaterials(safeArray(matRes));
      setYears(buildYearsState(dby, cpy, enrs));
      setError("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, []);

  // ── Enrollment activity tracking ──────────────────────────────────────────
  useEffect(() => {
    if (!isMounted.current) { prevEnrolled.current = enrollments; return; }
    const prev = prevEnrolled.current;
    enrollments.forEach((course) => {
      if (!prev.some((p) => p.courseId === course.courseId))
        addActivity(setActivityLog, { icon: "📚", text: `Enrolled in "${course.name}"`, color: c.emerald });
    });
    prev.forEach((p) => {
      if (!enrollments.some((course) => course.courseId === p.courseId))
        addActivity(setActivityLog, { icon: "🗑️", text: `Unenrolled from "${p.name}"`, color: c.rose });
    });
    enrollments.forEach((course) => {
      const p = prev.find((p) => p.courseId === course.courseId);
      if (p && course.progress === 100 && p.progress < 100)
        addActivity(setActivityLog, { icon: "🎉", text: `Completed "${course.name}"! +${course.credits || 0} credits`, color: c.emerald });
    });
    prevEnrolled.current = enrollments;
  }, [enrollments]);

  // ── Materials activity tracking (web → mobile notifications) ─────────────
  useEffect(() => {
    if (!isMounted.current) { prevMaterials.current = myMaterials; isMounted.current = true; return; }
    const prev = prevMaterials.current;
    myMaterials.forEach((m) => {
      const mid = m._id || m.id;
      const old = prev.find((p) => (p._id || p.id) === mid);
      // New material appeared (uploaded from web)
      if (!old)
        addActivity(setActivityLog, { icon: "📎", text: `New material: "${m.title}"`, color: c.blue });
      // Status changed (mentor reviewed on web)
      else if (old.status !== m.status) {
        if (m.status === "approved")
          addActivity(setActivityLog, { icon: "✅", text: `"${m.title}" was approved by mentor`, color: c.emerald });
        else if (m.status === "rejected")
          addActivity(setActivityLog, { icon: "❌", text: `"${m.title}" was rejected`, color: c.rose });
      }
    });
    prevMaterials.current = myMaterials;
  }, [myMaterials]);

  const handleEnroll = async (course) => {
    try { await api.post(`/users/enrollments/${course.mongoId || course._id || course.id}`); await loadAll(); }
    catch (e) { Alert.alert("Failed", e.message); }
  };
  const handleUnenroll = async () => {
    if (!confirmUnenroll) return;
    try { await api.delete(`/users/enrollments/${confirmUnenroll.mongoId || confirmUnenroll.courseId}`); setConfirmUnenroll(null); await loadAll(); }
    catch (e) { Alert.alert("Failed", e.message); }
  };

  const enrolledCourses  = Object.values(years).flatMap((y) => y.enrolled || []);
  const availableCourses = Object.entries(years).filter(([, y]) => y.unlocked).flatMap(([, y]) => y.available || []);
  const inProgress       = enrolledCourses.filter((e) => e.progress > 0 && e.progress < 100);
  const completed        = enrolledCourses.filter((e) => e.progress >= 100);
  const totalCredits     = completed.reduce((s, e) => s + (e.credits || 0), 0);
  const firstName        = dbUser?.name?.split(" ")[0] || "Student";

  // New materials from web (approved ones the student should know about)
  const recentMaterials  = [...myMaterials].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const pendingCount     = myMaterials.filter((m) => m.status === "pending").length;
  const approvedCount    = myMaterials.filter((m) => m.status === "approved").length;

  return (
    <Screen>
      <ConfirmModal visible={Boolean(confirmUnenroll)} title="Unenroll?" danger
        message={confirmUnenroll ? `Remove "${confirmUnenroll.name}" from your enrollments?` : ""}
        confirmLabel="Unenroll" onConfirm={handleUnenroll} onCancel={() => setConfirmUnenroll(null)} />

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Avatar name={dbUser?.name || "S"} />
        <View>
          <Text style={{ fontWeight: "800", fontSize: 16, color: c.text }}>Welcome, {firstName} 👋</Text>
          <Text style={{ fontSize: 12, color: c.textSub, marginTop: 1, textTransform: "capitalize" }}>{dbUser?.role || "student"}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {DASH_TABS.map((tab) => (
            <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
                backgroundColor: activeTab === tab.id ? c.blue : c.card,
                borderWidth: 1, borderColor: activeTab === tab.id ? c.blue : c.border }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: activeTab === tab.id ? "#fff" : c.textSub }}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ErrorBox message={error} />

      {loading ? <Card><Text style={{ color: c.textSub, textAlign: "center" }}>Loading…</Text></Card> : (
        <>
          {activeTab === "dashboard" && (
            <>
              {/* Stats row */}
              <Card>
                <SectionLabel>Overview</SectionLabel>
                <View style={{ flexDirection: "row" }}>
                  <Pill label="Enrolled"    value={enrolledCourses.length} color={c.blue}    />
                  <Pill label="In Progress" value={inProgress.length}      color={c.amber}   />
                  <Pill label="Completed"   value={completed.length}       color={c.emerald} />
                  <Pill label="Credits"     value={totalCredits}           color={c.blue}    />
                </View>
              </Card>

              {/* Continue learning */}
              {inProgress.length > 0 && (
                <Card>
                  <SectionLabel>Continue Learning</SectionLabel>
                  {inProgress.slice(0, 3).map((e, i) => (
                    <View key={e.id || i} style={{ marginTop: i > 0 ? 12 : 4 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                        <Text style={{ fontWeight: "700", color: c.text, flex: 1, marginRight: 8 }} numberOfLines={1}>{e.name}</Text>
                        <Text style={{ fontWeight: "700", color: c.blue, fontSize: 12 }}>{e.progress}%</Text>
                      </View>
                      <ProgressBar value={e.progress} />
                      <Text style={{ fontSize: 11, color: c.textSub, marginTop: 3 }}>Next: {e.nextItem}</Text>
                    </View>
                  ))}
                </Card>
              )}

              {/* ── Recent Materials (web-uploaded, shows mentor review status) ── */}
              <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <SectionLabel>Recent Materials</SectionLabel>
                  {myMaterials.length > 0 && (
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      {pendingCount  > 0 && <Tag label={`${pendingCount} pending`}  color={c.amber}   bg={c.amberBg}   />}
                      {approvedCount > 0 && <Tag label={`${approvedCount} approved`} color={c.emerald} bg={c.emeraldBg} />}
                    </View>
                  )}
                </View>
                {myMaterials.length === 0 ? (
                  <Text style={{ color: c.textSub, fontSize: 13 }}>No materials yet. Your mentor can upload materials for you.</Text>
                ) : (
                  recentMaterials.map((m, i) => (
                    <View key={m._id || m.id || i}
                      style={{ flexDirection: "row", alignItems: "center", gap: 12,
                        paddingVertical: 10,
                        borderBottomWidth: i < recentMaterials.length - 1 ? 1 : 0,
                        borderColor: c.border }}>
                      {/* Status dot */}
                      <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
                        backgroundColor: m.status === "approved" ? c.emeraldBg : m.status === "rejected" ? c.roseBg : c.amberBg }}>
                        <Text style={{ fontSize: 16 }}>
                          {m.status === "approved" ? "✅" : m.status === "rejected" ? "❌" : "⏳"}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "700", color: c.text, fontSize: 13 }} numberOfLines={1}>{m.title}</Text>
                        <Text style={{ fontSize: 11, color: c.textSub, marginTop: 1 }}>{m.course} · {m.type}</Text>
                        {m.mentorFeedback ? (
                          <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 2, fontStyle: "italic" }} numberOfLines={1}>
                            "{m.mentorFeedback}"
                          </Text>
                        ) : null}
                      </View>
                      <Text style={{ fontSize: 11, fontWeight: "700",
                        color: STATUS_COLOR[m.status] || c.textMuted }}>
                        {m.status === "approved" ? "Approved" : m.status === "rejected" ? "Rejected" : "Pending"}
                      </Text>
                    </View>
                  ))
                )}
              </Card>

              {/* Activity log */}
              <Card>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <SectionLabel>Activity Log</SectionLabel>
                  {activityLog.length > 0 && (
                    <TouchableOpacity onPress={() => { setActivityLog([]); storeJson(ACTIVITY_KEY, []); }}>
                      <Text style={{ fontSize: 11, color: c.rose, fontWeight: "600" }}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {activityLog.length === 0 ? (
                  <Text style={{ color: c.textSub, fontSize: 13 }}>No activity yet.</Text>
                ) : (
                  activityLog.slice(0, 15).map((entry) => (
                    <View key={entry.id} style={{ flexDirection: "row", gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderColor: c.border }}>
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontSize: 15 }}>{entry.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, color: entry.color, fontWeight: "600" }}>{entry.text}</Text>
                        <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 1 }}>{entry.time}</Text>
                      </View>
                    </View>
                  ))
                )}
              </Card>
            </>
          )}

          {activeTab === "courses" && (
            <>
              <SectionLabel>Enrolled ({enrolledCourses.length})</SectionLabel>
              {enrolledCourses.length === 0
                ? <EmptyState icon="📚" title="No courses" subtitle="Enroll from available below." />
                : enrolledCourses.map((e, i) => (
                  <Card key={e.id || i} style={e.progress >= 100 ? { borderColor: c.emeraldBorder } : {}}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={{ fontWeight: "700", color: c.text, fontSize: 14 }}>{e.name}</Text>
                        <Text style={{ fontSize: 12, color: c.textSub, marginTop: 2 }}>{e.code} · Year {e.yearId} · {e.credits} cr</Text>
                      </View>
                      {e.progress >= 100
                        ? <Tag label="Done ✓" color={c.emerald} bg={c.emeraldBg} />
                        : <Text style={{ fontWeight: "700", color: c.blue, fontSize: 13 }}>{e.progress}%</Text>}
                    </View>
                    <ProgressBar value={e.progress} height={6} />
                    <Text style={{ fontSize: 11, color: c.textSub, marginTop: 4 }}>
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
              }

              <SectionLabel>Available to Enroll ({availableCourses.length})</SectionLabel>
              {availableCourses.length === 0
                ? <Card bg={c.surface}><Text style={{ color: c.textSub, fontSize: 13 }}>No additional courses available.</Text></Card>
                : availableCourses.map((course) => (
                  <Card key={course.id}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "700", color: c.text, fontSize: 14 }}>{course.name}</Text>
                        <Text style={{ fontSize: 12, color: c.textSub, marginTop: 2 }}>Year {course.yearId} · {course.code} · {course.credits} cr</Text>
                      </View>
                      <Btn label="Enroll" small onPress={() => handleEnroll(course)} />
                    </View>
                  </Card>
                ))
              }
            </>
          )}
        </>
      )}
    </Screen>
  );
}