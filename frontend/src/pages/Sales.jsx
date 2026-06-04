import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCurrency } from '../CurrencyContext';

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
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Submit Sales</h2>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '5px 15px', cursor: 'pointer' }}>Back to Dashboard</button>
      </div>
      <hr />

      <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
        <div style={{ flex: 1, maxWidth: '400px' }}>
          <h3>Record New Sales</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <form onSubmit={handleSubmitSale} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label>Product</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.basePrice)}</option>
              ))}
            </select>

            <label>Quantity Sold</label>
            <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />

            <button type="submit" style={{ padding: '10px', marginTop: '10px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}>
              Calculate & Submit
            </button>
          </form>
        </div>

        <div style={{ flex: 1 }}>
          {payoutResult && (
            <div style={{ padding: '20px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, color: '#4CAF50' }}>Sales Recorded Successfully! 🎉</h3>
              
              <div style={{ padding: '15px', backgroundColor: '#e9ecef', borderRadius: '6px', marginBottom: '15px' }}>
                <p style={{ margin: '0 0 5px 0' }}><strong>Sales Rep:</strong> {payoutResult.salesRepName}</p>
                <p style={{ margin: '0 0 5px 0' }}><strong>Total Sales Value:</strong> {formatCurrency(payoutResult.totalValue)}</p>
                <p style={{ margin: '0' }}><strong>Total Pcs Sold (All-Time):</strong> {payoutResult.totalQuantitySold} pcs <span style={{ fontSize: '0.85em', color: '#666' }}>(Including this record)</span></p>
              </div>

              {payoutResult.payouts && payoutResult.payouts.length > 0 ? (
                <>
                  {payoutResult.payouts.map((p, idx) => (
                    <div key={idx} style={{ padding: '10px', background: '#fff', border: '1px solid #eee', marginTop: '10px' }}>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Program Applied:</strong> {p.programName}</p>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Reward:</strong> {p.rewardType === 'PERCENTAGE' ? `${p.rewardApplied}%` : formatCurrency(p.rewardApplied)}</p>
                      <h4 style={{ color: '#333', margin: '5px 0' }}>Payout Earned: {formatCurrency(p.commissionEarned)}</h4>
                    </div>
                  ))}
                  <hr />
                  <h2 style={{ color: '#333' }}>Total Payout: {formatCurrency(payoutResult.payouts.reduce((sum, p) => sum + parseFloat(p.commissionEarned), 0))}</h2>
                </>
              ) : (
                <p style={{ color: 'orange', marginTop: '10px' }}><em>Note: {payoutResult.message || 'No active programs matched this sale.'}</em></p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}