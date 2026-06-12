import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCurrency } from '../CurrencyContext';
import Layout from './layout.jsx';

export default function Dashboard() {
  const [report, setReport] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { currency, setCurrency, exchangeRate, setExchangeRate, rateSource, setRateSource, formatCurrency } = useCurrency();
  const isAdmin = user.role === 'COMPANY_ADMIN';
  const [reportSearch, setReportSearch] = useState('');
  const [salesSearch, setSalesSearch] = useState('');
  const [reportSort, setReportSort] = useState({ key: 'totalPayout', direction: 'desc' });
  const [salesSort, setSalesSort] = useState({ key: 'date', direction: 'desc' });

  const fetchSales = () => {
    api.get('/sales-records')
      .then((res) => {
        const sales = res.data;
        setSalesHistory(sales);
        
        // Calculate Payout Report manually to avoid the "null/NaN" backend bug
        const reportMap = {};
        sales.forEach(sale => {
          const userId = sale.userId;
          if (!reportMap[userId]) {
            reportMap[userId] = { 
              userId, 
              name: sale.user?.name || 'Unknown', 
              commissionsCount: 0, 
              totalPayout: 0 
            };
          }
          
          let totalEarnedForSale = 0;
          if (sale.commissionRecords && sale.commissionRecords.length > 0) {
            reportMap[userId].commissionsCount += 1;
            sale.commissionRecords.forEach(cr => {
              totalEarnedForSale += parseFloat(cr.commissionEarned || 0);
            });
          }
          reportMap[userId].totalPayout += totalEarnedForSale;
        });
        setReport(Object.values(reportMap));
      })
      .catch(() => {
        // If it fails (like a 401 Unauthorized), boot them back to login
        localStorage.clear();
        navigate('/');
      });
  };

  useEffect(() => {
    fetchSales();
  }, [navigate]);

  const handleDeleteSale = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sales record?")) return;
    try {
      await api.delete(`/sales-records/${id}`);
      fetchSales(); // Refresh the list
    } catch (err) {
      alert("Failed to delete sales record");
    }
  };

  const handleDeleteAllSales = async () => {
    if (!window.confirm("Are you sure you want to delete ALL sales history? This cannot be undone!")) return;
    try {
      await Promise.all(salesHistory.map(sale => api.delete(`/sales-records/${sale.id}`)));
      fetchSales(); // Refresh the list
    } catch (err) {
      alert("Failed to delete all sales");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Function to Export Payout Report to CSV
  const handleExportCSV = () => {
    const headers = ['Sales Rep Name', 'Total Sales Handled', 'Total Commission Earned'];
    
    // Map data to CSV rows
    const csvData = report.map(row => 
      `"${row.name}","${row.commissionsCount}","${row.totalPayout}"`
    );
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Payroll_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Calculate Totals for the Sales History Table
  const totalQuantity = salesHistory.reduce((sum, sale) => sum + sale.quantity, 0);
  const totalSaleValue = salesHistory.reduce((sum, sale) => sum + parseFloat(sale.totalValue || 0), 0);
  const totalPayout = salesHistory.reduce((sum, sale) => 
    sum + (sale.commissionRecords?.reduce((cSum, cr) => cSum + parseFloat(cr.commissionEarned || 0), 0) || 0)
  , 0);

  const filteredReport = report.filter(row => row.name.toLowerCase().includes(reportSearch.toLowerCase()));
  const filteredSalesHistory = salesHistory.filter(sale => 
    (sale.user?.name || '').toLowerCase().includes(salesSearch.toLowerCase()) ||
    (sale.product?.name || '').toLowerCase().includes(salesSearch.toLowerCase()) ||
    (new Date(sale.soldAt || sale.createdAt).toLocaleDateString()).includes(salesSearch) ||
    String(sale.quantity).includes(salesSearch)
  );

  const handleReportSort = (key) => {
    let direction = 'asc';
    if (reportSort.key === key && reportSort.direction === 'asc') direction = 'desc';
    setReportSort({ key, direction });
  };

  const handleSalesSort = (key) => {
    let direction = 'asc';
    if (salesSort.key === key && salesSort.direction === 'asc') direction = 'desc';
    setSalesSort({ key, direction });
  };

  const sortedReport = [...filteredReport].sort((a, b) => {
    if (!reportSort.key) return 0;
    let aVal = a[reportSort.key];
    let bVal = b[reportSort.key];
    if (aVal < bVal) return reportSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return reportSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const sortedSalesHistory = [...filteredSalesHistory].sort((a, b) => {
    if (!salesSort.key) return 0;
    let aVal = a[salesSort.key];
    let bVal = b[salesSort.key];
    if (salesSort.key === 'date') { 
      aVal = new Date(a.soldAt || a.createdAt).getTime(); 
      bVal = new Date(b.soldAt || b.createdAt).getTime(); 
    } else if (salesSort.key === 'salesRep') { aVal = a.user?.name || ''; bVal = b.user?.name || ''; }
    else if (salesSort.key === 'product') { aVal = a.product?.name || ''; bVal = b.product?.name || ''; }
    else if (salesSort.key === 'payoutEarned') { 
      aVal = a.commissionRecords?.reduce((s, cr) => s + parseFloat(cr.commissionEarned || 0), 0) || 0;
      bVal = b.commissionRecords?.reduce((s, cr) => s + parseFloat(cr.commissionEarned || 0), 0) || 0;
    }
    else if (salesSort.key === 'totalValue') { 
      aVal = parseFloat(a.totalValue || 0); 
      bVal = parseFloat(b.totalValue || 0); 
    }
    if (aVal < bVal) return salesSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return salesSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <Layout>
      <div style={{ padding: '32px', color: '#1F2937' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '28px', fontWeight: '700' }}>Dashboard Overview</h2>
              <p style={{ margin: '0', color: '#6B7280', fontSize: '15px' }}>Welcome back, {user.name}. Here's what's happening.</p>
            </div>
            <button onClick={() => navigate('/sales')} style={{ padding: '10px 20px', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} onMouseOver={(e) => e.target.style.backgroundColor = '#059669'} onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}>+ Submit Sales</button>
          </div>

          {/* Currency Settings Panel */}
          <div style={{ padding: '20px', backgroundColor: '#FFFFFF', marginBottom: '24px', borderRadius: '16px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>Display Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} disabled={!isAdmin} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none' }}>
                <option value="IDR">IDR (Rp)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            {currency === 'USD' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>Rate Source</label>
                  <select value={rateSource} onChange={e => setRateSource(e.target.value)} disabled={!isAdmin} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none' }}>
                    <option value="manual">Manual Entry</option>
                    <option value="api">Auto (open.er-api.com)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: '600', color: '#4B5563' }}>USD to IDR Rate</label>
                  <input type="number" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} disabled={rateSource === 'api' || !isAdmin} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none' }} />
                </div>
              </>
            )}
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h3 style={{ margin: '0', color: '#111827', fontSize: '18px', fontWeight: '600' }}>Payout Report (Payroll)</h3>
                <input type="text" placeholder="Search by name..." value={reportSearch} onChange={e => setReportSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none' }} />
              </div>
              {user.role === 'COMPANY_ADMIN' && report.length > 0 && <button onClick={handleExportCSV} style={{ cursor: 'pointer', padding: '8px 16px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500' }}>📥 Export CSV</button>}
            </div>
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th onClick={() => handleReportSort('name')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Sales Rep {reportSort.key === 'name' ? (reportSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleReportSort('commissionsCount')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Commissions {reportSort.key === 'commissionsCount' ? (reportSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleReportSort('totalPayout')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Total Payout {reportSort.key === 'totalPayout' ? (reportSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedReport.length === 0 ? (<tr><td colSpan="3" style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>No data found.</td></tr>) : sortedReport.map((row, idx) => (
                    <tr key={row.userId} style={{ borderBottom: idx !== sortedReport.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                      <td style={{ padding: '12px 16px', color: '#1F2937' }}>{row.name}</td>
                      <td style={{ padding: '12px 16px', color: '#4B5563' }}>{row.commissionsCount}</td>
                      <td style={{ padding: '12px 16px', color: '#10B981', fontWeight: '600' }}>{formatCurrency(row.totalPayout)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h3 style={{ margin: '0', color: '#111827', fontSize: '18px', fontWeight: '600' }}>Sales History</h3>
                <input type="text" placeholder="Search sales..." value={salesSearch} onChange={e => setSalesSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none' }} />
              </div>
              {user.role === 'COMPANY_ADMIN' && salesHistory.length > 0 && (
                <button onClick={handleDeleteAllSales} style={{ color: '#B91C1C', backgroundColor: '#FEE2E2', border: 'none', padding: '8px 16px', cursor: 'pointer', borderRadius: '6px', fontWeight: '500' }}>Delete All History</button>
              )}
            </div>
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th onClick={() => handleSalesSort('date')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Date {salesSort.key === 'date' ? (salesSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSalesSort('salesRep')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Sales Rep {salesSort.key === 'salesRep' ? (salesSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSalesSort('product')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Product {salesSort.key === 'product' ? (salesSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSalesSort('quantity')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Quantity {salesSort.key === 'quantity' ? (salesSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSalesSort('totalValue')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Sales Value {salesSort.key === 'totalValue' ? (salesSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSalesSort('payoutEarned')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Payout Earned {salesSort.key === 'payoutEarned' ? (salesSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                    {user.role === 'COMPANY_ADMIN' && <th style={{ padding: '12px 16px', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedSalesHistory.length === 0 ? (
                    <tr><td colSpan={user.role === 'COMPANY_ADMIN' ? "7" : "6"} style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>No sales recorded yet.</td></tr>
                  ) : (
                    sortedSalesHistory.map((sale, idx) => (
                      <tr key={sale.id} style={{ borderBottom: idx !== sortedSalesHistory.length - 1 ? '1px solid #E5E7EB' : 'none', transition: 'background-color 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '12px 16px', color: '#6B7280', fontSize: '14px' }}>{new Date(sale.soldAt || sale.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px', color: '#1F2937', fontWeight: '500', fontSize: '14px' }}>{sale.user?.name || 'Unknown'}</td>
                        <td style={{ padding: '12px 16px', color: '#374151', fontSize: '14px' }}>{sale.product?.name || 'Unknown'}</td>
                        <td style={{ padding: '12px 16px', color: '#374151', fontSize: '14px' }}>{sale.quantity}</td>
                        <td style={{ padding: '12px 16px', color: '#374151', fontSize: '14px' }}>{formatCurrency(sale.totalValue)}</td>
                        <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                          {sale.commissionRecords && sale.commissionRecords.length > 0
                            ? <span style={{ color: '#10B981', fontWeight: '600' }}>{sale.commissionRecords.map(cr => formatCurrency(cr.commissionEarned)).join(' + ')}</span>
                            : <span style={{ color: '#EF4444' }}>{formatCurrency(0)} <small>(No Rule)</small></span>}
                        </td>
                        {user.role === 'COMPANY_ADMIN' && (
                          <td style={{ padding: '12px 16px' }}>
                            <button onClick={() => handleDeleteSale(sale.id)} style={{ color: '#B91C1C', backgroundColor: '#FEE2E2', border: 'none', padding: '4px 8px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px', fontWeight: '500' }}>Delete</button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
                {salesHistory.length > 0 && (
                  <tfoot>
                    <tr style={{ backgroundColor: '#F9FAFB', borderTop: '2px solid #E5E7EB' }}>
                      <td colSpan="3" style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#374151' }}>Total:</td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1F2937' }}>{totalQuantity}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1F2937' }}>{formatCurrency(totalSaleValue)}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#10B981' }}>{formatCurrency(totalPayout)}</td>
                      {user.role === 'COMPANY_ADMIN' && <td></td>}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}