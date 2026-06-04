import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [report, setReport] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/commission-records/payout-report')
      .then((res) => setReport(res.data))
      .catch(() => {
        localStorage.clear();
        navigate('/');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <h2>Dashboard</h2>
          <button onClick={() => navigate('/sales')} style={{ cursor: 'pointer', padding: '5px 15px', height: '35px', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}>Submit a Sale</button>
          <button onClick={() => navigate('/products')} style={{ cursor: 'pointer', padding: '5px 15px', height: '35px' }}>Manage Products</button>
        </div>
        <button onClick={handleLogout} style={{ cursor: 'pointer', padding: '5px 15px' }}>Logout ({user.name})</button>
      </div>

      <hr />

      <h3>Payout Report</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr><th>Sales Rep</th><th>Total Commissions</th><th>Total Payout</th></tr>
        </thead>
        <tbody>
          {report.map((row) => (
            <tr key={row.userId}><td>{row.name}</td><td>{row.commissionsCount}</td><td>${row.totalPayout.toFixed(2)}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}