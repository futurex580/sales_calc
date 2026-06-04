import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCurrency } from '../CurrencyContext';

export default function Dashboard() {
  const [report, setReport] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { currency, setCurrency, exchangeRate, setExchangeRate, rateSource, setRateSource, formatCurrency } = useCurrency();
  const isAdmin = user.role === 'COMPANY_ADMIN';

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

  // Calculate Totals for the Sales History Table
  const totalQuantity = salesHistory.reduce((sum, sale) => sum + sale.quantity, 0);
  const totalSaleValue = salesHistory.reduce((sum, sale) => sum + parseFloat(sale.totalValue || 0), 0);
  const totalPayout = salesHistory.reduce((sum, sale) => 
    sum + (sale.commissionRecords?.reduce((cSum, cr) => cSum + parseFloat(cr.commissionEarned || 0), 0) || 0)
  , 0);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <h2>Dashboard</h2>
          
          {/* Only Admins should see the Admin buttons */}
          {user.role === 'COMPANY_ADMIN' && (
            <>
              <button onClick={() => navigate('/users')} style={{ cursor: 'pointer', padding: '5px 15px', height: '35px', backgroundColor: '#17A2B8', color: 'white', border: 'none' }}>Manage Team</button>
              <button onClick={() => navigate('/rules')} style={{ cursor: 'pointer', padding: '5px 15px', height: '35px', backgroundColor: '#007BFF', color: 'white', border: 'none' }}>Manage Rules</button>
              <button onClick={() => navigate('/analytics')} style={{ cursor: 'pointer', padding: '5px 15px', height: '35px', backgroundColor: '#6f42c1', color: 'white', border: 'none' }}>Program Analytics</button>
              <button onClick={() => navigate('/products')} style={{ cursor: 'pointer', padding: '5px 15px', height: '35px' }}>Manage Products</button>
            </>
          )}
          
          {/* Everyone can submit sales! */}
          <button onClick={() => navigate('/sales')} style={{ cursor: 'pointer', padding: '5px 15px', height: '35px', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}>Submit Sales</button>
        </div>
        <button onClick={handleLogout} style={{ cursor: 'pointer', padding: '5px 15px' }}>Logout ({user.name})</button>
      </div>

      <hr />
      
      {/* Currency Settings Panel */}
      <div style={{ padding: '15px', background: '#f9f9f9', marginBottom: '20px', borderRadius: '8px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: '10px' }}><strong>Display Currency:</strong></label>
          <select value={currency} onChange={e => setCurrency(e.target.value)} disabled={!isAdmin}>
            <option value="USD">USD ($)</option>
            <option value="IDR">IDR (Rp)</option>
          </select>
        </div>
        {currency === 'IDR' && (
          <>
            <div>
              <label style={{ marginRight: '10px' }}>Rate Source:</label>
              <select value={rateSource} onChange={e => setRateSource(e.target.value)} disabled={!isAdmin}>
                <option value="manual">Manual Entry</option>
                <option value="api">Auto (open.er-api.com)</option>
              </select>
            </div>
            <div>
              <label style={{ marginRight: '10px' }}>USD to IDR Rate:</label>
              <input type="number" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} disabled={rateSource === 'api' || !isAdmin} />
            </div>
          </>
        )}
      </div>

      <h3>Payout Report</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr><th>Sales Rep</th><th>Total Commissions</th><th>Total Payout</th></tr>
        </thead>
        <tbody>
          {report.map((row) => (
            <tr key={row.userId}><td>{row.name}</td><td>{row.commissionsCount}</td><td>{formatCurrency(row.totalPayout)}</td></tr>
          ))}
        </tbody>
      </table>

      <br />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Sales History</h3>
        {user.role === 'COMPANY_ADMIN' && salesHistory.length > 0 && (
          <button onClick={handleDeleteAllSales} style={{ color: 'white', backgroundColor: '#dc3545', border: 'none', padding: '5px 15px', cursor: 'pointer', borderRadius: '4px' }}>Delete All History</button>
        )}
      </div>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr><th>Date</th><th>Sales Rep</th><th>Product</th><th>Quantity</th><th>Sales Value</th><th>Payout Earned</th>{user.role === 'COMPANY_ADMIN' && <th>Actions</th>}</tr>
        </thead>
        <tbody>
          {salesHistory.length === 0 ? (
            <tr><td colSpan={user.role === 'COMPANY_ADMIN' ? "7" : "6"}>No sales recorded yet.</td></tr>
          ) : (
            salesHistory.map((sale) => (
              <tr key={sale.id}>
                <td>{new Date(sale.soldAt || sale.createdAt).toLocaleDateString()}</td>
                <td>{sale.user?.name || 'Unknown'}</td>
                <td>{sale.product?.name || 'Unknown'}</td>
                <td>{sale.quantity}</td>
                <td>{formatCurrency(sale.totalValue)}</td>
                <td>
                  {sale.commissionRecords && sale.commissionRecords.length > 0
                    ? sale.commissionRecords.map(cr => formatCurrency(cr.commissionEarned)).join(' + ')
                    : <span style={{ color: 'red' }}>{formatCurrency(0)} (No Rule)</span>}
                </td>
                {user.role === 'COMPANY_ADMIN' && (
                  <td>
                    <button onClick={() => handleDeleteSale(sale.id)} style={{ color: 'white', backgroundColor: '#dc3545', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Delete</button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
        {salesHistory.length > 0 && (
          <tfoot>
            <tr style={{ backgroundColor: '#f1f1f1', fontWeight: 'bold' }}>
              <td colSpan="3" style={{ textAlign: 'right' }}>Total:</td>
              <td>{totalQuantity}</td>
              <td>{formatCurrency(totalSaleValue)}</td>
              <td>{formatCurrency(totalPayout)}</td>
              {user.role === 'COMPANY_ADMIN' && <td></td>}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}