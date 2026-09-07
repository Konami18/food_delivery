import userModel from '../../models/user/userModel.js';
import promoModel from '../../models/product/promoModel.js';

// Get user's loyalty points
const getPoints = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await userModel.findById(userId).select('loyaltyPoints');
        
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, points: user.loyaltyPoints });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching points" });
    }
};

// Add points after order completion (1 point = $1 spent)
const addPoints = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        
        // Calculate points: 1 point per dollar spent
        const pointsToAdd = Math.floor(amount);

        const user = await userModel.findByIdAndUpdate(
            userId,
            { $inc: { loyaltyPoints: pointsToAdd } },
            { new: true }
        );

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ 
            success: true, 
            message: `Earned ${pointsToAdd} points!`,
            totalPoints: user.loyaltyPoints 
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding points" });
    }
};

// Redeem points for discount (100 points = $5 discount)
const redeemPoints = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { points } = req.body;

        if (points < 100) {
            return res.json({ 
                success: false, 
                message: "Minimum 100 points required to redeem" 
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.loyaltyPoints < points) {
            return res.json({ 
                success: false, 
                message: "Insufficient points" 
            });
        }

        // Calculate discount: 100 points = $5
        const discount = (points / 100) * 5;

        // Create promo code
        const promoCode = `LOYALTY${Date.now().toString().slice(-8)}`;
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + 30); // Valid for 30 days

        const newPromo = new promoModel({
            code: promoCode,
            discountType: 'fixed',
            discountValue: discount,
            validFrom: new Date(),
            validUntil: validUntil,
            usageLimit: 1,
            usedCount: 0,
            minOrderAmount: 0,
            isActive: true
        });

        await newPromo.save();

        // Deduct points
        user.loyaltyPoints -= points;
        await user.save();

        res.json({ 
            success: true, 
            message: `Redeemed ${points} points for $${discount.toFixed(2)} discount`,
            promoCode: promoCode,
            discount: discount,
            validUntil: validUntil,
            remainingPoints: user.loyaltyPoints
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error redeeming points" });
    }
};

// Get points history and available rewards
const getRewardsInfo = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await userModel.findById(userId).select('loyaltyPoints');

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const points = user.loyaltyPoints;

        // Define reward tiers
        const rewards = [
            { points: 100, discount: 5, available: points >= 100 },
            { points: 200, discount: 10, available: points >= 200 },
            { points: 500, discount: 30, available: points >= 500 },
            { points: 1000, discount: 70, available: points >= 1000 }
        ];

        res.json({ 
            success: true, 
            currentPoints: points,
            rewards: rewards
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching rewards info" });
    }
};

export { getPoints, addPoints, redeemPoints, getRewardsInfo };
