import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { FileText, Download, Search } from 'lucide-react';
import { Form, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import api from '../services/api';

const Reports = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const params = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const res = await api.get('/reports/invoices', { params });
      setReport(res.data);
    } catch (error) {
      toast.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const label = fromDate || toDate ? `${fromDate || ''}_${toDate || ''}` : 'all';

  const downloadCSV = () => {
    if (!report || report.invoices.length === 0) return;

    const sep = ',';
    const header = ['Invoice No','Date','Airline','Airline Code','Vendor','Vendor Code','Quantity (L)','Unit Price','Total','Remarks'].join(sep);
    const rows = report.invoices.map(inv =>
      [
        inv.invoice_no,
        inv.transaction_date,
        inv.airline_name,
        inv.airline_code,
        inv.vendor_name,
        inv.vendor_code,
        Number(inv.fuel_quantity).toLocaleString(),
        Number(inv.fuel_price).toFixed(4),
        Number(inv.total_amount).toLocaleString(),
        `"${(inv.remarks || '').replace(/"/g, '""')}"`,
      ].join(sep)
    ).join('\n');

    const summary = [
      '',
      `Total Records,,${report.total_records}`,
      `Total Fuel (L),,,${Number(report.total_fuel_quantity).toLocaleString()}`,
      `Total Amount,,,$${Number(report.total_amount).toLocaleString()}`,
    ].join('\n');

    const csv = `\uFEFF${header}\n${rows}\n${summary}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel_report_${label}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded as CSV');
  };

  const downloadPDF = () => {
    if (!report || report.invoices.length === 0) return;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
    const pageW = 280;
    let y = 15;

    const bold = (text, x, size) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(size); doc.text(text, x, y); };
    const normal = (text, x, size) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(size); doc.text(text, x, y); };

    doc.setFillColor(13, 110, 253);
    doc.rect(0, 0, 300, 18, 'F');
    doc.setTextColor(255, 255, 255);
    bold('AeroFuel - Invoice Report', 10, 12);
    doc.setTextColor(0, 0, 0);

    y = 28;
    normal(`Period: ${fromDate || 'Start'} to ${toDate || 'End'}`, 10, 10);
    y += 10;

    const cols = [10, 48, 78, 108, 140, 170, 200, 230];
    const headers = ['Invoice No', 'Date', 'Airline', 'Vendor', 'Qty (L)', 'Unit Price', 'Total', 'Remarks'];
    doc.setFillColor(240, 240, 240);
    doc.rect(8, y - 3, pageW, 8, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
    headers.forEach((h, i) => doc.text(h, cols[i], y));
    y += 7;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    report.invoices.forEach((inv, idx) => {
      if (y > 185) {
        doc.addPage();
        y = 15;
        doc.setFillColor(240, 240, 240);
        doc.rect(8, y - 3, pageW, 8, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
        headers.forEach((h, i) => doc.text(h, cols[i], y));
        y += 7;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
      }
      doc.text(inv.invoice_no, cols[0], y);
      doc.text(inv.transaction_date, cols[1], y);
      doc.text(`${inv.airline_name} (${inv.airline_code})`, cols[2], y);
      doc.text(`${inv.vendor_name} (${inv.vendor_code})`, cols[3], y);
      doc.text(Number(inv.fuel_quantity).toLocaleString(), cols[4], y);
      doc.text(`$${Number(inv.fuel_price).toFixed(4)}`, cols[5], y);
      doc.text(`$${Number(inv.total_amount).toLocaleString()}`, cols[6], y);
      doc.text(inv.remarks || '-', cols[7], y);
      y += 5;
    });

    y = Math.max(y + 8, 220);
    doc.setDrawColor(13, 110, 253);
    doc.line(8, y, pageW + 8, y);
    y += 6;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text(`Total Records: ${report.total_records}`, 10, y);
    doc.text(`Total Fuel: ${Number(report.total_fuel_quantity).toLocaleString()} L`, 80, y);
    doc.text(`Total Revenue: $${Number(report.total_amount).toLocaleString()}`, 160, y);

    doc.save(`fuel_report_${label}.pdf`);
    toast.success('Report downloaded as PDF');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Invoice Report</h4>
          <p className="text-secondary mb-0">View and export filtered transaction reports.</p>
        </div>
        {report && report.invoices.length > 0 && (
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary d-flex align-items-center gap-2 hover-lift" onClick={downloadCSV}>
              <Download size={16} /> CSV
            </button>
            <button className="btn btn-primary d-flex align-items-center gap-2 hover-lift" onClick={downloadPDF}>
              <Download size={16} /> PDF
            </button>
          </div>
        )}
      </div>

      <div className="glass-card p-4 mb-4">
        <Form onSubmit={fetchReport}>
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <Form.Group>
                <Form.Label className="text-secondary small mb-1">From Date</Form.Label>
                <Form.Control type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label className="text-secondary small mb-1">To Date</Form.Label>
                <Form.Control type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
              </Form.Group>
            </div>
            <div className="col-md-3 d-flex gap-2">
              <Button variant="primary" type="submit" disabled={loading} className="d-flex align-items-center gap-2">
                <Search size={16} /> {loading ? 'Loading...' : 'Generate Report'}
              </Button>
              <Button variant="outline-secondary" onClick={() => { setFromDate(''); setToDate(''); setReport(null); }}>
                Clear
              </Button>
            </div>
          </div>
        </Form>
      </div>

      {loading ? (
        <div className="p-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>
      ) : report ? (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="glass-card p-3 text-center">
                <p className="text-secondary small mb-1">Total Records</p>
                <h3 className="fw-bold mb-0 text-primary">{report.total_records}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-card p-3 text-center">
                <p className="text-secondary small mb-1">Total Fuel (L)</p>
                <h3 className="fw-bold mb-0 text-success">{Number(report.total_fuel_quantity).toLocaleString()}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="glass-card p-3 text-center">
                <p className="text-secondary small mb-1">Total Revenue</p>
                <h3 className="fw-bold mb-0 text-warning">${Number(report.total_amount).toLocaleString()}</h3>
              </div>
            </div>
          </div>

          <div className="glass-card">
            {report.invoices.length === 0 ? (
              <div className="p-5 text-center text-secondary">No transactions found for the selected period.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th className="px-4 py-3">Invoice No</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Airline</th>
                      <th className="px-4 py-3">Vendor</th>
                      <th className="px-4 py-3 text-end">Quantity (L)</th>
                      <th className="px-4 py-3 text-end">Unit Price</th>
                      <th className="px-4 py-3 text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.invoices.map(inv => (
                      <tr key={inv.invoice_no}>
                        <td className="px-4 py-3 fw-bold text-primary">{inv.invoice_no}</td>
                        <td className="px-4 py-3">{inv.transaction_date}</td>
                        <td className="px-4 py-3">{inv.airline_name} <span className="text-secondary">({inv.airline_code})</span></td>
                        <td className="px-4 py-3">{inv.vendor_name} <span className="text-secondary">({inv.vendor_code})</span></td>
                        <td className="px-4 py-3 text-end">{Number(inv.fuel_quantity).toLocaleString()}</td>
                        <td className="px-4 py-3 text-end">${Number(inv.fuel_price).toFixed(4)}</td>
                        <td className="px-4 py-3 text-end text-success fw-bold">${Number(inv.total_amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="glass-card p-5 text-center text-secondary">
          <FileText size={48} className="mb-3 opacity-50" />
          <p className="mb-0">Select a date range and click "Generate Report" to view transaction data.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
