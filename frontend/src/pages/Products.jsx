import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCurrency } from '../CurrencyContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [cogs, setCogs] = useState('0');
  const [editingProductId, setEditingProductId] = useState(null);
  const navigate = useNavigate();
  const { formatCurrency, currency, exchangeRate } = useCurrency();

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Automatically convert back to USD if the user is typing in IDR!
    const finalPrice = currency === 'IDR' ? parseFloat(basePrice) / exchangeRate : parseFloat(basePrice);
    const finalCogs = currency === 'IDR' ? parseFloat(cogs) / exchangeRate : parseFloat(cogs);

    try {
      const payload = {
        name,
        basePrice: finalPrice,
        cogs: finalCogs
      };

      if (editingProductId) {
        await api.patch(`/products/${editingProductId}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setName('');
      setBasePrice('');
      setCogs('0');
      setEditingProductId(null);
      fetchProducts();
    } catch (err) {
      alert('Failed to save product: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEditProduct = (p) => {
    setEditingProductId(p.id);
    setName(p.name);
    setBasePrice(currency === 'IDR' ? (parseFloat(p.basePrice) * exchangeRate).toString() : p.basePrice.toString());
    setCogs(currency === 'IDR' ? (parseFloat(p.cogs) * exchangeRate).toString() : p.cogs.toString());
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setName(''); setBasePrice(''); setCogs('0');
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product. It might be linked to existing sales records or incentive programs.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Products Management</h2>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '5px 15px', cursor: 'pointer' }}>Back to Dashboard</button>
      </div>
      <hr />
      <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
        <div style={{ flex: 1, maxWidth: '300px' }}>
          <h3>{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label>Product Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
            <label>Base Price ({currency === 'IDR' ? 'Rp' : '$'})</label>
            <input type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
            <label>Cost of Goods Sold ({currency === 'IDR' ? 'Rp' : '$'})</label>
            <input type="number" step="0.01" value={cogs} onChange={(e) => setCogs(e.target.value)} required />
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ flex: 1, padding: '10px', cursor: 'pointer', backgroundColor: editingProductId ? '#FFC107' : '#007BFF', color: editingProductId ? 'black' : 'white', border: 'none' }}>{editingProductId ? 'Update Product' : 'Save Product'}</button>
              {editingProductId && <button type="button" onClick={handleCancelEdit} style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none' }}>Cancel</button>}
            </div>
          </form>
        </div>
        <div style={{ flex: 2 }}>
          <h3>Existing Products</h3>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Price</th><th>COGS</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="5">No products found.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontSize: '0.8em', color: 'gray' }}>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{formatCurrency(p.basePrice)}</td>
                    <td>{formatCurrency(p.cogs)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => handleEditProduct(p)} style={{ color: 'black', backgroundColor: '#FFC107', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Edit</button>
                        <button onClick={() => handleDeleteProduct(p.id)} style={{ color: 'white', backgroundColor: '#dc3545', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}