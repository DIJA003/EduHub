/**
 * src/pages/CoursePlayer.jsx
 * Fetches sections from backend /sections/course/:mongoId
 * Progress advances section by section, synced to backend.
 * Fully theme-aware (light + dark mode).
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Modal, Pressable, Text, TouchableOpacity, View,
} from "react-native";
import { api } from "../services/api";
import { useCourses } from "../context/CourseContext";
import { useMaterials } from "../context/MaterialContext";
import {
  Screen, Card, SectionLabel, ProgressBar,
  Btn, ErrorBox, safeArray, useColors,
} from "../components/UI";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sectionsCompletedFromProgress(progress, total) {
  if (!total) return 0;
  return Math.min(total, Math.round((progress / 100) * total));
}
function nextSectionLabel(sections, completedCount) {
  if (!sections?.length)                return "Getting Started";
  if (completedCount >= sections.length) return "Course complete";
  return sections[completedCount].title;
}

export default function CoursePlayer({ course, yearId, onBack }) {
  const c = useColors();
  const { updateCourseProgress, undoEnrollment } = useCourses();
  const { materials, addMaterial, removeMaterial } = useMaterials();

  // ── Sections from backend ─────────────────────────────────────────────────
  const [sections,        setSections]        = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionsError,   setSectionsError]   = useState("");

  const mongoId = course.mongoId || course.courseId || course.id;

  useEffect(() => {
    if (!mongoId) { setSectionsLoading(false); return; }
    setSectionsLoading(true); setSectionsError("");
    api.get(`/materials?courseRef=${mongoId}`)
      .then((res) => {
        const raw = safeArray(res?.data ?? res);
        setSections(raw.map((sec) => ({
          id:      sec._id,
          title:   sec.title   || "Untitled section",
          summary: sec.summary || "",
          body:    sec.body    || "",
        })));
      })
      .catch((e) => { setSectionsError(e.message); setSections([]); })
      .finally(() => setSectionsLoading(false));
  }, [mongoId]);

  const n = sections.length;

  // ── Progress ──────────────────────────────────────────────────────────────
  const sectionsDone = useMemo(() => {
    if (!n) return 0;
    if (course.sectionsCompleted != null) return course.sectionsCompleted;
    return sectionsCompletedFromProgress(course.progress || 0, n);
  }, [course.sectionsCompleted, course.progress, n]);

  const courseComplete   = n > 0 && (course.progress || 0) >= 100;
  const maxReadableIndex = courseComplete ? n - 1 : Math.min(sectionsDone, n - 1);

  const [started,           setStarted]           = useState(false);
  const [viewIndex,         setViewIndex]         = useState(0);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [mode,              setMode]              = useState("study");
  const [confirmUnenroll,   setConfirmUnenroll]   = useState(false);
  const [uploading,         setUploading]         = useState(false);

  const isStarted = started || (course.progress || 0) > 0;

  useEffect(() => {
    if (!n) return;
    const cap = courseComplete ? n - 1 : Math.max(0, Math.min(sectionsDone, n - 1));
    setViewIndex((v) => Math.min(Math.max(v, 0), cap));
  }, [n, sectionsDone, courseComplete]);

  useEffect(() => {
    if (sections.length && !selectedSectionId) setSelectedSectionId(sections[0].id);
  }, [sections]);

  const isSectionReadable = (idx) => {
    if (!isStarted && !courseComplete) return false;
    if (courseComplete)                return idx >= 0 && idx < n;
    return idx >= 0 && idx <= maxReadableIndex;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (!n) return;
    const nextDone    = Math.min(n, sectionsDone + 1);
    const newProgress = Math.min(100, Math.round((nextDone / n) * 100));
    const done        = nextDone >= n;
    const nextLabel   = done ? "Course complete" : nextSectionLabel(sections, nextDone);
    updateCourseProgress(yearId, course.id, {
      progress: newProgress, nextItem: nextLabel, sectionsCompleted: nextDone,
    });
    setStarted(true);
    setViewIndex(done ? n - 1 : Math.min(nextDone, n - 1));
  };

  const handleUnenroll = () => {
    undoEnrollment(yearId, course.id);
    setConfirmUnenroll(false);
    onBack();
  };

  const handleUploadMaterial = async () => {
    const sec = sections.find((s) => s.id === selectedSectionId);
    if (!sec) return;
    setUploading(true);
    try {
      await addMaterial({
        courseId: course.id, courseName: course.name,
        fileName: `Material — ${sec.title}`, type: "file",
        sectionId: selectedSectionId, sectionLabel: sec.title,
      });
      Alert.alert("Uploaded!", "Material submitted for mentor review.");
    } catch (e) { Alert.alert("Upload failed", e.message); }
    finally { setUploading(false); }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentSection   = sections[viewIndex];
  const courseMaterials  = materials.filter((m) => m.courseId === course.id);
  const sectionMaterials = selectedSectionId
    ? courseMaterials.filter((m) => m.sectionId === selectedSectionId)
    : [];
  const showNextButton =
    isStarted && !courseComplete && mode === "study" &&
    viewIndex === sectionsDone && sectionsDone < n;

  const STATUS_COLOR = { pending: c.amber, approved: c.emerald, rejected: c.rose, Draft: c.amber };
  const STATUS_LABEL = { pending: "⏳ Pending", approved: "✅ Approved", rejected: "❌ Rejected", Draft: "⏳ Pending" };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Screen>
      {/* Unenroll confirm */}
      <Modal visible={confirmUnenroll} transparent animationType="fade">
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
          onPress={() => setConfirmUnenroll(false)}>
          <Pressable style={{ backgroundColor: c.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 10, borderTopWidth: 1, borderColor: c.border }}>
            <Text style={{ fontWeight: "800", fontSize: 16, color: c.text }}>Unenroll from this course?</Text>
            <Text style={{ color: c.textSub, fontSize: 13, marginTop: 4 }}>
              Your progress will be lost. You can re-enroll later.
            </Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <View style={{ flex: 1 }}><Btn label="Cancel"   variant="outline" onPress={() => setConfirmUnenroll(false)} /></View>
              <View style={{ flex: 1 }}><Btn label="Unenroll" variant="danger"  onPress={handleUnenroll} /></View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Header */}
      <Card>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 8 }}>
          <Text style={{ color: c.blue, fontWeight: "600", fontSize: 13 }}>← Back to year</Text>
        </TouchableOpacity>
        <SectionLabel>Year {yearId} / {course.code}</SectionLabel>
        <Text style={{ fontSize: 22, fontWeight: "800", color: c.text }}>{course.name}</Text>
        {course.instructor
          ? <Text style={{ fontSize: 12, color: c.textMuted }}>Instructor: {course.instructor}</Text>
          : null}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 }}>
          <View style={{ flex: 1 }}>
            <ProgressBar value={course.progress || 0} height={8} />
            <Text style={{ fontSize: 11, color: c.textMuted, marginTop: 3 }}>
              {course.progress || 0}% · Next: {course.nextItem || "Getting Started"}
            </Text>
          </View>
          <Btn label="Unenroll" variant="outline" small onPress={() => setConfirmUnenroll(true)} />
        </View>

        {/* Mode toggle */}
        <View style={{ flexDirection: "row", borderWidth: 1, borderColor: c.border, borderRadius: 99, overflow: "hidden", alignSelf: "flex-start", marginTop: 12 }}>
          {["study", "upload"].map((m) => (
            <TouchableOpacity key={m} onPress={() => setMode(m)}
              style={{ paddingHorizontal: 18, paddingVertical: 8, backgroundColor: mode === m ? c.blue : "transparent" }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: mode === m ? "#fff" : c.textMuted }}>
                {m === "study" ? "📖 Study" : "📎 Upload"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Sections list */}
      <Card>
        <SectionLabel>
          {sectionsLoading ? "Loading sections…" : `Sections (${n})`}
        </SectionLabel>

        {sectionsLoading ? (
          <Text style={{ color: c.textMuted, paddingVertical: 8 }}>Loading…</Text>
        ) : sectionsError ? (
          <ErrorBox message={sectionsError} />
        ) : n === 0 ? (
          <Text style={{ color: c.textSub, fontSize: 13 }}>
            No sections available for this course yet.
          </Text>
        ) : (
          sections.map((sec, idx) => {
            const done     = courseComplete || idx < sectionsDone;
            const readable = mode === "upload" || isSectionReadable(idx);
            const active   = mode === "upload"
              ? selectedSectionId === sec.id
              : viewIndex === idx;
            return (
              <TouchableOpacity key={sec.id}
                onPress={() => {
                  if (mode === "upload") { setSelectedSectionId(sec.id); return; }
                  if (!isSectionReadable(idx)) return;
                  setViewIndex(idx);
                }}
                disabled={mode === "study" && !readable}
                style={[{
                  flexDirection: "row", alignItems: "flex-start", gap: 10,
                  padding: 10, borderRadius: 12, marginBottom: 4,
                  borderWidth: 1, borderColor: "transparent",
                  backgroundColor: active ? c.blueBg : c.surface,
                  borderColor: active ? c.blueLight : "transparent",
                  opacity: (!readable && mode === "study") ? 0.4 : 1,
                }]}>
                <Text style={{ fontWeight: "800", color: done ? c.emerald : active ? c.blue : c.textMuted, fontSize: 14, width: 22 }}>
                  {done ? "✓" : `${idx + 1}.`}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", color: c.text, fontSize: 13 }}>{sec.title}</Text>
                  {sec.summary
                    ? <Text style={{ fontSize: 11, color: c.textSub, marginTop: 1 }}>{sec.summary}</Text>
                    : null}
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
            <Text style={{ color: c.textMuted, textAlign: "center", paddingVertical: 20 }}>Loading sections…</Text>
          ) : sectionsError ? (
            <ErrorBox message={sectionsError} />
          ) : n === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Text style={{ color: c.textSub }}>No sections yet.</Text>
              <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 4 }}>Check back later or contact your instructor.</Text>
            </View>
          ) : !isStarted && !courseComplete ? (
            <View style={{ alignItems: "center", paddingVertical: 24 }}>
              <Text style={{ color: c.textSub, textAlign: "center", fontSize: 14 }}>
                This course has {n} section{n !== 1 ? "s" : ""}. When you are ready, start with the first section.
              </Text>
              <View style={{ marginTop: 20 }}>
                <Btn label="Start" onPress={() => { setStarted(true); setViewIndex(0); }} />
              </View>
            </View>
          ) : (
            <>
              {courseComplete && (
                <View style={{ backgroundColor: c.emeraldBg, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: c.emerald }}>
                  <Text style={{ color: c.emerald, fontWeight: "700" }}>
                    🎉 Course complete — you can open any section to review.
                  </Text>
                </View>
              )}
              {!courseComplete && viewIndex < sectionsDone && sectionsDone > 0 && (
                <View style={{ backgroundColor: c.surface, borderRadius: 12, padding: 10, marginBottom: 8 }}>
                  <Text style={{ color: c.textSub, fontSize: 13 }}>
                    Review mode — browsing a section you already finished.
                  </Text>
                </View>
              )}

              <SectionLabel>Section {viewIndex + 1} of {n}</SectionLabel>
              <Text style={{ fontWeight: "700", fontSize: 18, color: c.text }}>{currentSection?.title}</Text>
              {currentSection?.summary
                ? <Text style={{ fontSize: 13, color: c.textSub, marginTop: 4 }}>{currentSection.summary}</Text>
                : null}

              <View style={{ backgroundColor: c.surface, borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: c.border }}>
                <Text style={{ fontSize: 14, color: c.text, lineHeight: 22 }}>
                  {currentSection?.body || "No content yet."}
                </Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <Btn label="← Previous" variant="outline" small
                  disabled={viewIndex <= 0}
                  onPress={() => setViewIndex((i) => Math.max(0, i - 1))} />
                {showNextButton && (
                  <Btn label={sectionsDone >= n - 1 ? "Finish course ✓" : "Next →"}
                    small onPress={handleNext} />
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
            Section:{" "}
            <Text style={{ fontWeight: "700", color: c.text }}>
              {sections.find((s) => s.id === selectedSectionId)?.title || "—"}
            </Text>
          </Text>
          <View style={{ marginTop: 12 }}>
            <Btn label={uploading ? "Uploading…" : "📎 Upload for this section"}
              disabled={uploading || !selectedSectionId}
              onPress={handleUploadMaterial} />
          </View>

          {sectionMaterials.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <SectionLabel>Files in this section</SectionLabel>
              {sectionMaterials.map((m, i) => (
                <View key={m.id || i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: c.border }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", fontSize: 13, color: c.text }}>{m.fileName}</Text>
                    <Text style={{ fontSize: 11, marginTop: 2, color: STATUS_COLOR[m.status] || c.textMuted }}>
                      {STATUS_LABEL[m.status] || m.status}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeMaterial(m.id)}>
                    <Text style={{ fontSize: 12, color: c.rose, fontWeight: "600" }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {courseMaterials.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <SectionLabel>All materials in this course</SectionLabel>
              {courseMaterials.map((m, i) => (
                <View key={m.id || i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: c.border }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", fontSize: 13, color: c.text }}>{m.fileName}</Text>
                    <Text style={{ fontSize: 11, color: c.textMuted }}>{m.sectionLabel || "General"}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: STATUS_COLOR[m.status] || c.textMuted, fontWeight: "600" }}>
                    {STATUS_LABEL[m.status] || m.status}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {courseMaterials.length === 0 && (
            <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 12 }}>No uploads yet for this course.</Text>
          )}
        </Card>
      )}
    </Screen>
  );
}