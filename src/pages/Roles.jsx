import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Key } from 'lucide-react';
import { Offcanvas, Form, Button, Modal } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';
import usePermission from '../hooks/usePermission';

const EMPTY_FORM = { role_name: '', description: '', is_active: true };

const ALL_ACTIONS = ['can_view', 'can_create', 'can_edit', 'can_delete', 'can_download', 'can_approve', 'can_export', 'can_print'];
const ACTION_LABELS = { can_view: 'View', can_create: 'Create', can_edit: 'Edit', can_delete: 'Delete', can_download: 'Download', can_approve: 'Approve', can_export: 'Export', can_print: 'Print' };

const Roles = () => {
  const { canCreate, canEdit, canDelete } = usePermission();
  const [roles, setRoles]   = useState([]);
  const [menus, setMenus]   = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDrawer, setShowDrawer] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);

  const [menusLoading, setMenusLoading] = useState(true);
  const [showPerms, setShowPerms] = useState(false);
  const [permRole, setPermRole]   = useState(null);
  const [permMatrix, setPermMatrix] = useState({});

  const fetchRoles = async () => {
    try { setLoading(true); const res = await api.get('/roles'); setRoles(res.data.data || []); }
    catch { toast.error('Failed to fetch roles'); }
    finally { setLoading(false); }
  };

  const fetchMenus = async () => {
    setMenusLoading(true);
    try { const res = await api.get('/menus'); setMenus(res.data.data || []); }
    catch { /* silent */ }
    finally { setMenusLoading(false); }
  };

  useEffect(() => { fetchRoles(); fetchMenus(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowDrawer(true); };
  const openEdit   = (r) => { setForm({ role_name: r.role_name, description: r.description || '', is_active: r.is_active }); setEditingId(r.id); setShowDrawer(true); };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/roles/${editingId}`, form); toast.success('Role updated'); }
      else           { await api.post('/roles', form); toast.success('Role created'); }
      setShowDrawer(false);
      fetchRoles();
    } catch (err) { toast.error(err.response?.data?.detail || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this role?')) return;
    try { await api.delete(`/roles/${id}`); toast.success('Role deleted'); fetchRoles(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Delete failed'); }
  };

  const openPermissions = async (role) => {
    if (menusLoading || menus.length === 0) {
      toast.error('Menu data not loaded yet. Please wait and try again.');
      return;
    }
    setPermRole(role);
    try {
      const res = await api.get(`/permissions/roles/${role.id}`);
      const matrix = {};
      (res.data || []).forEach(p => { matrix[p.menu_id] = p; });
      // Ensure all menus are present
      menus.forEach(m => { if (!matrix[m.id]) matrix[m.id] = { menu_id: m.id, ...Object.fromEntries(ALL_ACTIONS.map(a => [a, false])) }; });
      setPermMatrix(matrix);
    } catch { toast.error('Failed to load permissions'); }
    setShowPerms(true);
  };

  const togglePerm = (menuId, action) => {
    setPermMatrix(prev => ({
      ...prev,
      [menuId]: { ...prev[menuId], [action]: !prev[menuId]?.[action] },
    }));
  };

  const toggleAllForMenu = (menuId) => {
    const perm = permMatrix[menuId] || {};
    const allTrue = ALL_ACTIONS.every(a => perm[a]);
    setPermMatrix(prev => ({
      ...prev,
      [menuId]: { ...prev[menuId], ...Object.fromEntries(ALL_ACTIONS.map(a => [a, !allTrue])) },
    }));
  };

  const savePermissions = async () => {
    const permEntries = Object.values(permMatrix);
    if (permEntries.length === 0) {
      return toast.error('No permissions to save. Ensure menus are loaded.');
    }
    try {
      const permissions = permEntries.map(p => ({
        menu_id: p.menu_id || p.id,
        ...Object.fromEntries(ALL_ACTIONS.map(a => [a, !!p[a]])),
      }));
      await api.put(`/permissions/roles/${permRole.id}`, { permissions });
      toast.success('Permissions saved');
      setShowPerms(false);
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed to save permissions'); }
  };

  // Group menus by parent
  const topMenus  = menus.filter(m => !m.parent_menu_id);
  const childrenOf = (id) => menus.filter(m => m.parent_menu_id === id);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Role Management</h1>
          <p className="page-subtitle">Define roles and assign menu permissions.</p>
        </div>
        {canCreate('roles') && (
          <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Role</button>
        )}
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 12 }} />)}
          </div>
        ) : roles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Key size={22} /></div>
            <div className="empty-state-title">No roles yet</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r, i) => (
                  <motion.tr key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <td><span style={{ fontWeight: 700 }}>{r.role_name}</span></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.description || '—'}</td>
                    <td><span className={`badge-base ${r.is_active ? 'badge-success' : 'badge-danger'}`}>{r.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                        <button className="btn-icon-ghost primary" onClick={() => openPermissions(r)} title="Set Permissions"><Key size={14} /></button>
                        {canEdit('roles')   && <button className="btn-icon-ghost primary" onClick={() => openEdit(r)} title="Edit"><Edit2 size={14} /></button>}
                        {canDelete('roles') && <button className="btn-icon-ghost danger"  onClick={() => handleDelete(r.id)} title="Delete"><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Drawer */}
      <Offcanvas show={showDrawer} onHide={() => setShowDrawer(false)} placement="end" backdrop="static">
        <Offcanvas.Header closeButton><Offcanvas.Title>{editingId ? 'Edit Role' : 'Create Role'}</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Role Name *</Form.Label>
                  <Form.Control value={form.role_name} onChange={e => setForm(f => ({ ...f, role_name: e.target.value }))} required />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Check type="switch" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} label="Active" />
              </div>
            </div>
            <div className="divider" style={{ margin: '1.5rem 0 1.25rem' }} />
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <Button variant="link" className="text-secondary text-decoration-none" onClick={() => setShowDrawer(false)}>Cancel</Button>
              <Button variant="primary" type="submit">{editingId ? 'Save' : 'Create'}</Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Permission Matrix Modal */}
      <Modal show={showPerms} onHide={() => setShowPerms(false)} size="xl" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Permissions — {permRole?.role_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.5rem' }}>
          <div className="table-responsive">
            <table className="table" style={{ fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 160 }}>Menu</th>
                  {ALL_ACTIONS.map(a => <th key={a} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{ACTION_LABELS[a]}</th>)}
                  <th style={{ textAlign: 'center' }}>All</th>
                </tr>
              </thead>
              <tbody>
                {topMenus.map(parent => {
                  const children = childrenOf(parent.id);
                  return (
                    <React.Fragment key={parent.id}>
                      {/* Parent row */}
                      <tr style={{ background: 'var(--bg-secondary)' }}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{parent.menu_name}</td>
                        {ALL_ACTIONS.map(a => <td key={a} style={{ textAlign: 'center' }} />)}
                        <td />
                      </tr>
                      {/* Children (or parent itself if no children) */}
                      {(children.length > 0 ? children : [parent]).map(menu => {
                        const perm = permMatrix[menu.id] || {};
                        return (
                          <tr key={menu.id}>
                            <td style={{ paddingLeft: children.length > 0 ? '2rem' : '1rem' }}>{menu.menu_name}</td>
                            {ALL_ACTIONS.map(a => (
                              <td key={a} style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={!!perm[a]}
                                  onChange={() => togglePerm(menu.id, a)}
                                  style={{ accentColor: 'var(--primary)', width: 15, height: 15 }}
                                />
                              </td>
                            ))}
                            <td style={{ textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={ALL_ACTIONS.every(a => !!perm[a])}
                                onChange={() => toggleAllForMenu(menu.id)}
                                style={{ accentColor: 'var(--primary)', width: 15, height: 15 }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" className="text-secondary text-decoration-none" onClick={() => setShowPerms(false)}>Cancel</Button>
          <Button variant="primary" onClick={savePermissions}>Save Permissions</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Roles;
