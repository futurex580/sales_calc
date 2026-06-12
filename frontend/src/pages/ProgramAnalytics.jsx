import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCurrency } from '../CurrencyContext';
import Layout from './layout.jsx';

export default function ProgramAnalytics() {
  const [report, setReport] = useState([]);
  
  // AI Predictor States
  const [draftDuration, setDraftDuration] = useState('30');
  const [draftReward, setDraftReward] = useState('5');
  const [prediction, setPrediction] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'roiValue', direction: 'desc' });
  
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    api.get('/incentive-programs/kpi/report')
      .then(res => setReport(res.data))
      .catch(err => console.error("Failed to fetch KPI report", err));
  }, []);

  const handleAskAI = async (e) => {
    e.preventDefault();
    setLoadingAI(true);
    try {
      const res = await api.post('/analytics/predict', {
        durationDays: parseInt(draftDuration, 10),
        rewardValue: parseFloat(draftReward)
      });
      setPrediction(res.data);
    } catch (err) {
      alert("AI Engine failed to predict");
    } finally {
      setLoadingAI(false);
    }
  };

  const enrichedReport = report.map(p => {
    const roiValue = p.totalRevenue - p.totalCommissions;
    const roiPercent = p.totalRevenue > 0 ? ((roiValue / p.totalRevenue) * 100).toFixed(1) : 0;
    return { ...p, roiValue, roiPercent };
  });

  const filteredReport = enrichedReport.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedReport = [...filteredReport].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = sortConfig.key === 'period' ? new Date(a.startDate).getTime() : a[sortConfig.key];
    let bVal = sortConfig.key === 'period' ? new Date(b.startDate).getTime() : b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <Layout>
      <div style={{ padding: '32px', color: '#1F2937' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '28px', fontWeight: '700' }}>Program Analytics (KPI)</h2>
              <p style={{ margin: '0', color: '#6B7280', fontSize: '15px' }}>Analyze the effectiveness of your incentive programs based on historical data.</p>
            </div>
          </div>

          {/* AI Sandbox Widget */}
          <div style={{ padding: '24px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '16px', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '18px', fontWeight: '600' }}>🤖 AI Program Simulator (Local ML)</h3>
            <p style={{ margin: '0 0 20px 0', color: '#14532D', fontSize: '14px' }}>
              Predict estimated revenue before launching a new incentive program. The AI learns from your past programs.
            </p>
            <form onSubmit={handleAskAI} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '600', color: '#166534' }}>Expected Duration (Days)</label>
                <input type="number" min="1" value={draftDuration} onChange={e => setDraftDuration(e.target.value)} required style={{ padding: '10px 14px', width: '160px', borderRadius: '8px', border: '1px solid #86EFAC', backgroundColor: '#FFFFFF', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: '600', color: '#166534' }}>Max Reward Planned (%)</label>
                <input type="number" min="0" step="0.1" value={draftReward} onChange={e => setDraftReward(e.target.value)} required style={{ padding: '10px 14px', width: '160px', borderRadius: '8px', border: '1px solid #86EFAC', backgroundColor: '#FFFFFF', outline: 'none' }} />
              </div>
              <button type="submit" disabled={loadingAI} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#16A34A', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', transition: 'background-color 0.2s', height: '42px' }} onMouseOver={(e) => e.target.style.backgroundColor = '#15803D'} onMouseOut={(e) => e.target.style.backgroundColor = '#16A34A'}>
                {loadingAI ? 'Analyzing Patterns...' : '✨ Predict Revenue'}
              </button>
            </form>
            
            {prediction && (
              <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#FFFFFF', borderRadius: '12px', borderLeft: `6px solid ${prediction.estimatedRevenue !== null ? '#10B981' : '#F59E0B'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                {prediction.estimatedRevenue !== null ? (
                  <>
                    <h3 style={{ margin: '0 0 8px 0', color: '#059669', fontSize: '20px' }}>Est. Revenue: {formatCurrency(prediction.estimatedRevenue)}</h3>
                    <span style={{ fontSize: '12px', backgroundColor: '#E0F2FE', color: '#3730A3', padding: '4px 10px', borderRadius: '9999px', fontWeight: '600' }}>AI Confidence: {prediction.confidenceScore}%</span>
                    <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: '#4B5563' }}>{prediction.message}</p>
                  </>
                ) : (
                   <p style={{ margin: '0', color: '#B45309', fontWeight: '600' }}>{prediction.message}</p>
                )}
              </div>
            )}
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '18px', fontWeight: '600' }}>Historical Report</h3>
              <input type="text" placeholder="Search programs..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none' }} />
            </div>
            
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th onClick={() => handleSort('name')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Program Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('period')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Period {sortConfig.key === 'period' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                    <th style={{ padding: '12px 16px', color: '#4B5563', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Targets</th>
                    <th onClick={() => handleSort('totalQty')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Qty Sold {sortConfig.key === 'totalQty' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('totalRevenue')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Revenue {sortConfig.key === 'totalRevenue' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('totalCommissions')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Paid {sortConfig.key === 'totalCommissions' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                    <th onClick={() => handleSort('roiValue')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>ROI {sortConfig.key === 'roiValue' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedReport.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>No programs found.</td></tr>
                  ) : (
                    sortedReport.map((p, idx) => (
                      <tr key={p.id} style={{ borderBottom: idx !== sortedReport.length - 1 ? '1px solid #E5E7EB' : 'none', transition: 'background-color 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '12px 16px', color: '#1F2937', fontWeight: '500', fontSize: '14px' }}>{p.name} {p.isActive && <span style={{ color: '#10B981', fontSize: '11px', padding: '2px 6px', backgroundColor: '#D1FAE5', borderRadius: '4px', marginLeft: '4px' }}>Active</span>}</td>
                        <td style={{ padding: '12px 16px', color: '#6B7280', fontSize: '13px' }}>{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px', color: '#4B5563', fontSize: '13px' }}>{p.products.length > 0 ? p.products.join(', ') : <span style={{ fontStyle: 'italic', color: '#9CA3AF' }}>All Products</span>}</td>
                        <td style={{ padding: '12px 16px', color: '#1F2937', fontSize: '14px' }}>{p.totalQty} pcs</td>
                        <td style={{ padding: '12px 16px', color: '#1F2937', fontSize: '14px' }}>{formatCurrency(p.totalRevenue)}</td>
                        <td style={{ padding: '12px 16px', color: '#EF4444', fontSize: '14px' }}>{formatCurrency(p.totalCommissions)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <strong style={{ color: p.roiValue >= 0 ? '#10B981' : '#EF4444', fontSize: '14px' }}>{formatCurrency(p.roiValue)}</strong><br />
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>({p.roiPercent}% margin)</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}