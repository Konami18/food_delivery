import reviewModel from "../../models/product/reviewModel.js";
import foodModel from "../../models/product/foodModel.js";
import userModel from "../../models/user/userModel.js";

// Add a review
const addReview = async (req, res) => {
    try {
        const { foodId, rating, comment } = req.body;
        const userId = req.body.userId;

        // Get user info
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Check if food exists
        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.json({ success: false, message: "Food not found" });
        }

        // Handle uploaded images
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.filename);
        }

        const newReview = new reviewModel({
            foodId,
            userId,
            userName: user.name,
            rating: Number(rating),
            comment,
            images
        });

        await newReview.save();
        res.json({ success: true, message: "Review added successfully", data: newReview });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding review" });
    }
};

// Get reviews for a specific food item
const getFoodReviews = async (req, res) => {
    try {
        const { foodId } = req.params;
        const reviews = await reviewModel.find({ foodId }).sort({ createdAt: -1 });
        
        // Calculate average rating
        let avgRating = 0;
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            avgRating = (totalRating / reviews.length).toFixed(1);
        }

        res.json({ 
            success: true, 
            data: reviews,
            averageRating: avgRating,
            totalReviews: reviews.length
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
};

// Get all reviews (for admin)
const getAllReviews = async (req, res) => {
    try {
        const reviews = await reviewModel.find({})
            .populate('foodId', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: reviews });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.body;
        await reviewModel.findByIdAndDelete(reviewId);
        res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting review" });
    }
};

// Update food model with average rating
const updateFoodRating = async (foodId) => {
    try {
        const reviews = await reviewModel.find({ foodId });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const avgRating = totalRating / reviews.length;
            
            await foodModel.findByIdAndUpdate(foodId, { 
                averageRating: avgRating.toFixed(1),
                totalReviews: reviews.length 
            });
        }
    } catch (error) {
        console.log("Error updating food rating:", error);
    }
};

// Mark review as helpful
const markHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.body.userId;

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        // Check if user already voted
        const alreadyVoted = review.votedBy.includes(userId);
        
        if (alreadyVoted) {
            // Remove vote
            review.votedBy = review.votedBy.filter(id => id.toString() !== userId);
            review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
        } else {
            // Add vote
            review.votedBy.push(userId);
            review.helpfulVotes += 1;
        }

        await review.save();
        res.json({ 
            success: true, 
            message: alreadyVoted ? "Vote removed" : "Marked as helpful",
            helpfulVotes: review.helpfulVotes,
            voted: !alreadyVoted
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error marking helpful" });
    }
};

// Admin reply to review
const addAdminReply = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { message, adminName } = req.body;

        const review = await reviewModel.findByIdAndUpdate(
            reviewId,
            {
                adminReply: {
                    message,
                    repliedAt: new Date(),
                    repliedBy: adminName || "Admin"
                }
            },
            { new: true }
        );

        if (!review) {
            return res.json({ success: false, message: "Review not found" });
        }

        res.json({ success: true, message: "Reply added successfully", data: review });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding reply" });
    }
};

// Get reviews with filters and sorting
const getReviewsFiltered = async (req, res) => {
    try {
        const { foodId } = req.params;
        const { sortBy, rating } = req.query;

        let query = { foodId };
        
        // Filter by rating if provided
        if (rating && rating !== 'all') {
            query.rating = Number(rating);
        }

        let reviews = await reviewModel.find(query);

        // Sort reviews
        switch (sortBy) {
            case 'helpful':
                reviews.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
                break;
            case 'rating-high':
                reviews.sort((a, b) => b.rating - a.rating);
                break;
            case 'rating-low':
                reviews.sort((a, b) => a.rating - b.rating);
                break;
            case 'newest':
            default:
                reviews.sort((a, b) => b.createdAt - a.createdAt);
                break;
        }

        // Calculate average rating
        let avgRating = 0;
        const allReviews = await reviewModel.find({ foodId });
        if (allReviews.length > 0) {
            const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
            avgRating = (totalRating / allReviews.length).toFixed(1);
        }

        res.json({ 
            success: true, 
            data: reviews,
            averageRating: avgRating,
            totalReviews: allReviews.length
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching reviews" });
    }
};

export { 
    addReview, 
    getFoodReviews, 
    getAllReviews, 
    deleteReview, 
    updateFoodRating,
    markHelpful,
    addAdminReply,
    getReviewsFiltered
};
