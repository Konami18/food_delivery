import React, { useState, useEffect, useContext } from 'react';
import './Rewards.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';

const Rewards = () => {
    const { url, token } = useContext(StoreContext);
    const [userPoints, setUserPoints] = useState(0);
    const [rewardsInfo, setRewardsInfo] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user points and rewards info
    const fetchRewardsData = async () => {
        try {
            const [pointsRes, rewardsRes] = await Promise.all([
                axios.get(`${url}/api/loyalty/points`, {
                    headers: { token }
                }),
                axios.get(`${url}/api/loyalty/rewards`)
            ]);

            if (pointsRes.data.success) {
                setUserPoints(pointsRes.data.points);
            }

            if (rewardsRes.data.success) {
                setRewardsInfo(rewardsRes.data.rewards);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching rewards data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchRewardsData();
        }
    }, [token]);

    // Redeem points for discount
    const handleRedeem = async (pointsRequired, discount) => {
        if (userPoints < pointsRequired) return;

        try {
            const response = await axios.post(
                `${url}/api/loyalty/redeem`,
                { points: pointsRequired },
                { headers: { token } }
            );

            if (response.data.success) {
                alert(`Successfully redeemed ${pointsRequired} points for $${discount} discount! Promo code: ${response.data.promoCode}`);
                setUserPoints(response.data.remainingPoints);
            }
        } catch (error) {
            console.error("Redemption error:", error);
            alert(error.response?.data?.message || "Failed to redeem points");
        }
    };

    if (!token) {
        return (
            <div className='rewards-page'>
                <h2>Please login to view your rewards</h2>
            </div>
        );
    }

    if (loading) {
        return (
            <div className='rewards-page'>
                <h2>Loading...</h2>
            </div>
        );
    }

    return (
        <div className='rewards-page'>
            <h2>🎁 Loyalty Rewards</h2>

            {/* Points Banner */}
            <div className='points-banner'>
                <h3>Your Current Points</h3>
                <div className='points-value'>{userPoints}</div>
                <div className='points-equivalent'>
                    {userPoints >= 100 
                        ? `Worth $${Math.floor(userPoints / 100) * 5} in rewards!`
                        : `Earn ${100 - userPoints} more points to unlock your first reward`
                    }
                </div>
            </div>

            {/* How it Works */}
            <div className='how-it-works'>
                <h3>How It Works</h3>
                <ul>
                    <li>Earn 1 point for every $1 you spend</li>
                    <li>Points are automatically added after successful order payment</li>
                    <li>Redeem points for discount codes to use on future orders</li>
                    <li>Discount codes are valid for 30 days</li>
                    <li>Points never expire - save up for bigger rewards!</li>
                </ul>
            </div>

            {/* Rewards Grid */}
            <div className='rewards-grid'>
                {rewardsInfo.map((reward) => {
                    const isAvailable = userPoints >= reward.pointsRequired;
                    const progress = Math.min((userPoints / reward.pointsRequired) * 100, 100);

                    return (
                        <div 
                            key={reward.pointsRequired} 
                            className={`reward-card ${isAvailable ? 'available' : 'unavailable'}`}
                        >
                            {!isAvailable && <div className='lock-icon'>🔒</div>}
                            
                            <div className='reward-points'>{reward.pointsRequired}</div>
                            <div className='reward-points-label'>POINTS</div>
                            
                            <div className='reward-discount'>${reward.discount}</div>
                            
                            <div className={`reward-status ${isAvailable ? 'available' : 'locked'}`}>
                                {isAvailable ? '✓ Available' : 'Locked'}
                            </div>

                            {!isAvailable && (
                                <div className='progress-indicator'>
                                    <div className='progress-bar'>
                                        <div 
                                            className='progress-fill' 
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className='progress-text'>
                                        {reward.pointsRequired - userPoints} points to go
                                    </div>
                                </div>
                            )}

                            <button 
                                className='redeem-btn'
                                onClick={() => handleRedeem(reward.pointsRequired, reward.discount)}
                                disabled={!isAvailable}
                            >
                                {isAvailable ? 'Redeem Now' : 'Not Yet'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Rewards;
