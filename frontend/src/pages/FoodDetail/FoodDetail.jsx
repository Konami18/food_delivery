import React, { useContext, useEffect, useState } from 'react';
import './FoodDetail.css';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import ReviewSection from '../../components/features/ReviewSection/ReviewSection';
import Recommendations from '../../components/features/recommendations/Recommendations/Recommendations';

const FoodDetail = ({ setShowLogin }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { food_list, cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);
    const [food, setFood] = useState(null);

    useEffect(() => {
        const foundFood = food_list.find(item => item._id === id);
        setFood(foundFood);
    }, [id, food_list]);

    if (!food) {
        return <div className='food-detail'>Loading...</div>;
    }

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
    };

    return (
        <div className='food-detail'>
            <span className='back-button' onClick={() => navigate(-1)}>
                ← Back to Menu
            </span>
            
            <div className='food-detail-container'>
                <div>
                    <img 
                        className='food-detail-image' 
                        src={url + "/images/" + food.image} 
                        alt={food.name} 
                    />
                </div>
                
                <div className='food-detail-info'>
                    <div className='food-detail-header'>
                        <h2>{food.name}</h2>
                        
                        {food.averageRating > 0 && (
                            <div className='food-rating'>
                                <span className='stars'>{renderStars(food.averageRating)}</span>
                                <span className='rating-text'>
                                    {food.averageRating} ({food.totalReviews} reviews)
                                </span>
                            </div>
                        )}
                        
                        <span className='food-detail-category'>{food.category}</span>
                    </div>
                    
                    <p className='food-detail-description'>{food.description}</p>
                    
                    <div className='food-detail-price'>{food.price.toLocaleString('vi-VN')}$</div>
                    
                    <div className='food-detail-actions'>
                        {!cartItems[id] ? (
                            <button 
                                className='add-to-cart-btn' 
                                onClick={() => addToCart(id)}
                            >
                                Add to Cart
                            </button>
                        ) : (
                            <div className='food-detail-counter'>
                                <img 
                                    onClick={() => removeFromCart(id)} 
                                    src={assets.remove_icon_red} 
                                    alt="Remove" 
                                />
                                <p>{cartItems[id]}</p>
                                <img 
                                    onClick={() => addToCart(id)} 
                                    src={assets.add_icon_green} 
                                    alt="Add" 
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ReviewSection foodId={id} setShowLogin={setShowLogin} />
            
            <Recommendations type="similar" foodId={id} />
            <Recommendations type="frequently-bought" foodId={id} />
        </div>
    );
};

export default FoodDetail;
