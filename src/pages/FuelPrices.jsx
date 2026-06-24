import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Droplets, TrendingUp, TrendingDown } from 'lucide-react';
import { Offcanvas, Form, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';
import usePermission from '../hooks/usePermission';

const FuelPrices = () => {
  const { canCreate, canEdit, canDelete } = usePermission();
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
        api.get('/vendors/'),
      ]);
      setFuelPrices(pricesRes.data.data || pricesRes.data || []);
      setVendors(vendorsRes.data.data || vendorsRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.vendor_name : 'Unknown';
  };

  const getVendorCode = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.vendor_code : '—';
  };

  const handleShow = (price = null) => {
    if (price) {
      setFormData({
        vendor_id: price.vendor_id,
        price_per_liter: price.price_per_liter,
        effective_date: price.effective_date,
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

  // Find highest price for relative indicator
  const maxPrice = Math.max(...fuelPrices.map(p => Number(p.price_per_liter)), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fuel Prices</h1>
          <p className="page-subtitle">Manage fuel pricing history per vendor.</p>
        </div>
        {canCreate('fuel_prices') && (
          <button className="btn btn-primary" onClick={() => handleShow()}>
            <Plus size={15} />
            Add Price
          </button>
        )}
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--r-lg)',
                background: 'var(--warning-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Droplets size={15} color="var(--warning)" />
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {fuelPrices.length} Price Records
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div className="skeleton" style={{ width: '25%', height: 10 }} />
                <div className="skeleton" style={{ width: '15%', height: 10 }} />
                <div className="skeleton" style={{ width: '20%', height: 10 }} />
                <div className="skeleton" style={{ flex: 1, height: 10 }} />
              </div>
            ))}
          </div>
        ) : fuelPrices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Droplets size={22} /></div>
            <div className="empty-state-title">No price records yet</div>
            <div className="empty-state-desc">Add fuel prices for your vendors to enable automatic pricing on transactions.</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Price Per Liter</th>
                  <th>Trend</th>
                  <th>Effective Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fuelPrices.map((price, i) => {
                  const priceVal = Number(price.price_per_liter);
                  const pct = maxPrice > 0 ? (priceVal / maxPrice) * 100 : 50;
                  const isHigh = pct >= 70;

                  return (
                    <motion.tr
                      key={price.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.22 }}
                    >
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontWeight: 600 }}>{getVendorName(price.vendor_id)}</span>
                          <span className="badge-base badge-neutral" style={{ width: 'fit-content', fontFamily: 'monospace', fontSize: '0.625rem' }}>
                            {getVendorCode(price.vendor_id)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '1.0625rem',
                            fontWeight: 800,
                            fontVariantNumeric: 'tabular-nums',
                            color: isHigh ? 'var(--danger)' : 'var(--success)',
                          }}
                        >
                          ₹{priceVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: 4 }}>/L</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: 80,
                              height: 6,
                              background: 'var(--bg-secondary)',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: isHigh ? '#EF4444' : '#10B981',
                                borderRadius: 3,
                                transition: 'width 0.5s ease',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.6875rem', color: isHigh ? 'var(--danger)' : 'var(--success)' }}>
                            {isHigh ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-base badge-neutral">{price.effective_date}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                          {canEdit('fuel_prices') && (
                            <button className="btn-icon-ghost primary" onClick={() => handleShow(price)} title="Edit">
                              <Edit2 size={14} />
                            </button>
                          )}
                          {canDelete('fuel_prices') && (
                            <button className="btn-icon-ghost danger" onClick={() => handleDelete(price.id)} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Offcanvas Drawer */}
      <Offcanvas show={showModal} onHide={handleClose} placement="end" backdrop="static">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{editingId ? 'Edit Fuel Price' : 'Add Fuel Price'}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Vendor *</Form.Label>
                  <Form.Select name="vendor_id" value={formData.vendor_id} onChange={handleChange} required disabled={!!editingId}>
                    <option value="">Select a Vendor</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.vendor_name} ({v.vendor_code})</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label>Price Per Liter *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    name="price_per_liter"
                    value={formData.price_per_liter}
                    onChange={handleChange}
                    required
                    placeholder="0.0000"
                  />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label>Effective Date *</Form.Label>
                  <Form.Control type="date" name="effective_date" value={formData.effective_date} onChange={handleChange} required />
                </Form.Group>
              </div>
            </div>

            <div
              className="info-banner"
              style={{ marginTop: '1.25rem' }}
            >
              <Droplets size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>The latest price for each vendor is automatically used when creating new transactions.</span>
            </div>

            <div className="divider" style={{ margin: '1.5rem 0 1.25rem' }} />

            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <Button variant="link" className="text-secondary text-decoration-none" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingId ? 'Save Changes' : 'Add Price Record'}
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default FuelPrices;
