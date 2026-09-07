import React, { useState, useEffect } from 'react';
import './Reviews.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Reviews = ({ url }) => {
    const [reviews, setReviews] = useState([]);
    const [replyText, setReplyText] = useState({});

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`${url}/api/review/all`);
            if (response.data.success) {
                setReviews(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Failed to fetch reviews");
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleReplyChange = (reviewId, text) => {
        setReplyText(prev => ({ ...prev, [reviewId]: text }));
    };

    const handleAddReply = async (reviewId) => {
        const message = replyText[reviewId];
        if (!message || message.trim() === '') {
            toast.error("Please enter a reply message");
            return;
        }

        try {
            const response = await axios.post(
                `${url}/api/review/reply/${reviewId}`,
                { message, adminName: "Restaurant Admin" }
            );

            if (response.data.success) {
                toast.success("Reply added successfully!");
                setReplyText(prev => ({ ...prev, [reviewId]: '' }));
                fetchReviews();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error adding reply:", error);
            toast.error("Failed to add reply");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            const response = await axios.post(
                `${url}/api/review/delete`,
                { reviewId }
            );

            if (response.data.success) {
                toast.success("Review deleted successfully!");
                fetchReviews();
            }
        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Failed to delete review");
        }
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className='reviews-management'>
            <h2>⭐ Reviews Management</h2>

            <div className='reviews-list'>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review._id} className='review-card'>
                            <div className='review-card-header'>
                                <div className='review-user-info'>
                                    <span className='review-user-name'>{review.userName}</span>
                                    <span className='review-food-name'>
                                        {review.foodId?.name || 'Food Item'}
                                    </span>
                                    <span className='review-date'>{formatDate(review.createdAt)}</span>
                                </div>
                                <div className='review-rating'>{renderStars(review.rating)}</div>
                            </div>

                            <div className='review-content'>
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

                                <div className='review-stats'>
                                    <span>👍 {review.helpfulVotes || 0} helpful votes</span>
                                    {review.verified && <span>✓ Verified Purchase</span>}
                                </div>
                            </div>

                            <div className='admin-reply-section'>
                                {review.adminReply && review.adminReply.message ? (
                                    <div className='existing-reply'>
                                        <strong>Your Response:</strong>
                                        <p>{review.adminReply.message}</p>
                                        <small>Replied on {formatDate(review.adminReply.repliedAt)}</small>
                                    </div>
                                ) : (
                                    <>
                                        <h4>Add Response:</h4>
                                        <div className='reply-form'>
                                            <textarea
                                                value={replyText[review._id] || ''}
                                                onChange={(e) => handleReplyChange(review._id, e.target.value)}
                                                placeholder="Thank you for your review! We appreciate your feedback..."
                                            />
                                            <button onClick={() => handleAddReply(review._id)}>
                                                Send Response
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button 
                                className='delete-btn'
                                onClick={() => handleDeleteReview(review._id)}
                            >
                                Delete Review
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        No reviews yet
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;
