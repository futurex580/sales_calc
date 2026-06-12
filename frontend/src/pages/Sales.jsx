import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCurrency } from '../CurrencyContext';
import Layout from './layout.jsx';

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [payoutResult, setPayoutResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    // Fetch products to populate the dropdown
    api.get('/products')
      .then((res) => {
        setProducts(res.data);
        if (res.data.length > 0) setProductId(res.data[0].id);
      })
      .catch((err) => console.error("Failed to fetch products", err));
  }, []);

  const handleSubmitSale = async (e) => {
    e.preventDefault();
    setError('');
    setPayoutResult(null);
    try {
      const res = await api.post('/sales-records', {
        productId,
        quantity: parseInt(quantity, 10)
      });
      setPayoutResult(res.data.payout);
      setQuantity('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit sales');
    }
  };

  return (
    <Layout>
      <div style={{ padding: '32px', color: '#1F2937', fontFamily: '"Inter", "Segoe UI", sans-serif', width: '100%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '28px', fontWeight: '700' }}>Submit Sales</h2>
              <p style={{ margin: '0', color: '#6B7280', fontSize: '15px' }}>Record a new sale and calculate payout instantly.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            
            {/* Left Column: Form */}
            <div style={{ flex: '1', minWidth: '350px', maxWidth: '450px' }}>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#111827', fontSize: '18px', fontWeight: '600' }}>Record New Sales</h3>
                
                {error && (
                  <div style={{ backgroundColor: '#FEE2E2', borderLeft: '4px solid #EF4444', padding: '12px 16px', marginBottom: '24px', borderRadius: '4px' }}>
                    <p style={{ margin: '0', color: '#B91C1C', fontSize: '14px', fontWeight: '500' }}>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmitSale} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Product</label>
                    <select value={productId} onChange={(e) => setProductId(e.target.value)} required style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }}>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.basePrice)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Quantity Sold</label>
                    <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required placeholder="1" style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }} onFocus={(e) => { e.target.style.borderColor = '#818CF8'; e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.2)'; e.target.style.backgroundColor = '#FFFFFF'; }} onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#F9FAFB'; }} />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '14px', marginTop: '8px', cursor: 'pointer', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#059669'} onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}>Calculate & Submit</button>
                </form>
              </div>
            </div>

            {/* Right Column: Result */}
            <div style={{ flex: '1', minWidth: '400px' }}>
              {payoutResult ? (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: '24px', borderTop: '6px solid #10B981' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#059669', fontSize: '20px', fontWeight: '700' }}>Sales Recorded Successfully! 🎉</h3>
                  
                  <div style={{ padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#4B5563', fontWeight: '500' }}>Sales Rep:</span>
                      <span style={{ color: '#111827', fontWeight: '600' }}>{payoutResult.salesRepName}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#4B5563', fontWeight: '500' }}>Total Sales Value:</span>
                      <span style={{ color: '#111827', fontWeight: '600' }}>{formatCurrency(payoutResult.totalValue)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#4B5563', fontWeight: '500' }}>All-Time Qty:</span>
                      <span style={{ color: '#111827', fontWeight: '600' }}>{payoutResult.totalQuantitySold} pcs <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 'normal' }}>(Including this)</span></span>
                    </div>
                  </div>

                  {payoutResult.payouts && payoutResult.payouts.length > 0 ? (
                    <div>
                      <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commissions Applied</h4>
                      {payoutResult.payouts.map((p, idx) => (
                        <div key={idx} style={{ padding: '16px', backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '8px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ color: '#3730A3', fontWeight: '600', fontSize: '15px' }}>{p.programName}</span>
                            <span style={{ color: '#4338CA', backgroundColor: '#E0E7FF', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{p.rewardType === 'PERCENTAGE' ? `${p.rewardApplied}%` : formatCurrency(p.rewardApplied)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #C7D2FE' }}>
                            <span style={{ color: '#4F46E5', fontWeight: '500' }}>Payout Earned</span>
                            <span style={{ color: '#312E81', fontWeight: '700', fontSize: '18px' }}>{formatCurrency(p.commissionEarned)}</span>
                          </div>
                        </div>
                      ))}
                      
                      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '2px dashed #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#111827', fontSize: '18px', fontWeight: '700' }}>Total Payout:</span>
                        <span style={{ color: '#10B981', fontSize: '24px', fontWeight: '800' }}>{formatCurrency(payoutResult.payouts.reduce((sum, p) => sum + parseFloat(p.commissionEarned), 0))}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#FFFBEB', padding: '16px', borderRadius: '8px', border: '1px solid #FEF3C7' }}>
                      <p style={{ margin: 0, color: '#B45309', fontSize: '14px', fontWeight: '500' }}><em>Note: {payoutResult.message || 'No active programs matched this sale.'}</em></p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}