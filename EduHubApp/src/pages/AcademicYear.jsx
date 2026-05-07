/**
 * pages/AcademicYear.jsx
 * Same logic as web AcademicYear.jsx — uses CourseContext
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCourses, getCurrentAcademicYearId, computeYearEarnedCredits } from '../context/CourseContext';
import { Badge } from '../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../utils/theme';

const YEAR_STATUS_V = { Completed: 'success', 'In Progress': 'blue', Locked: 'default' };

function ProgressBar({ value, max, color = colors.accent }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <View style={pb.track}>
      <View style={[pb.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}
const pb = StyleSheet.create({
  track: { height: 6, backgroundColor: colors.bgCard, borderRadius: 3, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 3 },
});

export default function AcademicYear() {
  const { dbUser } = useAuth();
  const { years, currentYearId, enrollCourse, undoEnrollment } = useCourses();

  const yearIds = Object.keys(years).sort((a, b) => Number(a) - Number(b));

  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>

      {/* Header */}
      <View style={st.header}>
        {dbUser && (
          <View style={st.userBanner}>
            <View style={st.avatar}>
              <Text style={st.avatarTxt}>{dbUser.name?.[0]?.toUpperCase() || 'S'}</Text>
            </View>
            <View>
              <Text style={st.userName}>{dbUser.name}</Text>
              <Text style={st.userRole}>{dbUser.college || 'Student'}</Text>
            </View>
          </View>
        )}
        <Text style={st.pageTitle}>Academic Path</Text>
        <Text style={st.pageSub}>Track your progress through each academic year.</Text>
      </View>

      {/* Year cards */}
      {yearIds.map(yearId => {
        const year    = years[yearId];
        const meta    = year?.meta || {};
        const locked  = meta.unlocked === false;
        const isCurrent = yearId === currentYearId;
        const earned  = computeYearEarnedCredits(year?.enrolled || []);
        const total   = meta.totalCredits || 42;

        return (
          <View key={yearId} style={[st.yearCard, locked && st.yearCardLocked, isCurrent && st.yearCardCurrent]}>
            {/* Year header */}
            <View style={st.yearHeader}>
              <View>
                <Text style={st.yearTitle}>{meta.title || `Year ${yearId}`}</Text>
                <Text style={st.yearCredits}>{earned} / {total} credits earned</Text>
              </View>
              <Badge variant={YEAR_STATUS_V[meta.status] || 'default'}>{meta.status || 'Locked'}</Badge>
            </View>

            <ProgressBar value={earned} max={total} color={locked ? colors.textMuted : colors.accent} />

            {locked ? (
              <View style={st.lockedBanner}><Text style={st.lockedTxt}>🔒 Complete previous year to unlock</Text></View>
            ) : (
              <>
                {/* Enrolled courses */}
                {(year?.enrolled || []).length > 0 && (
                  <View style={st.courseSection}>
                    <Text style={st.courseSectionTitle}>Enrolled ({year.enrolled.length})</Text>
                    {year.enrolled.map(course => (
                      <View key={course.id} style={st.courseRow}>
                        <View style={st.courseIconWrap}>
                          <Text style={{ fontSize: 16 }}>📘</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={st.courseName}>{course.name}</Text>
                          <Text style={st.courseMeta}>{course.code} · {course.credits || 3} cr</Text>
                          {course.progress > 0 && <ProgressBar value={course.progress} max={100} color={colors.success} />}
                        </View>
                        <TouchableOpacity onPress={() => undoEnrollment(yearId, course.id)} style={st.unenrollBtn}>
                          <Text style={st.unenrollTxt}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Available courses */}
                {(year?.available || []).length > 0 && (
                  <View style={st.courseSection}>
                    <Text style={st.courseSectionTitle}>Available ({year.available.length})</Text>
                    {year.available.map(course => (
                      <View key={course.id} style={st.courseRow}>
                        <View style={[st.courseIconWrap, { backgroundColor: colors.bgCard }]}>
                          <Text style={{ fontSize: 16 }}>📗</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={st.courseName}>{course.name}</Text>
                          <Text style={st.courseMeta}>{course.code || 'ELEC'} · {course.credits || 3} cr</Text>
                        </View>
                        <TouchableOpacity onPress={() => enrollCourse(yearId, course)} style={st.enrollBtn}>
                          <Text style={st.enrollTxt}>+ Enroll</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {(year?.enrolled || []).length === 0 && (year?.available || []).length === 0 && (
                  <Text style={st.emptyTxt}>No courses available for this year yet.</Text>
                )}
              </>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgBase },
  content:   { padding: spacing.xl, gap: spacing.xl, paddingBottom: 60 },

  header:    { gap: spacing.md },
  userBanner:{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  avatar:    { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.white },
  userName:  { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  userRole:  { fontSize: fontSize.sm, color: colors.textMuted },
  pageTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary, letterSpacing: -0.5 },
  pageSub:   { fontSize: fontSize.sm, color: colors.textSecondary },

  yearCard:        { backgroundColor: colors.bgSurface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, gap: spacing.lg },
  yearCardLocked:  { opacity: 0.55 },
  yearCardCurrent: { borderColor: colors.accent },
  yearHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  yearTitle:       { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.textPrimary },
  yearCredits:     { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  lockedBanner:    { backgroundColor: colors.bgCard, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  lockedTxt:       { fontSize: fontSize.sm, color: colors.textMuted },

  courseSection:     { gap: spacing.md },
  courseSectionTitle:{ fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  courseRow:         { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgCard, borderRadius: radius.md, padding: spacing.md },
  courseIconWrap:    { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.accentGlow, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  courseName:        { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  courseMeta:        { fontSize: fontSize.xs, color: colors.textMuted },
  enrollBtn:         { backgroundColor: colors.accent, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.sm },
  enrollTxt:         { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  unenrollBtn:       { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  unenrollTxt:       { color: colors.danger, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  emptyTxt:          { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center' },
});
