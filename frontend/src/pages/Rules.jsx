import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Rules() {
  const [programs, setPrograms] = useState([]);
  const [tiers, setTiers] = useState([]);

  // Program Form State
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [editingProgramId, setEditingProgramId] = useState(null);

  // Tier Form State
  const [incentiveProgramId, setIncentiveProgramId] = useState('');
  const [minTarget, setMinTarget] = useState('');
  const [tierBasis, setTierBasis] = useState('QUANTITY');
  const [rewardType, setRewardType] = useState('PERCENTAGE');
  const [rewardValue, setRewardValue] = useState('');
  const [editingTierId, setEditingTierId] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [progRes, tierRes, prodRes] = await Promise.all([
        api.get('/incentive-programs').catch(() => ({ data: [] })),
        api.get('/commission-rule-tiers').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] }))
      ]);
      
      setPrograms(progRes.data);
      setTiers(tierRes.data);
      setAllProducts(prodRes.data);
      
      // Auto-select the first program in the dropdown if available
      if (progRes.data.length > 0 && !incentiveProgramId) {
        setIncentiveProgramId(progRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch rules data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProgram = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const payload = {
        name,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        companyId: user.companyId,
        productIds: selectedProductIds
      };

      if (editingProgramId) {
        await api.patch(`/incentive-programs/${editingProgramId}`, payload);
      } else {
        await api.post('/incentive-programs', payload);
      }

      setName(''); setStartDate(''); setEndDate(''); setSelectedProductIds([]); 
      setEditingProgramId(null);
      fetchData(); // Refresh the lists!
    } catch (err) {
      alert('Failed to add program: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddTier = async (e) => {
    e.preventDefault();
    try {
      await api.post('/commission-rule-tiers', {
        incentiveProgramId,
        minTarget: parseFloat(minTarget),
        tierBasis,
        rewardType,
        rewardValue: parseFloat(rewardValue)
      });
      setMinTarget(''); setRewardValue('');
      fetchData(); // Refresh the lists!
    } catch (err) {
      alert('Failed to add tier: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditProgram = (p) => {
    setEditingProgramId(p.id);
    setName(p.name);
    setStartDate(p.startDate.split('T')[0]);
    setEndDate(p.endDate.split('T')[0]);
    setSelectedProductIds(p.products?.map(prod => prod.id) || []);
  };

  const handleCancelEditProgram = () => {
    setEditingProgramId(null);
    setName(''); setStartDate(''); setEndDate(''); setSelectedProductIds([]);
  };

  const handleEditTier = (t) => {
    setEditingTierId(t.id);
    setIncentiveProgramId(t.incentiveProgramId);
    setTierBasis(t.tierBasis);
    setMinTarget(t.minTarget);
    setRewardType(t.rewardType);
    setRewardValue(t.rewardValue);
  };

  const handleCancelEditTier = () => {
    setEditingTierId(null);
    setMinTarget(''); setRewardValue('');
  };

  const handleDeleteProgram = async (id) => {
    if (!window.confirm("Are you sure you want to delete this program?")) return;
    try {
      await api.delete(`/incentive-programs/${id}`);
      fetchData(); // Refresh the lists!
    } catch (err) {
      alert('Failed to delete program. You must delete all of its Rule Tiers first!');
    }
  };

  const handleDeleteTier = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rule tier?")) return;
    try {
      await api.delete(`/commission-rule-tiers/${id}`);
      fetchData(); // Refresh the lists!
    } catch (err) {
      alert('Failed to delete tier. It might have recorded sales linked to it.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Manage Commission Rules</h2>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '5px 15px', cursor: 'pointer' }}>Back to Dashboard</button>
      </div>
      <hr />

      <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
        {/* Left Column: Programs */}
        <div style={{ flex: 1 }}>
          <h3>1. {editingProgramId ? 'Edit' : 'Create'} Incentive Program</h3>
          <form onSubmit={handleAddProgram} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
            <label>Program Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q3 Bonus" required />
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            <label>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            
            <label>Target Products (Leave empty for All Products)</label>
            <select multiple value={selectedProductIds} onChange={(e) => setSelectedProductIds(Array.from(e.target.selectedOptions, option => option.value))} style={{ height: '80px' }}>
              {allProducts.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
            <small style={{ color: '#666', marginTop: '-5px' }}>*Hold Ctrl/Cmd to select multiple. Empty = Global Program.</small>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', cursor: 'pointer', backgroundColor: editingProgramId ? '#FFC107' : '#007BFF', color: editingProgramId ? 'black' : 'white', border: 'none' }}>{editingProgramId ? 'Update Program' : 'Save Program'}</button>
              {editingProgramId && <button type="button" onClick={handleCancelEditProgram} style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none' }}>Cancel</button>}
            </div>
          </form>
          <h4>Active Programs</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {programs.map(p => (
              <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                <div>
                  <strong>{p.name}</strong><br/>
                  <small style={{ color: '#666', display: 'block', margin: '3px 0' }}>
                    Products: {p.products?.length > 0 ? p.products.map(prod => prod.name).join(', ') : 'All Products'}
                  </small>
                  <small style={{ color: '#666' }}>{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</small>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => handleEditProgram(p)} style={{ color: 'black', backgroundColor: '#FFC107', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Edit</button>
                  <button onClick={() => handleDeleteProgram(p.id)} style={{ color: 'white', backgroundColor: '#dc3545', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Tiers */}
        <div style={{ flex: 1 }}>
          <h3>2. {editingTierId ? 'Edit' : 'Create'} Rule Tier</h3>
          <form onSubmit={handleAddTier} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
            <label>Link to Program</label>
            <select value={incentiveProgramId} onChange={(e) => setIncentiveProgramId(e.target.value)} required><option value="" disabled>Select a program...</option>{programs.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
            
            <label>Target Type</label>
            <select value={tierBasis} onChange={(e) => setTierBasis(e.target.value)}><option value="QUANTITY">Based on Quantity (Pcs)</option><option value="REVENUE">Based on Revenue (Omset)</option></select>
            <label>Minimum Target</label>
            <input type="number" min="1" value={minTarget} onChange={(e) => setMinTarget(e.target.value)} required />
            
            <label>Reward Type</label>
            <select value={rewardType} onChange={(e) => setRewardType(e.target.value)}><option value="PERCENTAGE">Percentage (%)</option><option value="FIXED_AMOUNT">Fixed Amount / Pcs</option></select>
            <label>Reward Value</label>
            <input type="number" step="0.1" min="0" value={rewardValue} onChange={(e) => setRewardValue(e.target.value)} required />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', cursor: 'pointer', backgroundColor: editingTierId ? '#FFC107' : '#28A745', color: editingTierId ? 'black' : 'white', border: 'none' }}>{editingTierId ? 'Update Rule Tier' : 'Save Rule Tier'}</button>
              {editingTierId && <button type="button" onClick={handleCancelEditTier} style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none' }}>Cancel</button>}
            </div>
          </form>
          <h4>Active Rule Tiers</h4>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr><th>Program</th><th>Target Products</th><th>Basis</th><th>Min Target</th><th>Reward</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {tiers.map(t => (
                <tr key={t.id}>
                  <td>{t.incentiveProgram?.name}</td>
                  <td style={{ fontSize: '0.9em', color: '#555' }}>
                    {t.incentiveProgram?.products?.length > 0
                      ? t.incentiveProgram.products.map(p => p.name).join(', ')
                      : <span style={{ fontStyle: 'italic' }}>All Products</span>
                    }
                  </td>
                  <td>{t.tierBasis}</td>
                  <td>{t.tierBasis === 'REVENUE' ? '$' : ''}{t.minTarget}+</td>
                  <td>{t.rewardType === 'PERCENTAGE' ? `${t.rewardValue}%` : `$${t.rewardValue}`}</td>
                  <td style={{ display: 'flex', gap: '5px' }}>
                    <button onClick={() => handleEditTier(t)} style={{ color: 'black', backgroundColor: '#FFC107', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Edit</button>
                    <button onClick={() => handleDeleteTier(t.id)} style={{ color: 'white', backgroundColor: '#dc3545', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}