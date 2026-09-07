import mongoose from "mongoose";

const promoSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true }, // percentage or fixed amount
    discountValue: { type: Number, required: true }, // percentage (1-100) or fixed amount
    minOrderAmount: { type: Number, default: 0 }, // Minimum order amount to use promo
    maxDiscount: { type: Number }, // Maximum discount for percentage type
    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const promoModel = mongoose.models.promo || mongoose.model("promo", promoSchema);
export default promoModel;
