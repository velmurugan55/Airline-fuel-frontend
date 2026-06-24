import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { Plus, Eye, Download } from 'lucide-react';
import { Modal, Button, Form, Badge } from 'react-bootstrap';
import toast from 'react-hot-toast';
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
    remarks: '' 
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, airRes, venRes] = await Promise.all([
        api.get('/transactions/'),
        api.get('/airlines/'),
        api.get('/vendors/')
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

  useEffect(() => {
    fetchData();
  }, []);

  const getAirlineCode = (id) => airlines.find(a => a.id === id)?.airline_code || 'Unknown';
  const getVendorName = (id) => vendors.find(v => v.id === id)?.vendor_name || 'Unknown';

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
      try {
        doc.addImage(invoiceData.airline.logo, 'JPEG', logoX, 16, 30, 15);
      } catch (_) {}
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Fuel Transactions</h4>
          <p className="text-secondary mb-0">Record fuelling activities and view invoices.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 hover-lift" onClick={handleShow}>
          <Plus size={18} />
          <span>New Transaction</span>
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
                  <th className="px-4 py-3">Invoice No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Airline</th>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Quantity (L)</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-secondary">No transactions found.</td>
                  </tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 fw-bold text-primary">{t.invoice_no}</td>
                      <td className="px-4 py-3">{t.transaction_date}</td>
                      <td className="px-4 py-3"><Badge bg="secondary" className="bg-opacity-25 text-light">{getAirlineCode(t.airline_id)}</Badge></td>
                      <td className="px-4 py-3">{getVendorName(t.vendor_id)}</td>
                      <td className="px-4 py-3">{Number(t.fuel_quantity).toLocaleString()}</td>
                      <td className="px-4 py-3 text-success fw-bold">${Number(t.total_amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-end">
                        <button className="btn btn-sm btn-link text-primary p-1 hover-lift" onClick={() => viewInvoice(t.invoice_no)}>
                          <Eye size={16} />
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

      <Modal show={showModal} onHide={handleClose} centered backdrop="static" size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton className="border-bottom border-secondary border-opacity-25">
            <Modal.Title className="fs-5 fw-bold">New Fuel Transaction</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4 py-4">
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Airline *</Form.Label>
                  <Form.Select name="airline_id" value={formData.airline_id} onChange={handleChange} required>
                    <option value="">Select Airline</option>
                    {airlines.map(a => <option key={a.id} value={a.id}>{a.airline_name} ({a.airline_code})</option>)}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Vendor *</Form.Label>
                  <Form.Select name="vendor_id" value={formData.vendor_id} onChange={handleChange} required>
                    <option value="">Select Vendor</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.vendor_name}</option>)}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Fuel Quantity (Liters) *</Form.Label>
                  <Form.Control type="number" step="0.0001" min="0.0001" name="fuel_quantity" value={formData.fuel_quantity} onChange={handleChange} required />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Transaction Date *</Form.Label>
                  <Form.Control type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} required />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label className="text-secondary small mb-1">Remarks</Form.Label>
                  <Form.Control as="textarea" rows={2} name="remarks" value={formData.remarks} onChange={handleChange} />
                </Form.Group>
              </div>
            </div>
            <div className="mt-3 p-3 rounded bg-warning bg-opacity-10 border border-warning border-opacity-25 text-warning small">
              The system will automatically use the latest fuel price available for the selected vendor on the given date to calculate the total amount.
            </div>
          </Modal.Body>
          <Modal.Footer className="border-top border-secondary border-opacity-25">
            <Button variant="link" className="text-secondary text-decoration-none" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" type="submit">Create Transaction</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-bottom border-secondary border-opacity-25">
          <Modal.Title className="fs-5 fw-bold text-primary">Invoice Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {invoiceData ? (
            <div>
              <div className="d-flex justify-content-between mb-4 pb-3 border-bottom border-secondary border-opacity-25">
                <div>
                  <h3 className="fw-bold mb-1">{invoiceData.invoice_no}</h3>
                  <p className="text-secondary mb-0">Date: {invoiceData.transaction_date}</p>
                </div>
                <div className="text-end">
                  <h4 className="fw-bold text-success mb-1">${Number(invoiceData.total_amount).toLocaleString()}</h4>
                  <p className="text-secondary mb-0">Total Amount</p>
                </div>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <h6 className="text-secondary text-uppercase small fw-bold mb-2">Billed To</h6>
                  <p className="mb-0 fw-bold">{invoiceData.airline.airline_name} ({invoiceData.airline.airline_code})</p>
                  <p className="text-secondary mb-0 small">{invoiceData.airline.address || 'No address provided'}</p>
                  {invoiceData.airline.gst_number && <p className="text-secondary mb-0 small">GST: {invoiceData.airline.gst_number}</p>}
                  {invoiceData.airline.phone && <p className="text-secondary mb-0 small">Phone: {invoiceData.airline.phone}</p>}
                </div>
                <div className="col-md-6 text-md-end">
                  <h6 className="text-secondary text-uppercase small fw-bold mb-2">Supplier</h6>
                  <p className="mb-0 fw-bold">{invoiceData.vendor.vendor_name} ({invoiceData.vendor.vendor_code})</p>
                  <p className="text-secondary mb-0 small">{invoiceData.vendor.address || 'No address provided'}</p>
                  {invoiceData.vendor.phone && <p className="text-secondary mb-0 small">Phone: {invoiceData.vendor.phone}</p>}
                </div>
              </div>

              <div className="table-responsive rounded border border-secondary border-opacity-25">
                <table className="table table-borderless mb-0">
                  <thead className="bg-secondary bg-opacity-10 border-bottom border-secondary border-opacity-25">
                    <tr>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-end">Quantity (L)</th>
                      <th className="py-3 px-4 text-end">Unit Price</th>
                      <th className="py-3 px-4 text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 px-4">Aviation Fuel Refill</td>
                      <td className="py-3 px-4 text-end">{Number(invoiceData.fuel_quantity_liters).toLocaleString()}</td>
                      <td className="py-3 px-4 text-end">${Number(invoiceData.fuel_price_per_liter).toFixed(4)}</td>
                      <td className="py-3 px-4 text-end fw-bold">${Number(invoiceData.total_amount).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {invoiceData.remarks && (
                <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
                  <p className="small text-secondary mb-1">Remarks</p>
                  <p className="mb-0">{invoiceData.remarks}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
          )}
        </Modal.Body>
        {invoiceData && (
          <Modal.Footer className="border-top border-secondary border-opacity-25">
            <Button variant="link" className="text-secondary text-decoration-none" onClick={() => setShowInvoiceModal(false)}>Close</Button>
            <Button variant="primary" onClick={downloadInvoice}>
              <Download size={16} className="me-1" /> Download Invoice
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </div>
  );
};

export default Transactions;
