import React, { useState, useEffect, useContext } from 'react';
import './OrderTracking.css';
import { StoreContext } from '../../context/StoreContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderTracking = () => {
    const { orderId } = useParams();
    const { url, token } = useContext(StoreContext);
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }

        const fetchOrderTracking = async () => {
            try {
                const response = await axios.get(
                    `${url}/api/order/tracking/${orderId}`,
                    { headers: { token } }
                );

                if (response.data.success) {
                    setOrder(response.data.data);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching order tracking:", error);
                setLoading(false);
            }
        };

        fetchOrderTracking();
        // Refresh every 30 seconds
        const interval = setInterval(fetchOrderTracking, 30000);
        return () => clearInterval(interval);
    }, [orderId, token, url, navigate]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeRemaining = (estimatedDelivery) => {
        const now = new Date();
        const delivery = new Date(estimatedDelivery);
        const diff = delivery - now;

        if (diff <= 0) return "Arriving soon";

        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes} minutes`;

        const hours = Math.floor(minutes / 60);
        const remainingMins = minutes % 60;
        return `${hours}h ${remainingMins}m`;
    };

    const getStatusIndex = (status) => {
        const statuses = ["Order Placed", "Food Processing", "Out for delivery", "Delivered"];
        return statuses.indexOf(status);
    };

    if (loading) {
        return (
            <div className='order-tracking'>
                <h2>Loading...</h2>
            </div>
        );
    }

    if (!order) {
        return (
            <div className='order-tracking'>
                <h2>Order not found</h2>
            </div>
        );
    }

    const currentStatusIndex = getStatusIndex(order.status);

    return (
        <div className='order-tracking'>
            <div className='tracking-header'>
                <h2>Track Your Order</h2>
                <p>Order ID: {orderId.slice(-8).toUpperCase()}</p>

                <div className='order-info'>
                    <div className='info-item'>
                        <span className='info-label'>Order Date</span>
                        <span className='info-value'>{formatDate(order.date)}</span>
                    </div>
                    <div className='info-item'>
                        <span className='info-label'>Total Amount</span>
                        <span className='info-value'>{order.amount.toLocaleString('vi-VN')}$</span>
                    </div>
                    <div className='info-item'>
                        <span className='info-label'>Payment Status</span>
                        <span className='info-value'>{order.payment ? '✓ Paid' : 'Pending'}</span>
                    </div>
                </div>

                {order.estimatedDelivery && order.status !== "Delivered" && (
                    <div className='estimated-time'>
                        <div>Estimated Delivery</div>
                        <strong>{getTimeRemaining(order.estimatedDelivery)}</strong>
                    </div>
                )}
            </div>

            {order.deliveryPerson && order.deliveryPerson.name && (
                <div className='delivery-person-card'>
                    <h3>🛵 Delivery Person</h3>
                    <div className='delivery-person-info'>
                        <div className='info-item'>
                            <span className='info-label'>Name</span>
                            <span className='info-value'>{order.deliveryPerson.name}</span>
                        </div>
                        <div className='info-item'>
                            <span className='info-label'>Phone</span>
                            <span className='info-value'>{order.deliveryPerson.phone}</span>
                        </div>
                        <div className='info-item'>
                            <span className='info-label'>Vehicle</span>
                            <span className='info-value'>{order.deliveryPerson.vehicle}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className='timeline'>
                <h3>Order Timeline</h3>
                <div className='timeline-track'>
                    {order.statusHistory && order.statusHistory.length > 0 ? (
                        order.statusHistory.map((item, index) => {
                            const isActive = item.status === order.status;
                            const isCompleted = getStatusIndex(item.status) < currentStatusIndex;

                            return (
                                <div 
                                    key={index} 
                                    className={`timeline-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                >
                                    <div className='timeline-dot'></div>
                                    <div className='timeline-content'>
                                        <div className='timeline-status'>{item.status}</div>
                                        <div className='timeline-note'>{item.note}</div>
                                        <div className='timeline-time'>{formatDate(item.timestamp)}</div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className='timeline-item active'>
                            <div className='timeline-dot'></div>
                            <div className='timeline-content'>
                                <div className='timeline-status'>{order.status}</div>
                                <div className='timeline-time'>{formatDate(order.date)}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className='order-items-section'>
                <h3>Order Items</h3>
                {order.items.map((item, index) => (
                    <div key={index} className='order-item'>
                        <div>
                            <span className='item-name'>{item.name}</span>
                            <span className='item-quantity'>x {item.quantity}</span>
                        </div>
                        <span className='item-price'>{(item.price * item.quantity).toLocaleString('vi-VN')}$</span>
                    </div>
                ))}
                <div className='order-total'>
                    <span>Total</span>
                    <span>{order.amount.toLocaleString('vi-VN')}$</span>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
