/**
 * pages/AcademicYear.jsx
 * Year list → Year detail → Course Player
 * Locking: Year1=always, Year2=39cr, Year3=78cr, Year4=117cr
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Screen, Card, SectionLabel, Tag, Pill, ProgressBar, Btn, Divider, ErrorBox, EmptyState, ConfirmModal, useColors, st } from '../components/UI';

function safeArray(d) { return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []; }

// ── Locking thresholds (same as web) ──────────────────────────────────────────
const UNLOCK_THRESHOLDS = { 1: 0, 2: 39, 3: 78, 4: 117 };

const YEAR_META = {
  1: { title: 'Year One — Foundations',             desc: 'Foundational concepts: computing, mathematics, and logic.' },
  2: { title: 'Year Two — Core Specializations',    desc: 'Core engineering principles and advanced programming foundations.' },
  3: { title: 'Year Three — Advanced Applications', desc: 'Advanced applications: software engineering, cloud, and AI.' },
  4: { title: 'Year Four — Research & Thesis',      desc: 'Capstone, research, and industry placement.' },
};

function computeEarnedCredits(enrolled) {
  return (enrolled || []).reduce((s, c) => s + (c.progress >= 100 ? c.credits || 0 : 0), 0);
}

function buildYearsState(dbYears, coursesPerYear, enrollments) {
  const yearIds = ['1', '2', '3', '4'];
  const result  = {};
  for (const yid of yearIds) {
    const ynum   = Number(yid);
    const dbYear = dbYears.find(y => String(y.year) === yid);
    const title  = dbYear?.name || YEAR_META[ynum]?.title || `Year ${ynum}`;

    const yearEnrollments = enrollments.filter(e => String(e.yearId || '1') === yid);
    const enrolled = yearEnrollments.map(e => ({
      id: e.id, name: e.name || 'Course', code: e.code || '',
      credits: e.credits || 3, progress: e.progress || 0,
      sectionsCompleted: e.sectionsCompleted || 0,
      nextItem: e.nextItem || 'Getting Started',
      mongoId: e.courseId, instructor: e.instructor || '', yearId: yid,
    }));

    const enrolledMongoIds = new Set(enrolled.map(c => String(c.mongoId)));
    const available = (coursesPerYear[yid] || [])
      .filter(c => !enrolledMongoIds.has(String(c._id)))
      .map(c => ({
        id: String(c._id), name: c.title, code: c.code,
        credits: c.creditHours || 3, instructor: c.instructor || 'TBA',
        mongoId: String(c._id), yearId: yid,
      }));

    const earnedCredits = computeEarnedCredits(enrolled);
    const totalEarnedSoFar = Object.values(result).reduce((sum, y) => sum + (y.earnedCredits ?? 0), 0) + earnedCredits;
    const threshold = UNLOCK_THRESHOLDS[ynum] ?? 0;
    const unlocked  = ynum === 1 || enrolled.length > 0 || totalEarnedSoFar >= threshold;
    const allDone   = enrolled.length > 0 && enrolled.every(c => c.progress >= 100);
    const status    = !unlocked ? 'Locked' : allDone ? 'Completed' : enrolled.length > 0 ? 'In Progress' : 'Not Started';

    result[yid] = {
      title, desc: YEAR_META[ynum]?.desc || '',
      status, unlocked, earnedCredits,
      totalCredits: dbYear?.totalCredits || 42,
      enrolled, available,
    };
  }
  return result;
}

// ── Course Player ─────────────────────────────────────────────────────────────
function CoursePlayer({ course, yearId, onBack }) {
  const C = useColors();
  const STATUS_COLOR = { pending: C.amber, approved: C.emerald, rejected: C.rose };
  const STATUS_LABEL = { pending: '⏳ Pending', approved: '✅ Approved', rejected: '❌ Rejected' };
  const [sections,        setSections]        = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [viewIndex,       setViewIndex]       = useState(0);
  const [started,         setStarted]         = useState(false);
  const [mode,            setMode]            = useState('study');
  const [selectedSecIdx,  setSelectedSecIdx]  = useState(0);
  const [myMaterials,     setMyMaterials]     = useState([]);
  const [uploadLoading,   setUploadLoading]   = useState(false);
  const [confirmUnenroll, setConfirmUnenroll] = useState(false);

  const mongoId     = course.mongoId || course.courseId || course.id;
  const progress    = course.progress || 0;
  const n           = sections.length;
  const secDone     = course.sectionsCompleted ?? Math.round((progress / 100) * Math.max(n, 1));
  const courseComplete = progress >= 100;
  const isStarted   = started || progress > 0;

  useEffect(() => {
    if (!mongoId) return;
    setSectionsLoading(true);
    api.get(`/sections/course/${mongoId}`)
      .then(r => {
        const raw = safeArray(r?.data ?? r);
        setSections(raw.map(s => ({ id: s._id, title: s.title, summary: s.summary || '', body: s.body || '' })));
      })
      .catch(() => setSections([]))
      .finally(() => setSectionsLoading(false));
  }, [mongoId]);

  useEffect(() => {
    if (!n) return;
    const cap = courseComplete ? n - 1 : Math.max(0, Math.min(secDone, n - 1));
    setViewIndex(v => Math.min(v, cap));
  }, [n, secDone, courseComplete]);

  useEffect(() => {
    api.get('/users/materials')
      .then(r => {
        const all = safeArray(r?.data ?? r);
        setMyMaterials(all.filter(m => String(m.courseId) === String(mongoId) || String(m.courseRef) === String(mongoId)));
      })
      .catch(() => {});
  }, [mongoId]);

  const isSectionReadable = idx => {
    if (!isStarted && !courseComplete) return false;
    if (courseComplete) return true;
    return idx <= secDone;
  };

  const handleNext = async () => {
    if (!n) return;
    const nextDone    = Math.min(n, secDone + 1);
    const newProgress = Math.min(100, Math.round((nextDone / n) * 100));
    const done        = nextDone >= n;
    const nextLabel   = done ? 'Course complete' : sections[nextDone]?.title ?? 'Next section';
    try {
      await api.patch(`/users/enrollments/${mongoId}/progress`, {
        progress: newProgress, nextItem: nextLabel, sectionsCompleted: nextDone,
      });
    } catch {}
    if (!done) setViewIndex(Math.min(nextDone, n - 1));
    else       setViewIndex(n - 1);
    onBack({ refresh: true });
  };

  const handlePrev = () => setViewIndex(i => Math.max(0, i - 1));
  const showNext   = isStarted && !courseComplete && mode === 'study' && viewIndex === secDone && secDone < n;

  const handleUpload = async () => {
    const sec = sections[selectedSecIdx];
    if (!sec) return;
    setUploadLoading(true);
    try {
      const res = await api.post('/users/materials', {
        title: `Material for ${sec.title}`, course: course.name,
        type: 'Other', courseId: mongoId, yearId,
        sectionId: sec.id, sectionLabel: sec.title,
      });
      const m = res?.data || res;
      setMyMaterials(prev => [{ id: m._id, title: m.title, courseId: mongoId, sectionLabel: sec.title, status: m.status || 'pending', createdAt: m.createdAt }, ...prev]);
      Alert.alert('Uploaded!', 'Material sent to mentor for review.');
    } catch (e) { Alert.alert('Upload failed', e.message); }
    finally { setUploadLoading(false); }
  };

  const handleRemoveMaterial = async id => {
    try { await api.delete(`/users/materials/${id}`); setMyMaterials(prev => prev.filter(m => m.id !== id)); }
    catch (e) { Alert.alert('Failed', e.message); }
  };

  const handleUnenroll = async () => {
    try { await api.delete(`/users/enrollments/${mongoId}`); onBack({ refresh: true }); }
    catch (e) { Alert.alert('Failed', e.message); }
  };

  const currentSection   = sections[viewIndex];
  const sectionMaterials = myMaterials.filter(m => m.sectionLabel === sections[selectedSecIdx]?.title);

  return (
    <Screen>
      <ConfirmModal visible={confirmUnenroll} title="Unenroll?" danger
        message={`Remove enrollment from "${course.name}"?`}
        confirmLabel="Unenroll" onConfirm={handleUnenroll} onCancel={() => setConfirmUnenroll(false)} />

      {/* Header */}
      <Card>
        <TouchableOpacity onPress={() => onBack({})} style={{ marginBottom: 6 }}>
          <Text style={{ color: C.blueLight, fontWeight: '600', fontSize: 13 }}>← Back to year</Text>
        </TouchableOpacity>
        <SectionLabel>Year {yearId} / {course.code}</SectionLabel>
        <Text style={st.pageTitle}>{course.name}</Text>
        {course.instructor ? <Text style={{ fontSize: 12, color: C.textSub }}>Instructor: {course.instructor}</Text> : null}
        <Divider />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 11, color: C.textSub }}>Progress</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.text }}>{progress}%</Text>
          </View>
          <View style={{ flex: 1, marginHorizontal: 14 }}>
            <ProgressBar value={progress} height={8} />
            <Text style={{ fontSize: 10, color: C.textSub, marginTop: 3 }}>Next: {course.nextItem || 'Getting Started'}</Text>
          </View>
          <Btn label="Unenroll" variant="outline" small onPress={() => setConfirmUnenroll(true)} />
        </View>
        {/* Study / Upload toggle */}
        <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: C.border, borderRadius: 99, overflow: 'hidden', alignSelf: 'flex-start', marginTop: 8 }}>
          {['study', 'upload'].map(m => (
            <TouchableOpacity key={m} onPress={() => setMode(m)}
              style={{ paddingHorizontal: 16, paddingVertical: 7, backgroundColor: mode === m ? C.blue : 'transparent' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: mode === m ? '#fff' : C.textSub, textTransform: 'capitalize' }}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Sections list */}
      <Card>
        <SectionLabel>{sectionsLoading ? 'Loading sections…' : `Sections (${n})`}</SectionLabel>
        {sectionsLoading ? <Text style={{ color: C.textSub }}>Loading…</Text>
          : n === 0 ? <Text style={{ color: C.textSub, fontSize: 13 }}>No sections available yet.</Text>
          : sections.map((sec, idx) => {
            const done    = courseComplete || idx < secDone;
            const readable = isSectionReadable(idx);
            const active  = mode === 'upload' ? selectedSecIdx === idx : viewIndex === idx;
            return (
              <TouchableOpacity key={sec.id}
                onPress={() => { if (mode === 'upload') setSelectedSecIdx(idx); else if (readable) setViewIndex(idx); }}
                disabled={mode === 'study' && !readable}
                style={[{ flexDirection: 'row', gap: 10, padding: 10, borderRadius: 12, marginBottom: 4, borderWidth: 1 },
                  active ? { backgroundColor: C.blueBg, borderColor: C.blue } : { backgroundColor: C.surface, borderColor: 'transparent' },
                  !readable && mode === 'study' ? { opacity: 0.35 } : {}]}>
                <Text style={{ fontSize: 14, color: done ? C.emerald : active ? C.blueLight : C.textMuted, fontWeight: '700', width: 20 }}>
                  {done ? '✓' : `${idx + 1}.`}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: C.text, fontSize: 13 }}>{sec.title}</Text>
                  {sec.summary ? <Text style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>{sec.summary}</Text> : null}
                </View>
              </TouchableOpacity>
            );
          })}
      </Card>

      {/* Study mode */}
      {mode === 'study' && (
        <Card>
          {sectionsLoading ? <Text style={{ color: C.textSub, textAlign: 'center' }}>Loading…</Text>
            : n === 0 ? <Text style={{ color: C.textSub }}>No sections for this course yet.</Text>
            : !isStarted && !courseComplete ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ color: C.textSub, textAlign: 'center', fontSize: 14 }}>
                  This course has {n} section{n !== 1 ? 's' : ''}. When ready, start with the first section.
                </Text>
                <View style={{ marginTop: 16 }}><Btn label="Start" onPress={() => { setStarted(true); setViewIndex(0); }} /></View>
              </View>
            ) : (
              <>
                {courseComplete && (
                  <Card bg={C.emeraldBg} style={{ borderColor: C.emerald, borderWidth: 1, marginBottom: 8 }}>
                    <Text style={{ color: C.emerald, fontWeight: '700' }}>🎉 Course complete — review any section below.</Text>
                  </Card>
                )}
                {!courseComplete && viewIndex < secDone && secDone > 0 && (
                  <Card bg={C.surface} style={{ marginBottom: 8 }}>
                    <Text style={{ color: C.textSub, fontSize: 13 }}>Review mode — browsing a section you already finished.</Text>
                  </Card>
                )}
                <SectionLabel>Section {viewIndex + 1} of {n}</SectionLabel>
                <Text style={{ fontWeight: '700', fontSize: 17, color: C.text }}>{currentSection?.title}</Text>
                {currentSection?.summary ? <Text style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>{currentSection.summary}</Text> : null}
                <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, marginTop: 10, borderWidth: 1, borderColor: C.border }}>
                  <Text style={{ fontSize: 14, color: C.text, lineHeight: 22 }}>{currentSection?.body}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                  <Btn label="← Previous" variant="outline" small disabled={viewIndex <= 0} onPress={handlePrev} />
                  {showNext && <Btn label={secDone >= n - 1 ? 'Finish course' : 'Next →'} small onPress={handleNext} />}
                </View>
              </>
            )}
        </Card>
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <Card>
          <SectionLabel>Upload material</SectionLabel>
          <Text style={{ fontSize: 13, color: C.textSub }}>
            Section: <Text style={{ fontWeight: '700', color: C.text }}>{sections[selectedSecIdx]?.title || '—'}</Text>
          </Text>
          <View style={{ marginTop: 10 }}>
            <Btn label={uploadLoading ? 'Uploading…' : '📎 Upload for this section'}
              disabled={uploadLoading || !sections[selectedSecIdx]} onPress={handleUpload} />
          </View>
          {sectionMaterials.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <SectionLabel>Files in this section</SectionLabel>
              {sectionMaterials.map((m, i) => (
                <View key={m.id || i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: C.border }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: C.text, fontWeight: '600' }}>{m.title}</Text>
                    <Text style={{ fontSize: 11, color: STATUS_COLOR[m.status] || C.textSub, marginTop: 2 }}>{STATUS_LABEL[m.status] || m.status}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveMaterial(m.id)}>
                    <Text style={{ fontSize: 12, color: C.rose, fontWeight: '600' }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          {myMaterials.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <SectionLabel>All materials in this course</SectionLabel>
              {myMaterials.map((m, i) => (
                <View key={m.id || i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: C.border }}>
                  <Text style={{ fontSize: 12, color: C.text, flex: 1 }} numberOfLines={1}>{m.title}</Text>
                  <Text style={{ fontSize: 11, color: C.textSub, marginLeft: 8 }}>{m.sectionLabel || 'General'}</Text>
                </View>
              ))}
            </View>
          )}
        </Card>
      )}
    </Screen>
  );
}

