/**
 * src/pages/CoursePlayer.jsx
 *
 * Mobile port of web CoursePlayer.jsx — exact same logic:
 *  - Fetches sections from backend via /sections/course/:mongoId
 *  - Section-by-section reading, progress advances via Next button
 *  - Study mode + Upload mode tab toggle
 *  - Materials per section, remove material
 *  - Unenroll confirm
 *  - All state synced to backend
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert, Modal, Pressable, ScrollView,
  Text, TouchableOpacity, View,
} from "react-native";
import { api } from "../services/api";
import { useCourses } from "../context/CourseContext";
import { useMaterials } from "../context/MaterialContext";
import {
  Screen, Card, SectionLabel, Tag, ProgressBar,
  Btn, ErrorBox, safeArray, C, s,
} from "../components/UI";

// ─── Helpers (same as web) ────────────────────────────────────────────────────
function sectionsCompletedFromProgress(progress, total) {
  if (!total) return 0;
  return Math.min(total, Math.round((progress / 100) * total));
}
function nextSectionLabel(sections, completedCount) {
  if (!sections?.length)               return "Getting Started";
  if (completedCount >= sections.length) return "Course complete";
  return sections[completedCount].title;
}

// ─── Status colors (materials) ────────────────────────────────────────────────
const STATUS_COLOR = { pending: C.amber, approved: C.emerald, rejected: C.rose, Draft: C.amber };
const STATUS_LABEL = { pending: "⏳ Pending", approved: "✅ Approved", rejected: "❌ Rejected", Draft: "⏳ Pending" };

// ─── CoursePlayer ─────────────────────────────────────────────────────────────
/**
 * Props:
 *   course   — { id, mongoId, name, code, credits, instructor, progress,
 *                sectionsCompleted, nextItem, yearId }
 *   yearId   — "1" | "2" | "3" | "4"
 *   onBack   — () => void  called when user presses Back
 */
