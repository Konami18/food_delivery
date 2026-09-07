import mongoose from "mongoose";

const flashSaleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    foodItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'food' }], // Specific items on sale
    isActive: { type: Boolean, default: true },
    bannerImage: { type: String }, // Optional banner image URL
    priority: { type: Number, default: 0 } // Higher priority shows first
}, { timestamps: true });

// Index for efficient queries
flashSaleSchema.index({ startTime: 1, endTime: 1, isActive: 1 });

// Virtual to check if sale is currently active
flashSaleSchema.virtual('isLive').get(function() {
    const now = new Date();
    return this.isActive && now >= this.startTime && now <= this.endTime;
});

const flashSaleModel = mongoose.models.flashSale || mongoose.model("flashSale", flashSaleSchema);
export default flashSaleModel;
