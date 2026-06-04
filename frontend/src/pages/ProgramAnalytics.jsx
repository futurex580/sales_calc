import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCurrency } from '../CurrencyContext';

export default function ProgramAnalytics() {
  const [report, setReport] = useState([]);
  
  // AI Predictor States
  const [draftDuration, setDraftDuration] = useState('30');
  const [draftReward, setDraftReward] = useState('5');
  const [prediction, setPrediction] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  
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

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Program Analytics (KPI)</h2>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '5px 15px', cursor: 'pointer' }}>Back to Dashboard</button>
      </div>
      <hr />
      
      <p>Analyze the effectiveness of your incentive programs based on historical data.</p>

      {/* AI Sandbox Widget */}
      <div style={{ padding: '20px', backgroundColor: '#e0f7fa', border: '1px solid #b2ebf2', borderRadius: '8px', margin: '20px 0', color: '#006064' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>🤖 AI Program Simulator (Local ML)</h3>
        <p style={{ fontSize: '0.9em', margin: '0 0 15px 0' }}>
          Predict estimated revenue before launching a new incentive program. The AI learns from your past programs.
        </p>
        <form onSubmit={handleAskAI} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '5px', fontWeight: 'bold' }}>Expected Duration (Days)</label>
            <input type="number" min="1" value={draftDuration} onChange={e => setDraftDuration(e.target.value)} required style={{ padding: '8px', width: '150px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '5px', fontWeight: 'bold' }}>Max Reward Planned (%)</label>
            <input type="number" min="0" step="0.1" value={draftReward} onChange={e => setDraftReward(e.target.value)} required style={{ padding: '8px', width: '150px' }} />
          </div>
          <button type="submit" disabled={loadingAI} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
            {loadingAI ? 'Analyzing Patterns...' : '✨ Predict Revenue'}
          </button>
        </form>
        
        {prediction && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '6px', borderLeft: `5px solid ${prediction.estimatedRevenue ? '#28a745' : '#ffc107'}`, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {prediction.estimatedRevenue !== null ? (
              <>
                <h3 style={{ margin: '0 0 5px 0', color: '#28a745' }}>Est. Revenue: {formatCurrency(prediction.estimatedRevenue)}</h3>
                <span style={{ fontSize: '0.85em', backgroundColor: '#17a2b8', color: 'white', padding: '3px 8px', borderRadius: '12px' }}>AI Confidence: {prediction.confidenceScore}%</span>
                <p style={{ margin: '10px 0 0 0', fontSize: '0.95em', color: '#333' }}>{prediction.message}</p>
              </>
            ) : (
               <p style={{ margin: '0', color: '#856404', fontWeight: 'bold' }}>{prediction.message}</p>
            )}
          </div>
        )}
      </div>

      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4' }}>
            <th>Program Name</th>
            <th>Period</th>
            <th>Target Products</th>
            <th>Total Qty Sold</th>
            <th>Total Revenue</th>
            <th>Commissions Paid</th>
            <th>ROI (Revenue - Commission)</th>
          </tr>
        </thead>
        <tbody>
          {report.length === 0 ? (
            <tr><td colSpan="7">No programs found.</td></tr>
          ) : (
            report.map(p => {
              const roiValue = p.totalRevenue - p.totalCommissions;
              const roiPercent = p.totalRevenue > 0 ? ((roiValue / p.totalRevenue) * 100).toFixed(1) : 0;
              return (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong> {p.isActive && <span style={{ color: 'green', fontSize: '0.8em' }}>(Active)</span>}</td>
                  <td>{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</td>
                  <td>{p.products.length > 0 ? p.products.join(', ') : <em>All Products</em>}</td>
                  <td>{p.totalQty} pcs</td>
                  <td>{formatCurrency(p.totalRevenue)}</td>
                  <td>{formatCurrency(p.totalCommissions)}</td>
                  <td>
                    <strong style={{ color: roiValue >= 0 ? 'green' : 'red' }}>{formatCurrency(roiValue)}</strong><br />
                    <small>({roiPercent}% margin)</small>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  );
}