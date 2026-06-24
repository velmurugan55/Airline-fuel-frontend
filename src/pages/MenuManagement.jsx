import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Menu as MenuIcon } from 'lucide-react';
import { Offcanvas, Form, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';
import usePermission from '../hooks/usePermission';

const EMPTY_FORM = { menu_name: '', menu_code: '', parent_menu_id: '', route_path: '', icon: '', display_order: 0, is_active: true };

const MenuManagement = () => {
  const { canCreate, canEdit, canDelete } = usePermission();
  const [menus, setMenus]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);

  const fetchMenus = async () => {
    try { setLoading(true); const res = await api.get('/menus'); setMenus(res.data.data || []); }
    catch { toast.error('Failed to fetch menus'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMenus(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setShowDrawer(true); };
  const openEdit   = (m) => {
    setForm({ menu_name: m.menu_name, menu_code: m.menu_code, parent_menu_id: m.parent_menu_id || '', route_path: m.route_path || '', icon: m.icon || '', display_order: m.display_order, is_active: m.is_active });
    setEditingId(m.id);
    setShowDrawer(true);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : (name === 'display_order' ? Number(value) : value) }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = { ...form, parent_menu_id: form.parent_menu_id ? Number(form.parent_menu_id) : null };
      if (editingId) { await api.put(`/menus/${editingId}`, payload); toast.success('Menu updated'); }
      else           { await api.post('/menus', payload); toast.success('Menu created'); }
      setShowDrawer(false);
      fetchMenus();
    } catch (err) { toast.error(err.response?.data?.detail || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu?')) return;
    try { await api.delete(`/menus/${id}`); toast.success('Menu deleted'); fetchMenus(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Delete failed'); }
  };

  const parentOf = (id) => menus.find(m => m.id === id)?.menu_name || '—';
  const topMenus    = menus.filter(m => !m.parent_menu_id);
  const childrenOf  = (id) => menus.filter(m => m.parent_menu_id === id);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Menu Management</h1>
          <p className="page-subtitle">Configure sidebar menus and parent-child hierarchy.</p>
        </div>
        {canCreate('menus') && (
          <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Add Menu</button>
        )}
      </div>

      <div className="table-card">
        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 36, marginBottom: 10 }} />)}
          </div>
        ) : menus.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><MenuIcon size={22} /></div>
            <div className="empty-state-title">No menus configured</div>
            <div className="empty-state-desc">Run the RBAC migration to seed default menus.</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Menu Name</th>
                  <th>Code</th>
                  <th>Parent</th>
                  <th>Route</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topMenus.flatMap((parent) => {
                  const children = childrenOf(parent.id);
                  const rows = [
                    <motion.tr key={parent.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'var(--bg-secondary)' }}>
                      <td style={{ fontWeight: 700 }}>{parent.id}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        <span style={{ marginRight: 6 }}>{parent.icon}</span>{parent.menu_name}
                      </td>
                      <td><code style={{ fontSize: '0.75rem' }}>{parent.menu_code}</code></td>
                      <td style={{ color: 'var(--text-muted)' }}>—</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{parent.route_path || '—'}</td>
                      <td>{parent.display_order}</td>
                      <td><span className={`badge-base ${parent.is_active ? 'badge-success' : 'badge-danger'}`}>{parent.is_active ? 'Active' : 'Off'}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                          {canEdit('menus')   && <button className="btn-icon-ghost primary" onClick={() => openEdit(parent)}><Edit2 size={13} /></button>}
                          {canDelete('menus') && <button className="btn-icon-ghost danger"  onClick={() => handleDelete(parent.id)}><Trash2 size={13} /></button>}
                        </div>
                      </td>
                    </motion.tr>
                  ];
                  children.forEach(child => {
                    rows.push(
                      <motion.tr key={child.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td style={{ paddingLeft: '2rem', color: 'var(--text-muted)' }}>{child.id}</td>
                        <td style={{ paddingLeft: '2rem' }}>{child.menu_name}</td>
                        <td><code style={{ fontSize: '0.75rem' }}>{child.menu_code}</code></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{parent.menu_name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{child.route_path || '—'}</td>
                        <td>{child.display_order}</td>
                        <td><span className={`badge-base ${child.is_active ? 'badge-success' : 'badge-danger'}`}>{child.is_active ? 'Active' : 'Off'}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                            {canEdit('menus')   && <button className="btn-icon-ghost primary" onClick={() => openEdit(child)}><Edit2 size={13} /></button>}
                            {canDelete('menus') && <button className="btn-icon-ghost danger"  onClick={() => handleDelete(child.id)}><Trash2 size={13} /></button>}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  });
                  return rows;
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Offcanvas show={showDrawer} onHide={() => setShowDrawer(false)} placement="end" backdrop="static">
        <Offcanvas.Header closeButton><Offcanvas.Title>{editingId ? 'Edit Menu' : 'Add Menu'}</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12"><Form.Group><Form.Label>Menu Name *</Form.Label><Form.Control name="menu_name" value={form.menu_name} onChange={handleChange} required /></Form.Group></div>
              <div className="col-6"><Form.Group><Form.Label>Menu Code *</Form.Label><Form.Control name="menu_code" value={form.menu_code} onChange={handleChange} required disabled={!!editingId} placeholder="e.g. transactions" /></Form.Group></div>
              <div className="col-6"><Form.Group><Form.Label>Display Order</Form.Label><Form.Control type="number" name="display_order" value={form.display_order} onChange={handleChange} /></Form.Group></div>
              <div className="col-12"><Form.Group><Form.Label>Parent Menu</Form.Label>
                <Form.Select name="parent_menu_id" value={form.parent_menu_id} onChange={handleChange}>
                  <option value="">— None (top level) —</option>
                  {menus.filter(m => !m.parent_menu_id && m.id !== editingId).map(m => <option key={m.id} value={m.id}>{m.menu_name}</option>)}
                </Form.Select>
              </Form.Group></div>
              <div className="col-12"><Form.Group><Form.Label>Route Path</Form.Label><Form.Control name="route_path" value={form.route_path} onChange={handleChange} placeholder="/transactions" /></Form.Group></div>
              <div className="col-12"><Form.Group><Form.Label>Icon (Lucide name)</Form.Label><Form.Control name="icon" value={form.icon} onChange={handleChange} placeholder="Receipt" /></Form.Group></div>
              <div className="col-12"><Form.Check type="switch" name="is_active" checked={form.is_active} onChange={handleChange} label="Active" /></div>
            </div>
            <div className="divider" style={{ margin: '1.5rem 0 1.25rem' }} />
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <Button variant="link" className="text-secondary text-decoration-none" onClick={() => setShowDrawer(false)}>Cancel</Button>
              <Button variant="primary" type="submit">{editingId ? 'Save' : 'Add Menu'}</Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default MenuManagement;
