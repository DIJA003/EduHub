import { useState, useEffect } from 'react';
import Modal from '../../components/admin/Modal';
import {
  Badge, FormGroup, FormInput, FormSelect,
  PageHeader, TableWrap, TableSearch, EmptyState,
  BtnPrimary, BtnSecondary, BtnDanger, tw,
} from '../../components/admin/adminUtils';
import { coursesApi, collegesApi } from '../../services/api';

const EMPTY = { code: '', title: '', college: '', instructor: '', students: '', status: 'Draft' };
const statusVariant = (s) => s === 'Published' ? 'success' : s === 'Draft' ? 'warning' : 'default';

function CourseManagement() {
  const [courses,  setCourses]  = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [cRes, colRes] = await Promise.all([
        coursesApi.getAll(),
        collegesApi.getAll(),
      ]);
      setCourses(cRes.data || []);
      setColleges(colRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered   = courses.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase())
  );
  const openAdd    = ()  => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit   = (c) => { setForm(c); setEditId(c._id); setModal(true); };
  const closeModal = ()  => { setModal(false); setSaving(false); };
  const set        = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title?.trim() || !form.code?.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const res = await coursesApi.update(editId, form);
        setCourses((p) => p.map((c) => c._id === editId ? res.data : c));
      } else {
        const res = await coursesApi.create(form);
        setCourses((p) => [...p, res.data]);
      }
      closeModal();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await coursesApi.remove(id);
      setCourses((p) => p.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const TH = ({ children }) => (
    <th className={tw.th} style={{ color: 'var(--text-muted)', borderBottomColor: 'var(--border)' }}>{children}</th>
  );
  const TD = ({ children, secondary, small }) => (
    <td className={tw.td} style={{
      borderBottomColor: 'var(--border-light)',
      color: secondary ? 'var(--text-secondary)' : 'var(--text-primary)',
      fontSize: small ? '13px' : undefined,
    }}>
      {children}
    </td>
  );

  return (
    <div>
      <PageHeader
        title="Course Management"
        subtitle="Create and manage courses across all faculties."
        actions={
          <BtnPrimary onClick={openAdd}>
            <span className="material-symbols-outlined text-[14px]">add</span>
            Add Course
          </BtnPrimary>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
          {error} — <button className="underline" onClick={loadData}>Retry</button>
        </div>
      )}

      <TableWrap
        toolbar={
          <>
            <span className="text-[13.5px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              All Courses ({filtered.length})
            </span>
            <TableSearch value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." />
          </>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📚" title="No courses found" description="Try a different search or add a new course." />
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ background: 'var(--bg-card)' }}>
              <tr>
                <TH>Code</TH><TH>Title</TH><TH>College</TH>
                <TH>Instructor</TH><TH>Students</TH><TH>Status</TH><TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id} className={tw.trHover}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <TD><Badge variant="blue" mono>{c.code}</Badge></TD>
                  <TD><span className="font-medium">{c.title}</span></TD>
                  <TD secondary small>{c.college}</TD>
                  <TD secondary small>{c.instructor}</TD>
                  <TD>{c.students}</TD>
                  <TD><Badge variant={statusVariant(c.status)}>{c.status}</Badge></TD>
                  <TD>
                    <div className="flex items-center gap-2 justify-end">
                      <BtnSecondary className={tw.btnSm} onClick={() => openEdit(c)}>Edit</BtnSecondary>
                      <BtnDanger    className={tw.btnSm} onClick={() => handleDelete(c._id)}>Delete</BtnDanger>
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      {modal && (
        <Modal title={editId ? 'Edit Course' : 'Add New Course'} onClose={closeModal}
          footer={
            <>
              <BtnSecondary onClick={closeModal}>Cancel</BtnSecondary>
              <BtnPrimary onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Course'}
              </BtnPrimary>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Course Code">
                <FormInput value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="e.g. CS101" />
              </FormGroup>
              <FormGroup label="Status">
                <FormSelect value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option>Draft</option><option>Published</option><option>Archived</option>
                </FormSelect>
              </FormGroup>
            </div>
            <FormGroup label="Course Title">
              <FormInput value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Introduction to Computer Science" />
            </FormGroup>
            <FormGroup label="College">
              <FormSelect value={form.college} onChange={(e) => set('college', e.target.value)}>
                <option value="">Select college...</option>
                {colleges.map((col) => <option key={col._id} value={col.name}>{col.name}</option>)}
              </FormSelect>
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Instructor">
                <FormInput value={form.instructor} onChange={(e) => set('instructor', e.target.value)} placeholder="Dr. Name" />
              </FormGroup>
              <FormGroup label="Enrolled Students">
                <FormInput type="number" value={form.students} onChange={(e) => set('students', e.target.value)} placeholder="0" />
              </FormGroup>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CourseManagement;