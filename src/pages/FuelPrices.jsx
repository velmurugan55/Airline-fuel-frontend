import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal, Button, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';
import api from '../services/api';

const FuelPrices = () => {
  const [fuelPrices, setFuelPrices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ vendor_id: '', price_per_liter: '', effective_date: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pricesRes, vendorsRes] = await Promise.all([
        api.get('/fuel-prices/'),
        api.get('/vendors/')
      ]);
      setFuelPrices(pricesRes.data.data || pricesRes.data || []);
      setVendors(vendorsRes.data.data || vendorsRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.vendor_name : 'Unknown';
  };

  const handleShow = (price = null) => {
    if (price) {
      setFormData({
        vendor_id: price.vendor_id,
        price_per_liter: price.price_per_liter,
        effective_date: price.effective_date
      });
      setEditingId(price.id);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({ vendor_id: '', price_per_liter: '', effective_date: today });
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
        await api.put(`/fuel-prices/${editingId}`, formData);
        toast.success('Fuel price updated successfully');
      } else {
        await api.post('/fuel-prices/', formData);
        toast.success('Fuel price added successfully');
      }
      handleClose();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this price record?')) {
      try {
        await api.delete(`/fuel-prices/${id}`);
        toast.success('Price record deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete price record');
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Fuel Prices</h4>
          <p className="text-secondary mb-0">Manage fuel pricing history per vendor.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 hover-lift" onClick={() => handleShow()}>
          <Plus size={18} />
          <span>Add Price</span>
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
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Price Per Liter</th>
                  <th className="px-4 py-3">Effective Date</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fuelPrices.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-secondary">No fuel prices found.</td>
                  </tr>
                ) : (
                  fuelPrices.map(price => (
                    <tr key={price.id}>
                      <td className="px-4 py-3 fw-medium">{getVendorName(price.vendor_id)}</td>
                      <td className="px-4 py-3 text-success fw-bold">{Number(price.price_per_liter).toFixed(2)}</td>
                      <td className="px-4 py-3">{price.effective_date}</td>
                      <td className="px-4 py-3 text-end">
                        <button className="btn btn-sm btn-link text-primary p-1 me-2 hover-lift" onClick={() => handleShow(price)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-sm btn-link text-danger p-1 hover-lift" onClick={() => handleDelete(price.id)}>
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
            <Modal.Title className="fs-5 fw-bold">{editingId ? 'Edit Fuel Price' : 'Add Fuel Price'}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 py-4">
            <div className="row g-3">
              <div className="col-12">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Vendor *</Form.Label>
                  <Form.Select name="vendor_id" value={formData.vendor_id} onChange={handleChange} required disabled={!!editingId}>
                    <option value="">Select a Vendor</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.vendor_name} ({v.vendor_code})</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Price Per Liter *</Form.Label>
                  <Form.Control type="number" step="0.0001" min="0.0001" name="price_per_liter" value={formData.price_per_liter} onChange={handleChange} required />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Effective Date *</Form.Label>
                  <Form.Control type="date" name="effective_date" value={formData.effective_date} onChange={handleChange} required />
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

export default FuelPrices;
