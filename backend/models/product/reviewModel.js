import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'foods', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [{ type: String }], // Array of image URLs
    helpfulVotes: { type: Number, default: 0 }, // Helpful count
    votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // Users who voted
    adminReply: {
        message: { type: String },
        repliedAt: { type: Date },
        repliedBy: { type: String }
    },
    verified: { type: Boolean, default: false }, // Verified purchase
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);
export default reviewModel;
