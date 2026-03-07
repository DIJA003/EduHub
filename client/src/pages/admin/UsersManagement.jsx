import { useState, useEffect } from 'react';
import Modal from '../../components/admin/Modal';
import {
  Badge, FormGroup, FormInput, FormSelect,
  PageHeader, TableWrap, TableSearch, EmptyState,
  BtnPrimary, BtnSecondary, BtnDanger, tw,
} from '../../components/admin/adminUtils';
import { adminUsersApi } from '../../services/api';

const EMPTY = { name: '', email: '', role: 'Student', college: '', status: 'Active' };
const ROLE_VARIANT = { Student: 'blue', Mentor: 'success', Admin: 'warning' };
const AVATAR_STYLES = [
  { bg: 'var(--accent-glow)',      color: 'var(--accent-light)' },
  { bg: 'var(--success-bg)',       color: 'var(--success)'      },
  { bg: 'var(--warning-bg)',       color: 'var(--warning)'      },
  { bg: 'rgba(139,92,246,0.15)',   color: '#a78bfa'             },
];

function UsersManagement() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminUsersApi.getAll();
      setUsers(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter((u) =>
    (u.name?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === 'All' || u.role === roleFilter)
  );

  const openEdit   = (u)  => { setForm(u); setEditId(u._id); setModal(true); };
  const closeModal = ()   => { setModal(false); setSaving(false); };
  const set        = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name?.trim() || !form.email?.trim()) return;
    setSaving(true);
    try {
      const res = await adminUsersApi.update(editId, form);
      setUsers((p) => p.map((u) => u._id === editId ? { ...u, ...res.data } : u));
      closeModal();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this user?')) return;
    try {
      await adminUsersApi.remove(id);
      setUsers((p) => p.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const statusVariant = (s) => s === 'Active' ? 'success' : s === 'Pending' ? 'warning' : 'default';
  const TH = ({ children }) => (
    <th className={tw.th} style={{ color: 'var(--text-muted)', borderBottomColor: 'var(--border)' }}>{children}</th>
  );

  return (
    <div>
      <PageHeader
        title="Users Management"
        subtitle="Manage students, mentors and administrators."
        actions={
          <div className="flex items-center gap-2">
            {['All', 'Student', 'Mentor', 'Admin'].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className="px-3 py-1.5 rounded-sm text-[12.5px] font-semibold border transition-all duration-150 cursor-pointer active:scale-[0.97]"
                style={roleFilter === r
                  ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }
                  : { background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                }
                onMouseEnter={(e) => { if (roleFilter !== r) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
                onMouseLeave={(e) => { if (roleFilter !== r) { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
          {error} — <button className="underline" onClick={loadUsers}>Retry</button>
        </div>
      )}

      <TableWrap
        toolbar={
          <>
            <span className="text-[13.5px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              Users ({filtered.length})
            </span>
            <TableSearch value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." />
          </>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="👥" title="No users found" description="Try a different filter." />
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ background: 'var(--bg-card)' }}>
              <tr>
                <TH>User</TH><TH>Role</TH><TH>College</TH><TH>Joined</TH><TH>Status</TH><TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const av = AVATAR_STYLES[i % AVATAR_STYLES.length];
                return (
                  <tr key={u._id} className={tw.trHover}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className={tw.td} style={{ borderBottomColor: 'var(--border-light)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: av.bg, color: av.color, border: '1.5px solid var(--border)' }}>
                          {u.name?.[0] || '?'}
                        </div>
                        <div>
                          <div className="text-[13.5px] font-medium" style={{ color: 'var(--text-primary)' }}>{u.name}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className={tw.td} style={{ borderBottomColor: 'var(--border-light)' }}>
                      <Badge variant={ROLE_VARIANT[u.role] || 'default'}>{u.role}</Badge>
                    </td>
                    <td className={tw.td} style={{ borderBottomColor: 'var(--border-light)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {u.college}
                    </td>
                    <td className={tw.td} style={{ borderBottomColor: 'var(--border-light)' }}>
                      <span className="font-mono text-[12px]" style={{ color: 'var(--text-muted)' }}>{u.joined}</span>
                    </td>
                    <td className={tw.td} style={{ borderBottomColor: 'var(--border-light)' }}>
                      <Badge variant={statusVariant(u.status)}>{u.status}</Badge>
                    </td>
                    <td className={tw.td} style={{ borderBottomColor: 'var(--border-light)' }}>
                      <div className="flex items-center gap-2 justify-end">
                        <BtnSecondary className={tw.btnSm} onClick={() => openEdit(u)}>Edit</BtnSecondary>
                        <BtnDanger    className={tw.btnSm} onClick={() => handleDelete(u._id)}>Remove</BtnDanger>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TableWrap>

      {modal && (
        <Modal title="Edit User" onClose={closeModal}
          footer={
            <>
              <BtnSecondary onClick={closeModal}>Cancel</BtnSecondary>
              <BtnPrimary onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </BtnPrimary>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Full Name">
                <FormInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" />
              </FormGroup>
              <FormGroup label="Role">
                <FormSelect value={form.role} onChange={(e) => set('role', e.target.value)}>
                  <option>Student</option><option>Mentor</option><option>Admin</option>
                </FormSelect>
              </FormGroup>
            </div>
            <FormGroup label="Email">
              <FormInput type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="user@eduhub.com" />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="College">
                <FormInput value={form.college} onChange={(e) => set('college', e.target.value)} placeholder="Faculty of..." />
              </FormGroup>
              <FormGroup label="Status">
                <FormSelect value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option>Active</option><option>Pending</option><option>Suspended</option>
                </FormSelect>
              </FormGroup>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default UsersManagement;