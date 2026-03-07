import { useState } from "react";
import Modal from "../../components/admin/Modal";
import {
  Badge, FormGroup, FormInput, FormSelect,
  PageHeader, TableWrap, TableSearch, EmptyState,
  BtnPrimary, BtnSecondary, BtnDanger, tw
} from "../../components/admin/adminUtils";

const INIT_COURSES = [
  { id: 1, code: "CS101",  title: "Introduction to Computer Science", college: "Faculty of Science",     instructor: "Dr. Mona Salem",   students: 84, status: "Published" },
  { id: 2, code: "ENG201", title: "Engineering Mathematics II",       college: "Faculty of Engineering", instructor: "Dr. Tarek Nasser", students: 62, status: "Published" },
  { id: 3, code: "BUS301", title: "Business Strategy",                college: "Faculty of Business",    instructor: "Prof. Hana Samir", students: 55, status: "Draft"     },
  { id: 4, code: "CS302",  title: "Data Structures & Algorithms",     college: "Faculty of Science",     instructor: "Dr. Yasser Fathi", students: 71, status: "Published" },
  { id: 5, code: "ART101", title: "History of Art",                   college: "Faculty of Arts",        instructor: "Dr. Nadia Hassan", students: 38, status: "Archived"  },
];
const COLLEGES = ["Faculty of Engineering","Faculty of Science","Faculty of Business","Faculty of Arts"];
const EMPTY    = { code: "", title: "", college: "", instructor: "", students: "", status: "Draft" };
const statusVariant = (s) => s === "Published" ? "success" : s === "Draft" ? "warning" : "default";

function CourseManagement() {
  const [courses, setCourses] = useState(INIT_COURSES);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [editId,  setEditId]  = useState(null);

  const filtered   = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );
  const openAdd    = ()   => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit   = (c)  => { setForm(c); setEditId(c.id); setModal(true); };
  const closeModal = ()   => setModal(false);
  const set        = (k,v)=> setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim() || !form.code.trim()) return;
    if (editId) setCourses((p) => p.map((c) => c.id === editId ? { ...form, id: editId } : c));
    else        setCourses((p) => [...p, { ...form, id: Date.now() }]);
    closeModal();
  };
  const handleDelete = (id) => setCourses((p) => p.filter((c) => c.id !== id));

  const TH = ({ children }) => (
    <th className={tw.th} style={{ color: "var(--text-muted)", borderBottomColor: "var(--border)" }}>{children}</th>
  );
  const TD = ({ children, secondary, small }) => (
    <td className={tw.td} style={{
      borderBottomColor: "var(--border-light)",
      color: secondary ? "var(--text-secondary)" : "var(--text-primary)",
      fontSize: small ? "13px" : undefined,
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

      <TableWrap
        toolbar={
          <>
            <span className="text-[13.5px] font-semibold" style={{ color: "var(--text-primary)" }}>
              All Courses ({filtered.length})
            </span>
            <TableSearch value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses..." />
          </>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon="📚" title="No courses found" description="Try a different search or add a new course." />
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ background: "var(--bg-card)" }}>
              <tr>
                <TH>Code</TH><TH>Title</TH><TH>College</TH>
                <TH>Instructor</TH><TH>Students</TH><TH>Status</TH><TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className={tw.trHover}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
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
                      <BtnDanger    className={tw.btnSm} onClick={() => handleDelete(c.id)}>Delete</BtnDanger>
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      {modal && (
        <Modal title={editId ? "Edit Course" : "Add New Course"} onClose={closeModal}
          footer={
            <>
              <BtnSecondary onClick={closeModal}>Cancel</BtnSecondary>
              <BtnPrimary   onClick={handleSave}>{editId ? "Save Changes" : "Add Course"}</BtnPrimary>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Course Code">
                <FormInput value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="e.g. CS101" />
              </FormGroup>
              <FormGroup label="Status">
                <FormSelect value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option>Draft</option><option>Published</option><option>Archived</option>
                </FormSelect>
              </FormGroup>
            </div>
            <FormGroup label="Course Title">
              <FormInput value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Introduction to Computer Science" />
            </FormGroup>
            <FormGroup label="College">
              <FormSelect value={form.college} onChange={(e) => set("college", e.target.value)}>
                <option value="">Select college...</option>
                {COLLEGES.map((col) => <option key={col}>{col}</option>)}
              </FormSelect>
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Instructor">
                <FormInput value={form.instructor} onChange={(e) => set("instructor", e.target.value)} placeholder="Dr. Name" />
              </FormGroup>
              <FormGroup label="Enrolled Students">
                <FormInput type="number" value={form.students} onChange={(e) => set("students", e.target.value)} placeholder="0" />
              </FormGroup>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CourseManagement;