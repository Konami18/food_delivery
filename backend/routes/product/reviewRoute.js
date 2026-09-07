import express from "express";
import { 
    addReview, 
    getFoodReviews, 
    getAllReviews, 
    deleteReview,
    markHelpful,
    addAdminReply,
    getReviewsFiltered
} from "../../controllers/products-management/reviewController.js";
import authMiddleware from "../../middleware/auth.js";
import multer from "multer";

const reviewRouter = express.Router();

// Image storage configuration for review images
const storage = multer.diskStorage({
    destination: "uploads/reviews",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Add review (requires authentication)
reviewRouter.post("/add", authMiddleware, upload.array("images", 5), addReview);

// Get reviews for a specific food
reviewRouter.get("/food/:foodId", getFoodReviews);

// Get reviews with filters
reviewRouter.get("/food/:foodId/filtered", getReviewsFiltered);

// Mark review as helpful (requires authentication)
reviewRouter.post("/helpful/:reviewId", authMiddleware, markHelpful);

// Admin reply to review
reviewRouter.post("/reply/:reviewId", addAdminReply);

// Get all reviews (admin)
reviewRouter.get("/all", getAllReviews);

// Delete review (admin)
reviewRouter.post("/delete", deleteReview);

export default reviewRouter;
