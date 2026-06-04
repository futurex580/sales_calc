import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('SALES_REP');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', { name, email, password, role });
      setName(''); setEmail(''); setPassword(''); setRole('SALES_REP');
      fetchUsers();
    } catch (err) {
      alert('Failed to add user: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user. They might have sales records linked to them!');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Manage Team Members</h2>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '5px 15px', cursor: 'pointer' }}>Back to Dashboard</button>
      </div>
      <hr />
      <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
        <div style={{ flex: 1, maxWidth: '300px' }}>
          <h3>Invite New Member</h3>
          <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label>Full Name</label><input value={name} onChange={e => setName(e.target.value)} required />
            <label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <label>Temporary Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength="6" />
            <label>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}><option value="SALES_REP">Sales Rep</option><option value="MANAGER">Manager</option><option value="COMPANY_ADMIN">Company Admin</option></select>
            <button type="submit" style={{ padding: '10px', marginTop: '10px', cursor: 'pointer', backgroundColor: '#007BFF', color: 'white', border: 'none' }}>Create User</button>
          </form>
        </div>
        <div style={{ flex: 2 }}>
          <h3>Active Team</h3>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead><tr><th>Name</th><th>Email</th><th>Role (RBAC)</th><th>Actions</th></tr></thead>
            <tbody>{users.map(u => (<tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td><select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}><option value="SALES_REP">Sales Rep</option><option value="MANAGER">Manager</option><option value="COMPANY_ADMIN">Company Admin</option></select></td><td><button onClick={() => handleDeleteUser(u.id)} style={{ color: 'white', backgroundColor: '#dc3545', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Remove</button></td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}