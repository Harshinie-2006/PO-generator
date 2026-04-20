import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, vendorsAPI, purchaseOrdersAPI } from '../services/api';
import heroBanner from '../assets/images/aisle-1.jpg';

const Dashboard = () => {
    const [stats, setStats] = useState({
        lowStockCount: 0,
        totalVendors: 0,
        pendingPOs: 0,
        draftPOs: 0
    });
    const [toastMessage, setToastMessage] = useState('');

    const dummyProducts = [
        { id: 1, name: 'Rice', price: 60, rating: 4.5 },
        { id: 2, name: 'Milk', price: 30, rating: 4.2 },
        { id: 3, name: 'Biscuit', price: 20, rating: 3.8 },
        { id: 4, name: 'Soap', price: 40, rating: 4.0 },
        { id: 5, name: 'Cooking Oil', price: 180, rating: 4.6 },
        { id: 6, name: 'Sugar', price: 45, rating: 4.1 },
        { id: 7, name: 'Salt', price: 20, rating: 3.9 },
        { id: 8, name: 'Tea Powder', price: 120, rating: 4.4 },
        { id: 9, name: 'Coffee', price: 150, rating: 4.3 },
        { id: 10, name: 'Toothpaste', price: 90, rating: 4.0 },
        { id: 11, name: 'Shampoo', price: 110, rating: 4.2 },
        { id: 12, name: 'Detergent', price: 130, rating: 4.1 }
    ];

    const handleDemoOrder = (productName) => {
        setToastMessage(`Order placed for ${productName} (Demo)`);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={`full-${i}`}>⭐</span>);
        }
        if (hasHalfStar) {
            stars.push(<span key="half">⭐</span>);
        }

        return <span>{stars} {rating}</span>;
    };
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [lowStockRes, vendorsRes, posRes] = await Promise.all([
                productsAPI.getLowStock(),
                vendorsAPI.getAll(),
                purchaseOrdersAPI.getAll()
            ]);

            const allPOs = posRes.data.data || [];
            const draftPOs = allPOs.filter(po => po.status === 'DRAFT');
            const sentPOs = allPOs.filter(po => po.status === 'SENT');

            setStats({
                lowStockCount: lowStockRes.data.count || 0,
                totalVendors: vendorsRes.data.count || 0,
                pendingPOs: sentPOs.length,
                draftPOs: draftPOs.length
            });

            setLowStockProducts(lowStockRes.data.data || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <div className="spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Hero Banner */}
            <div style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '2rem',
                height: '200px',
                background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${heroBanner})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
                    <h1 style={{
                        fontSize: 'calc(1.5rem + 1vw)',
                        fontWeight: 700,
                        margin: '0 0 0.5rem 0',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}>
                        Welcome to Thulir Market
                    </h1>
                    <p style={{
                        fontSize: '1.125rem',
                        margin: 0,
                        opacity: 0.95,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}>
                        Manage your inventory and purchase orders efficiently
                    </p>
                </div>
            </div>

            {/* <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-description">
                    Overview of your inventory and purchase orders
                </p>
            </div> */}

            {/* Stats Cards */}
            <div className="dashboard-grid">
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-label">Low Stock Items</div>
                    <div className="stat-value">{stats.lowStockCount}</div>
                </div>

                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <div className="stat-icon">👥</div>
                    <div className="stat-label">Total Vendors</div>
                    <div className="stat-value">{stats.totalVendors}</div>
                </div>

                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                    <div className="stat-icon">📦</div>
                    <div className="stat-label">Pending POs</div>
                    <div className="stat-value">{stats.pendingPOs}</div>
                </div>

                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                    <div className="stat-icon">📄</div>
                    <div className="stat-label">Draft POs</div>
                    <div className="stat-value">{stats.draftPOs}</div>
                </div>
            </div>

            {/* Low Stock Alert */}
            {stats.lowStockCount > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">⚠️ Low Stock Alerts</h2>
                        <Link to="/purchase-orders" className="btn btn-primary">
                            Generate POs
                        </Link>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Product Name</th>
                                    <th>Vendor</th>
                                    <th>Current Stock</th>
                                    <th>Reorder Point</th>
                                    <th>Reorder Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockProducts.slice(0, 5).map((product) => (
                                    <tr key={product._id}>
                                        <td>
                                            <code style={{
                                                background: 'var(--gray-100)',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem'
                                            }}>
                                                {product.sku}
                                            </code>
                                        </td>
                                        <td className="font-medium">{product.name}</td>
                                        <td>{product.vendor?.name}</td>
                                        <td>
                                            <span className="badge badge-danger">
                                                {product.currentStock}
                                            </span>
                                        </td>
                                        <td>{product.reorderPoint}</td>
                                        <td>{product.reorderQuantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {lowStockProducts.length > 5 && (
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Link to="/inventory" className="btn btn-secondary">
                                View All Low Stock Items
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Actions */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Quick Actions</h2>
                </div>

                <div className="responsive-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem'
                }}>
                    <Link
                        to="/vendors"
                        className="btn btn-secondary"
                        style={{ padding: '1.5rem', flexDirection: 'column' }}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                        <div>Manage Vendors</div>
                    </Link>

                    <Link
                        to="/inventory"
                        className="btn btn-secondary"
                        style={{ padding: '1.5rem', flexDirection: 'column' }}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                        <div>Manage Inventory</div>
                    </Link>

                    <Link
                        to="/purchase-orders"
                        className="btn btn-secondary"
                        style={{ padding: '1.5rem', flexDirection: 'column' }}
                    >
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                        <div>Purchase Orders</div>
                    </Link>
                </div>
            </div>

            {/* Store Location Map */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">📍 Thulir Supermarket – Location</h2>
                </div>
                <div style={{ borderRadius: '8px', overflow: 'hidden', height: '400px' }}>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.3!2d77.5!3d13.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA3JzQ4LjAiTiA3N8KwMzAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>

            {/* Quick Order Section */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">🛒 Quick Order (Demo)</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Click "Order Now" to test demo ordering
                    </p>
                </div>

                <div className="product-grid">
                    {dummyProducts.map((product) => (
                        <div key={product.id} className="product-card">
                            <div className="product-icon">🏪</div>
                            <h3 className="product-name">{product.name}</h3>
                            <div className="product-price">₹{product.price}</div>
                            <div className="product-rating">
                                {renderStars(product.rating)}
                            </div>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleDemoOrder(product.name)}
                                style={{ width: '100%', marginTop: '0.5rem' }}
                            >
                                Order Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Toast Notification */}
            {toastMessage && (
                <div className="toast-notification">
                    ✅ {toastMessage}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
