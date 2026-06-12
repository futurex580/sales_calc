import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCurrency } from '../CurrencyContext';
import Layout from './layout.jsx';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [cogs, setCogs] = useState('0');
  const [search, setSearch] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
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
    
    // Automatically convert back to IDR if the user is typing in USD!
    const finalPrice = currency === 'USD' ? parseFloat(basePrice) * exchangeRate : parseFloat(basePrice);
    const finalCogs = currency === 'USD' ? parseFloat(cogs) * exchangeRate : parseFloat(cogs);

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
    setBasePrice(currency === 'USD' ? (parseFloat(p.basePrice) / exchangeRate).toString() : p.basePrice.toString());
    setCogs(currency === 'USD' ? (parseFloat(p.cogs) / exchangeRate).toString() : p.cogs.toString());
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    String(p.id).includes(search)
  );

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    if (sortConfig.key === 'basePrice' || sortConfig.key === 'cogs') {
      aVal = parseFloat(aVal || 0);
      bVal = parseFloat(bVal || 0);
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <Layout>
      <div style={{ padding: '32px', fontFamily: 'sans-serif', color: '#1F2937', width: '100%' }}>
        <h2 style={{ marginTop: 0, fontSize: '28px' }}>Products Management</h2>
        <hr style={{ borderColor: '#E5E7EB', marginBottom: '24px' }} />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>Existing Products</h3>
            <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('basePrice')} style={{ cursor: 'pointer' }}>Price {sortConfig.key === 'basePrice' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('cogs')} style={{ cursor: 'pointer' }}>COGS {sortConfig.key === 'cogs' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.length === 0 ? (
                <tr><td colSpan="5">No products found.</td></tr>
              ) : (
                sortedProducts.map((p) => (
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
    </Layout>
  );
}