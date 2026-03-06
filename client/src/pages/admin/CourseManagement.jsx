import { useState } from "react";
import Modal from "../../components/admin/Modal";
import { tw, Badge, FormGroup, PageHeader, TableWrap, EmptyState } from "../../components/admin/adminUtils";

const INIT_COURSES = [
  { id: 1, code: "CS101",   title: "Introduction to Computer Science", college: "Faculty of Science",      instructor: "Dr. Mona Salem",   students: 84, status: "Published" },
  { id: 2, code: "ENG201",  title: "Engineering Mathematics II",       college: "Faculty of Engineering",  instructor: "Dr. Tarek Nasser", students: 62, status: "Published" },
  { id: 3, code: "BUS301",  title: "Business Strategy",                college: "Faculty of Business",     instructor: "Prof. Hana Samir", students: 55, status: "Draft"     },
  { id: 4, code: "CS302",   title: "Data Structures & Algorithms",     college: "Faculty of Science",      instructor: "Dr. Yasser Fathi", students: 71, status: "Published" },
  { id: 5, code: "ART101",  title: "History of Art",                   college: "Faculty of Arts",         instructor: "Dr. Nadia Hassan", students: 38, status: "Archived"  },
];

const COLLEGES = ["Faculty of Engineering", "Faculty of Science", "Faculty of Business", "Faculty of Arts"];
const EMPTY    = { code: "", title: "", college: "", instructor: "", students: "", status: "Draft" };

const statusVariant = (s) => s === "Published" ? "success" : s === "Draft" ? "warning" : "default";

function CourseManagement() {
  const [courses,  setCourses]  = useState(INIT_COURSES);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [editId,   setEditId]   = useState(null);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd    = ()   => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit   = (c)  => { setForm(c); setEditId(c.id); setModal(true); };
  const closeModal = ()   => setModal(false);
  const set        = (k,v)=> setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim() || !form.code.trim()) return;
    if (editId) {
      setCourses((p) => p.map((c) => c.id === editId ? { ...form, id: editId } : c));
    } else {
      setCourses((p) => [...p, { ...form, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id) => setCourses((p) => p.filter((c) => c.id !== id));

  return (
    <div>
      <PageHeader
        title="Course Management"
        subtitle="Create and manage courses across all faculties."
        actions={
          <button className={tw.btnPrimary} onClick={openAdd}>
            <span className="material-symbols-outlined text-[14px]">add</span>
            Add Course
          </button>
        }
      />

      <TableWrap
        toolbar={
          <>
            <span className="text-[13.5px] font-semibold text-text-primary">All Courses ({filtered.length})</span>
            <input
              className="bg-card border border-border text-text-primary px-3 py-[6px] rounded-sm text-[12.5px] w-[220px] outline-none placeholder:text-text-muted transition-all focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(36,99,235,0.15)]"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon="📚" title="No courses found" description="Try a different search or add a new course." />
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-card">
              <tr>
                <th className={tw.th}>Code</th>
                <th className={tw.th}>Title</th>
                <th className={tw.th}>College</th>
                <th className={tw.th}>Instructor</th>
                <th className={tw.th}>Students</th>
                <th className={tw.th}>Status</th>
                <th className={tw.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className={tw.trHover}>
                  <td className={tw.td}>
                    <Badge variant="blue" mono>{c.code}</Badge>
                  </td>
                  <td className={tw.td + " !font-medium"}>{c.title}</td>
                  <td className={tw.td + " !text-text-secondary !text-[13px]"}>{c.college}</td>
                  <td className={tw.td + " !text-text-secondary !text-[13px]"}>{c.instructor}</td>
                  <td className={tw.td}>{c.students}</td>
                  <td className={tw.td}><Badge variant={statusVariant(c.status)}>{c.status}</Badge></td>
                  <td className={tw.td}>
                    <div className="flex items-center gap-2 justify-end">
                      <button className={tw.btnSecondary + " " + tw.btnSm} onClick={() => openEdit(c)}>Edit</button>
                      <button className={tw.btnDanger    + " " + tw.btnSm} onClick={() => handleDelete(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      {modal && (
        <Modal
          title={editId ? "Edit Course" : "Add New Course"}
          onClose={closeModal}
          footer={
            <>
              <button className={tw.btnSecondary} onClick={closeModal}>Cancel</button>
              <button className={tw.btnPrimary}   onClick={handleSave}>
                {editId ? "Save Changes" : "Add Course"}
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Course Code">
                <input className={tw.formInput} placeholder="e.g. CS101"
                  value={form.code} onChange={(e) => set("code", e.target.value)} />
              </FormGroup>
              <FormGroup label="Status">
                <div className="relative">
                  <select className={tw.formSelect} value={form.status} onChange={(e) => set("status", e.target.value)}>
                    <option>Draft</option><option>Published</option><option>Archived</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[10px]">▼</span>
                </div>
              </FormGroup>
            </div>
            <FormGroup label="Course Title">
              <input className={tw.formInput} placeholder="e.g. Introduction to Computer Science"
                value={form.title} onChange={(e) => set("title", e.target.value)} />
            </FormGroup>
            <FormGroup label="College">
              <div className="relative">
                <select className={tw.formSelect} value={form.college} onChange={(e) => set("college", e.target.value)}>
                  <option value="">Select college...</option>
                  {COLLEGES.map((col) => <option key={col}>{col}</option>)}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[10px]">▼</span>
              </div>
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Instructor">
                <input className={tw.formInput} placeholder="Dr. Name"
                  value={form.instructor} onChange={(e) => set("instructor", e.target.value)} />
              </FormGroup>
              <FormGroup label="Enrolled Students">
                <input className={tw.formInput} type="number" placeholder="0"
                  value={form.students} onChange={(e) => set("students", e.target.value)} />
              </FormGroup>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CourseManagement;