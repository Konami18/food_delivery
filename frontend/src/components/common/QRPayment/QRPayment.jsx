import React, { useState, useEffect } from 'react';
import './QRPayment.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const QRPayment = ({ qrCode, paymentInfo, orderId, url, token }) => {
    const [countdown, setCountdown] = useState(600); // 10 minutes
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleCancel();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatUSD = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const handleConfirmPayment = async () => {
        try {
            const response = await axios.post(
                `${url}/api/order/verify`,
                { orderId, success: "true" },
                { headers: { token } }
            );
            
            if (response.data.success) {
                navigate(`/verify?success=true&orderId=${orderId}`);
            }
        } catch (error) {
            console.error("Payment verification error:", error);
            alert("Lỗi xác nhận thanh toán");
        }
    };

    const handleCancel = async () => {
        try {
            await axios.post(
                `${url}/api/order/verify`,
                { orderId, success: "false" },
                { headers: { token } }
            );
            navigate('/cart');
        } catch (error) {
            console.error("Cancel error:", error);
            navigate('/cart');
        }
    };

    return (
        <div className='qr-payment-modal'>
            <div className='qr-payment-container'>
                <div className='qr-header'>
                    <h2>🏦 Scan QR Code to Pay</h2>
                    <div className='countdown'>
                        <span>⏱️ Time Remaining: </span>
                        <strong>{formatTime(countdown)}</strong>
                    </div>
                </div>

                <div className='qr-body'>
                    <div className='qr-code-section'>
                        <img src={qrCode} alt="QR Code" className='qr-image' />
                        <p className='qr-instruction'>
                            Open your banking app and scan the QR code
                        </p>
                    </div>

                    <div className='payment-details'>
                        <h3>📋 Payment Information</h3>
                        <div className='detail-row'>
                            <span className='label'>Bank:</span>
                            <span className='value'>{paymentInfo.bankName}</span>
                        </div>
                        <div className='detail-row'>
                            <span className='label'>Account Number:</span>
                            <span className='value'>{paymentInfo.accountNumber}</span>
                        </div>
                        <div className='detail-row'>
                            <span className='label'>Account Holder:</span>
                            <span className='value'>{paymentInfo.accountName}</span>
                        </div>
                        <div className='detail-row highlight'>
                            <span className='label'>Amount:</span>
                            <span className='value amount'>{formatUSD(paymentInfo.amount)}</span>
                        </div>
                        <div className='detail-row'>
                            <span className='label'>Content:</span>
                            <span className='value'>{paymentInfo.content}</span>
                        </div>
                    </div>

                    <div className='qr-note'>
                        <p>⚠️ <strong>Lưu ý:</strong>Please write the correct transfer content for the fastest order processing!</p>
                    </div>
                </div>

                <div className='qr-actions'>
                    <button className='btn-confirm' onClick={handleConfirmPayment}>
                        ✅ Payment Completed
                    </button>
                    <button className='btn-cancel' onClick={handleCancel}>
                        ❌ Cancel Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRPayment;
