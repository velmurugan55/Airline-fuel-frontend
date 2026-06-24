import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Plus, Eye, Download, Receipt, Plane, Building2 } from 'lucide-react';
import { Modal, Offcanvas, Button, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const [formData, setFormData] = useState({
    airline_id: '',
    vendor_id: '',
    fuel_quantity: '',
    transaction_date: '',
    remarks: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, airRes, venRes] = await Promise.all([
        api.get('/transactions/'),
        api.get('/airlines/'),
        api.get('/vendors/'),
      ]);
      setTransactions(transRes.data.data || transRes.data || []);
      setAirlines(airRes.data.data || airRes.data || []);
      setVendors(venRes.data.data || venRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getAirlineCode = (id) => airlines.find(a => a.id === id)?.airline_code || '—';
  const getVendorName = (id) => vendors.find(v => v.id === id)?.vendor_name || '—';

  const handleShow = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({ airline_id: '', vendor_id: '', fuel_quantity: '', transaction_date: today, remarks: '' });
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions/', formData);
      toast.success('Transaction created successfully');
      handleClose();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create transaction');
    }
  };

  const viewInvoice = async (invoiceNo) => {
    try {
      const res = await api.get(`/transactions/${invoiceNo}`);
      setInvoiceData(res.data);
      setShowInvoiceModal(true);
    } catch (error) {
      toast.error('Failed to fetch invoice details');
    }
  };

  const downloadInvoice = () => {
    if (!invoiceData) return;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 190;
    let y = 20;
    const logoX = 160;

    const bold = (text, x, size) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(size); doc.text(text, x, y); };
    const normal = (text, x, size) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.text(text, x, y); };
    const line = () => { y += 2; doc.line(10, y, 200, y); y += 4; };

    doc.setFillColor(13, 110, 253);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    bold('INVOICE', 14, 14);
    doc.setFontSize(20);
    doc.text(invoiceData.invoice_no, 14, 28);

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(invoiceData.transaction_date, logoX, 14);
    doc.text('Date', logoX, 10);

    if (invoiceData.airline.logo) {
      try { doc.addImage(invoiceData.airline.logo, 'JPEG', logoX, 16, 30, 15); } catch (_) {}
    }
    doc.setTextColor(0, 0, 0);

    y = 45;
    bold('Bill To', 14, 10);
    y += 6;
    normal(invoiceData.airline.airline_name, 14, 11);
    y += 5;
    normal(`${invoiceData.airline.airline_code}`, 14, 9);
    y += 4;
    if (invoiceData.airline.address) normal(invoiceData.airline.address, 14, 9);
    y += 4;
    if (invoiceData.airline.gst_number) normal(`GST: ${invoiceData.airline.gst_number}`, 14, 9);
    y += 4;
    if (invoiceData.airline.phone) normal(`Phone: ${invoiceData.airline.phone}`, 14, 9);
    y += 4;
    if (invoiceData.airline.email) normal(`Email: ${invoiceData.airline.email}`, 14, 9);
    y += 8;

    bold('Supplier', 14, 10);
    y += 6;
    normal(invoiceData.vendor.vendor_name, 14, 11);
    y += 5;
    normal(`${invoiceData.vendor.vendor_code}`, 14, 9);
    y += 4;
    if (invoiceData.vendor.address) normal(invoiceData.vendor.address, 14, 9);
    y += 4;
    if (invoiceData.vendor.phone) normal(`Phone: ${invoiceData.vendor.phone}`, 14, 9);
    y += 4;
    if (invoiceData.vendor.email) normal(`Email: ${invoiceData.vendor.email}`, 14, 9);
    y += 6;
    line();

    const col1 = 14, col2 = 100, col3 = 140, col4 = 170;
    doc.setFillColor(240, 240, 240);
    doc.rect(col1 - 2, y - 3, pageW, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text('Description', col1, y); doc.text('Quantity (L)', col2, y); doc.text('Unit Price', col3, y); doc.text('Amount', col4, y);
    y += 8;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text('Aviation Fuel Refill', col1, y);
    doc.text(Number(invoiceData.fuel_quantity_liters).toLocaleString(), col2, y);
    doc.text(`$${Number(invoiceData.fuel_price_per_liter).toFixed(4)}`, col3, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${Number(invoiceData.total_amount).toLocaleString()}`, col4, y);

    y = 230;
    doc.setDrawColor(200, 200, 200);
    doc.line(10, y, 200, y);
    y += 6;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text('Total Amount:', 120, y);
    doc.text(`$${Number(invoiceData.total_amount).toLocaleString()}`, 170, y, { align: 'right' });

    if (invoiceData.remarks) {
      y += 10;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Remarks: ${invoiceData.remarks}`, 14, y);
    }

    y = 270;
    doc.setDrawColor(13, 110, 253);
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    y += 5;
    doc.setTextColor(100); doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', 14, y);

    doc.save(`${invoiceData.invoice_no}.pdf`);
    toast.success('Invoice downloaded as PDF');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Record fuelling activities and view auto-generated invoices.</p>
        </div>
        <button className="btn btn-primary" onClick={handleShow}>
          <Plus size={15} />
          New Transaction
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--r-lg)',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Receipt size={15} color="var(--primary)" />
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {transactions.length} Records
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <div className="skeleton" style={{ width: '18%', height: 22, borderRadius: 'var(--r-full)' }} />
                <div className="skeleton" style={{ width: '12%', height: 10 }} />
                <div className="skeleton" style={{ width: '14%', height: 22, borderRadius: 'var(--r-full)' }} />
                <div className="skeleton" style={{ width: '18%', height: 10 }} />
                <div className="skeleton" style={{ width: '12%', height: 10 }} />
                <div className="skeleton" style={{ flex: 1, height: 10 }} />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Receipt size={22} /></div>
            <div className="empty-state-title">No transactions yet</div>
            <div className="empty-state-desc">Create your first fuel transaction to generate an invoice.</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th>Airline</th>
                  <th>Vendor</th>
                  <th style={{ textAlign: 'right' }}>Quantity (L)</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                  <th style={{ textAlign: 'right' }}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.22 }}
                  >
                    <td>
                      <span
                        className="badge-base badge-primary"
                        style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.01em' }}
                      >
                        {t.invoice_no}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.transaction_date}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 'var(--r)',
                            background: 'var(--primary-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Plane size={11} color="var(--primary)" />
                        </div>
                        <span className="badge-base badge-neutral" style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.6875rem' }}>
                          {getAirlineCode(t.airline_id)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 'var(--r)',
                            background: 'var(--success-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Building2 size={11} color="var(--success)" />
                        </div>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{getVendorName(t.vendor_id)}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                      {Number(t.fuel_quantity).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
                      ${Number(t.total_amount).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-icon-ghost primary"
                        onClick={() => viewInvoice(t.invoice_no)}
                        title="View Invoice"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Transaction Drawer */}
      <Offcanvas show={showModal} onHide={handleClose} placement="end" backdrop="static">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>New Fuel Transaction</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Airline *</Form.Label>
                  <Form.Select name="airline_id" value={formData.airline_id} onChange={handleChange} required>
                    <option value="">Select Airline</option>
                    {airlines.map(a => (
                      <option key={a.id} value={a.id}>{a.airline_name} ({a.airline_code})</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Vendor *</Form.Label>
                  <Form.Select name="vendor_id" value={formData.vendor_id} onChange={handleChange} required>
                    <option value="">Select Vendor</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.vendor_name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label>Fuel Quantity (L) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    name="fuel_quantity"
                    value={formData.fuel_quantity}
                    onChange={handleChange}
                    required
                    placeholder="0.0000"
                  />
                </Form.Group>
              </div>
              <div className="col-6">
                <Form.Group>
                  <Form.Label>Transaction Date *</Form.Label>
                  <Form.Control type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} required />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label>Remarks</Form.Label>
                  <Form.Control as="textarea" rows={2} name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Optional notes…" />
                </Form.Group>
              </div>
            </div>

            <div className="warning-banner" style={{ marginTop: '1.25rem' }}>
              <Receipt size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>The system will automatically use the latest fuel price for the selected vendor to calculate the total amount.</span>
            </div>

            <div className="divider" style={{ margin: '1.5rem 0 1.25rem' }} />

            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <Button variant="link" className="text-secondary text-decoration-none" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Create Transaction
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Invoice Modal */}
      <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ color: 'var(--primary)' }}>
            <Receipt size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Invoice Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '0 !important' }}>
          {invoiceData ? (
            <div>
              {/* Invoice header */}
              <div
                className="invoice-display-header"
                style={{
                  margin: '0 0 0',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #1e3a8a, #2563EB)',
                  color: 'white',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7, marginBottom: '0.25rem' }}>
                      Invoice
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'monospace' }}>
                      {invoiceData.invoice_no}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6875rem', opacity: 0.7, marginBottom: '0.25rem', fontWeight: 500 }}>Total Amount</div>
                    <div style={{ fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                      ${Number(invoiceData.total_amount).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.65, marginTop: '0.25rem' }}>{invoiceData.transaction_date}</div>
                  </div>
                </div>
              </div>

              {/* Party info */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>
                      Billed To
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 3 }}>{invoiceData.airline.airline_name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Code: {invoiceData.airline.airline_code}</div>
                    {invoiceData.airline.address && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>{invoiceData.airline.address}</div>}
                    {invoiceData.airline.gst_number && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>GST: {invoiceData.airline.gst_number}</div>}
                    {invoiceData.airline.phone && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>Tel: {invoiceData.airline.phone}</div>}
                  </div>
                  <div className="col-md-6">
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.625rem' }}>
                      Supplier
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 3 }}>{invoiceData.vendor.vendor_name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Code: {invoiceData.vendor.vendor_code}</div>
                    {invoiceData.vendor.address && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>{invoiceData.vendor.address}</div>}
                    {invoiceData.vendor.phone && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>Tel: {invoiceData.vendor.phone}</div>}
                  </div>
                </div>
              </div>

              {/* Line item */}
              <div style={{ padding: '1.5rem' }}>
                <div
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--r-xl)',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto auto',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      background: 'var(--border)',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <span>Description</span>
                    <span>Quantity (L)</span>
                    <span>Unit Price</span>
                    <span>Amount</span>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto auto',
                      gap: '1rem',
                      padding: '1rem',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Aviation Fuel Refill</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                      {Number(invoiceData.fuel_quantity_liters).toLocaleString()}
                    </span>
                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                      ${Number(invoiceData.fuel_price_per_liter).toFixed(4)}
                    </span>
                    <span style={{ fontWeight: 800, color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
                      ${Number(invoiceData.total_amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Total row */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <div
                    style={{
                      background: 'var(--primary-light)',
                      border: '1px solid rgba(37,99,235,0.2)',
                      borderRadius: 'var(--r-lg)',
                      padding: '0.75rem 1.25rem',
                      display: 'flex',
                      gap: '2rem',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Amount</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ${Number(invoiceData.total_amount).toLocaleString()}
                    </span>
                  </div>
                </div>

                {invoiceData.remarks && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.875rem 1rem',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--r-lg)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Remarks
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{invoiceData.remarks}</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div className="spinner-border text-primary" role="status" />
            </div>
          )}
        </Modal.Body>
        {invoiceData && (
          <Modal.Footer>
            <Button variant="link" className="text-secondary text-decoration-none" onClick={() => setShowInvoiceModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={downloadInvoice}>
              <Download size={14} />
              Download PDF
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
};

export default Transactions;
