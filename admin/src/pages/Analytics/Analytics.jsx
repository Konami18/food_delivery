import React, { useState, useEffect } from 'react';
import './Analytics.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Analytics = ({ url }) => {
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [customerAnalytics, setCustomerAnalytics] = useState(null);
    const [period, setPeriod] = useState('week');
    const [loading, setLoading] = useState(true);

    const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];

    useEffect(() => {
        fetchAllData();
    }, [period]);

    const fetchAllData = async () => {
        try {
            const [statsRes, revenueRes, productsRes, customersRes] = await Promise.all([
                axios.get(`${url}/api/analytics/stats`),
                axios.get(`${url}/api/analytics/revenue?period=${period}`),
                axios.get(`${url}/api/analytics/top-products?limit=5`),
                axios.get(`${url}/api/analytics/customers`)
            ]);

            if (statsRes.data.success) setStats(statsRes.data.data);
            if (revenueRes.data.success) setRevenueData(revenueRes.data.data);
            if (productsRes.data.success) setTopProducts(productsRes.data.data);
            if (customersRes.data.success) setCustomerAnalytics(customersRes.data.data);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching analytics:", error);
            toast.error("Failed to load analytics data");
            setLoading(false);
        }
    };

    const handleExport = async (type) => {
        try {
            const response = await axios.get(`${url}/api/analytics/export/${type}`, {
                responseType: 'blob'
            });

            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `${type}_export_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success(`${type} data exported successfully!`);
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export data");
        }
    };

    const formatRevenueData = () => {
        return revenueData.map(item => ({
            name: period === 'day' 
                ? `${item._id.day}/${item._id.month}`
                : period === 'week'
                ? `Week ${item._id.week}`
                : period === 'month'
                ? `${item._id.month}/${item._id.year}`
                : item._id.year,
            revenue: item.revenue,
            orders: item.orders
        }));
    };

    if (loading) {
        return (
            <div className='analytics-page'>
                <h2>Loading analytics...</h2>
            </div>
        );
    }

    return (
        <div className='analytics-page'>
            <h2>📊 Analytics & Reports</h2>

            {/* Overall Stats */}
            <div className='stats-grid'>
                <div className='stat-card revenue'>
                    <div className='stat-icon'>💰</div>
                    <div className='stat-label'>Total Revenue</div>
                    <div className='stat-value'>{stats?.totalRevenue.toLocaleString('vi-VN')}$</div>
                </div>

                <div className='stat-card orders'>
                    <div className='stat-icon'>📦</div>
                    <div className='stat-label'>Total Orders</div>
                    <div className='stat-value'>{stats?.totalOrders}</div>
                </div>

                <div className='stat-card customers'>
                    <div className='stat-icon'>👥</div>
                    <div className='stat-label'>Total Customers</div>
                    <div className='stat-value'>{stats?.totalCustomers}</div>
                </div>

                <div className='stat-card avg'>
                    <div className='stat-icon'>📈</div>
                    <div className='stat-label'>Avg Order Value</div>
                    <div className='stat-value'>{stats?.avgOrderValue.toLocaleString('vi-VN')}$</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className='charts-section'>
                <div className='chart-card'>
                    <h3>Revenue Over Time</h3>
                    <div className='period-selector'>
                        <button 
                            className={period === 'day' ? 'active' : ''}
                            onClick={() => setPeriod('day')}
                        >
                            Daily
                        </button>
                        <button 
                            className={period === 'week' ? 'active' : ''}
                            onClick={() => setPeriod('week')}
                        >
                            Weekly
                        </button>
                        <button 
                            className={period === 'month' ? 'active' : ''}
                            onClick={() => setPeriod('month')}
                        >
                            Monthly
                        </button>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={formatRevenueData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#4CAF50" strokeWidth={2} />
                            <Line type="monotone" dataKey="orders" stroke="#2196F3" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className='chart-card'>
                    <h3>Customer Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'New', value: customerAnalytics?.newCustomers || 0 },
                                    { name: 'Returning', value: customerAnalytics?.returningCustomers || 0 }
                                ]}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {[0, 1].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tables Section */}
            <div className='tables-section'>
                <div className='table-card'>
                    <h3>🏆 Top Selling Products</h3>
                    <table className='data-table'>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Sold</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.map((product, index) => (
                                <tr key={index}>
                                    <td>{product.name}</td>
                                    <td>{product.quantity}</td>
                                    <td>{product.revenue.toLocaleString('vi-VN')}$</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className='table-card'>
                    <h3>💎 Top Customers</h3>
                    <table className='data-table'>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Orders</th>
                                <th>Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerAnalytics?.topCustomers.slice(0, 5).map((customer, index) => (
                                <tr key={index}>
                                    <td>{customer.name}</td>
                                    <td>{customer.orderCount}</td>
                                    <td>{customer.totalSpent.toLocaleString('vi-VN')}$</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Export Section */}
            <div className='export-section'>
                <h3>📥 Export Data</h3>
                <div className='export-buttons'>
                    <button className='export-btn' onClick={() => handleExport('orders')}>
                        📦 Export Orders (CSV)
                    </button>
                    <button className='export-btn secondary' onClick={() => handleExport('customers')}>
                        👥 Export Customers (CSV)
                    </button>
                    <button className='export-btn' onClick={() => handleExport('products')}>
                        🍽️ Export Products (CSV)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
