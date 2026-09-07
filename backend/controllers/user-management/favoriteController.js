import favoriteModel from "../../models/user/favoriteModel.js";
import foodModel from "../../models/product/foodModel.js";

// Add food to favorites
const addToFavorites = async (req, res) => {
    try {
        const { foodId } = req.body;
        const userId = req.body.userId;

        // Check if already favorited
        const existingFavorite = await favoriteModel.findOne({ userId, foodId });
        if (existingFavorite) {
            return res.json({ success: false, message: "Already in favorites" });
        }

        const newFavorite = new favoriteModel({
            userId,
            foodId
        });

        await newFavorite.save();
        res.json({ success: true, message: "Added to favorites" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error adding to favorites" });
    }
};

// Remove food from favorites
const removeFromFavorites = async (req, res) => {
    try {
        const { foodId } = req.body;
        const userId = req.body.userId;

        await favoriteModel.findOneAndDelete({ userId, foodId });
        res.json({ success: true, message: "Removed from favorites" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing from favorites" });
    }
};

// Get user's favorites with full food details
const getFavorites = async (req, res) => {
    try {
        const userId = req.body.userId;

        const favorites = await favoriteModel.find({ userId })
            .populate('foodId')
            .sort({ addedAt: -1 });

        const favoriteFoods = favorites
            .filter(fav => fav.foodId) // Filter out any null references
            .map(fav => fav.foodId);

        res.json({ success: true, data: favoriteFoods });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching favorites" });
    }
};

// Check if food is favorited
const checkFavorite = async (req, res) => {
    try {
        const { foodId } = req.params;
        const userId = req.body.userId;

        const favorite = await favoriteModel.findOne({ userId, foodId });
        res.json({ success: true, isFavorite: !!favorite });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error checking favorite" });
    }
};

// Get all favorite food IDs for a user (for quick checking)
const getFavoriteIds = async (req, res) => {
    try {
        const userId = req.body.userId;

        const favorites = await favoriteModel.find({ userId }).select('foodId');
        const foodIds = favorites.map(fav => fav.foodId.toString());

        res.json({ success: true, data: foodIds });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching favorite IDs" });
    }
};

export { addToFavorites, removeFromFavorites, getFavorites, checkFavorite, getFavoriteIds };
