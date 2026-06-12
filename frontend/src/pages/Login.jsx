import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.accessToken;
      
      // Decode the JWT token payload to securely extract the companyId
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userWithCompany = { ...response.data.user, companyId: payload.companyId };

      // Save the token and user details to local storage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userWithCompany));
      // Redirect to the dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error("Login Error:", err);
      
      // Tampilkan error asli dari ValidationPipe (Backend) jika ada
      if (err.response?.data?.message) {
        setError(Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message);
      } else {
        setError('Invalid email or password');
      }
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
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '28px', fontWeight: '700' }}>Welcome Back</h2>
          <p style={{ margin: '0', color: '#6B7280', fontSize: '15px' }}>Sign in to your Sales Calc workspace</p>
        </div>

        {/* Error Alert Box (Pastel Red) */}
        {error && (
          <div style={{ backgroundColor: '#FEE2E2', borderLeft: '4px solid #EF4444', padding: '12px 16px', marginBottom: '24px', borderRadius: '4px' }}>
            <p style={{ margin: '0', color: '#B91C1C', fontSize: '14px', fontWeight: '500' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="you@company.com"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = '#818CF8'; e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.2)'; e.target.style.backgroundColor = '#FFFFFF'; }}
              onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#F9FAFB'; }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = '#818CF8'; e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.2)'; e.target.style.backgroundColor = '#FFFFFF'; }}
              onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#F9FAFB'; }}
            />
          </div>
          
          <button type="submit" style={{ width: '100%', padding: '14px', marginTop: '8px', cursor: 'pointer', backgroundColor: '#6366F1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#4F46E5'} onMouseOut={(e) => e.target.style.backgroundColor = '#6366F1'}>Sign In</button>
          
          <button type="button" onClick={() => navigate('/register')} style={{ width: '100%', padding: '14px', cursor: 'pointer', backgroundColor: '#FFFFFF', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s' }} onMouseOver={(e) => { e.target.style.backgroundColor = '#F9FAFB'; e.target.style.color = '#111827'; }} onMouseOut={(e) => { e.target.style.backgroundColor = '#FFFFFF'; e.target.style.color = '#4B5563'; }}>Create an Account</button>
        </form>
      </div>
    </div>
  );
}