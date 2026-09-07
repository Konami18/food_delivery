import React, { useState, useEffect, useContext } from 'react';
import './Recommendations.css';
import { StoreContext } from '../../../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Recommendations = ({ type = 'personalized', foodId = null }) => {
    const { url, token } = useContext(StoreContext);
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, [type, foodId, token]);

    const fetchRecommendations = async () => {
        try {
            let response;

            switch (type) {
                case 'personalized':
                    if (!token) {
                        // If not logged in, show trending
                        response = await axios.get(`${url}/api/recommendation/trending`);
                    } else {
                        response = await axios.post(
                            `${url}/api/recommendation/personalized`,
                            {},
                            { headers: { token } }
                        );
                    }
                    break;

                case 'trending':
                    response = await axios.get(`${url}/api/recommendation/trending`);
                    break;

                case 'similar':
                    if (foodId) {
                        response = await axios.get(`${url}/api/recommendation/similar/${foodId}`);
                    }
                    break;

                case 'frequently-bought':
                    if (foodId) {
                        response = await axios.get(`${url}/api/recommendation/frequently-bought/${foodId}`);
                    }
                    break;

                default:
                    response = await axios.get(`${url}/api/recommendation/trending`);
            }

            if (response?.data.success) {
                setRecommendations(response.data.data);
                setReason(response.data.reason || '');
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            setLoading(false);
        }
    };

    const handleItemClick = (id) => {
        navigate(`/food/${id}`);
    };

    const getTitle = () => {
        switch (type) {
            case 'personalized':
                return token ? ' Recommended For You' : ' Trending Now';
            case 'trending':
                return ' Trending Now';
            case 'similar':
                return ' You Might Also Like';
            case 'frequently-bought':
                return ' Frequently Bought Together';
            default:
                return ' Recommendations';
        }
    };

    if (loading) {
        return (
            <div className='recommendations-section'>
                <h3>{getTitle()}</h3>
                <div className='loading-recommendations'>Loading recommendations...</div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div className='recommendations-section'>
            <h3>
                {getTitle()}
                {reason && <span className='recommendation-reason'>({reason})</span>}
            </h3>

            <div className='recommendations-grid'>
                {recommendations.map((item) => (
                    <div
                        key={item._id}
                        className='recommendation-card'
                        onClick={() => handleItemClick(item._id)}
                    >
                        <img
                            src={`${url}/images/${item.image}`}
                            alt={item.name}
                            className='recommendation-image'
                        />
                        <div className='recommendation-info'>
                            <div className='recommendation-name'>{item.name}</div>
                            <div className='recommendation-category'>{item.category}</div>
                            <div className='recommendation-price'>{item.price.toLocaleString('vi-VN')}$</div>
                            {item.averageRating && (
                                <div className='recommendation-rating'>
                                    ⭐ {item.averageRating} ({item.totalReviews || 0})x
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Recommendations;
