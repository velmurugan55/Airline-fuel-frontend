import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal, Button, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';
import api from '../services/api';

const Airlines = () => {
  const [airlines, setAirlines] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAirlines();
  }, []);

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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Airlines</h4>
          <p className="text-secondary mb-0">Manage airline partners and contact details.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 hover-lift" onClick={() => handleShow()}>
          <Plus size={18} />
          <span>Add Airline</span>
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <div className="p-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th className="px-4 py-3">Logo</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">GST No</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {airlines.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-secondary">No airlines found.</td>
                  </tr>
                ) : (
                  airlines.map(airline => (
                    <tr key={airline.id}>
                      <td className="px-4 py-3">
                        {airline.logo ? (
                          <img src={airline.logo} alt="" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 4 }} />
                        ) : (
                          <span className="text-secondary">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 fw-medium">{airline.airline_code}</td>
                      <td className="px-4 py-3">{airline.airline_name}</td>
                      <td className="px-4 py-3 text-muted small">{airline.gst_number || '-'}</td>
                      <td className="px-4 py-3">{airline.phone || '-'}</td>
                      <td className="px-4 py-3 text-muted small" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{airline.address || '-'}</td>
                      <td className="px-4 py-3 text-end">
                        <button className="btn btn-sm btn-link text-primary p-1 me-2 hover-lift" onClick={() => handleShow(airline)} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-sm btn-link text-danger p-1 hover-lift" onClick={() => handleDelete(airline.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={handleClose} centered backdrop="static">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton className="border-bottom border-secondary border-opacity-25">
            <Modal.Title className="fs-5 fw-bold">{editingId ? 'Edit Airline' : 'Add Airline'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 py-4">
            <div className="row g-3">
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Airline Code *</Form.Label>
                  <Form.Control type="text" name="airline_code" value={formData.airline_code} onChange={handleChange} required disabled={!!editingId} />
                </Form.Group>
              </div>
              <div className="col-md-8">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Airline Name *</Form.Label>
                  <Form.Control type="text" name="airline_name" value={formData.airline_name} onChange={handleChange} required />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">GST Number</Form.Label>
                  <Form.Control type="text" name="gst_number" value={formData.gst_number} onChange={handleChange} placeholder="27AABCU9603R1ZM" />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Phone</Form.Label>
                  <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+62-21-2351-9999" />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Contact Person</Form.Label>
                  <Form.Control type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Email</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Address</Form.Label>
                  <Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} placeholder="Company address" />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Logo</Form.Label>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Control type="file" accept="image/*" onChange={handleLogoChange} />
                    {logoPreview && (
                      <img src={logoPreview} alt="logo preview" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 4, border: '1px solid var(--border-color)' }} />
                    )}
                  </div>
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-top border-secondary border-opacity-25">
            <Button variant="link" className="text-secondary text-decoration-none" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit">Save Changes</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Airlines;