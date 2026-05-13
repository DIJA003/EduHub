/**
 * context/CourseContext.jsx
 * Same logic as web version — localStorage replaced with AsyncStorage for React Native
 */
import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { enrollmentApi2, courseCatalogApi } from '../services/api';
import { useAuth } from './AuthContext';

const CourseContext = createContext(null);
const STORAGE_KEY = 'eduhub-course-state-v3';

export function computeYearEarnedCredits(enrolled) {
  if (!enrolled?.length) return 0;
  return enrolled.reduce((sum, c) => sum + (c.progress >= 100 ? c.credits || 0 : 0), 0);
}

export function sumEnrolledCredits(enrolled) {
  if (!enrolled?.length) return 0;
  return enrolled.reduce((sum, c) => sum + (c.credits || 0), 0);
}

export function getCurrentAcademicYearId(years) {
  if (!years) return '2';
  const ordered = Object.keys(years).sort((a, b) => Number(a) - Number(b));
  const active = ordered.find(id => {
    const m = years[id]?.meta;
    return m && m.unlocked !== false && m.status === 'In Progress';
  });
  if (active) return active;
  const fallback = ordered.filter(id => years[id]?.meta?.unlocked !== false);
  return fallback[fallback.length - 1] ?? ordered[0] ?? '2';
}

function withYearEarnedCredits(year) {
  const earnedCredits = computeYearEarnedCredits(year.enrolled);
  return { ...year, meta: { ...year.meta, earnedCredits } };
}

const BASE_STATE = {
  lastCompletedCourse: null,
  years: {
    1: { meta: { title: 'Year One: Freshman Year',  status: 'Completed',  earnedCredits: 42, totalCredits: 42, unlocked: true  }, enrolled: [], available: [] },
    2: { meta: { title: 'Year Two: Sophomore Year', status: 'In Progress',earnedCredits: 0,  totalCredits: 42, unlocked: true  }, enrolled: [], available: [] },
    3: { meta: { title: 'Year Three: Junior Year',  status: 'Locked',     earnedCredits: 0,  totalCredits: 42, unlocked: false }, enrolled: [], available: [] },
    4: { meta: { title: 'Year Four: Senior Year',   status: 'Locked',     earnedCredits: 0,  totalCredits: 42, unlocked: false }, enrolled: [], available: [] },
  },
};

// AsyncStorage helpers (same as localStorage helpers in web)
async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

