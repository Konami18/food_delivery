import React, { useState, useEffect, useContext } from 'react';
import './FlashSaleBanner.css';
import { StoreContext } from '../../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FlashSaleBanner = () => {
    const { url } = useContext(StoreContext);
    const navigate = useNavigate();
    const [flashSales, setFlashSales] = useState([]);
    const [currentSale, setCurrentSale] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState({});

    // Fetch active flash sales
    useEffect(() => {
        const fetchFlashSales = async () => {
            try {
                const response = await axios.get(`${url}/api/flashsale/active`);
                if (response.data.success && response.data.data.length > 0) {
                    setFlashSales(response.data.data);
                    setCurrentSale(response.data.data[0]); // Show first/highest priority sale
                }
            } catch (error) {
                console.error("Error fetching flash sales:", error);
            }
        };

        fetchFlashSales();
        // Refresh every 30 seconds
        const interval = setInterval(fetchFlashSales, 30000);
        return () => clearInterval(interval);
    }, [url]);

    // Countdown timer
    useEffect(() => {
        if (!currentSale) return;

        const calculateTimeRemaining = () => {
            const now = new Date().getTime();
            const endTime = new Date(currentSale.endTime).getTime();
            const difference = endTime - now;

            if (difference <= 0) {
                setTimeRemaining({ expired: true });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeRemaining({ days, hours, minutes, seconds, expired: false });
        };

        calculateTimeRemaining();
        const timer = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(timer);
    }, [currentSale]);

    const handleItemClick = (foodId) => {
        navigate(`/food/${foodId}`);
    };

    if (!currentSale || timeRemaining.expired) {
        return null; // Don't show banner if no active sales
    }

    return (
        <div className='flash-sale-banner'>
            <div className='flash-sale-content'>
                <div className='flash-sale-header'>
                    <div className='flash-sale-title'>
                        <span className='flash-icon'>⚡</span>
                        <div>
                            <h2>{currentSale.title || 'Flash Sale'}</h2>
                            <p>{currentSale.description || `Get up to ${currentSale.discountPercent}% OFF!`}</p>
                        </div>
                    </div>

                    <div className='countdown-timer'>
                        <div className='countdown-label'>Ends in:</div>
                        <div className='countdown-time'>
                            {timeRemaining.days > 0 && (
                                <div className='time-unit'>
                                    <span className='time-value'>{String(timeRemaining.days).padStart(2, '0')}</span>
                                    <span className='time-label'>Days</span>
                                </div>
                            )}
                            <div className='time-unit'>
                                <span className='time-value'>{String(timeRemaining.hours || 0).padStart(2, '0')}</span>
                                <span className='time-label'>Hours</span>
                            </div>
                            <div className='time-unit'>
                                <span className='time-value'>{String(timeRemaining.minutes || 0).padStart(2, '0')}</span>
                                <span className='time-label'>Mins</span>
                            </div>
                            <div className='time-unit'>
                                <span className='time-value'>{String(timeRemaining.seconds || 0).padStart(2, '0')}</span>
                                <span className='time-label'>Secs</span>
                            </div>
                        </div>
                    </div>
                </div>

                {currentSale.foodItems && currentSale.foodItems.length > 0 ? (
                    <div className='flash-sale-items'>
                        {currentSale.foodItems.map((item) => {
                            const discountedPrice = (item.price * (1 - currentSale.discountPercent / 100)).toFixed(2);
                            
                            return (
                                <div 
                                    key={item._id} 
                                    className='flash-item-card'
                                    onClick={() => handleItemClick(item._id)}
                                >
                                    <div className='discount-badge'>-{currentSale.discountPercent}%</div>
                                    <img 
                                        src={`${url}/images/${item.image}`} 
                                        alt={item.name}
                                        className='flash-item-image'
                                    />
                                    <div className='flash-item-info'>
                                        <div className='flash-item-name'>{item.name}</div>
                                        <div className='flash-item-prices'>
                                            <span className='original-price'>{item.price.toLocaleString('vi-VN')}$</span>
                                            <span className='sale-price'>{discountedPrice.toLocaleString('vi-VN')}$</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className='no-flash-sale'>
                        <p> Amazing deals coming soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlashSaleBanner;
