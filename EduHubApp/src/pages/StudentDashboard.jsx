/**
 * pages/StudentDashboard.jsx
 * 4 tabs: Overview (with activity backlog) / Courses / Upload / Materials
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Screen, Card, SectionLabel, Tag, Pill, ProgressBar, Btn, Divider, ErrorBox, EmptyState, ConfirmModal, Avatar, useColors, st } from '../components/UI';

function safeArray(d) { return Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []; }

function buildYearsState(dbYears, coursesPerYear, enrollments) {
  const UNLOCK = { 1: 0, 2: 39, 3: 78, 4: 117 };
  const result = {};
  for (const yid of ['1', '2', '3', '4']) {
    const ynum = Number(yid);
    const dbYear = dbYears.find(y => String(y.year) === yid);
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
      .map(c => ({ id: String(c._id), name: c.title, code: c.code, credits: c.creditHours || 3, instructor: c.instructor || 'TBA', mongoId: String(c._id), yearId: yid }));
    const earnedCredits = enrolled.reduce((s, c) => s + (c.progress >= 100 ? c.credits || 0 : 0), 0);
    const totalEarnedSoFar = Object.values(result).reduce((sum, y) => sum + (y.earnedCredits ?? 0), 0) + earnedCredits;
    const unlocked = ynum === 1 || enrolled.length > 0 || totalEarnedSoFar >= (UNLOCK[ynum] ?? 0);
    result[yid] = { unlocked, earnedCredits, enrolled, available, totalCredits: dbYear?.totalCredits || 42 };
  }
  return result;
}

const TABS = [
  { id: 'dashboard',  label: 'Overview'  },
  { id: 'courses',    label: 'Courses'   },
  { id: 'upload',     label: 'Upload'    },
  { id: 'materials',  label: 'Materials' },
];
const ACTIVITY_KEY = 'eduhub-mobile-activity-v2';

async function storeJson(key, value) { try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {} }
async function loadJson(key)         { try { const v = await AsyncStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } }

function addActivity(setLog, entry) {
  setLog(prev => {
    const next = [{ id: Date.now() + Math.random(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), ...entry }, ...prev].slice(0, 100);
    storeJson(ACTIVITY_KEY, next);
    return next;
  });
}



export default function StudentDashboard() {
  const C = useColors();
  const STATUS_COLOR = { pending: C.amber, approved: C.emerald, rejected: C.rose };
  const STATUS_LABEL = { pending: '⏳ Pending', approved: '✅ Approved', rejected: '❌ Rejected' };
  const { dbUser } = useAuth();
  const [dbYears,       setDbYears]       = useState([]);
  const [coursesPerYear,setCoursesPerYear]= useState({});
  const [enrollments,   setEnrollments]   = useState([]);
  const [myMaterials,   setMyMaterials]   = useState([]);
  const [years,         setYears]         = useState({});
  const [activeTab,     setActiveTab]     = useState('dashboard');
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [activityLog,   setActivityLog]   = useState([]);
  const [confirmUnenroll, setConfirmUnenroll] = useState(null);

  const prevEnrolled  = useRef([]);
  const prevMaterials = useRef([]);
  const isMounted     = useRef(false);

  useEffect(() => { loadJson(ACTIVITY_KEY).then(v => { if (v) setActivityLog(v); }); }, []);

  const loadAll = useCallback(async () => {
    try {
      const [yrRes, enrRes, matRes, c1, c2, c3, c4] = await Promise.all([
        api.get('/academic-years'), api.get('/users/enrollments'), api.get('/users/materials'),
        api.get('/courses/year/1'), api.get('/courses/year/2'),
        api.get('/courses/year/3'), api.get('/courses/year/4'),
      ]);
      const dby  = safeArray(yrRes);
      const enrs = safeArray(enrRes);
      const cpy  = { '1': safeArray(c1), '2': safeArray(c2), '3': safeArray(c3), '4': safeArray(c4) };
      setDbYears(dby); setEnrollments(enrs); setCoursesPerYear(cpy);
      setMyMaterials(safeArray(matRes));
      setYears(buildYearsState(dby, cpy, enrs));
      setError('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, []);

  // Activity tracking
  useEffect(() => {
    if (!isMounted.current) { prevEnrolled.current = enrollments; return; }
    const prev = prevEnrolled.current; const curr = enrollments;
    curr.forEach(c => { if (!prev.some(p => p.courseId === c.courseId)) addActivity(setActivityLog, { icon: '📚', text: `Enrolled in "${c.name}" (Year ${c.yearId})`, color: C.emerald }); });
    prev.forEach(p => { if (!curr.some(c => c.courseId === p.courseId)) addActivity(setActivityLog, { icon: '🗑️', text: `Unenrolled from "${p.name}"`, color: C.rose }); });
    curr.forEach(c => {
      const p = prev.find(p => p.courseId === c.courseId);
      if (p) {
        if (c.progress === 100 && p.progress < 100) addActivity(setActivityLog, { icon: '🎉', text: `Completed "${c.name}"! +${c.credits || 0} credits`, color: C.emerald });
        else if (c.nextItem !== p.nextItem && c.progress < 100) addActivity(setActivityLog, { icon: '▶️', text: `Progress in "${c.name}" → ${c.nextItem}`, color: C.blueLight });
      }
    });
    prevEnrolled.current = curr;
  }, [enrollments]);

  useEffect(() => {
    if (!isMounted.current) { prevMaterials.current = myMaterials; isMounted.current = true; return; }
    const prev = prevMaterials.current; const curr = myMaterials;
    curr.forEach(m => {
      if (!prev.some(p => (p._id || p.id) === (m._id || m.id))) addActivity(setActivityLog, { icon: '📎', text: `Uploaded "${m.title}" — awaiting mentor review`, color: C.amber });
      const pm = prev.find(p => (p._id || p.id) === (m._id || m.id));
      if (pm && m.status !== pm.status) {
        const icon = m.status === 'approved' ? '✅' : m.status === 'rejected' ? '❌' : '⏳';
        addActivity(setActivityLog, { icon, text: `"${m.title}" was ${m.status} by mentor`, color: STATUS_COLOR[m.status] || C.textSub });
      }
    });
    prevMaterials.current = curr;
  }, [myMaterials]);

  const handleEnroll = async course => {
    try { await api.post(`/users/enrollments/${course.mongoId || course._id || course.id}`); await loadAll(); }
    catch (e) { Alert.alert('Failed', e.message); }
  };

  const handleUnenroll = async () => {
    if (!confirmUnenroll) return;
    try { await api.delete(`/users/enrollments/${confirmUnenroll.mongoId || confirmUnenroll.courseId}`); setConfirmUnenroll(null); await loadAll(); }
    catch (e) { Alert.alert('Failed', e.message); }
  };

  const handleRemoveMaterial = async id => {
    try { await api.delete(`/users/materials/${id}`); setMyMaterials(prev => prev.filter(m => (m._id || m.id) !== id)); }
    catch (e) { Alert.alert('Failed', e.message); }
  };

  const enrolledCourses  = Object.values(years).flatMap(y => y.enrolled || []);
  const availableCourses = Object.entries(years).filter(([, y]) => y.unlocked).flatMap(([, y]) => y.available || []);
  const inProgress       = enrolledCourses.filter(c => c.progress > 0 && c.progress < 100);
  const completed        = enrolledCourses.filter(c => c.progress >= 100);
  const totalCredits     = completed.reduce((s, c) => s + (c.credits || 0), 0);
  const firstName        = dbUser?.name?.split(' ')[0] || 'Student';

  return (
    <Screen>
      <ConfirmModal visible={Boolean(confirmUnenroll)} title="Unenroll?" danger
        message={confirmUnenroll ? `Remove "${confirmUnenroll.name}" from your enrollments?` : ''}
        confirmLabel="Unenroll" onConfirm={handleUnenroll} onCancel={() => setConfirmUnenroll(null)} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Avatar name={dbUser?.name || 'S'} />
        <View>
          <Text style={{ fontWeight: '800', fontSize: 16, color: C.text }}>Welcome, {firstName} 👋</Text>
          <Text style={{ fontSize: 12, color: C.textSub, marginTop: 1, textTransform: 'capitalize' }}>{dbUser?.role || 'student'}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab.id} onPress={() => setActiveTab(tab.id)}
              style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99,
                backgroundColor: activeTab === tab.id ? C.blue : C.card,
                borderWidth: 1, borderColor: activeTab === tab.id ? C.blue : C.border }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: activeTab === tab.id ? '#fff' : C.textSub }}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <ErrorBox message={error} />

      {loading ? <Card><Text style={{ color: C.textSub, textAlign: 'center' }}>Loading…</Text></Card> : (
        <>
          {/* Overview */}
          {activeTab === 'dashboard' && (
            <>
              <Card>
                <SectionLabel>Overview</SectionLabel>
                <View style={{ flexDirection: 'row' }}>
                  <Pill label="Enrolled"    value={enrolledCourses.length} color={C.blueLight} />
                  <Pill label="In Progress" value={inProgress.length}      color={C.amber}     />
                  <Pill label="Completed"   value={completed.length}       color={C.emerald}   />
                  <Pill label="Credits"     value={totalCredits}           color={C.blueLight} />
                </View>
              </Card>
              {inProgress.length > 0 && (
                <Card>
                  <SectionLabel>Continue Learning</SectionLabel>
                  {inProgress.slice(0, 3).map((e, i) => (
                    <View key={e.id || i} style={{ marginTop: i > 0 ? 12 : 4 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontWeight: '700', color: C.text, flex: 1, marginRight: 8 }} numberOfLines={1}>{e.name}</Text>
                        <Text style={{ fontWeight: '700', color: C.blueLight, fontSize: 12 }}>{e.progress}%</Text>
                      </View>
                      <ProgressBar value={e.progress} />
                      <Text style={{ fontSize: 11, color: C.textSub, marginTop: 3 }}>Next: {e.nextItem}</Text>
                    </View>
                  ))}
                </Card>
              )}
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <SectionLabel>Activity Log</SectionLabel>
                  {activityLog.length > 0 && (
                    <TouchableOpacity onPress={() => { setActivityLog([]); storeJson(ACTIVITY_KEY, []); }}>
                      <Text style={{ fontSize: 11, color: C.rose, fontWeight: '600' }}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {activityLog.length === 0 ? (
                  <Text style={{ color: C.textSub, fontSize: 13 }}>No activity yet. Enroll in a course or upload materials.</Text>
                ) : (
                  activityLog.slice(0, 15).map(entry => (
                    <View key={entry.id} style={{ flexDirection: 'row', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderColor: C.border }}>
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 15 }}>{entry.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, color: entry.color, fontWeight: '600' }}>{entry.text}</Text>
                        <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{entry.time}</Text>
                      </View>
                    </View>
                  ))
                )}
              </Card>
              {enrolledCourses.length === 0 && <EmptyState icon="📚" title="No courses yet" subtitle="Go to Academic Years to enroll." />}
            </>
          )}

          {/* Courses */}
          {activeTab === 'courses' && (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionLabel>Enrolled ({enrolledCourses.length})</SectionLabel>
                <Text style={{ fontSize: 11, color: C.textMuted }}>{totalCredits} credits earned</Text>
              </View>
              {enrolledCourses.length === 0 ? <EmptyState icon="📚" title="No courses" subtitle="Enroll from available below." /> :
                enrolledCourses.map((e, i) => (
                  <Card key={e.id || i} style={e.progress >= 100 ? { borderColor: C.emerald } : {}}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={{ fontWeight: '700', color: C.text, fontSize: 14 }}>{e.name}</Text>
                        <Text style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{e.code} · Year {e.yearId} · {e.credits} cr</Text>
                      </View>
                      {e.progress >= 100 ? <Tag label="Done ✓" color={C.emerald} bg={C.emeraldBg} /> :
                        <Text style={{ fontWeight: '700', color: C.blueLight, fontSize: 13 }}>{e.progress}%</Text>}
                    </View>
                    <ProgressBar value={e.progress} height={6} />
                    <Text style={{ fontSize: 11, color: C.textSub, marginTop: 4 }}>
                      {e.progress >= 100 ? 'Completed ✓' : `Next: ${e.nextItem}`}
                    </Text>
                    {e.progress < 100 && (
                      <View style={{ marginTop: 10 }}>
                        <Btn label="Unenroll" variant="outline" small
                          onPress={() => setConfirmUnenroll({ mongoId: e.mongoId, courseId: e.id, name: e.name })} />
                      </View>
                    )}
                  </Card>
                ))}
              <SectionLabel>Available to Enroll ({availableCourses.length})</SectionLabel>
              {availableCourses.length === 0 ?
                <Card bg={C.surface}><Text style={{ color: C.textSub, fontSize: 13 }}>No additional courses available from unlocked years.</Text></Card> :
                availableCourses.map(c => (
                  <Card key={c.id}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '700', color: C.text, fontSize: 14 }}>{c.name}</Text>
                        <Text style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>Year {c.yearId} · {c.code} · {c.credits} cr · {c.instructor}</Text>
                      </View>
                      <Btn label="Enroll" small onPress={() => handleEnroll(c)} />
                    </View>
                  </Card>
                ))}
            </>
          )}

          {/* Upload */}
          {activeTab === 'upload' && (
            enrolledCourses.length === 0 ?
              <EmptyState icon="📎" title="No courses enrolled" subtitle="Enroll first to upload materials." /> :
              <>
                <Text style={{ fontSize: 13, color: C.textSub }}>
                  Open a course from Academic Years → Upload tab to submit materials by section.
                </Text>
                {enrolledCourses.map((e, i) => {
                  const courseMats   = myMaterials.filter(m => String(m.courseId || m.courseRef) === String(e.mongoId));
                  const pendingCount = courseMats.filter(m => m.status === 'pending').length;
                  return (
                    <Card key={e.id || i}>
                      <Text style={{ fontWeight: '700', color: C.text, fontSize: 14 }}>{e.name}</Text>
                      <Text style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{e.code} · {courseMats.length} material{courseMats.length !== 1 ? 's' : ''}</Text>
                      {pendingCount > 0 && <Text style={{ fontSize: 12, color: C.amber, marginTop: 2 }}>⏳ {pendingCount} pending review</Text>}
                    </Card>
                  );
                })}
                {myMaterials.length > 0 && (
                  <>
                    <SectionLabel>Your Materials</SectionLabel>
                    {myMaterials.map((m, i) => (
                      <Card key={m._id || m.id || i}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '600', color: C.text, fontSize: 13 }}>{m.title}</Text>
                            <Text style={{ fontSize: 11, color: STATUS_COLOR[m.status] || C.textSub, marginTop: 2 }}>{STATUS_LABEL[m.status] || m.status}</Text>
                            {m.mentorFeedback ? <Text style={{ fontSize: 11, color: C.textSub, marginTop: 2 }}>Feedback: {m.mentorFeedback}</Text> : null}
                          </View>
                          <TouchableOpacity onPress={() => handleRemoveMaterial(m._id || m.id)}>
                            <Text style={{ fontSize: 12, color: C.rose, fontWeight: '600' }}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </Card>
                    ))}
                  </>
                )}
              </>
          )}

          {/* Materials */}
          {activeTab === 'materials' && (
            myMaterials.length === 0 ? <EmptyState icon="📋" title="No materials yet" /> :
              myMaterials.map((m, i) => (
                <Card key={m._id || m.id || i}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontWeight: '700', color: C.text, fontSize: 13 }}>{m.title}</Text>
                      <Text style={{ fontSize: 12, color: C.textSub, marginTop: 2 }}>{m.course} · {m.type}</Text>
                      {m.mentorFeedback ? <Text style={{ fontSize: 11, color: C.textSub, marginTop: 2, fontStyle: 'italic' }}>Feedback: {m.mentorFeedback}</Text> : null}
                      <Text style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{new Date(m.createdAt || Date.now()).toLocaleString()}</Text>
                    </View>
                    <Tag label={STATUS_LABEL[m.status] || m.status}
                      color={STATUS_COLOR[m.status] || C.textSub}
                      bg={m.status === 'approved' ? C.emeraldBg : m.status === 'rejected' ? C.roseBg : C.amberBg} />
                  </View>
                </Card>
              ))
          )}
        </>
      )}
    </Screen>
  );
}