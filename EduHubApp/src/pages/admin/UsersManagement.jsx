import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { adminUsersApi } from '../../services/api';
import Modal from '../../components/admin/Modal';
import { Badge, PageHeader, TableSearch, EmptyState, BtnPrimary, BtnSecondary, BtnDanger, FormGroup, FormInput, FormSelect } from '../../components/admin/adminUtils';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/theme';

const ROLE_VARIANT = { student: 'blue', mentor: 'success', admin: 'warning' };
const AVATAR_COLORS = [
  { bg: 'rgba(36,99,235,0.15)', color: '#3b82f6' },
  { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
  { bg: 'rgba(245,158,11,0.12)',color: '#f59e0b' },
  { bg: 'rgba(139,92,246,0.15)',color: '#a78bfa' },
];
const EMPTY = { name: '', email: '', role: 'student', college: '', status: 'Active', password: '' };

export default function UsersManagement() {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('All');
  const [showDeleted, setShowDeleted] = useState(false);
  const [modal,       setModal]       = useState(false);
  const [form,        setForm]        = useState(EMPTY);
  const [editId,      setEditId]      = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true); setError(null);
      const res = await adminUsersApi.getAll(showDeleted);
      setUsers(res.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadUsers(); }, [showDeleted]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) await adminUsersApi.update(editId, form);
      else        await adminUsersApi.create(form);
      setModal(false); setForm(EMPTY); setEditId(null);
      await loadUsers();
    } catch (err) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  const openEdit = user => {
    setForm({ name: user.name || '', email: user.email || '', role: user.role || 'student', college: user.college || '', status: user.status || 'Active', password: '' });
    setEditId(user._id); setModal(true);
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete User', `Delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await adminUsersApi.remove(id); await loadUsers(); }
        catch (err) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'All' || u.role === roleFilter.toLowerCase();
    return matchSearch && matchRole;
  });

  const set = field => val => setForm(f => ({ ...f, [field]: val }));

  return (
    <View style={st.container}>
      <View style={st.topBar}>
        <TableSearch value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" />
        <TouchableOpacity style={st.addBtn} onPress={() => { setForm(EMPTY); setEditId(null); setModal(true); }}>
          <Text style={st.addBtnTxt}>+ Add User</Text>
        </TouchableOpacity>
      </View>

      {/* Role filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.filterRow} contentContainerStyle={st.filterContent}>
        {['All', 'student', 'mentor', 'admin'].map(r => (
          <TouchableOpacity key={r} onPress={() => setRoleFilter(r)}
            style={[st.chip, roleFilter === r && st.chipActive]}>
            <Text style={[st.chipTxt, roleFilter === r && { color: colors.white }]}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={st.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadUsers(); }} tintColor={colors.accent} />}>

        <PageHeader title="Users Management" subtitle={`${filtered.length} user${filtered.length !== 1 ? 's' : ''}`} />

        {error   ? <View style={st.errorBox}><Text style={st.errorTxt}>⚠ {error}</Text></View> : null}
        {loading ? <Text style={st.loadingTxt}>Loading…</Text>
        : filtered.length === 0 ? <EmptyState icon="👥" title="No users found" description="Try a different search or filter." />
        : filtered.map((u, i) => {
          const ac = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
          return (
            <View key={u._id} style={st.card}>
              <View style={[st.avatar, { backgroundColor: ac.bg }]}>
                <Text style={[st.avatarTxt, { color: ac.color }]}>{initials}</Text>
              </View>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Text style={st.name}>{u.name}</Text>
                <Text style={st.email}>{u.email}</Text>
                <View style={st.metaRow}>
                  <Badge variant={ROLE_VARIANT[u.role] || 'default'}>{u.role}</Badge>
                  {u.college ? <Text style={st.college}>{u.college}</Text> : null}
                </View>
              </View>
              <View style={st.actions}>
                <TouchableOpacity style={st.iconBtn} onPress={() => openEdit(u)}><Text style={{ fontSize: 18 }}>✏️</Text></TouchableOpacity>
                <TouchableOpacity style={st.iconBtn} onPress={() => handleDelete(u._id, u.name)}><Text style={{ fontSize: 18 }}>🗑️</Text></TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal title={editId ? 'Edit User' : 'Add User'} onClose={() => { setModal(false); setEditId(null); }} visible={modal}
        footer={<View style={{ flexDirection: 'row', gap: spacing.sm, flex: 1 }}>
          <BtnSecondary onPress={() => setModal(false)} style={{ flex: 1 }}>Cancel</BtnSecondary>
          <BtnPrimary   onPress={handleSave} loading={saving} style={{ flex: 1 }}>{editId ? 'Update' : 'Create'}</BtnPrimary>
        </View>}>
        <FormGroup label="Name"><FormInput value={form.name} onChangeText={set('name')} placeholder="Full name" /></FormGroup>
        <FormGroup label="Email"><FormInput value={form.email} onChangeText={set('email')} placeholder="Email" keyboardType="email-address" editable={!editId} /></FormGroup>
        {!editId && <FormGroup label="Password"><FormInput value={form.password} onChangeText={set('password')} placeholder="Password" secureTextEntry /></FormGroup>}
        <FormGroup label="College"><FormInput value={form.college} onChangeText={set('college')} placeholder="College" /></FormGroup>
        <FormGroup label="Role">
          <FormSelect value={form.role} onChange={e => set('role')(e.target.value)}>
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </FormSelect>
        </FormGroup>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.bgBase },
  topBar:     { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border },
  addBtn:     { backgroundColor: colors.accent, paddingHorizontal: spacing.lg, paddingVertical: spacing.md - 2, borderRadius: radius.sm },
  addBtnTxt:  { color: colors.white, fontWeight: fontWeight.semibold, fontSize: fontSize.md },
  filterRow:  { backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.border, maxHeight: 52 },
  filterContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  chip:       { paddingHorizontal: spacing.md, paddingVertical: spacing.sm - 2, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipTxt:    { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  list:       { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  loadingTxt: { textAlign: 'center', color: colors.textMuted, padding: spacing.xxl },
  errorBox:   { backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: radius.sm, padding: spacing.md },
  errorTxt:   { color: colors.danger, fontSize: fontSize.sm },
  card:       { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt:  { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  name:       { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  email:      { fontSize: fontSize.sm, color: colors.textSecondary },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  college:    { fontSize: fontSize.xs, color: colors.textMuted },
  actions:    { flexDirection: 'row', gap: spacing.xs },
  iconBtn:    { padding: spacing.sm },
});
