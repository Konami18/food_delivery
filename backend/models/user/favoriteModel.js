import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'foods', required: true },
    addedAt: { type: Date, default: Date.now }
});

// Create compound index to prevent duplicate favorites
favoriteSchema.index({ userId: 1, foodId: 1 }, { unique: true });

const favoriteModel = mongoose.models.favorite || mongoose.model("favorite", favoriteSchema);
export default favoriteModel;