export default function CoursePlayer({ course, yearId, onBack }) {
  const { updateCourseProgress, undoEnrollment } = useCourses();
  const { materials, addMaterial, removeMaterial } = useMaterials();

  // ── Section data ──────────────────────────────────────────────────────────
  const [sections,        setSections]        = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [sectionsError,   setSectionsError]   = useState("");

  const mongoId = course.mongoId || course.courseId || course.id;

  useEffect(() => {
    if (!mongoId) return;
    setSectionsLoading(true); setSectionsError("");
    api.get(`/sections/course/${mongoId}`)
      .then((res) => {
        const raw = safeArray(res?.data ?? res);
        setSections(raw.map((sec) => ({
          id:      sec._id,
          title:   sec.title,
          summary: sec.summary || "",
          body:    sec.body    || "",
        })));
      })
      .catch((e) => { setSectionsError(e.message); setSections([]); })
      .finally(() => setSectionsLoading(false));
  }, [mongoId]);

  const n = sections.length;

  // ── Progress state ────────────────────────────────────────────────────────
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
  const [mode,              setMode]              = useState("study"); // "study" | "upload"
  const [confirmUnenroll,   setConfirmUnenroll]   = useState(false);
  const [uploading,         setUploading]         = useState(false);

  const isStarted = started || (course.progress || 0) > 0;

  // Cap viewIndex when sections load
  useEffect(() => {
    if (!n) return;
    const cap = courseComplete ? n - 1 : Math.min(sectionsDone, n - 1);
    setViewIndex((v) => Math.min(Math.max(v, 0), Math.max(0, cap)));
  }, [n, sectionsDone, courseComplete]);

  // Auto-select first section for upload mode
  useEffect(() => {
    if (sections.length && !selectedSectionId) setSelectedSectionId(sections[0].id);
  }, [sections, selectedSectionId]);

  // ── Section readability (same rule as web) ────────────────────────────────
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

  const handlePrev = () => setViewIndex((i) => Math.max(0, i - 1));

  const selectSection = (idx) => {
    if (mode === "upload") { setSelectedSectionId(sections[idx]?.id); return; }
    if (!isSectionReadable(idx)) return;
    setViewIndex(idx);
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
        courseId:     course.id,
        courseName:   course.name,
        fileName:     `Material — ${sec.title}`,
        type:         "file",
        sectionId:    selectedSectionId,
        sectionLabel: sec.title,
      });
      Alert.alert("Uploaded!", "Material submitted for mentor review.");
    } catch (e) { Alert.alert("Upload failed", e.message); }
    finally { setUploading(false); }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentSection    = sections[viewIndex];
  const selectedSecIdx    = sections.findIndex((s) => s.id === selectedSectionId);
  const courseMaterials   = materials.filter((m) => m.courseId === course.id);
  const sectionMaterials  = selectedSectionId
    ? courseMaterials.filter((m) => m.sectionId === selectedSectionId)
    : [];

  const showNextButton =
    isStarted && !courseComplete && mode === "study" &&
    viewIndex === sectionsDone && sectionsDone < n;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Screen>
      {/* Unenroll confirm modal */}
      <Modal visible={confirmUnenroll} transparent animationType="fade">
        <Pressable style={ss.overlay} onPress={() => setConfirmUnenroll(false)}>
          <Pressable style={ss.modalCard}>
            <Text style={ss.modalTitle}>Unenroll from this course?</Text>
            <Text style={{ color: C.slate600, fontSize: 13, marginTop: 4 }}>
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
          <Text style={{ color: C.blue, fontWeight: "600", fontSize: 13 }}>← Back to year</Text>
        </TouchableOpacity>

        <SectionLabel>Year {yearId} / {course.code}</SectionLabel>
        <Text style={s.pageTitle}>{course.name}</Text>
        {course.instructor ? (
          <Text style={{ fontSize: 12, color: C.slate500 }}>Instructor: {course.instructor}</Text>
        ) : null}

        {/* Progress row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 10 }}>
          <View style={{ flex: 1 }}>
            <ProgressBar value={course.progress || 0} height={8} />
            <Text style={{ fontSize: 11, color: C.slate500, marginTop: 3 }}>
              {course.progress || 0}% · Next: {course.nextItem || "Getting Started"}
            </Text>
          </View>
          <Btn label="Unenroll" variant="outline" small onPress={() => setConfirmUnenroll(true)} />
        </View>

        {/* Study / Upload toggle */}
        <View style={ss.modeToggle}>
          {["study", "upload"].map((m) => (
            <TouchableOpacity key={m} onPress={() => setMode(m)}
              style={[ss.modeBtn, mode === m && ss.modeBtnActive]}>
              <Text style={[ss.modeBtnTxt, mode === m && { color: "#fff" }]}>
                {m === "study" ? "📖 Study" : "📎 Upload"}
              </Text>
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
          <Text style={{ color: C.slate500, fontSize: 13 }}>
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
              <TouchableOpacity key={sec.id} onPress={() => selectSection(idx)}
                disabled={mode === "study" && !readable}
                style={[ss.sectionRow, active && ss.sectionRowActive, !readable && mode === "study" && { opacity: 0.4 }]}>
                <Text style={{ fontWeight: "800", color: done ? C.emerald : active ? C.blue : C.slate400, fontSize: 14, width: 22 }}>
                  {done ? "✓" : `${idx + 1}.`}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", color: C.slate900, fontSize: 13 }}>{sec.title}</Text>
                  {sec.summary ? <Text style={{ fontSize: 11, color: C.slate500, marginTop: 1 }}>{sec.summary}</Text> : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </Card>

      {/* Main content panel */}
      {mode === "study" && (
        <Card>
          {sectionsLoading ? (
            <Text style={{ color: C.slate400, textAlign: "center", paddingVertical: 20 }}>Loading sections…</Text>
          ) : sectionsError ? (
            <ErrorBox message={sectionsError} />
          ) : n === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Text style={{ color: C.slate500 }}>No sections yet.</Text>
              <Text style={{ color: C.slate400, fontSize: 12, marginTop: 4 }}>Check back later or contact your instructor.</Text>
            </View>
          ) : !isStarted && !courseComplete ? (
            <View style={{ alignItems: "center", paddingVertical: 24 }}>
              <Text style={{ color: C.slate600, textAlign: "center", fontSize: 14 }}>
                This course has {n} section{n !== 1 ? "s" : ""}. When you are ready, start with the first section.
              </Text>
              <View style={{ marginTop: 20 }}>
                <Btn label="Start" onPress={() => { setStarted(true); setViewIndex(0); }} />
              </View>
            </View>
          ) : (
            <>
              {courseComplete && (
                <Card bg={C.emeraldBg} style={{ borderColor: C.emeraldBorder, marginBottom: 8 }}>
                  <Text style={{ color: "#065F46", fontWeight: "700" }}>
                    🎉 Course complete — you can open any section to review.
                  </Text>
                </Card>
              )}
              {!courseComplete && viewIndex < sectionsDone && sectionsDone > 0 && (
                <Card bg={C.slate50} style={{ marginBottom: 8 }}>
                  <Text style={{ color: C.slate600, fontSize: 13 }}>
                    Review mode — browsing a section you already finished.
                  </Text>
                </Card>
              )}

              <SectionLabel>Section {viewIndex + 1} of {n}</SectionLabel>
              <Text style={{ fontWeight: "700", fontSize: 18, color: C.slate900 }}>
                {currentSection?.title}
              </Text>
              {currentSection?.summary ? (
                <Text style={{ fontSize: 13, color: C.slate500, marginTop: 4 }}>
                  {currentSection.summary}
                </Text>
              ) : null}

              <View style={ss.bodyBox}>
                <Text style={ss.bodyText}>{currentSection?.body || "No content yet."}</Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <Btn label="← Previous" variant="outline" small
                  disabled={viewIndex <= 0}
                  onPress={handlePrev} />
                {showNextButton && (
                  <Btn label={sectionsDone >= n - 1 ? "Finish course ✓" : "Next →"}
                    small onPress={handleNext} />
                )}
              </View>
            </>
          )}
        </Card>
      )}

      {mode === "upload" && (
        <Card>
          <SectionLabel>Upload material</SectionLabel>
          <Text style={{ fontSize: 13, color: C.slate600 }}>
            Section: <Text style={{ fontWeight: "700", color: C.slate900 }}>
              {sections.find((s) => s.id === selectedSectionId)?.title || "—"}
            </Text>
          </Text>

          <View style={{ marginTop: 12 }}>
            <Btn label={uploading ? "Uploading…" : "📎 Upload for this section"}
              disabled={uploading || !selectedSectionId}
              onPress={handleUploadMaterial} />
          </View>

          {/* Materials in this section */}
          {sectionMaterials.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <SectionLabel>Files in this section</SectionLabel>
              {sectionMaterials.map((m, i) => (
                <View key={m.id || i} style={ss.materialRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", fontSize: 13, color: C.slate900 }}>{m.fileName}</Text>
                    <Text style={{ fontSize: 11, marginTop: 2, color: STATUS_COLOR[m.status] || C.slate500 }}>
                      {STATUS_LABEL[m.status] || m.status}
                    </Text>
                    {m.sectionLabel ? <Text style={{ fontSize: 11, color: C.slate400 }}>{m.sectionLabel}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => removeMaterial(m.id)}>
                    <Text style={{ fontSize: 12, color: C.rose, fontWeight: "600" }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* All materials in this course */}
          {courseMaterials.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <SectionLabel>All materials in this course</SectionLabel>
              {courseMaterials.map((m, i) => (
                <View key={m.id || i} style={[ss.materialRow, { backgroundColor: m.status === "Draft" || m.status === "pending" ? C.amberBg : C.slate50 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", fontSize: 13, color: C.slate900 }}>{m.fileName}</Text>
                    <Text style={{ fontSize: 11, color: C.slate400 }}>{m.sectionLabel || "General"}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: STATUS_COLOR[m.status] || C.slate500, fontWeight: "600" }}>
                    {STATUS_LABEL[m.status] || m.status}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {courseMaterials.length === 0 && (
            <Text style={{ color: C.slate500, fontSize: 13, marginTop: 12 }}>No uploads yet for this course.</Text>
          )}
        </Card>
      )}
    </Screen>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const ss = {
  overlay:        { flex: 1, backgroundColor: "rgba(2,6,23,0.5)", justifyContent: "flex-end" },
  modalCard:      { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle:     { fontWeight: "800", fontSize: 16, color: C.slate900 },
  modeToggle:     { flexDirection: "row", borderWidth: 1, borderColor: C.border, borderRadius: 99, overflow: "hidden", alignSelf: "flex-start", marginTop: 12 },
  modeBtn:        { paddingHorizontal: 18, paddingVertical: 8, backgroundColor: "transparent" },
  modeBtnActive:  { backgroundColor: C.blue },
  modeBtnTxt:     { fontSize: 12, fontWeight: "700", color: C.slate500 },
  sectionRow:     { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 10, borderRadius: 12, marginBottom: 4, borderWidth: 1, borderColor: "transparent", backgroundColor: C.slate50 },
  sectionRowActive: { backgroundColor: C.blueBg, borderColor: "#93C5FD" },
  bodyBox:        { backgroundColor: C.slate50, borderRadius: 12, padding: 14, marginTop: 12 },
  bodyText:       { fontSize: 14, color: C.slate700, lineHeight: 22 },
  materialRow:    { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: C.borderLight },
};