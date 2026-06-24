import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal, Button, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';
import api from '../services/api';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    fetchVendors();
  }, []);

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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Fuel Vendors</h4>
          <p className="text-secondary mb-0">Manage fuel suppliers and their details.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 hover-lift" onClick={() => handleShow()}>
          <Plus size={18} />
          <span>Add Vendor</span>
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
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">GST No</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-secondary">No vendors found.</td>
                  </tr>
                ) : (
                  vendors.map(vendor => (
                    <tr key={vendor.id}>
                      <td className="px-4 py-3 fw-medium">{vendor.vendor_code}</td>
                      <td className="px-4 py-3">{vendor.vendor_name}</td>
                      <td className="px-4 py-3 text-muted small">{vendor.gst_number || '-'}</td>
                      <td className="px-4 py-3">{vendor.contact_person || '-'}</td>
                      <td className="px-4 py-3">{vendor.email || '-'}</td>
                      <td className="px-4 py-3 text-end">
                        <button className="btn btn-sm btn-link text-primary p-1 me-2 hover-lift" onClick={() => handleShow(vendor)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-sm btn-link text-danger p-1 hover-lift" onClick={() => handleDelete(vendor.id)}>
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
            <Modal.Title className="fs-5 fw-bold">{editingId ? 'Edit Vendor' : 'Add Vendor'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 py-4">
            <div className="row g-3">
              <div className="col-md-4">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Vendor Code *</Form.Label>
                  <Form.Control type="text" name="vendor_code" value={formData.vendor_code} onChange={handleChange} required disabled={!!editingId} />
                </Form.Group>
              </div>
              <div className="col-md-8">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Vendor Name *</Form.Label>
                  <Form.Control type="text" name="vendor_name" value={formData.vendor_name} onChange={handleChange} required />
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
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Phone</Form.Label>
                  <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
                </Form.Group>
              </div>
              <div className="col-md-12">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Address</Form.Label>
                  <Form.Control as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} />
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

export default Vendors;
