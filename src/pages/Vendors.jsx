import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Building2 } from 'lucide-react';
import { Offcanvas, Form, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';
import usePermission from '../hooks/usePermission';

const Vendors = () => {
  const { canCreate, canEdit, canDelete } = usePermission();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ vendor_code: '', vendor_name: '', contact_person: '', email: '', phone: '', address: '', gst_number: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors/');
      setVendors(res.data.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleShow = (vendor = null) => {
    if (vendor) {
      setFormData({
        vendor_code: vendor.vendor_code,
        vendor_name: vendor.vendor_name,
        contact_person: vendor.contact_person || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        gst_number: vendor.gst_number || '',
      });
      setEditingId(vendor.id);
    } else {
      setFormData({ vendor_code: '', vendor_name: '', contact_person: '', email: '', phone: '', address: '', gst_number: '' });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/vendors/${editingId}`, formData);
        toast.success('Vendor updated successfully');
      } else {
        await api.post('/vendors/', formData);
        toast.success('Vendor added successfully');
      }
      handleClose();
      fetchVendors();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        await api.delete(`/vendors/${id}`);
        toast.success('Vendor deleted successfully');
        fetchVendors();
      } catch (error) {
        toast.error('Failed to delete vendor');
      }
    }
  };

  const filtered = vendors.filter(v =>
    v.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
    v.vendor_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendors</h1>
          <p className="page-subtitle">Manage fuel suppliers and their details.</p>
        </div>
        {canCreate('vendors') && (
          <button className="btn btn-primary" onClick={() => handleShow()}>
            <Plus size={15} />
            Add Vendor
          </button>
        )}
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={14} className="table-search-icon" />
            <input
              type="text"
              placeholder="Search vendors…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {filtered.length} {filtered.length === 1 ? 'vendor' : 'vendors'}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 'var(--r)' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '30%', height: 10, marginBottom: 6 }} />
                  <div className="skeleton" style={{ width: '20%', height: 8 }} />
                </div>
                <div className="skeleton" style={{ width: 80, height: 10 }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Building2 size={22} /></div>
            <div className="empty-state-title">{search ? 'No results found' : 'No vendors yet'}</div>
            <div className="empty-state-desc">
              {search ? `No vendors match "${search}".` : 'Add your first fuel vendor to get started.'}
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Vendor Name</th>
                  <th>GST Number</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((vendor, i) => (
                  <motion.tr
                    key={vendor.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.22 }}
                  >
                    <td>
                      <span className="badge-base badge-success" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {vendor.vendor_code}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 'var(--r)',
                            background: 'var(--success-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Building2 size={13} color="var(--success)" />
                        </div>
                        <span style={{ fontWeight: 600 }}>{vendor.vendor_name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                      {vendor.gst_number || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {vendor.contact_person || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {vendor.email || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                        {canEdit('vendors') && (
                          <button className="btn-icon-ghost primary" onClick={() => handleShow(vendor)} title="Edit">
                            <Edit2 size={14} />
                          </button>
                        )}
                        {canDelete('vendors') && (
                          <button className="btn-icon-ghost danger" onClick={() => handleDelete(vendor.id)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Offcanvas Drawer */}
      <Offcanvas show={showModal} onHide={handleClose} placement="end" backdrop="static">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{editingId ? 'Edit Vendor' : 'Add Vendor'}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-5">
                <Form.Group>
                  <Form.Label>Vendor Code *</Form.Label>
                  <Form.Control type="text" name="vendor_code" value={formData.vendor_code} onChange={handleChange} required disabled={!!editingId} placeholder="e.g. PT" />
                </Form.Group>
              </div>
              <div className="col-7">
                <Form.Group>
                  <Form.Label>Vendor Name *</Form.Label>
                  <Form.Control type="text" name="vendor_name" value={formData.vendor_name} onChange={handleChange} required placeholder="Full name" />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>GST Number</Form.Label>
                  <Form.Control type="text" name="gst_number" value={formData.gst_number} onChange={handleChange} placeholder="27AABCU9603R1ZM" />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label>Contact Person</Form.Label>
                  <Form.Control type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label>Phone</Form.Label>
                  <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Address</Form.Label>
                  <Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} />
                </Form.Group>
              </div>
            </div>

            <div className="divider" style={{ margin: '1.5rem 0 1.25rem' }} />

            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <Button variant="link" className="text-secondary text-decoration-none" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingId ? 'Save Changes' : 'Add Vendor'}
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default Vendors;