async function saveState(state) {
  try {
    const toSave = { lastCompletedCourse: state.lastCompletedCourse, years: {} };
    Object.keys(state.years).forEach(id => {
      const y = state.years[id];
      toSave.years[id] = { meta: y.meta, enrolled: y.enrolled };
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
}

function mergeStoredState(base, stored) {
  if (!stored) return base;
  const merged = { ...base, lastCompletedCourse: stored.lastCompletedCourse ?? base.lastCompletedCourse };
  merged.years = { ...base.years };
  Object.keys(stored.years || {}).forEach(id => {
    const storedYear = stored.years[id];
    const baseYear   = base.years[id];
    if (!baseYear) return;
    merged.years[id] = {
      ...baseYear,
      meta:     { ...baseYear.meta, ...(storedYear.meta || {}) },
      enrolled: storedYear.enrolled?.length > 0 ? storedYear.enrolled : baseYear.enrolled,
    };
  });
  return merged;
}

export function CourseProvider({ children }) {
  const { user } = useAuth();
  const [state,       setState]       = useState(BASE_STATE);
  const [courseIdMap, setCourseIdMap] = useState({});
  const [hydrated,    setHydrated]    = useState(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    loadState().then(stored => {
      const merged = mergeStoredState(BASE_STATE, stored);
      const y = { ...merged.years };
      Object.keys(y).forEach(id => { y[id] = withYearEarnedCredits(y[id]); });
      setState({ ...merged, years: y });
      setHydrated(true);
    });
  }, []);

  // Persist on every change (after hydration)
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  // Sync from backend on login
  useEffect(() => {
    if (!user) return;
    const syncFromBackend = async () => {
      try {
        const yearIds = ['1', '2', '3', '4'];
        const yearCourses = {};
        await Promise.all(yearIds.map(async yid => {
          try { const r = await courseCatalogApi.getByYear(yid); yearCourses[yid] = r.data || []; }
          catch { yearCourses[yid] = []; }
        }));
        const enrollRes  = await enrollmentApi2.getAll();
        const enrollments = enrollRes.data || [];
        const idMap = {};
        enrollments.forEach(e => { if (e.courseId && e.id) idMap[e.id] = e.courseId; });
        setCourseIdMap(idMap);

        setState(prev => {
          const years = {};
          yearIds.forEach(yid => {
            const year = prev.years[yid];
            if (!year) return;
            const adminCourses = yearCourses[yid] || [];
            const existingIds = new Set([...(year.available || []).map(c => String(c.id)), ...(year.enrolled || []).map(c => String(c.id))]);
            const newAdminCourses = adminCourses
              .filter(c => !existingIds.has(String(c._id)))
              .map(c => ({ id: String(c._id), name: c.title, code: c.code, credits: c.creditHours || 3, type: 'Core', mongoId: String(c._id) }));
            years[yid] = { ...year, available: [...(year.available || []), ...newAdminCourses] };
          });
          enrollments.forEach(e => {
            const yid = String(e.yearId || '2');
            if (!years[yid]) return;
            const year = years[yid];
            const available = (year.available || []).filter(c => c.id !== e.id && String(c.id) !== String(e.courseId));
            const existing  = year.enrolled.find(c => c.id === e.id || String(c.id) === String(e.courseId));
            const updatedCourse = { id: e.id, name: e.name, code: e.code, credits: e.credits, progress: Math.max(e.progress || 0, existing?.progress || 0), mongoId: e.courseId };
            const enrolled = existing
              ? year.enrolled.map(c => c.id === e.id ? { ...c, ...updatedCourse } : c)
              : [...year.enrolled, updatedCourse];
            years[yid] = withYearEarnedCredits({ ...year, enrolled, available });
          });
          yearIds.forEach(yid => { if (!years[yid]) years[yid] = prev.years[yid]; });
          return { ...prev, years };
        });
      } catch (err) {
        console.warn('CourseContext: backend sync failed:', err.message);
      }
    };
    syncFromBackend();
  }, [user]);

  const currentYearId = useMemo(() => getCurrentAcademicYearId(state.years), [state.years]);

  const enrollCourse = useCallback((yearId, course) => {
    setState(prev => {
      const year = prev.years[yearId];
      if (!year || year.enrolled.some(c => c.id === course.id)) return prev;
      const enrolled = [...year.enrolled, { id: course.id, name: course.name, code: course.code || 'ELEC', credits: course.credits || 3, progress: 0, mongoId: course.mongoId || null }];
      return { ...prev, years: { ...prev.years, [yearId]: withYearEarnedCredits({ ...year, enrolled, available: year.available.filter(c => c.id !== course.id) }) } };
    });
    if (user) {
      const mongoId = course.mongoId || courseIdMap[course.id];
      if (mongoId) enrollmentApi2.enroll(mongoId).catch(err => console.warn('Backend enroll failed:', err.message));
    }
  }, [user, courseIdMap]);

  const undoEnrollment = useCallback((yearId, courseId) => {
    setState(prev => {
      const year   = prev.years[yearId];
      const course = year?.enrolled.find(c => c.id === courseId);
      if (!course) return prev;
      const enrolled = year.enrolled.filter(c => c.id !== courseId);
      return { ...prev, years: { ...prev.years, [yearId]: withYearEarnedCredits({ ...year, enrolled, available: [...year.available, { id: course.id, name: course.name, credits: course.credits || 3, mongoId: course.mongoId }] }) } };
    });
    if (user) {
      const mongoId = courseIdMap[courseId];
      enrollmentApi2.unenroll(mongoId || courseId).catch(err => console.warn('Backend unenroll failed:', err.message));
    }
  }, [user, courseIdMap]);

  const updateCourseProgress = useCallback((yearId, courseId, payload) => {
    const { progress, nextItem, sectionsCompleted } = payload;
    setState(prev => {
      const year = prev.years[yearId];
      if (!year) return prev;
      const enrolled = year.enrolled.map(c => c.id === courseId ? { ...c, progress, nextItem, ...(sectionsCompleted !== undefined ? { sectionsCompleted } : {}) } : c);
      return { ...prev, years: { ...prev.years, [yearId]: withYearEarnedCredits({ ...year, enrolled }) } };
    });
    if (user) {
      const mongoId = courseIdMap[courseId];
      enrollmentApi2.updateProgress(mongoId || courseId, { progress, nextItem, sectionsCompleted })
        .catch(err => console.warn('Backend progress update failed:', err.message));
    }
  }, [user, courseIdMap]);

  const value = useMemo(() => ({ years: state.years, currentYearId, lastCompletedCourse: state.lastCompletedCourse, enrollCourse, undoEnrollment, updateCourseProgress }), [state, currentYearId, enrollCourse, undoEnrollment, updateCourseProgress]);

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used within a CourseProvider');
  return ctx;
}