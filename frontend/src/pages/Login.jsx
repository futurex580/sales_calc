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
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Welcome to Sales Calc</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        <button type="submit" style={{ padding: '10px', marginTop: '10px', cursor: 'pointer', backgroundColor: '#007BFF', color: 'white', border: 'none' }}>Login</button>
        <button type="button" onClick={() => navigate('/register')} style={{ padding: '10px', marginTop: '5px', cursor: 'pointer', backgroundColor: '#eee', border: '1px solid #ccc' }}>Create an Account</button>
      </form>
    </div>
  );
}