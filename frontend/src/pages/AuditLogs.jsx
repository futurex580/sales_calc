import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Layout from './layout.jsx';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/audit-logs')
      .then(res => setLogs(res.data))
      .catch(err => console.error("Failed to fetch audit logs", err));
  }, []);

  const filteredLogs = logs.filter(log => 
    (log.user ? `${log.user.name} ${log.user.email}` : 'System Entity').toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.entity.toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase())
  );

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    if (sortConfig.key === 'user') {
      aVal = a.user ? a.user.name : 'System';
      bVal = b.user ? b.user.name : 'System';
    }
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // UI Helpers for User-Friendly Display
  const formatAction = (action) => {
    if (!action) return 'Unknown';
    const cleaned = action.replace(/_/g, ' ');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  };

  // UX: Menggunakan warna pastel untuk badge agar tidak terlalu mencolok/intimidatif
  const getActionStyle = (action) => {
    if (action.includes('DELETE') || action.includes('REMOVE')) 
      return { bg: '#FEE2E2', text: '#991B1B' }; // Pastel Red
    if (action.includes('CREATE') || action.includes('ADD')) 
      return { bg: '#DCFCE7', text: '#166534' }; // Pastel Green
    if (action.includes('UPDATE') || action.includes('EDIT')) 
      return { bg: '#FEF9C3', text: '#854D0E' }; // Pastel Yellow
    
    return { bg: '#DBEAFE', text: '#1E3A8A' }; // Pastel Blue (Default)
  };

  const formatDetails = (details) => {
    if (!details) return '-';
    if (typeof details === 'string') return details;
    return JSON.stringify(details);
  };

  return (
    <Layout>
      <div style={{ padding: '32px', fontFamily: '"Inter", "Segoe UI", sans-serif', width: '100%', color: '#1F2937' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', padding: '32px' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '24px', fontWeight: '600' }}>Security & Audit Logs</h2>
            <p style={{ margin: '0', color: '#6B7280', fontSize: '14px' }}>Monitor system changes, creations, and deletions securely.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ padding: '10px 20px', backgroundColor: '#E0E7FF', color: '#3730A3', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: 'background-color 0.2s' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#C7D2FE'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#E0E7FF'}
          >
            Back to Dashboard
          </button>
        </div>
        
        {/* Search Bar */}
        <div style={{ marginBottom: '24px' }}>
          <input 
            type="text" 
            placeholder="Search logs, names, or actions..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            style={{ padding: '12px 16px', width: '100%', maxWidth: '350px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }} 
            onFocus={(e) => { e.target.style.borderColor = '#818CF8'; e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.2)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        
        {/* Modern Clean Table */}
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th onClick={() => handleSort('createdAt')} style={{ padding: '16px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Timestamp {sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('user')} style={{ padding: '16px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  User Account {sortConfig.key === 'user' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('action')} style={{ padding: '16px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Action {sortConfig.key === 'action' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('entity')} style={{ padding: '16px', cursor: 'pointer', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Entity Changed {sortConfig.key === 'entity' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th style={{ padding: '16px', color: '#4B5563', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data Info</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>No audit logs found.</td>
                </tr>
              ) : (
                sortedLogs.map((log, index) => {
                  const actionStyle = getActionStyle(log.action);
                  return (
                    <tr key={log.id} style={{ borderBottom: index !== sortedLogs.length - 1 ? '1px solid #E5E7EB' : 'none', transition: 'background-color 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#6B7280' }}>
                        {new Date(log.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#1F2937', fontWeight: '500' }}>
                        {log.user ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{log.user.name}</span>
                            <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 'normal' }}>{log.user.email}</span>
                          </div>
                        ) : 'System Entity'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          backgroundColor: actionStyle.bg,
                          color: actionStyle.text,
                          padding: '6px 12px',
                          borderRadius: '9999px', // Full rounded badge
                          fontSize: '12px',
                          fontWeight: '600',
                          letterSpacing: '0.025em'
                        }}>
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>
                        <strong style={{ color: '#374151', display: 'block' }}>{log.entity.replace(/([A-Z])/g, ' $1').trim()}</strong>
                        <span style={{ color: '#9CA3AF', fontSize: '12px', fontFamily: 'monospace' }}>ID: {log.entityId.substring(0, 8)}...</span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', maxWidth: '300px', lineHeight: '1.5', color: '#4B5563', wordBreak: 'break-word' }}>
                        {formatDetails(log.details)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </Layout>
  );
}