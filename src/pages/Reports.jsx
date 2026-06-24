import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { FileText, Download, Search, BarChart3, Fuel, DollarSign, Hash, Calendar } from 'lucide-react';
import { Form, Button } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';
import usePermission from '../hooks/usePermission';

const Reports = () => {
  const { canExport } = usePermission();
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
    const header = ['Invoice No', 'Date', 'Airline', 'Airline Code', 'Vendor', 'Vendor Code', 'Quantity (L)', 'Unit Price', 'Total', 'Remarks'].join(sep);
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

    const csv = `﻿${header}\n${rows}\n${summary}`;
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
    report.invoices.forEach((inv) => {
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
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">View and export filtered transaction reports.</p>
        </div>
        {report && report.invoices.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {canExport('reports') && (
              <button className="btn btn-outline-secondary" onClick={downloadCSV}>
                <Download size={14} />
                Export CSV
              </button>
            )}
            {canExport('reports') && (
              <button className="btn btn-primary" onClick={downloadPDF}>
                <Download size={14} />
                Export PDF
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-xl)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Calendar size={15} color="var(--primary)" />
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Date Range Filter</span>
        </div>
        <Form onSubmit={fetchReport}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 160px', minWidth: 160 }}>
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </Form.Group>
            </div>
            <div style={{ flex: '1 1 160px', minWidth: 160 }}>
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
              </Form.Group>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', paddingBottom: '0.0625rem' }}>
              <Button variant="primary" type="submit" disabled={loading}>
                <Search size={14} />
                {loading ? 'Loading…' : 'Generate Report'}
              </Button>
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => { setFromDate(''); setToDate(''); setReport(null); }}
              >
                Clear
              </Button>
            </div>
          </div>
        </Form>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="spinner-border text-primary" role="status" />
          <p style={{ color: 'var(--text-muted)', marginTop: '0.75rem', fontSize: '0.875rem' }}>Generating report…</p>
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="row g-3 mb-4">
            {[
              {
                label: 'Total Records',
                value: report.total_records,
                icon: Hash,
                color: '#2563EB',
                bg: 'var(--primary-light)',
              },
              {
                label: 'Total Fuel (L)',
                value: Number(report.total_fuel_quantity).toLocaleString(),
                icon: Fuel,
                color: '#F59E0B',
                bg: 'var(--warning-light)',
              },
              {
                label: 'Total Revenue',
                value: `$${Number(report.total_amount).toLocaleString()}`,
                icon: DollarSign,
                color: '#10B981',
                bg: 'var(--success-light)',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="col-12 col-md-4">
                  <motion.div
                    className="report-stat"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--r-lg)',
                        background: item.bg,
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.875rem',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: item.color,
                        letterSpacing: '-0.03em',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {item.value}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Report Table */}
          <div className="table-card">
            <div
              style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <BarChart3 size={15} color="var(--primary)" />
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Invoice Breakdown</span>
              <span className="badge-base badge-neutral" style={{ marginLeft: '0.5rem' }}>
                {report.invoices.length} records
              </span>
            </div>

            {report.invoices.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><FileText size={22} /></div>
                <div className="empty-state-title">No transactions found</div>
                <div className="empty-state-desc">No transactions match the selected date range.</div>
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
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.invoices.map((inv, i) => (
                      <motion.tr
                        key={inv.invoice_no}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                      >
                        <td>
                          <span className="badge-base badge-primary" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            {inv.invoice_no}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{inv.transaction_date}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{inv.airline_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.airline_code}</div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{inv.vendor_name}</td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {Number(inv.fuel_quantity).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
                          ${Number(inv.fuel_price).toFixed(4)}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
                          ${Number(inv.total_amount).toLocaleString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="empty-state" style={{ padding: '4rem 1.5rem' }}>
            <div className="empty-state-icon" style={{ width: 64, height: 64, borderRadius: 'var(--r-2xl)' }}>
              <BarChart3 size={28} />
            </div>
            <div className="empty-state-title" style={{ fontSize: '1rem' }}>Ready to generate a report</div>
            <div className="empty-state-desc">
              Select a date range above and click "Generate Report" to view your fuel transaction data.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
