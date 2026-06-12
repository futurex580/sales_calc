import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('COMPANY_ADMIN');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', {
        email,
        password,
        name,
        companyName,
        role
      });
      alert('Registration successful! You can now log in.');
      navigate('/');
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.response?.data?.message || 'Failed to register account');
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#F3F4F6',
      backgroundImage: 'url("/background.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: '"Inter", "Segoe UI", sans-serif', 
      padding: '20px' 
    }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '28px', fontWeight: '700' }}>Create Account</h2>
          <p style={{ margin: '0', color: '#6B7280', fontSize: '15px' }}>Register your new workspace</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FEE2E2', borderLeft: '4px solid #EF4444', padding: '12px 16px', marginBottom: '24px', borderRadius: '4px' }}>
            <p style={{ margin: '0', color: '#B91C1C', fontSize: '14px', fontWeight: '500' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }} onFocus={(e) => { e.target.style.borderColor = '#818CF8'; e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.2)'; e.target.style.backgroundColor = '#FFFFFF'; }} onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#F9FAFB'; }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }} onFocus={(e) => { e.target.style.borderColor = '#818CF8'; e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.2)'; e.target.style.backgroundColor = '#FFFFFF'; }} onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#F9FAFB'; }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" placeholder="••••••••" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }} onFocus={(e) => { e.target.style.borderColor = '#818CF8'; e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.2)'; e.target.style.backgroundColor = '#FFFFFF'; }} onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#F9FAFB'; }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Company Name</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="Acme Corp" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }} onFocus={(e) => { e.target.style.borderColor = '#818CF8'; e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.2)'; e.target.style.backgroundColor = '#FFFFFF'; }} onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#F9FAFB'; }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }} onFocus={(e) => { e.target.style.borderColor = '#818CF8'; e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.2)'; e.target.style.backgroundColor = '#FFFFFF'; }} onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#F9FAFB'; }}>
              <option value="COMPANY_ADMIN">Company Admin (Master Access)</option>
              <option value="SALES_REP">Sales Rep (Limited Access)</option>
            </select>
          </div>
          
          <button type="submit" style={{ width: '100%', padding: '14px', marginTop: '8px', cursor: 'pointer', backgroundColor: '#6366F1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#4F46E5'} onMouseOut={(e) => e.target.style.backgroundColor = '#6366F1'}>Create Account</button>
          
          <button type="button" onClick={() => navigate('/')} style={{ width: '100%', padding: '14px', cursor: 'pointer', backgroundColor: '#FFFFFF', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s' }} onMouseOver={(e) => { e.target.style.backgroundColor = '#F9FAFB'; e.target.style.color = '#111827'; }} onMouseOut={(e) => { e.target.style.backgroundColor = '#FFFFFF'; e.target.style.color = '#4B5563'; }}>Back to Login</button>
        </form>
      </div>
    </div>
  );
}