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
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Create an Account</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label>Full Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
        <label>Company Name</label>
        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="COMPANY_ADMIN">Company Admin (Master Access)</option>
          <option value="SALES_REP">Sales Rep (Limited Access)</option>
        </select>
        <button type="submit" style={{ padding: '10px', marginTop: '10px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}>Register</button>
        <button type="button" onClick={() => navigate('/')} style={{ padding: '10px', marginTop: '5px', cursor: 'pointer', backgroundColor: '#eee', border: '1px solid #ccc' }}>Back to Login</button>
      </form>
    </div>
  );
}