import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Plane } from 'lucide-react';
import { Offcanvas, Form, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';

const Airlines = () => {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ airline_code: '', airline_name: '', contact_person: '', email: '', phone: '', address: '', gst_number: '' });
  const [editingId, setEditingId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const fetchAirlines = async () => {
    try {
      setLoading(true);
      const res = await api.get('/airlines/');
      setAirlines(res.data.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch airlines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAirlines(); }, []);

  const handleShow = (airline = null) => {
    if (airline) {
      setFormData({
        airline_code: airline.airline_code,
        airline_name: airline.airline_name,
        contact_person: airline.contact_person || '',
        email: airline.email || '',
        phone: airline.phone || '',
        address: airline.address || '',
        gst_number: airline.gst_number || '',
      });
      setEditingId(airline.id);
      setLogoPreview(airline.logo || null);
    } else {
      setFormData({ airline_code: '', airline_name: '', contact_person: '', email: '', phone: '', address: '', gst_number: '' });
      setEditingId(null);
      setLogoPreview(null);
    }
    setLogoFile(null);
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let id = editingId;
      if (id) {
        await api.put(`/airlines/${id}`, formData);
        toast.success('Airline updated successfully');
      } else {
        const res = await api.post('/airlines/', formData);
        id = res.data.id;
        toast.success('Airline added successfully');
      }
      if (logoFile && id) {
        const fd = new FormData();
        fd.append('file', logoFile);
        await api.post(`/airlines/${id}/logo`, fd);
        toast.success('Logo uploaded successfully');
      }
      handleClose();
      fetchAirlines();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this airline?')) {
      try {
        await api.delete(`/airlines/${id}`);
        toast.success('Airline deleted successfully');
        fetchAirlines();
      } catch (error) {
        toast.error('Failed to delete airline');
      }
    }
  };

  const filtered = airlines.filter(a =>
    a.airline_name.toLowerCase().includes(search.toLowerCase()) ||
    a.airline_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Airlines</h1>
          <p className="page-subtitle">Manage airline partners and contact details.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleShow()}>
          <Plus size={15} />
          Add Airline
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={14} className="table-search-icon" />
            <input
              type="text"
              placeholder="Search airlines…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            {filtered.length} {filtered.length === 1 ? 'airline' : 'airlines'}
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
            <div className="empty-state-icon"><Plane size={22} /></div>
            <div className="empty-state-title">{search ? 'No results found' : 'No airlines yet'}</div>
            <div className="empty-state-desc">
              {search ? `No airlines match "${search}".` : 'Add your first airline to get started.'}
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Code</th>
                  <th>Airline Name</th>
                  <th>GST Number</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((airline, i) => (
                  <motion.tr
                    key={airline.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.22 }}
                  >
                    <td>
                      {airline.logo ? (
                        <img src={airline.logo} alt="" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} />
                      ) : (
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 'var(--r)',
                            background: 'var(--primary-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Plane size={13} color="var(--primary)" />
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge-base badge-primary" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                        {airline.airline_code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{airline.airline_name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                      {airline.gst_number || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{airline.phone || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.8125rem',
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {airline.address || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                        <button className="btn-icon-ghost primary" onClick={() => handleShow(airline)} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn-icon-ghost danger" onClick={() => handleDelete(airline.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
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
          <Offcanvas.Title>{editingId ? 'Edit Airline' : 'Add Airline'}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-5">
                <Form.Group>
                  <Form.Label>Airline Code *</Form.Label>
                  <Form.Control type="text" name="airline_code" value={formData.airline_code} onChange={handleChange} required disabled={!!editingId} placeholder="e.g. GA" />
                </Form.Group>
              </div>
              <div className="col-7">
                <Form.Group>
                  <Form.Label>Airline Name *</Form.Label>
                  <Form.Control type="text" name="airline_name" value={formData.airline_name} onChange={handleChange} required placeholder="Full name" />
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
                  <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+62-21-xxx" />
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
                  <Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} placeholder="Company address" />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Logo</Form.Label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Form.Control type="file" accept="image/*" onChange={handleLogoChange} />
                    {logoPreview && (
                      <img src={logoPreview} alt="preview" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 4, border: '1px solid var(--border)' }} />
                    )}
                  </div>
                </Form.Group>
              </div>
            </div>

            <div className="divider" style={{ margin: '1.5rem 0 1.25rem' }} />

            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <Button variant="link" className="text-secondary text-decoration-none" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingId ? 'Save Changes' : 'Add Airline'}
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default Airlines;
