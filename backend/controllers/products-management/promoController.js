import promoModel from "../../models/product/promoModel.js";

// Add new promo code (Admin)
const addPromo = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, validFrom, validUntil, description } = req.body;

        // Check if code already exists
        const existingPromo = await promoModel.findOne({ code: code.toUpperCase() });
        if (existingPromo) {
            return res.json({ success: false, message: "Promo code already exists" });
        }

        const newPromo = new promoModel({
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxDiscount: maxDiscount || null,
            usageLimit: usageLimit || null,
            validFrom: new Date(validFrom),
            validUntil: new Date(validUntil),
            description: description || ""
        });

        await newPromo.save();
        res.json({ success: true, message: "Promo code created successfully", data: newPromo });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error creating promo code" });
    }
};

// Validate and apply promo code
const validatePromo = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        const promo = await promoModel.findOne({ code: code.toUpperCase() });

        if (!promo) {
            return res.json({ success: false, message: "Invalid promo code" });
        }

        // Check if promo is active
        if (!promo.isActive) {
            return res.json({ success: false, message: "Promo code is not active" });
        }

        // Check validity dates
        const now = new Date();
        if (now < promo.validFrom) {
            return res.json({ success: false, message: "Promo code is not yet valid" });
        }
        if (now > promo.validUntil) {
            return res.json({ success: false, message: "Promo code has expired" });
        }

        // Check usage limit
        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
            return res.json({ success: false, message: "Promo code usage limit reached" });
        }

        // Check minimum order amount
        if (orderAmount < promo.minOrderAmount) {
            return res.json({ 
                success: false, 
                message: `Minimum order amount is $${promo.minOrderAmount}` 
            });
        }

        // Calculate discount
        let discount = 0;
        if (promo.discountType === 'percentage') {
            discount = (orderAmount * promo.discountValue) / 100;
            if (promo.maxDiscount && discount > promo.maxDiscount) {
                discount = promo.maxDiscount;
            }
        } else {
            discount = promo.discountValue;
        }

        res.json({ 
            success: true, 
            message: "Promo code applied successfully",
            discount: discount,
            promoData: {
                code: promo.code,
                discountType: promo.discountType,
                discountValue: promo.discountValue,
                description: promo.description
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error validating promo code" });
    }
};

// Apply promo code (increment usage count)
const applyPromo = async (req, res) => {
    try {
        const { code } = req.body;
        
        const promo = await promoModel.findOne({ code: code.toUpperCase() });
        if (promo) {
            promo.usedCount += 1;
            await promo.save();
        }

        res.json({ success: true });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error applying promo code" });
    }
};

// Get all promo codes (Admin)
const getAllPromos = async (req, res) => {
    try {
        const promos = await promoModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: promos });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching promo codes" });
    }
};

// Update promo code (Admin)
const updatePromo = async (req, res) => {
    try {
        const { id, ...updateData } = req.body;
        
        if (updateData.code) {
            updateData.code = updateData.code.toUpperCase();
        }

        const updatedPromo = await promoModel.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updatedPromo) {
            return res.json({ success: false, message: "Promo code not found" });
        }

        res.json({ success: true, message: "Promo code updated successfully", data: updatedPromo });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating promo code" });
    }
};

// Delete promo code (Admin)
const deletePromo = async (req, res) => {
    try {
        const { id } = req.body;
        await promoModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Promo code deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error deleting promo code" });
    }
};

export { addPromo, validatePromo, applyPromo, getAllPromos, updatePromo, deletePromo };
