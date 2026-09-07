import React, { useState, useEffect, useContext } from 'react';
import './ReviewSection.css';
import { StoreContext } from '../../../context/StoreContext';
import axios from 'axios';

const ReviewSection = ({ foodId, setShowLogin }) => {
    const { url, token } = useContext(StoreContext);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [sortBy, setSortBy] = useState('newest');
    const [filterRating, setFilterRating] = useState('all');

    const fetchReviews = async () => {
        try {
            const response = await axios.get(
                `${url}/api/review/food/${foodId}/filtered?sortBy=${sortBy}&rating=${filterRating}`
            );
            if (response.data.success) {
                setReviews(response.data.data);
                setAverageRating(response.data.averageRating);
                setTotalReviews(response.data.totalReviews);
            }
        } catch (error) {
            console.log("Error fetching reviews:", error);
        }
    };

    useEffect(() => {
        if (foodId) {
            fetchReviews();
        }
    }, [foodId, sortBy, filterRating]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!token) {
            setShowLogin(true);
            return;
        }

        if (rating === 0) {
            alert("Please select a rating");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('foodId', foodId);
            formData.append('rating', rating);
            formData.append('comment', comment);
            
            if (images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    formData.append('images', images[i]);
                }
            }

            const response = await axios.post(`${url}/api/review/add`, formData, {
                headers: { token }
            });

            if (response.data.success) {
                alert("Review added successfully!");
                setRating(0);
                setComment('');
                setImages([]);
                document.getElementById('review-images').value = '';
                fetchReviews();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.log("Error submitting review:", error);
            alert("Failed to submit review");
        }
    };

    const renderStars = (count) => {
        return '★'.repeat(count) + '☆'.repeat(5 - count);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const handleMarkHelpful = async (reviewId) => {
        if (!token) {
            setShowLogin(true);
            return;
        }

        try {
            const response = await axios.post(
                `${url}/api/review/helpful/${reviewId}`,
                {},
                { headers: { token } }
            );

            if (response.data.success) {
                fetchReviews();
            }
        } catch (error) {
            console.log("Error marking helpful:", error);
        }
    };

    return (
        <div className='review-section'>
            <h3>Ratings & Reviews</h3>

            {totalReviews > 0 && (
                <div className='rating-summary'>
                    <div className='avg-rating'>{averageRating}</div>
                    <div>
                        <div className='stars'>{renderStars(Math.round(averageRating))}</div>
                        <div className='total-reviews'>{totalReviews} reviews</div>
                    </div>
                </div>
            )}

            <div className='review-filters'>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="helpful">Most Helpful</option>
                    <option value="rating-high">Highest Rating</option>
                    <option value="rating-low">Lowest Rating</option>
                </select>

                <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>

            {token ? (
                <div className='add-review-form'>
                    <h4>Write a Review</h4>
                    <form onSubmit={handleSubmitReview}>
                        <div className='rating-input'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <textarea
                            placeholder='Share your experience with this dish...'
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                        />
                        <input
                            type="file"
                            id="review-images"
                            accept="image/*"
                            multiple
                            onChange={(e) => setImages([...e.target.files])}
                        />
                        <button type='submit'>Submit Review</button>
                    </form>
                </div>
            ) : (
                <div className='login-prompt'>
                    <p>Please login to write a review</p>
                    <button onClick={() => setShowLogin(true)}>Login</button>
                </div>
            )}

            <div className='review-list'>
                {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <div key={index} className='review-item'>
                            <div className='review-header'>
                                <div className='review-user-info'>
                                    <span className='review-user-name'>{review.userName}</span>
                                    <span className='review-date'>{formatDate(review.createdAt)}</span>
                                </div>
                                <div className='review-rating'>{renderStars(review.rating)}</div>
                            </div>
                            <p className='review-comment'>{review.comment}</p>
                            {review.images && review.images.length > 0 && (
                                <div className='review-images'>
                                    {review.images.map((img, idx) => (
                                        <img 
                                            key={idx} 
                                            src={`${url}/images/${img}`} 
                                            alt="Review" 
                                        />
                                    ))}
                                </div>
                            )}

                            <div className='review-actions'>
                                <button 
                                    className='helpful-btn'
                                    onClick={() => handleMarkHelpful(review._id)}
                                >
                                    👍 Helpful ({review.helpfulVotes || 0})
                                </button>
                            </div>

                            {review.adminReply && (
                                <div className='admin-reply'>
                                    <strong>Restaurant Response:</strong>
                                    <p>{review.adminReply.message}</p>
                                    <small>{formatDate(review.adminReply.repliedAt)}</small>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className='no-reviews'>
                        <p>No reviews yet. Be the first to review!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
