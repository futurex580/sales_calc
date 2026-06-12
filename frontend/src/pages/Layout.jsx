import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Sales Records', path: '/sales', icon: '💰' },
    { name: 'Products', path: '/products', icon: '📦' },
    { name: 'Team & Users', path: '/users', icon: '👥' },
    { name: 'Incentives', path: '/programs', icon: '🎯' },
    { name: 'Audit Logs', path: '/audit-logs', icon: '🛡️' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F3F4F6', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB' }}>
          <h2 style={{ margin: 0, color: '#4F46E5', fontSize: '22px', fontWeight: '800' }}>Sales Calc</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '13px' }}>Workspace</p>
        </div>
        
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {menuItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  backgroundColor: isActive ? '#EEF2FF' : 'transparent',
                  color: isActive ? '#4F46E5' : '#4B5563',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s', textAlign: 'left'
                }}
                onMouseOver={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                onMouseOut={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {item.name}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid #E5E7EB' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
              backgroundColor: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
          >
            <span style={{ fontSize: '18px' }}>🚪</span> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}