// ── Academic Year Screen ──────────────────────────────────────────────────────
export default function AcademicYear() {
  const C = useColors();
  const [years,          setYears]          = useState({});
  const [dbYears,        setDbYears]        = useState([]);
  const [coursesPerYear, setCoursesPerYear] = useState({});
  const [enrollments,    setEnrollments]    = useState([]);
  const [selectedYear,   setSelectedYear]   = useState(null);
  const [playerCourse,   setPlayerCourse]   = useState(null);
  const [loadingInit,    setLoadingInit]    = useState(true);
  const [error,          setError]          = useState('');
  const [confirmUnenroll, setConfirmUnenroll] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [yrRes, enrRes, c1, c2, c3, c4] = await Promise.all([
        api.get('/academic-years'),
        api.get('/users/enrollments'),
        api.get('/courses/year/1'), api.get('/courses/year/2'),
        api.get('/courses/year/3'), api.get('/courses/year/4'),
      ]);
      const dby  = safeArray(yrRes);
      const enrs = safeArray(enrRes);
      const cpy  = { '1': safeArray(c1), '2': safeArray(c2), '3': safeArray(c3), '4': safeArray(c4) };
      setDbYears(dby); setEnrollments(enrs); setCoursesPerYear(cpy);
      setYears(buildYearsState(dby, cpy, enrs));
      setError('');
    } catch (e) { setError(e.message); }
    finally { setLoadingInit(false); }
  }, []);

  useEffect(() => { loadData(); }, []);

  const totalEarned = Object.values(years).reduce((s, y) => s + (y.earnedCredits ?? 0), 0);

  const handleEnroll = async (course) => {
    try {
      await api.post(`/users/enrollments/${course.mongoId || course._id || course.id}`);
      const enrs = safeArray(await api.get('/users/enrollments'));
      setEnrollments(enrs);
      setYears(buildYearsState(dbYears, coursesPerYear, enrs));
      Alert.alert('Enrolled!', `You joined ${course.name || course.title}`);
    } catch (e) { Alert.alert('Failed', e.message); }
  };

  const handleUnenroll = async () => {
    if (!confirmUnenroll) return;
    try {
      await api.delete(`/users/enrollments/${confirmUnenroll.mongoId || confirmUnenroll.courseId}`);
      const enrs = safeArray(await api.get('/users/enrollments'));
      setEnrollments(enrs);
      setYears(buildYearsState(dbYears, coursesPerYear, enrs));
      setConfirmUnenroll(null);
    } catch (e) { Alert.alert('Failed', e.message); }
  };

  // CoursePlayer
  if (playerCourse) {
    const enr = enrollments.find(e => String(e.courseId) === String(playerCourse.mongoId));
    return (
      <CoursePlayer
        course={{ ...playerCourse, progress: enr?.progress || 0, sectionsCompleted: enr?.sectionsCompleted || 0, nextItem: enr?.nextItem || 'Getting Started' }}
        yearId={playerCourse.yearId}
        onBack={async ({ refresh }) => { if (refresh) await loadData(); setPlayerCourse(null); }}
      />
    );
  }

  // Year detail
  if (selectedYear) {
    const yid  = String(selectedYear);
    const year = years[yid];
    if (!year) return null;
    const allDone = year.enrolled.length > 0 && year.enrolled.every(c => c.progress >= 100);

    return (
      <Screen>
        <ConfirmModal visible={Boolean(confirmUnenroll)} title="Unenroll?" danger
          message={confirmUnenroll ? `Remove "${confirmUnenroll.name}" from your enrollments?` : ''}
          confirmLabel="Unenroll" onConfirm={handleUnenroll} onCancel={() => setConfirmUnenroll(null)} />

        <TouchableOpacity onPress={() => setSelectedYear(null)}>
          <Text style={{ color: C.blueLight, fontWeight: '600', fontSize: 13 }}>← Back to Years</Text>
        </TouchableOpacity>

        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <SectionLabel>Year {yid}</SectionLabel>
              <Text style={st.pageTitle}>{year.title}</Text>
              <Text style={{ fontSize: 13, color: C.textSub, marginTop: 4, lineHeight: 18 }}>{year.desc}</Text>
            </View>
            <Tag label={year.status}
              color={year.status === 'Completed' ? C.emerald : year.status === 'In Progress' ? C.amber : year.status === 'Locked' ? C.textMuted : C.blueLight}
              bg={year.status === 'Completed' ? C.emeraldBg : year.status === 'In Progress' ? C.amberBg : year.status === 'Locked' ? C.surface : C.blueBg} />
          </View>
          <Divider />
          <Text style={{ fontSize: 13, color: C.textSub }}>
            Credits earned: <Text style={{ fontWeight: '700', color: C.text }}>{year.earnedCredits}</Text> / {year.totalCredits}
          </Text>
        </Card>

        {!year.unlocked && (
          <Card bg={C.amberBg} style={{ borderColor: C.amber, borderWidth: 1 }}>
            <Text style={{ fontSize: 22, marginBottom: 4 }}>🔒</Text>
            <Text style={{ fontWeight: '800', color: C.amber, fontSize: 14 }}>Year {yid} is locked</Text>
            <Text style={{ color: C.amber, fontSize: 13, marginTop: 4 }}>
              Earn {Math.max(0, UNLOCK_THRESHOLDS[Number(yid)] - totalEarned)} more credits to unlock this year.
            </Text>
          </Card>
        )}

        {allDone && year.unlocked && (
          <Card bg={C.emeraldBg} style={{ borderColor: C.emerald, borderWidth: 1 }}>
            <Text style={{ fontSize: 22, marginBottom: 6 }}>🎉</Text>
            <Text style={{ fontWeight: '800', color: C.emerald, fontSize: 15 }}>Year {yid} Complete!</Text>
            <Text style={{ color: C.emerald, fontSize: 13, marginTop: 4 }}>
              You earned {year.earnedCredits} credits. Revisit any course to review sections.
            </Text>
          </Card>
        )}

        {year.enrolled.length > 0 && (
          <>
            <SectionLabel>Your Courses</SectionLabel>
            {year.enrolled.map((e, i) => {
              const passed = e.progress >= 100;
              return (
                <Card key={e.id || i} style={passed ? { borderColor: C.emerald } : {}}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontWeight: '700', color: C.text, fontSize: 14 }}>{e.name}</Text>
                      <Text style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{e.code} · {e.credits} credits</Text>
                      {e.instructor ? <Text style={{ fontSize: 11, color: C.textMuted }}>Instructor: {e.instructor}</Text> : null}
                    </View>
                    {passed ? <Tag label="Passed ✓" color={C.emerald} bg={C.emeraldBg} /> :
                      <Text style={{ fontWeight: '700', color: C.blueLight, fontSize: 13 }}>{e.progress}%</Text>}
                  </View>
                  <ProgressBar value={e.progress} height={6} />
                  <Text style={{ fontSize: 11, color: C.textSub, marginTop: 4 }}>
                    {passed ? 'Completed — open to review sections' : `Next: ${e.nextItem}`}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Btn label="Open course" small onPress={() => setPlayerCourse({
                        id: e.id, courseId: e.id, mongoId: e.mongoId,
                        name: e.name, code: e.code, credits: e.credits,
                        instructor: e.instructor || 'TBA',
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
              <Card bg={C.surface}>
                <Text style={{ color: C.textSub, fontSize: 13 }}>
                  {year.enrolled.length > 0 ? 'You are enrolled in all available courses.' : 'No courses published yet.'}
                </Text>
              </Card>
            ) : (
              year.available.map(c => (
                <Card key={c.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '700', color: C.text, fontSize: 14 }}>{c.name}</Text>
                      <Text style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{c.code} · {c.credits} cr · {c.instructor}</Text>
                    </View>
                    <Btn label="Enroll" small onPress={() => handleEnroll(c)} />
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
      <Text style={st.pageTitle}>Academic Years</Text>
      <ErrorBox message={error} />

      <Card bg={C.blueBg} style={{ borderColor: C.blue, borderWidth: 1 }}>
        <SectionLabel>Degree Progress</SectionLabel>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <Pill label="Credits Earned" value={totalEarned} color={C.blueLight} />
          <Pill label="Completed" value={enrollments.filter(e => e.progress >= 100).length} color={C.emerald} />
        </View>
        <ProgressBar value={Math.round((totalEarned / 168) * 100)} height={8} />
        <Text style={{ fontSize: 11, color: C.textSub, marginTop: 4 }}>
          {Math.round((totalEarned / 168) * 100)}% of degree completed (168 total credits)
        </Text>
      </Card>

      {loadingInit ? (
        <Card><Text style={{ color: C.textSub }}>Loading…</Text></Card>
      ) : (
        ['1', '2', '3', '4'].map(yid => {
          const year = years[yid];
          if (!year) return null;
          const creditsNeeded = year.unlocked ? 0 : Math.max(0, UNLOCK_THRESHOLDS[Number(yid)] - totalEarned);
          return (
            <TouchableOpacity key={yid} onPress={() => setSelectedYear(yid)} activeOpacity={0.85}>
              <Card style={{
                borderWidth: year.status === 'Completed' ? 1.5 : 1,
                borderColor: year.status === 'Completed' ? C.emerald : !year.unlocked ? C.amber : C.border,
                backgroundColor: !year.unlocked ? 'rgba(245,158,11,0.07)' : C.card,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: !year.unlocked ? 'rgba(245,158,11,0.15)' : year.status === 'Completed' ? C.emeraldBg : C.blueBg }}>
                    <Text style={{ fontWeight: '800', fontSize: 20,
                      color: !year.unlocked ? C.amber : year.status === 'Completed' ? C.emerald : C.blueLight }}>
                      {!year.unlocked ? '🔒' : yid}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: C.text, fontSize: 15 }}>{year.title}</Text>
                    <Text style={{ fontSize: 12, color: C.textSub, marginTop: 2 }} numberOfLines={2}>{year.desc}</Text>
                  </View>
                </View>
                <Divider />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4,
                      backgroundColor: year.status === 'Completed' ? C.emerald : year.status === 'In Progress' ? C.amber : !year.unlocked ? C.amber : C.border }} />
                    <Text style={{ fontSize: 12, fontWeight: '700',
                      color: year.status === 'Completed' ? C.emerald : year.status === 'In Progress' ? C.amber : !year.unlocked ? C.amber : C.textSub }}>
                      {year.status}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: C.textSub }}>
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