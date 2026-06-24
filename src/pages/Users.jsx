import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, UserCheck, UserX, Key, Users as UsersIcon } from 'lucide-react';
import { Offcanvas, Form, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';
import usePermission from '../hooks/usePermission';

const EMPTY_FORM = {
  username: '', first_name: '', last_name: '', phone_number: '',
  email: '', password: '', confirm_password: '', role_id: '', role: 'operator', is_active: true,
};

const Users = () => {
  const { canCreate, canEdit, canDelete } = usePermission();
  const [users, setUsers]     = useState([]);
  const [roles, setRoles]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const limit = 10;

  const [showDrawer, setShowDrawer] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUserId, setResetUserId]       = useState(null);
  const [resetPwd, setResetPwd]             = useState({ new_password: '', confirm_password: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', { params: { page, limit, search } });
      setUsers(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to fetch users'); }
    finally { setLoading(false); }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data.data || []);
    } catch { /* silent */ }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);
  useEffect(() => { fetchRoles(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowDrawer(true); };
  const openEdit   = (u) => {
    setForm({
      username: u.username, first_name: u.first_name || '', last_name: u.last_name || '',
      phone_number: u.phone_number || '', email: u.email || '',
      password: '', confirm_password: '',
      role_id: u.role_id || '', role: u.role || 'operator', is_active: u.is_active,
    });
    setEditingId(u.id);
    setShowDrawer(true);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!editingId && form.password !== form.confirm_password) {
      return toast.error('Passwords do not match.');
    }
    try {
      const payload = { ...form };
      if (!payload.role_id) delete payload.role_id;
      delete payload.confirm_password;
      if (editingId) {
        delete payload.password;
        delete payload.username;
        await api.put(`/users/${editingId}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/users', payload);
        toast.success('User created');
      }
      setShowDrawer(false);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.detail || 'Operation failed'); }
  };

  const toggleActive = async (u) => {
    try {
      await api.post(`/users/${u.id}/${u.is_active ? 'deactivate' : 'activate'}`);
      toast.success(u.is_active ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch { toast.error('Failed to change status'); }
  };

  const openReset = (userId) => { setResetUserId(userId); setResetPwd({ new_password: '', confirm_password: '' }); setShowResetModal(true); };
  const handleReset = async e => {
    e.preventDefault();
    if (resetPwd.new_password !== resetPwd.confirm_password) return toast.error('Passwords do not match.');
    try {
      await api.post(`/users/${resetUserId}/reset-password`, resetPwd);
      toast.success('Password reset successfully');
      setShowResetModal(false);
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to reset password'); }
  };

  const totalPages = Math.ceil(total / limit);
  const roleName = (id) => roles.find(r => r.id === Number(id))?.role_name || '—';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users, roles, and access.</p>
        </div>
        {canCreate('users') && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add User
          </button>
        )}
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={14} className="table-search-icon" />
            <input
              type="text" placeholder="Search by username, name, email…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{total} users</span>
        </div>

        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '30%', height: 10, marginBottom: 6 }} />
                  <div className="skeleton" style={{ width: '20%', height: 8 }} />
                </div>
                <div className="skeleton" style={{ width: 80, height: 10 }} />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><UsersIcon size={22} /></div>
            <div className="empty-state-title">{search ? 'No results found' : 'No users yet'}</div>
            <div className="empty-state-desc">{search ? `No users match "${search}".` : 'Create your first user.'}</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--primary-light)', color: 'var(--primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.75rem',
                        }}>
                          {u.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.username}</div>
                          {(u.first_name || u.last_name) && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {[u.first_name, u.last_name].filter(Boolean).join(' ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.phone_number || '—'}</td>
                    <td>
                      {u.role_entity ? (
                        <span className="badge-base badge-primary">{u.role_entity.role_name}</span>
                      ) : (
                        <span className="badge-base badge-neutral">{u.role || '—'}</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge-base ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                        {canEdit('users') && (
                          <button className="btn-icon-ghost primary" onClick={() => openEdit(u)} title="Edit"><Edit2 size={14} /></button>
                        )}
                        {canEdit('users') && (
                          <button
                            className={`btn-icon-ghost ${u.is_active ? 'danger' : 'success'}`}
                            onClick={() => toggleActive(u)}
                            title={u.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>
                        )}
                        <button className="btn-icon-ghost primary" onClick={() => openReset(u.id)} title="Reset Password"><Key size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem', padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                style={{
                  width: 32, height: 32, borderRadius: 'var(--r)', border: 'none', cursor: 'pointer',
                  background: page === i + 1 ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: page === i + 1 ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: '0.8125rem',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Drawer */}
      <Offcanvas show={showDrawer} onHide={() => setShowDrawer(false)} placement="end" backdrop="static">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{editingId ? 'Edit User' : 'Create User'}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Username *</Form.Label>
                  <Form.Control name="username" value={form.username} onChange={handleChange} required disabled={!!editingId} placeholder="e.g. jdoe" />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control name="first_name" value={form.first_name} onChange={handleChange} />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control name="last_name" value={form.last_name} onChange={handleChange} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={form.email} onChange={handleChange} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control name="phone_number" value={form.phone_number} onChange={handleChange} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Role</Form.Label>
                  <Form.Select name="role_id" value={form.role_id} onChange={handleChange}>
                    <option value="">— Select role —</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.role_name}</option>)}
                  </Form.Select>
                </Form.Group>
              </div>
              {!editingId && (
                <>
                  <div className="col-6">
                    <Form.Group>
                      <Form.Label>Password *</Form.Label>
                      <Form.Control type="password" name="password" value={form.password} onChange={handleChange} required />
                    </Form.Group>
                  </div>
                  <div className="col-6">
                    <Form.Group>
                      <Form.Label>Confirm *</Form.Label>
                      <Form.Control type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} required />
                    </Form.Group>
                  </div>
                </>
              )}
              <div className="col-12">
                <Form.Check type="switch" name="is_active" checked={form.is_active} onChange={handleChange} label="Active" />
              </div>
            </div>
            <div className="divider" style={{ margin: '1.5rem 0 1.25rem' }} />
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <Button variant="link" className="text-secondary text-decoration-none" onClick={() => setShowDrawer(false)}>Cancel</Button>
              <Button variant="primary" type="submit">{editingId ? 'Save Changes' : 'Create User'}</Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Reset Password Modal */}
      <Offcanvas show={showResetModal} onHide={() => setShowResetModal(false)} placement="end" backdrop="static">
        <Offcanvas.Header closeButton><Offcanvas.Title>Reset Password</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleReset}>
            <div className="row g-3">
              <div className="col-12">
                <Form.Group>
                  <Form.Label>New Password *</Form.Label>
                  <Form.Control type="password" value={resetPwd.new_password} onChange={e => setResetPwd(p => ({ ...p, new_password: e.target.value }))} required minLength={6} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Confirm Password *</Form.Label>
                  <Form.Control type="password" value={resetPwd.confirm_password} onChange={e => setResetPwd(p => ({ ...p, confirm_password: e.target.value }))} required minLength={6} />
                </Form.Group>
              </div>
            </div>
            <div className="divider" style={{ margin: '1.5rem 0 1.25rem' }} />
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <Button variant="link" className="text-secondary text-decoration-none" onClick={() => setShowResetModal(false)}>Cancel</Button>
              <Button variant="danger" type="submit">Reset Password</Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default Users;
