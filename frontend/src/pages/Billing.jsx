
import React, { useState, useEffect } from 'react';
import { productsAPI, billingAPI } from '../services/api';

const Billing = () => {
    const [products, setProducts] = useState([]);
    const [skuInput, setSkuInput] = useState('');
    const [currentBillItems, setCurrentBillItems] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await productsAPI.getAll();
            if (response.data.success) {
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const addToBill = (e) => {
        e.preventDefault();
        setError('');

        const product = products.find(p => p.sku === skuInput.toUpperCase() || p.sku === skuInput);

        if (!product) {
            setError('Product not found!');
            return;
        }

        if (product.currentStock <= 0) {
            setError('Product is out of stock!');
            return;
        }

        const existingItem = currentBillItems.find(item => item.product._id === product._id);

        if (existingItem) {
            if (existingItem.quantity + 1 > product.currentStock) {
                setError(`Only ${product.currentStock} items in stock!`);
                return;
            }

            setCurrentBillItems(prev => prev.map(item =>
                item.product._id === product._id
                    ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
                    : item
            ));
        } else {
            setCurrentBillItems(prev => [...prev, {
                product: product, // Store full product object for display
                sku: product.sku,
                name: product.name,
                unitPrice: product.unitPrice,
                quantity: 1,
                total: product.unitPrice
            }]);
        }
        setSkuInput('');
    };

    const updateQuantity = (sku, newQty) => {
        if (newQty < 1) return;

        const item = currentBillItems.find(i => i.sku === sku);
        if (!item) return;

        // Find original product to check stock
        const product = products.find(p => p.sku === sku);
        if (newQty > product.currentStock) {
            setError(`Only ${product.currentStock} items in stock!`);
            return;
        }

        setCurrentBillItems(prev => prev.map(i =>
            i.sku === sku
                ? { ...i, quantity: newQty, total: newQty * i.unitPrice }
                : i
        ));
        setError('');
    };

    const removeFromBill = (sku) => {
        setCurrentBillItems(prev => prev.filter(item => item.sku !== sku));
    };

    const calculateTotal = () => {
        return currentBillItems.reduce((sum, item) => sum + item.total, 0);
    };

    const handleCheckout = async () => {
        if (currentBillItems.length === 0) {
            setError('No items in the bill!');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const billData = {
                items: currentBillItems.map(item => ({
                    sku: item.sku,
                    quantity: item.quantity
                })),
                customerName,
                paymentMethod
            };

            const response = await billingAPI.create(billData);

            if (response.data.success) {
                setSuccessMessage('Bill created successfully!');
                setCurrentBillItems([]);
                setCustomerName('');
                setPaymentMethod('CASH');
                fetchProducts(); // Refresh stock
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setError(error.response?.data?.message || 'Error processing bill');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
            <main style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 2rem' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    {/* Left Side: Billing Form */}
                    <div style={{ flex: 2 }}>
                        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: '#111827' }}>New Bill</h2>

                            {/* Product Entry */}
                            <form onSubmit={addToBill} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>Scan SKU / Product ID</label>
                                    <input
                                        type="text"
                                        value={skuInput}
                                        onChange={(e) => setSkuInput(e.target.value)}
                                        placeholder="Enter SKU (e.g., 001)"
                                        className="form-input"
                                        autoFocus
                                    />
                                </div>
                                <div style={{ alignSelf: 'flex-end' }}>
                                    <button type="submit" className="btn btn-primary">
                                        Add Item
                                    </button>
                                </div>
                            </form>

                            {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}
                            {successMessage && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMessage}</div>}

                            {/* Bill Items Table */}
                            <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                                            <th style={{ padding: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Product</th>
                                            <th style={{ padding: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Price</th>
                                            <th style={{ padding: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Qty</th>
                                            <th style={{ padding: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Total</th>
                                            <th style={{ padding: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentBillItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No items added yet</td>
                                            </tr>
                                        ) : (
                                            currentBillItems.map((item, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>SKU: {item.sku}</div>
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>₹{item.unitPrice}</td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                                                                style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #d1d5db', cursor: 'pointer' }}
                                                            >-</button>
                                                            <span>{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                                                                style={{ padding: '2px 8px', borderRadius: '4px', border: '1px solid #d1d5db', cursor: 'pointer' }}
                                                            >+</button>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>₹{item.total}</td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <button
                                                            onClick={() => removeFromBill(item.sku)}
                                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                        >✕</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Customer & Checkout */}
                            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '2rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                    <div>
                                        <label className="form-label">Customer Name (Optional)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Guest"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">Payment Method</label>
                                        <select
                                            className="form-input"
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        >
                                            <option value="CASH">Cash</option>
                                            <option value="CARD">Card</option>
                                            <option value="UPI">UPI</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Amount</div>
                                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>₹{calculateTotal()}</div>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={loading || currentBillItems.length === 0}
                                        className="btn btn-primary btn-lg"
                                        style={{ padding: '0.75rem 2rem' }}
                                    >
                                        {loading ? 'Processing...' : 'Complete Bill'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Product List Reference */}
                    <div style={{ flex: 1 }}>
                        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', position: 'sticky', top: '100px' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Product Reference</h3>
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {products.map(product => (
                                    <div
                                        key={product._id}
                                        onClick={() => { setSkuInput(product.sku); }}
                                        style={{
                                            padding: '0.75rem',
                                            borderBottom: '1px solid #f3f4f6',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <div style={{ fontWeight: 500 }}>{product.name}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                            <span>SKU: {product.sku}</span>
                                            <span style={{ color: product.currentStock > 0 ? '#059669' : '#ef4444' }}>
                                                Stock: {product.currentStock}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Billing;
