import { useCallback, useEffect, useState } from "react";
import { Alert, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Screen, Card, SectionLabel, Tag, Pill, ProgressBar,
  Divider, ErrorBox, EmptyState, ConfirmModal, Btn, safeArray, useColors,
} from "../components/UI";

// ─── Locking logic ────────────────────────────────────────────────────────────
const UNLOCK_THRESHOLDS = { 1: 0, 2: 39, 3: 78, 4: 117 };
const YEAR_META = {
  1: { title: "Year One — Foundations",             desc: "Foundational concepts: computing, mathematics, and logic." },
  2: { title: "Year Two — Core Specializations",    desc: "Core engineering principles and advanced programming foundations." },
  3: { title: "Year Three — Advanced Applications", desc: "Advanced applications: software engineering, cloud, and AI." },
  4: { title: "Year Four — Research & Thesis",      desc: "Capstone, research, and industry placement." },
};

function computeEarnedCredits(enrolled) {
  return (enrolled || []).reduce((s, c) => s + (c.progress >= 100 ? c.credits || 0 : 0), 0);
}
function computeYearStatus(enrolled) {
  if (!enrolled?.length) return "Not Started";
  if (enrolled.every((c) => c.progress >= 100)) return "Completed";
  return "In Progress";
}
function buildYearsState(dbYears, coursesPerYear, enrollments) {
  const result = {};
  for (const yid of ["1", "2", "3", "4"]) {
    const ynum   = Number(yid);
    const dbYear = dbYears.find((y) => String(y.year) === yid);
    const yearEnrollments = enrollments.filter((e) => String(e.yearId || "1") === yid);
    const enrolled = yearEnrollments.map((e) => ({
      id: e.id, name: e.name || "Course", code: e.code || "",
      credits: e.credits || 3, progress: e.progress || 0,
      sectionsCompleted: e.sectionsCompleted || 0,
      nextItem: e.nextItem || "Getting Started",
      mongoId: e.courseId, instructor: e.instructor || "", yearId: yid,
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
    const totalEarnedSoFar = Object.values(result).reduce((sum, y) => sum + (y.earnedCredits ?? 0), 0) + earnedCredits;
    const threshold        = UNLOCK_THRESHOLDS[ynum] ?? 0;
    const unlocked         = ynum === 1 || enrolled.length > 0 || totalEarnedSoFar >= threshold;
    const status           = unlocked ? computeYearStatus(enrolled) : "Locked";
    result[yid] = {
      title: dbYear?.name || YEAR_META[ynum]?.title || `Year ${ynum}`,
      desc: YEAR_META[ynum]?.desc || "", status, unlocked, earnedCredits,
      totalCredits: dbYear?.totalCredits || 42, enrolled, available,
    };
  }
  return result;
}

// ─── CoursePlayer (inline) ────────────────────────────────────────────────────
function CoursePlayer({ course, yearId, onBack }) {
  const c = useColors();

  const [sections,        setSections]        = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionsError,   setSectionsError]   = useState("");
  const [viewIndex,       setViewIndex]       = useState(0);
  const [started,         setStarted]         = useState(false);
  const [mode,            setMode]            = useState("study");
  const [selectedSecIdx,  setSelectedSecIdx]  = useState(0);
  const [myMaterials,     setMyMaterials]     = useState([]);
  const [uploadLoading,   setUploadLoading]   = useState(false);
  const [confirmUnenroll, setConfirmUnenroll] = useState(false);

  const mongoId        = course.mongoId || course.courseId || course.id;
  const progress       = course.progress || 0;
  const secDone        = course.sectionsCompleted ?? Math.round((progress / 100) * Math.max(sections.length, 1));
  const courseComplete = progress >= 100;
  const isStarted      = started || progress > 0;
  const n              = sections.length;

  // ── Fetch sections from backend ──────────────────────────────────────────
  useEffect(() => {
    if (!mongoId) { setSectionsLoading(false); return; }
    setSectionsLoading(true);
    setSectionsError("");
    api.get(`/sections/course/${mongoId}`)
      .then((r) => {
        // Backend returns { success, data: [...] }  OR  plain array
        const raw = safeArray(r?.data ?? r);
        setSections(raw.map((sec) => ({
          id:      sec._id,
          title:   sec.title   || "Untitled",
          summary: sec.summary || "",
          body:    sec.body    || "",
        })));
      })
      .catch((e) => {
        console.warn("sections fetch error:", e.message);
        setSectionsError(e.message);
        setSections([]);
      })
      .finally(() => setSectionsLoading(false));
  }, [mongoId]);

  // Cap viewIndex once sections load
  useEffect(() => {
    if (!n) return;
    const cap = courseComplete ? n - 1 : Math.max(0, Math.min(secDone, n - 1));
    setViewIndex((v) => Math.min(v, cap));
  }, [n, secDone, courseComplete]);

  // Load student materials for this course
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
    setViewIndex(done ? n - 1 : Math.min(nextDone, n - 1));
    onBack({ refresh: true });
  };

  const handleUploadMaterial = async () => {
    const sec = sections[selectedSecIdx];
    if (!sec) return;
    setUploadLoading(true);
    try {
      const res = await api.post("/users/materials", {
        title: `Material for ${sec.title}`, course: course.name,
        type: "Other", courseId: mongoId, yearId,
        sectionId: sec.id, sectionLabel: sec.title,
      });
      const m = res?.data || res;
      setMyMaterials((prev) => [
        { id: m._id, title: m.title, courseId: mongoId, sectionLabel: sec.title, status: m.status || "pending", createdAt: m.createdAt },
        ...prev,
      ]);
      Alert.alert("Uploaded!", "Material sent to mentor for review.");
    } catch (e) { Alert.alert("Upload failed", e.message); }
    finally { setUploadLoading(false); }
  };

  const handleRemoveMaterial = async (id) => {
    try {
      await api.delete(`/users/materials/${id}`);
      setMyMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (e) { Alert.alert("Failed", e.message); }
  };

  const handleUnenroll = async () => {
    try {
      await api.delete(`/users/enrollments/${mongoId}`);
      onBack({ refresh: true, unenrolled: course.courseId || course.id });
    } catch (e) { Alert.alert("Failed", e.message); }
  };

  const showNext       = isStarted && !courseComplete && mode === "study" && viewIndex === secDone && secDone < n;
  const currentSection = sections[viewIndex];
  const sectionMats    = myMaterials.filter((m) => m.sectionLabel === sections[selectedSecIdx]?.title);
  const STATUS_COLOR   = { pending: c.amber, approved: c.emerald, rejected: c.rose };
  const STATUS_LABEL   = { pending: "⏳ Pending", approved: "✅ Approved", rejected: "❌ Rejected" };

  return (
    <Screen>
      <ConfirmModal visible={confirmUnenroll} title="Unenroll?" danger
        message={`Remove enrollment from "${course.name}"? You can re-enroll later.`}
        confirmLabel="Unenroll" onConfirm={handleUnenroll} onCancel={() => setConfirmUnenroll(false)} />

      {/* Header */}
      <Card>
        <TouchableOpacity onPress={() => onBack({})} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 }}>
          <Text style={{ color: c.blue, fontWeight: "600", fontSize: 13 }}>← Back to year</Text>
        </TouchableOpacity>
        <SectionLabel>Year {yearId} / {course.code}</SectionLabel>
        <Text style={{ fontSize: 22, fontWeight: "800", color: c.text }}>{course.name}</Text>
        {course.instructor ? <Text style={{ fontSize: 12, color: c.textSub }}>Instructor: {course.instructor}</Text> : null}
        <Divider />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 11, color: c.textSub }}>Progress</Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: c.text }}>{progress}%</Text>
          </View>
          <View style={{ flex: 1, marginHorizontal: 14 }}>
            <ProgressBar value={progress} height={8} />
            <Text style={{ fontSize: 10, color: c.textSub, marginTop: 3 }}>Next: {course.nextItem || "Getting Started"}</Text>
          </View>
          <Btn label="Unenroll" variant="outline" small onPress={() => setConfirmUnenroll(true)} />
        </View>
        {/* Study / Upload toggle */}
        <View style={{ flexDirection: "row", borderWidth: 1, borderColor: c.border, borderRadius: 99, overflow: "hidden", alignSelf: "flex-start", marginTop: 8 }}>
          {["study", "upload"].map((m) => (
            <TouchableOpacity key={m} onPress={() => setMode(m)}
              style={{ paddingHorizontal: 16, paddingVertical: 7, backgroundColor: mode === m ? c.blue : "transparent" }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: mode === m ? "#fff" : c.textSub, textTransform: "capitalize" }}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Section list */}
      <Card>
        <SectionLabel>{sectionsLoading ? "Loading sections…" : `Sections (${n})`}</SectionLabel>
        {sectionsLoading ? (
          <Text style={{ color: c.textSub }}>Loading…</Text>
        ) : sectionsError ? (
          <Text style={{ color: c.rose, fontSize: 13 }}>⚠️ {sectionsError}</Text>
        ) : n === 0 ? (
          <Text style={{ color: c.textSub, fontSize: 13 }}>No sections available yet. Check back later.</Text>
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
                  active ? { backgroundColor: c.blueBg, borderColor: c.blueLight + "88" } : { backgroundColor: c.surface, borderColor: "transparent" },
                  !readable && mode === "study" ? { opacity: 0.4 } : {}]}>
                <Text style={{ fontSize: 14, color: done ? c.emerald : active ? c.blue : c.textMuted, fontWeight: "700", width: 20 }}>
                  {done ? "✓" : `${idx + 1}.`}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", color: c.text, fontSize: 13 }}>{sec.title}</Text>
                  {sec.summary ? <Text style={{ fontSize: 11, color: c.textSub, marginTop: 2 }}>{sec.summary}</Text> : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </Card>

      {/* Study panel */}
      {mode === "study" && (
        <Card>
          {sectionsLoading ? (
            <Text style={{ color: c.textSub, textAlign: "center" }}>Loading sections…</Text>
          ) : sectionsError ? (
            <Text style={{ color: c.rose, fontSize: 13, textAlign: "center" }}>Could not load sections: {sectionsError}</Text>
          ) : n === 0 ? (
            <Text style={{ color: c.textSub, textAlign: "center" }}>No sections yet.</Text>
          ) : !isStarted && !courseComplete ? (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Text style={{ color: c.textSub, textAlign: "center", fontSize: 14 }}>
                This course has {n} section{n !== 1 ? "s" : ""}. When ready, start with the first section.
              </Text>
              <View style={{ marginTop: 16 }}>
                <Btn label="Start" onPress={() => { setStarted(true); setViewIndex(0); }} />
              </View>
            </View>
          ) : (
            <>
              {courseComplete && (
                <Card bg={c.emeraldBg} style={{ borderColor: c.emeraldBorder, marginBottom: 8 }}>
                  <Text style={{ color: "#065F46", fontWeight: "700" }}>🎉 Course complete — review any section below.</Text>
                </Card>
              )}
              <SectionLabel>Section {viewIndex + 1} of {n}</SectionLabel>
              <Text style={{ fontWeight: "700", fontSize: 17, color: c.text }}>{currentSection?.title}</Text>
              {currentSection?.summary ? <Text style={{ fontSize: 13, color: c.textSub, marginTop: 2 }}>{currentSection.summary}</Text> : null}
              <View style={{ backgroundColor: c.surface, borderRadius: 12, padding: 14, marginTop: 10 }}>
                <Text style={{ fontSize: 14, color: c.text, lineHeight: 22 }}>{currentSection?.body || "No content yet."}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
                <Btn label="← Previous" variant="outline" small disabled={viewIndex <= 0} onPress={() => setViewIndex((i) => Math.max(0, i - 1))} />
                {showNext && (
                  <Btn label={secDone >= n - 1 ? "Finish course" : "Next →"} small onPress={handleNext} />
                )}
              </View>
            </>
          )}
        </Card>
      )}

      {/* Upload panel */}
      {mode === "upload" && (
        <Card>
          <SectionLabel>Upload material</SectionLabel>
          <Text style={{ fontSize: 13, color: c.textSub }}>
            Section: <Text style={{ fontWeight: "700", color: c.text }}>{sections[selectedSecIdx]?.title || "—"}</Text>
          </Text>
          <View style={{ marginTop: 10 }}>
            <Btn label={uploadLoading ? "Uploading…" : "📎 Upload for this section"}
              disabled={uploadLoading || !sections[selectedSecIdx]}
              onPress={handleUploadMaterial} />
          </View>
          {sectionMats.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <SectionLabel>Files in this section</SectionLabel>
              {sectionMats.map((m, i) => (
                <View key={m.id || i} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderColor: c.borderLight }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: c.text, fontWeight: "600" }}>{m.title}</Text>
                    <Text style={{ fontSize: 11, color: STATUS_COLOR[m.status] || c.textMuted, marginTop: 2 }}>
                      {STATUS_LABEL[m.status] || m.status}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveMaterial(m.id)}>
                    <Text style={{ fontSize: 12, color: c.rose, fontWeight: "600" }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </Card>
      )}
    </Screen>
  );
}

// ─── AcademicYear main screen ─────────────────────────────────────────────────
export default function AcademicYear() {
  const c = useColors();

  const [years,          setYears]          = useState({});
  const [dbYears,        setDbYears]        = useState([]);
  const [coursesPerYear, setCoursesPerYear] = useState({});
  const [enrollments,    setEnrollments]    = useState([]);
  const [selectedYear,   setSelectedYear]   = useState(null);
  const [playerCourse,   setPlayerCourse]   = useState(null);
  const [loadingInit,    setLoadingInit]    = useState(true);
  const [error,          setError]          = useState("");
  const [confirmUnenroll, setConfirmUnenroll] = useState(null);

  const loadData = useCallback(async () => {
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
      setError("");
    } catch (e) { setError(e.message); }
    finally { setLoadingInit(false); }
  }, []);

  useEffect(() => { loadData(); }, []);

  const totalEarned = Object.values(years).reduce((s, y) => s + (y.earnedCredits ?? 0), 0);

  const handleEnroll = async (course, yearId) => {
    try {
      await api.post(`/users/enrollments/${course.mongoId || course._id || course.id}`);
      const enrs = safeArray(await api.get("/users/enrollments"));
      setEnrollments(enrs);
      setYears(buildYearsState(dbYears, coursesPerYear, enrs));
      Alert.alert("Enrolled!", `You joined ${course.name || course.title}`);
    } catch (e) { Alert.alert("Failed", e.message); }
  };

  const handleUnenroll = async () => {
    if (!confirmUnenroll) return;
    try {
      await api.delete(`/users/enrollments/${confirmUnenroll.mongoId || confirmUnenroll.courseId}`);
      const enrs = safeArray(await api.get("/users/enrollments"));
      setEnrollments(enrs);
      setYears(buildYearsState(dbYears, coursesPerYear, enrs));
      setConfirmUnenroll(null);
    } catch (e) { Alert.alert("Failed", e.message); }
  };

  // ── CoursePlayer view ──────────────────────────────────────────────────────
  if (playerCourse) {
    const enr = enrollments.find((e) => String(e.courseId) === String(playerCourse.mongoId));
    return (
      <CoursePlayer
        course={{ ...playerCourse, progress: enr?.progress || 0, sectionsCompleted: enr?.sectionsCompleted || 0, nextItem: enr?.nextItem || "Getting Started" }}
        yearId={playerCourse.yearId}
        onBack={async ({ refresh }) => { if (refresh) await loadData(); setPlayerCourse(null); }}
      />
    );
  }

  // ── Year detail view ───────────────────────────────────────────────────────
  if (selectedYear) {
    const yid  = String(selectedYear);
    const year = years[yid];
    if (!year) return null;
    const allDone = year.enrolled.length > 0 && year.enrolled.every((course) => course.progress >= 100);

    return (
      <Screen>
        <ConfirmModal visible={Boolean(confirmUnenroll)} title="Unenroll?" danger
          message={confirmUnenroll ? `Remove "${confirmUnenroll.name}" from your enrollments?` : ""}
          confirmLabel="Unenroll" onConfirm={handleUnenroll} onCancel={() => setConfirmUnenroll(null)} />

        <TouchableOpacity onPress={() => setSelectedYear(null)}>
          <Text style={{ color: c.blue, fontWeight: "600", fontSize: 13 }}>← Back to Years</Text>
        </TouchableOpacity>

        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <SectionLabel>Year {yid}</SectionLabel>
              <Text style={{ fontSize: 22, fontWeight: "800", color: c.text }}>{year.title}</Text>
              <Text style={{ fontSize: 13, color: c.textSub, marginTop: 4, lineHeight: 18 }}>{year.desc}</Text>
            </View>
            <Tag label={year.status}
              color={year.status === "Completed" ? c.emerald : year.status === "In Progress" ? c.amber : year.status === "Locked" ? c.textMuted : c.blue}
              bg={year.status === "Completed" ? c.emeraldBg : year.status === "In Progress" ? c.amberBg : year.status === "Locked" ? c.surface : c.blueBg}
            />
          </View>
          <Divider />
          <Text style={{ fontSize: 13, color: c.textSub }}>
            Credits earned: <Text style={{ fontWeight: "700", color: c.text }}>{year.earnedCredits}</Text> / {year.totalCredits}
          </Text>
        </Card>

        {!year.unlocked && (
          <Card bg="#FFFBEB" style={{ borderColor: "#FCD34D" }}>
            <Text style={{ fontSize: 22, marginBottom: 4 }}>🔒</Text>
            <Text style={{ fontWeight: "800", color: "#92400E", fontSize: 14 }}>Year {yid} is locked</Text>
            <Text style={{ color: "#B45309", fontSize: 13, marginTop: 4 }}>
              Earn {UNLOCK_THRESHOLDS[Number(yid)] - totalEarned} more credits to unlock this year.
            </Text>
          </Card>
        )}

        {allDone && year.unlocked && (
          <Card bg={c.emeraldBg} style={{ borderColor: c.emeraldBorder }}>
            <Text style={{ fontSize: 22, marginBottom: 6 }}>🎉</Text>
            <Text style={{ fontWeight: "800", color: "#065F46", fontSize: 15 }}>Year {yid} Complete!</Text>
            <Text style={{ color: "#047857", fontSize: 13, marginTop: 4 }}>You earned {year.earnedCredits} credits.</Text>
          </Card>
        )}

        {year.enrolled.length > 0 && (
          <>
            <SectionLabel>Your Courses</SectionLabel>
            {year.enrolled.map((e, i) => {
              const passed = e.progress >= 100;
              return (
                <Card key={e.id || i} style={passed ? { borderColor: c.emeraldBorder } : {}}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontWeight: "700", color: c.text, fontSize: 14 }}>{e.name}</Text>
                      <Text style={{ fontSize: 12, color: c.textSub, marginTop: 2 }}>{e.code} · {e.credits} credits</Text>
                      {e.instructor ? <Text style={{ fontSize: 11, color: c.textMuted }}>Instructor: {e.instructor}</Text> : null}
                    </View>
                    {passed ? <Tag label="Passed ✓" color={c.emerald} bg={c.emeraldBg} /> :
                      <Text style={{ fontWeight: "700", color: c.blue, fontSize: 13 }}>{e.progress}%</Text>}
                  </View>
                  <ProgressBar value={e.progress} height={6} />
                  <Text style={{ fontSize: 11, color: c.textSub, marginTop: 4 }}>
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

        {year.unlocked && (
          <>
            <SectionLabel>Available to Enroll</SectionLabel>
            {year.available.length === 0 ? (
              <Card bg={c.surface}>
                <Text style={{ color: c.textSub, fontSize: 13 }}>
                  {year.enrolled.length > 0 ? "You are enrolled in all available courses." : "No courses published yet."}
                </Text>
              </Card>
            ) : (
              year.available.map((course) => (
                <Card key={course.id}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "700", color: c.text, fontSize: 14 }}>{course.name}</Text>
                      <Text style={{ fontSize: 12, color: c.textSub, marginTop: 2 }}>{course.code} · {course.credits} cr · {course.instructor}</Text>
                    </View>
                    <Btn label="Enroll" small onPress={() => handleEnroll(course, yid)} />
                  </View>
                </Card>
              ))
            )}
          </>
        )}
      </Screen>
    );
  }

  // ── Year list view ─────────────────────────────────────────────────────────
  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: "800", color: c.text }}>Academic Years</Text>
      <ErrorBox message={error} />

      <Card bg={c.blueBg} style={{ borderColor: c.blueBorder }}>
        <SectionLabel>Degree Progress</SectionLabel>
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <Pill label="Credits Earned" value={totalEarned}                                              color={c.blue}    />
          <Pill label="Completed"      value={enrollments.filter((e) => e.progress >= 100).length}      color={c.emerald} />
        </View>
        <ProgressBar value={Math.round((totalEarned / 168) * 100)} height={8} />
        <Text style={{ fontSize: 11, color: c.textSub, marginTop: 4 }}>
          {Math.round((totalEarned / 168) * 100)}% of degree completed (168 total credits)
        </Text>
      </Card>

      {loadingInit ? (
        <Card><Text style={{ color: c.textSub }}>Loading…</Text></Card>
      ) : (
        ["1", "2", "3", "4"].map((yid) => {
          const year = years[yid];
          if (!year) return null;
          const ynum          = Number(yid);
          const creditsNeeded = year.unlocked ? 0 : Math.max(0, UNLOCK_THRESHOLDS[ynum] - totalEarned);
          return (
            <TouchableOpacity key={yid} onPress={() => setSelectedYear(yid)} activeOpacity={0.85}>
              <Card style={{
                borderWidth: year.status === "Completed" ? 1.5 : 1,
                borderColor: year.status === "Completed" ? c.emeraldBorder : !year.unlocked ? "#FCD34D" : c.border,
                backgroundColor: !year.unlocked ? "#FFFBEB" : c.card,
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center",
                    backgroundColor: !year.unlocked ? "#FEF3C7" : year.status === "Completed" ? c.emeraldBg : c.blueBg }}>
                    <Text style={{ fontWeight: "800", fontSize: 20,
                      color: !year.unlocked ? c.amber : year.status === "Completed" ? c.emerald : c.blue }}>
                      {!year.unlocked ? "🔒" : yid}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700", color: !year.unlocked ? "#92400E" : c.text, fontSize: 15 }}>{year.title}</Text>
                    <Text style={{ fontSize: 12, color: !year.unlocked ? "#B45309" : c.textSub, marginTop: 2 }} numberOfLines={2}>{year.desc}</Text>
                  </View>
                </View>
                <Divider />
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4,
                      backgroundColor: year.status === "Completed" ? c.emerald : year.status === "In Progress" ? c.amber : !year.unlocked ? "#FCD34D" : c.textMuted }} />
                    <Text style={{ fontSize: 12, fontWeight: "700",
                      color: year.status === "Completed" ? c.emerald : year.status === "In Progress" ? c.amber : !year.unlocked ? c.amber : c.textSub }}>
                      {year.status}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: c.textSub }}>
                    {!year.unlocked ? `${creditsNeeded} more credits to unlock` : `${year.earnedCredits} credits earned →`}
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