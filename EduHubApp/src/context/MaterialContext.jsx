/**
 * context/MaterialContext.jsx
 * Identical logic to web version — no changes needed (no browser APIs used)
 */
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { studentMaterialsApi, mentorReviewApi } from '../services/api';
import { useAuth } from './AuthContext';

const MaterialContext = createContext(null);

export function MaterialProvider({ children }) {
  const { user, dbUser } = useAuth();
  const [materials,        setMaterials]        = useState([]);
  const [pendingMaterials, setPendingMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const shapeFromApi = (m) => ({
    id:             m._id,
    courseId:       m.courseId || m.courseRef || m.course || '',
    courseName:     m.course || '',
    fileName:       m.title,
    type:           (m.type || 'file').toLowerCase(),
    uploadDate:     m.createdAt || m.uploaded || new Date().toISOString(),
    status:         m.status || 'pending',
    size:           m.size,
    uploader:       m.uploader,
    sectionId:      m.sectionId || '',
    sectionLabel:   m.sectionLabel || '',
    mentorFeedback: m.mentorFeedback || '',
    fileUrl:        m.fileUrl || '',
    storagePath:    m.storagePath || '',
  });

  useEffect(() => {
    if (!user) { setMaterials([]); setPendingMaterials([]); return; }

    const fetchMaterials = async () => {
      setLoading(true); setError(null);
      try {
        if (dbUser?.role === 'mentor' || dbUser?.role === 'admin') {
          const res    = await mentorReviewApi.getPending();
          const shaped = (res.data || []).map(shapeFromApi);
          setPendingMaterials(shaped);
          setMaterials(shaped);
        } else {
          const res    = await studentMaterialsApi.getAll();
          const shaped = (res.data || []).map(shapeFromApi);
          setMaterials(shaped);
          setPendingMaterials(shaped.filter(m => m.status === 'pending'));
        }
      } catch (err) {
        console.warn('MaterialContext: backend unavailable:', err.message);
        setError(err.message);
        setMaterials([]); setPendingMaterials([]);
      } finally { setLoading(false); }
    };

    if (dbUser !== null) fetchMaterials();
  }, [user, dbUser?.role]);

  const addMaterial = useCallback(async (material) => {
    if (material.id && !material.id.startsWith('tmp-')) {
      const shaped = shapeFromApi({ _id: material.id, title: material.fileName, course: material.courseName || '', type: material.type || 'file', createdAt: new Date().toISOString(), status: material.status || 'pending', fileUrl: material.fileUrl || '' });
      setMaterials(prev => [shaped, ...prev]);
      if (shaped.status === 'pending') setPendingMaterials(prev => [shaped, ...prev]);
      return shaped;
    }
    const optimistic = { id: `tmp-${Date.now()}`, courseId: material.courseId || '', courseName: material.courseName || '', fileName: material.fileName, type: material.type || 'file', uploadDate: new Date().toISOString(), status: 'pending', fileUrl: '' };
    setMaterials(prev => [optimistic, ...prev]);
    setPendingMaterials(prev => [optimistic, ...prev]);
    try {
      const res   = await studentMaterialsApi.create({ title: material.fileName, course: material.courseName || '', type: material.type === 'pdf' ? 'PDF' : material.type === 'video' ? 'Video' : 'Other', courseId: material.courseId || '' });
      const saved = shapeFromApi(res.data);
      setMaterials(prev => prev.map(m => m.id === optimistic.id ? saved : m));
      setPendingMaterials(prev => prev.map(m => m.id === optimistic.id ? saved : m));
      return saved;
    } catch (err) { console.warn('Material upload failed:', err.message); return optimistic; }
  }, []);

  const removeMaterial = useCallback(async (id) => {
    const backup = materials.find(m => m.id === id);
    setMaterials(prev => prev.filter(m => m.id !== id));
    setPendingMaterials(prev => prev.filter(m => m.id !== id));
    if (!id.startsWith('tmp-')) {
      try { await studentMaterialsApi.remove(id); }
      catch (err) { if (backup) setMaterials(prev => [backup, ...prev]); }
    }
  }, [materials]);

  const approveMaterial = useCallback(async (id, feedback = '') => {
    setPendingMaterials(prev => prev.filter(m => m.id !== id));
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, status: 'approved' } : m));
    try { await mentorReviewApi.approve(id, feedback); } catch (err) { console.warn('Backend approve failed:', err.message); }
  }, []);

  const rejectMaterial = useCallback(async (id, feedback = '') => {
    setPendingMaterials(prev => prev.filter(m => m.id !== id));
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, status: 'rejected' } : m));
    try { await mentorReviewApi.reject(id, feedback); } catch (err) { console.warn('Backend reject failed:', err.message); }
  }, []);

  const value = useMemo(() => ({ materials, pendingMaterials, loading, error, addMaterial, removeMaterial, approveMaterial, rejectMaterial }), [materials, pendingMaterials, loading, error, addMaterial, removeMaterial, approveMaterial, rejectMaterial]);

  return <MaterialContext.Provider value={value}>{children}</MaterialContext.Provider>;
}

export function useMaterials() {
  const ctx = useContext(MaterialContext);
  if (!ctx) throw new Error('useMaterials must be used within MaterialProvider');
  return ctx;
}
