import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import axios from 'axios';

const Dashboard = ({ url }) => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch orders
            const ordersResponse = await axios.get(`${url}/api/order/list`);
            if (ordersResponse.data.success) {
                const orders = ordersResponse.data.data;
                
                // Calculate total revenue
                const revenue = orders.reduce((sum, order) => {
                    return order.payment ? sum + order.amount : sum;
                }, 0);

                // Get recent orders (last 5)
                const recent = orders.slice(0, 5);

                // Calculate top products
                const productSales = {};
                orders.forEach(order => {
                    if (order.payment) {
                        order.items.forEach(item => {
                            if (productSales[item._id]) {
                                productSales[item._id].quantity += item.quantity;
                            } else {
                                productSales[item._id] = {
                                    ...item,
                                    totalQuantity: item.quantity
                                };
                            }
                        });
                    }
                });

                const topProds = Object.values(productSales)
                    .sort((a, b) => b.totalQuantity - a.totalQuantity)
                    .slice(0, 5);

                setStats({
                    totalRevenue: revenue,
                    totalOrders: orders.length,
                    totalCustomers: new Set(orders.map(o => o.userId)).size,
                    totalProducts: 0 // Will be updated from food list
                });

                setRecentOrders(recent);
                setTopProducts(topProds);
            }

            // Fetch food products count
            const foodResponse = await axios.get(`${url}/api/food/list`);
            if (foodResponse.data.success) {
                setStats(prev => ({
                    ...prev,
                    totalProducts: foodResponse.data.data.length
                }));
            }

        } catch (error) {
            console.log("Error fetching dashboard data:", error);
        }
    };

    const getStatusColor = (status) => {
        if (status === "Delivered") return "delivered";
        if (status === "Food Processing") return "pending";
        return "";
    };

    return (
        <div className='dashboard'>
            <h2>Dashboard</h2>

            <div className='dashboard-stats'>
                <div className='stat-card'>
                    <h3>Total Revenue</h3>
                    <div className='stat-value'>${stats.totalRevenue.toFixed(2)}</div>
                    <div className='stat-change'>All time</div>
                </div>

                <div className='stat-card'>
                    <h3>Total Orders</h3>
                    <div className='stat-value'>{stats.totalOrders}</div>
                    <div className='stat-change'>All orders</div>
                </div>

                <div className='stat-card'>
                    <h3>Customers</h3>
                    <div className='stat-value'>{stats.totalCustomers}</div>
                    <div className='stat-change'>Unique customers</div>
                </div>

                <div className='stat-card'>
                    <h3>Products</h3>
                    <div className='stat-value'>{stats.totalProducts}</div>
                    <div className='stat-change'>In menu</div>
                </div>
            </div>

            <div className='dashboard-charts'>
                <div className='recent-orders'>
                    <h3>Recent Orders</h3>
                    <div className='order-list'>
                        {recentOrders.map((order, index) => (
                            <div key={index} className={`order-item-dash ${getStatusColor(order.status)}`}>
                                <div>
                                    <div className='order-id'>Order #{order._id.slice(-6)}</div>
                                    <div style={{fontSize: '13px', color: '#666'}}>
                                        {order.address.firstName} {order.address.lastName}
                                    </div>
                                </div>
                                <div className='order-amount'>{order.amount.toLocaleString('vi-VN')}$</div>
                                <div className='order-status-dash'>{order.status}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='top-products'>
                    <h3>Top Selling</h3>
                    <div className='product-list'>
                        {topProducts.map((product, index) => (
                            <div key={index} className='product-item'>
                                <img src={`${url}/images/${product.image}`} alt={product.name} />
                                <div className='product-info'>
                                    <h4>{product.name}</h4>
                                    <p>{product.totalQuantity} sold</p>
                                </div>
                                <div className='product-sales'>
                                    ${(product.price * product.totalQuantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
