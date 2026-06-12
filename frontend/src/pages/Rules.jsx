import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCurrency } from '../CurrencyContext';
import Layout from './layout.jsx';

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
  const [programSearch, setProgramSearch] = useState('');

  // Tier Form State
  const [incentiveProgramId, setIncentiveProgramId] = useState('');
  const [minTarget, setMinTarget] = useState('');
  const [tierBasis, setTierBasis] = useState('QUANTITY');
  const [rewardType, setRewardType] = useState('PERCENTAGE');
  const [rewardValue, setRewardValue] = useState('');
  const [editingTierId, setEditingTierId] = useState(null);
  const [tierSearch, setTierSearch] = useState('');
  const [tierSort, setTierSort] = useState({ key: null, direction: 'asc' });

  const navigate = useNavigate();
  const { formatCurrency, currency, exchangeRate } = useCurrency();

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

    let finalMinTarget = parseFloat(minTarget);
    if (tierBasis === 'REVENUE' && currency === 'USD') {
      finalMinTarget = finalMinTarget * exchangeRate;
    }
    
    let finalRewardValue = parseFloat(rewardValue);
    if (rewardType === 'FIXED_AMOUNT' && currency === 'USD') {
      finalRewardValue = finalRewardValue * exchangeRate;
    }

    try {
      const payload = {
        incentiveProgramId,
        minTarget: finalMinTarget,
        tierBasis,
        rewardType,
        rewardValue: finalRewardValue
      };

      if (editingTierId) {
        await api.patch(`/commission-rule-tiers/${editingTierId}`, payload);
      } else {
        await api.post('/commission-rule-tiers', payload);
      }
      setMinTarget(''); setRewardValue(''); setEditingTierId(null);
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
    
    let displayMinTarget = t.minTarget;
    if (t.tierBasis === 'REVENUE' && currency === 'USD') {
      displayMinTarget = parseFloat(displayMinTarget) / exchangeRate;
    }
    setMinTarget(displayMinTarget.toString());

    setRewardType(t.rewardType);

    let displayReward = t.rewardValue;
    if (t.rewardType === 'FIXED_AMOUNT' && currency === 'USD') {
      displayReward = parseFloat(displayReward) / exchangeRate;
    }
    setRewardValue(displayReward.toString());
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

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(programSearch.toLowerCase())
  );

  const filteredTiers = tiers.filter(t => 
    (t.incentiveProgram?.name || '').toLowerCase().includes(tierSearch.toLowerCase()) ||
    t.tierBasis.toLowerCase().includes(tierSearch.toLowerCase()) ||
    t.rewardType.toLowerCase().includes(tierSearch.toLowerCase())
  );

  const handleTierSort = (key) => {
    let direction = 'asc';
    if (tierSort.key === key && tierSort.direction === 'asc') direction = 'desc';
    setTierSort({ key, direction });
  };

  const sortedTiers = [...filteredTiers].sort((a, b) => {
    if (!tierSort.key) return 0;
    let aVal = a[tierSort.key];
    let bVal = b[tierSort.key];
    if (tierSort.key === 'program') {
      aVal = a.incentiveProgram?.name || '';
      bVal = b.incentiveProgram?.name || '';
    } else if (tierSort.key === 'minTarget' || tierSort.key === 'rewardValue') {
      aVal = parseFloat(aVal || 0);
      bVal = parseFloat(bVal || 0);
    }
    if (aVal < bVal) return tierSort.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return tierSort.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <Layout>
      <div style={{ padding: '32px', color: '#1F2937' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '28px', fontWeight: '700' }}>Manage Commission Rules</h2>
              <p style={{ margin: '0', color: '#6B7280', fontSize: '15px' }}>Configure incentive programs and tier targets.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            
            {/* Left Column: Programs */}
            <div style={{ flex: '1', minWidth: '450px' }}>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '18px', fontWeight: '600' }}>1. {editingProgramId ? 'Edit' : 'Create'} Incentive Program</h3>
                <form onSubmit={handleAddProgram} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Program Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q3 Bonus" required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }} onFocus={(e) => { e.target.style.borderColor = '#818CF8'; e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.2)'; e.target.style.backgroundColor = '#FFFFFF'; }} onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#F9FAFB'; }} />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Start Date</label>
                      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>End Date</label>
                      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Target Products <span style={{ fontWeight: 'normal', color: '#6B7280' }}>(Leave empty for All Products)</span></label>
                    <select multiple value={selectedProductIds} onChange={(e) => setSelectedProductIds(Array.from(e.target.selectedOptions, option => option.value))} style={{ width: '100%', height: '100px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }}>
                      {allProducts.map(p => (<option key={p.id} value={p.id} style={{ padding: '4px' }}>{p.name}</option>))}
                    </select>
                    <small style={{ color: '#9CA3AF', display: 'block', marginTop: '6px' }}>*Hold Ctrl/Cmd to select multiple. Empty = Global Program.</small>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button type="submit" style={{ flex: 1, padding: '12px', cursor: 'pointer', backgroundColor: editingProgramId ? '#F59E0B' : '#6366F1', color: editingProgramId ? '#000000' : 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = editingProgramId ? '#D97706' : '#4F46E5'} onMouseOut={(e) => e.target.style.backgroundColor = editingProgramId ? '#F59E0B' : '#6366F1'}>{editingProgramId ? 'Update Program' : 'Save Program'}</button>
                    {editingProgramId && <button type="button" onClick={handleCancelEditProgram} style={{ padding: '12px 20px', cursor: 'pointer', backgroundColor: '#F3F4F6', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '15px', fontWeight: '600' }}>Cancel</button>}
                  </div>
                </form>
              </div>

              {/* Active Programs List */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ margin: 0, color: '#111827', fontSize: '16px', fontWeight: '600' }}>Active Programs</h4>
                  <input type="text" placeholder="Search programs..." value={programSearch} onChange={e => setProgramSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredPrograms.length === 0 ? (<p style={{ color: '#6B7280', margin: 0 }}>No programs found.</p>) : filteredPrograms.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#F9FAFB' }}>
                      <div>
                        <strong style={{ color: '#1F2937', fontSize: '15px' }}>{p.name}</strong>
                        <div style={{ color: '#6B7280', fontSize: '13px', marginTop: '6px' }}>
                          Products: <span style={{ color: '#4B5563', fontWeight: '500' }}>{p.products?.length > 0 ? p.products.map(prod => prod.name).join(', ') : 'All Products'}</span>
                        </div>
                        <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '4px' }}>{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEditProgram(p)} style={{ color: '#854D0E', backgroundColor: '#FEF9C3', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: '600', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#FEF08A'} onMouseOut={(e) => e.target.style.backgroundColor = '#FEF9C3'}>Edit</button>
                        <button onClick={() => handleDeleteProgram(p.id)} style={{ color: '#B91C1C', backgroundColor: '#FEE2E2', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', fontWeight: '600', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#FCA5A5'} onMouseOut={(e) => e.target.style.backgroundColor = '#FEE2E2'}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Tiers */}
            <div style={{ flex: '1', minWidth: '500px' }}>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '18px', fontWeight: '600' }}>2. {editingTierId ? 'Edit' : 'Create'} Rule Tier</h3>
                <form onSubmit={handleAddTier} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Link to Program</label>
                    <select value={incentiveProgramId} onChange={(e) => setIncentiveProgramId(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }}><option value="" disabled>Select a program...</option>{programs.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Target Type</label>
                      <select value={tierBasis} onChange={(e) => setTierBasis(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }}><option value="QUANTITY">Quantity (Pcs)</option><option value="REVENUE">Revenue (Omset)</option></select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Min Target {tierBasis === 'REVENUE' ? (currency === 'IDR' ? '(Rp)' : '($)') : '(Pcs)'}</label>
                      <input type="number" min="1" value={minTarget} onChange={(e) => setMinTarget(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Reward Type</label>
                      <select value={rewardType} onChange={(e) => setRewardType(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }}><option value="PERCENTAGE">Percentage (%)</option><option value="FIXED_AMOUNT">Fixed Amount / Pcs</option></select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Reward Value {rewardType === 'FIXED_AMOUNT' ? (currency === 'IDR' ? '(Rp)' : '($)') : '(%)'}</label>
                      <input type="number" step="0.1" min="0" value={rewardValue} onChange={(e) => setRewardValue(e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button type="submit" style={{ flex: 1, padding: '12px', cursor: 'pointer', backgroundColor: editingTierId ? '#F59E0B' : '#10B981', color: editingTierId ? '#000000' : 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = editingTierId ? '#D97706' : '#059669'} onMouseOut={(e) => e.target.style.backgroundColor = editingTierId ? '#F59E0B' : '#10B981'}>{editingTierId ? 'Update Rule Tier' : 'Save Rule Tier'}</button>
                    {editingTierId && <button type="button" onClick={handleCancelEditTier} style={{ padding: '12px 20px', cursor: 'pointer', backgroundColor: '#F3F4F6', color: '#4B5563', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '15px', fontWeight: '600' }}>Cancel</button>}
                  </div>
                </form>
              </div>

              {/* Active Rule Tiers Table */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ margin: 0, color: '#111827', fontSize: '16px', fontWeight: '600' }}>Active Rule Tiers</h4>
                  <input type="text" placeholder="Search tiers..." value={tierSearch} onChange={e => setTierSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none' }} />
                </div>
                
                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <th onClick={() => handleTierSort('program')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Program {tierSort.key === 'program' ? (tierSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                        <th style={{ padding: '12px 16px', color: '#4B5563', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Targets</th>
                        <th onClick={() => handleTierSort('tierBasis')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Basis {tierSort.key === 'tierBasis' ? (tierSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                        <th onClick={() => handleTierSort('minTarget')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Min {tierSort.key === 'minTarget' ? (tierSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                        <th onClick={() => handleTierSort('rewardValue')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#4B5563', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Reward {tierSort.key === 'rewardValue' ? (tierSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                        <th style={{ padding: '12px 16px', color: '#4B5563', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTiers.length === 0 ? (<tr><td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: '#6B7280' }}>No rule tiers found.</td></tr>) : sortedTiers.map((t, idx) => (
                        <tr key={t.id} style={{ borderBottom: idx !== sortedTiers.length - 1 ? '1px solid #E5E7EB' : 'none', transition: 'background-color 0.15s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <td style={{ padding: '12px 16px', color: '#1F2937', fontWeight: '500', fontSize: '13px' }}>{t.incentiveProgram?.name}</td>
                          <td style={{ padding: '12px 16px', fontSize: '12px', color: '#6B7280' }}>
                            {t.incentiveProgram?.products?.length > 0
                              ? t.incentiveProgram.products.map(p => p.name).join(', ')
                              : <span style={{ fontStyle: 'italic', color: '#9CA3AF' }}>All Products</span>
                            }
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4B5563' }}>{t.tierBasis}</td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', fontWeight: '500' }}>{t.tierBasis === 'REVENUE' ? formatCurrency(t.minTarget) : `${t.minTarget} pcs`}+</td>
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: '#10B981', fontWeight: '600' }}>{t.rewardType === 'PERCENTAGE' ? `${t.rewardValue}%` : formatCurrency(t.rewardValue)}</td>
                          <td style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEditTier(t)} style={{ color: '#854D0E', backgroundColor: '#FEF9C3', border: 'none', padding: '6px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px', fontWeight: '600', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#FEF08A'} onMouseOut={(e) => e.target.style.backgroundColor = '#FEF9C3'}>Edit</button>
                            <button onClick={() => handleDeleteTier(t.id)} style={{ color: '#B91C1C', backgroundColor: '#FEE2E2', border: 'none', padding: '6px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '12px', fontWeight: '600', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#FCA5A5'} onMouseOut={(e) => e.target.style.backgroundColor = '#FEE2E2'}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              </div>
            </div>
            
            <label>Target Type</label>
            <select value={tierBasis} onChange={(e) => setTierBasis(e.target.value)}><option value="QUANTITY">Based on Quantity (Pcs)</option><option value="REVENUE">Based on Revenue (Omset)</option></select>
            <label>Minimum Target {tierBasis === 'REVENUE' ? (currency === 'IDR' ? '(Rp)' : '($)') : '(Pcs)'}</label>
            <input type="number" min="1" value={minTarget} onChange={(e) => setMinTarget(e.target.value)} required />
            
            <label>Reward Type</label>
            <select value={rewardType} onChange={(e) => setRewardType(e.target.value)}><option value="PERCENTAGE">Percentage (%)</option><option value="FIXED_AMOUNT">Fixed Amount / Pcs</option></select>
            <label>Reward Value {rewardType === 'FIXED_AMOUNT' ? (currency === 'IDR' ? '(Rp)' : '($)') : '(%)'}</label>
            <input type="number" step="0.1" min="0" value={rewardValue} onChange={(e) => setRewardValue(e.target.value)} required />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', cursor: 'pointer', backgroundColor: editingTierId ? '#FFC107' : '#28A745', color: editingTierId ? 'black' : 'white', border: 'none' }}>{editingTierId ? 'Update Rule Tier' : 'Save Rule Tier'}</button>
              {editingTierId && <button type="button" onClick={handleCancelEditTier} style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none' }}>Cancel</button>}
            </div>
          </form>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0 }}>Active Rule Tiers</h4>
            <input type="text" placeholder="Search tiers..." value={tierSearch} onChange={e => setTierSearch(e.target.value)} style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th onClick={() => handleTierSort('program')} style={{ cursor: 'pointer' }}>Program {tierSort.key === 'program' ? (tierSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Target Products</th>
                <th onClick={() => handleTierSort('tierBasis')} style={{ cursor: 'pointer' }}>Basis {tierSort.key === 'tierBasis' ? (tierSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleTierSort('minTarget')} style={{ cursor: 'pointer' }}>Min Target {tierSort.key === 'minTarget' ? (tierSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleTierSort('rewardValue')} style={{ cursor: 'pointer' }}>Reward {tierSort.key === 'rewardValue' ? (tierSort.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTiers.length === 0 ? (<tr><td colSpan="6">No rule tiers found.</td></tr>) : sortedTiers.map(t => (
                <tr key={t.id}>
                  <td>{t.incentiveProgram?.name}</td>
                  <td style={{ fontSize: '0.9em', color: '#555' }}>
                    {t.incentiveProgram?.products?.length > 0
                      ? t.incentiveProgram.products.map(p => p.name).join(', ')
                      : <span style={{ fontStyle: 'italic' }}>All Products</span>
                    }
                  </td>
                  <td>{t.tierBasis}</td>
                  <td>{t.tierBasis === 'REVENUE' ? formatCurrency(t.minTarget) : `${t.minTarget} pcs`}+</td>
                  <td>{t.rewardType === 'PERCENTAGE' ? `${t.rewardValue}%` : formatCurrency(t.rewardValue)}</td>
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
    </Layout>
  );
}